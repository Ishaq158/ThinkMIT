import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const auth = await requireAdminApi(req);
  if (auth.error) return auth.error;

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
  }

  try {
    const { action, teamIds, status } = await req.json();

    if (!Array.isArray(teamIds) || teamIds.length === 0) {
      return NextResponse.json({ error: 'teamIds must be a non-empty array' }, { status: 400 });
    }

    if (action === 'status') {
      const allowed = ['registered', 'under_review', 'shortlisted', 'selected', 'rejected'];
      if (!allowed.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('teams')
        .update({ status, updated_at: new Date().toISOString() })
        .in('id', teamIds)
        .select('id, status');

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, updated: data?.length || 0 });
    } else if (action === 'delete') {
      // Delete members first
      await supabase.from('members').delete().in('team_id', teamIds);

      const { error } = await supabase
        .from('teams')
        .delete()
        .in('id', teamIds);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, deleted: teamIds.length });
    } else {
      return NextResponse.json({ error: 'Invalid bulk action' }, { status: 400 });
    }
  } catch (err) {
    console.error('Bulk action error:', err);
    return NextResponse.json({ error: 'Failed to perform bulk action' }, { status: 500 });
  }
}

