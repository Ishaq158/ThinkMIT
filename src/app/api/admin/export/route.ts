import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { getContent } from '@/lib/content';
import { generateTeamCSV, generateMemberCSV } from '@/lib/csv';

export async function GET(req: NextRequest) {
  const auth = await requireAdminApi(req);
  if (auth.error) return auth.error;

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format') || 'team';
  const idsParam = searchParams.get('ids');
  const status = searchParams.get('status') || '';
  const track = searchParams.get('track') || '';
  const programme = searchParams.get('programme') || '';
  const q = searchParams.get('q')?.trim().toLowerCase() || '';
  const includeInternal = searchParams.get('internal') === '1' || searchParams.get('internal') === 'true';

  try {
    let query = supabase.from('teams').select('*, members(*)').order('created_at', { ascending: true });

    if (idsParam) {
      const ids = idsParam.split(',').map((id) => id.trim()).filter(Boolean);
      if (ids.length > 0) {
        query = query.in('id', ids);
      }
    } else {
      if (status) query = query.eq('status', status);
      if (track) query = query.eq('track_key', track);
    }

    const { data: teams, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let filtered = teams || [];

    if (programme) {
      filtered = filtered.filter((t) =>
        t.members?.some((m: { programme?: string }) => m.programme === programme)
      );
    }

    if (q) {
      filtered = filtered.filter((t) => {
        const teamMatch =
          t.team_name?.toLowerCase().includes(q) ||
          t.reg_code?.toLowerCase().includes(q) ||
          t.idea_title?.toLowerCase().includes(q);

        const memberMatch = t.members?.some(
          (m: { name?: string; usn?: string; email?: string; phone?: string }) =>
            m.name?.toLowerCase().includes(q) ||
            m.usn?.toLowerCase().includes(q) ||
            m.email?.toLowerCase().includes(q) ||
            m.phone?.includes(q)
        );

        return teamMatch || memberMatch;
      });
    }

    const content = await getContent();

    const csvContent =
      format === 'member'
        ? generateMemberCSV(filtered, content)
        : generateTeamCSV(filtered, content, includeInternal);

    // Current date in IST for filename
    const now = new Date();
    const istDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);

    const filename = `think-mit-registrations-${istDate}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('CSV export error:', err);
    return NextResponse.json({ error: 'Failed to export CSV' }, { status: 500 });
  }
}

