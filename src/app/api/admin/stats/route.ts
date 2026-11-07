import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { getContent } from '@/lib/content';
import { getRegistrationState } from '@/lib/registration-state';

export async function GET(req: NextRequest) {
  const auth = await requireAdminApi(req);
  if (auth.error) return auth.error;

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
  }

  try {
    const content = await getContent();
    const regState = getRegistrationState(content.registration);

    // Fetch all teams
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, reg_code, team_name, track_key, status, created_at')
      .order('created_at', { ascending: false });

    if (teamsError) {
      return NextResponse.json({ error: teamsError.message }, { status: 500 });
    }

    const allTeams = teams || [];
    const totalTeams = allTeams.length;

    // By track
    const byTrack: Record<string, number> = {};
    content.tracks.forEach((t) => {
      byTrack[t.key] = 0;
    });
    allTeams.forEach((t) => {
      byTrack[t.track_key] = (byTrack[t.track_key] || 0) + 1;
    });

    // By status matching schema: 'registered','under_review','shortlisted','selected','rejected'
    const byStatus: Record<string, number> = {
      registered: 0,
      under_review: 0,
      shortlisted: 0,
      selected: 0,
      rejected: 0,
    };
    allTeams.forEach((t) => {
      if (t.status in byStatus) {
        byStatus[t.status] += 1;
      } else {
        byStatus[t.status] = (byStatus[t.status] || 0) + 1;
      }
    });

    // Last 7 days trend
    const trend7d: Array<{ date: string; label: string; count: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateKey = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const count = allTeams.filter((t) => t.created_at.startsWith(dateKey)).length;
      trend7d.push({ date: dateKey, label, count });
    }

    const recentTeams = allTeams.slice(0, 5);

    return NextResponse.json({
      total: totalTeams,
      totalTeams,
      totalStudents: totalTeams * 3,
      byTrack,
      byStatus,
      trend7d,
      last7Days: trend7d,
      recentTeams,
      registrationState: {
        isOpen: regState.isOpen,
        deadlineLabel: regState.deadlineLabel,
        maxTeams: content.registration.maxTeams,
      },
    });
  } catch (err) {
    console.error('Stats error:', err);
    return NextResponse.json({ error: 'Failed to compute dashboard stats' }, { status: 500 });
  }
}
