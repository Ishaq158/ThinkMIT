import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { getContent } from '@/lib/content';
import { buildRegistrationSchema } from '@/lib/schema';

export async function GET(req: NextRequest) {
  const auth = await requireAdminApi(req);
  if (auth.error) return auth.error;

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim().toLowerCase() || '';
  const status = searchParams.get('status') || '';
  const track = searchParams.get('track') || '';
  const programme = searchParams.get('programme') || '';
  const sort = searchParams.get('sort') || 'created_at:desc';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(100, Math.max(10, parseInt(searchParams.get('pageSize') || '25', 10)));

  try {
    // Query teams joined with members
    let query = supabase
      .from('teams')
      .select('*, members(*)', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }
    if (track) {
      query = query.eq('track_key', track);
    }

    const [sortCol, sortDir] = sort.split(':');
    query = query.order(sortCol || 'created_at', { ascending: sortDir === 'asc' });

    const { data: teams, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // In-memory filtering for deep search across members, programme, phone, usn, etc.
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

    const totalFiltered = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    return NextResponse.json({
      teams: paginated,
      total: totalFiltered,
      totalDatabase: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil(totalFiltered / pageSize) || 1,
    });
  } catch (err) {
    console.error('Teams query error:', err);
    return NextResponse.json({ error: 'Failed to query teams' }, { status: 500 });
  }
}

// POST: Add team manually by admin
export async function POST(req: NextRequest) {
  const auth = await requireAdminApi(req);
  if (auth.error) return auth.error;

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const content = await getContent();
    const schema = buildRegistrationSchema(content);

    const parseResult = schema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const validData = parseResult.data;
    const submissionKey = `manual_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const prefix = content.registration.regIdPrefix || 'TMIT';

    const { data: regCode, error: rpcError } = await supabase.rpc('register_team', {
      payload: validData,
      p_submission_key: submissionKey,
      p_prefix: prefix,
    });

    if (rpcError) {
      return NextResponse.json({ error: rpcError.message }, { status: 400 });
    }

    return NextResponse.json({ regCode }, { status: 201 });
  } catch (err) {
    console.error('Manual team add error:', err);
    return NextResponse.json({ error: 'Failed to add team' }, { status: 500 });
  }
}

