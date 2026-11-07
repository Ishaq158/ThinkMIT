import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/supabase-server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminApi(req);
  if (auth.error) return auth.error;

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
  }

  const { id } = params;

  try {
    const { data: team, error } = await supabase
      .from('teams')
      .select('*, members(*)')
      .eq('id', id)
      .single();

    if (error || !team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    return NextResponse.json({ team });
  } catch (err) {
    console.error('Fetch team error:', err);
    return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminApi(req);
  if (auth.error) return auth.error;

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
  }

  const { id } = params;

  try {
    const body = await req.json();
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.status !== undefined) {
      const allowed = ['registered', 'under_review', 'shortlisted', 'selected', 'rejected'];
      if (!allowed.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
      }
      updateData.status = body.status;
    }

    if (body.score !== undefined) {
      const score = body.score === null || body.score === '' ? null : Number(body.score);
      if (score !== null && (isNaN(score) || score < 0 || score > 100)) {
        return NextResponse.json({ error: 'Score must be between 0 and 100' }, { status: 400 });
      }
      updateData.score = score;
    }

    if (body.internal_notes !== undefined) {
      updateData.internal_notes = body.internal_notes ? String(body.internal_notes) : null;
    }

    if (body.team_name !== undefined) updateData.team_name = String(body.team_name).trim();
    if (body.track_key !== undefined) updateData.track_key = String(body.track_key).trim();
    if (body.idea_title !== undefined) updateData.idea_title = String(body.idea_title).trim();
    if (body.idea_abstract !== undefined) updateData.idea_abstract = String(body.idea_abstract).trim();
    if (body.ppt_url !== undefined) updateData.ppt_url = body.ppt_url ? String(body.ppt_url).trim() : null;

    const { data: updatedTeam, error: teamErr } = await supabase
      .from('teams')
      .update(updateData)
      .eq('id', id)
      .select('*, members(*)')
      .single();

    if (teamErr) {
      return NextResponse.json({ error: teamErr.message }, { status: 500 });
    }

    // Optional: if members updates were passed
    if (Array.isArray(body.members)) {
      for (const m of body.members) {
        if (m.id) {
          await supabase
            .from('members')
            .update({
              name: m.name?.trim(),
              email: m.email?.trim().toLowerCase(),
              phone: m.phone?.trim(),
              programme: m.programme?.trim(),
              branch: m.branch?.trim(),
              semester: m.semester ? Number(m.semester) : undefined,
              role: m.role?.trim(),
            })
            .eq('id', m.id);
        }
      }
    }

    return NextResponse.json({ success: true, team: updatedTeam });
  } catch (err) {
    console.error('Update team error:', err);
    return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminApi(req);
  if (auth.error) return auth.error;

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
  }

  const { id } = params;

  try {
    // Delete members first in case cascade isn't configured
    await supabase.from('members').delete().eq('team_id', id);

    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err) {
    console.error('Delete team error:', err);
    return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 });
  }
}

