'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface StatsData {
  total: number;
  byStatus: {
    registered: number;
    under_review: number;
    shortlisted: number;
    selected: number;
    rejected: number;
  };
  byTrack: Record<string, number>;
  trend7d: { date: string; count: number }[];
  recentTeams: {
    id: string;
    reg_code: string;
    team_name: string;
    track_key: string;
    status: string;
    created_at: string;
  }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats');
      if (!res.ok) {
        throw new Error('Failed to load dashboard metrics');
      }
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#6a594d' }}>
        Loading dashboard metrics...
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div style={{ padding: '24px', background: '#fdedec', borderRadius: '12px', color: '#b0412c' }}>
        {error || 'Failed to load stats'}
      </div>
    );
  }

  // Calculate maximum count for SVG chart scaling
  const maxTrend = Math.max(...stats.trend7d.map((d) => d.count), 1);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 600, color: 'var(--ink)' }}>Event Dashboard</h1>
          <p style={{ fontSize: '14px', color: '#6a594d', marginTop: '4px' }}>
            Real-time overview of THINK MIT registrations and status.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchStats}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid var(--tint)',
              background: 'var(--surface)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            ↻ Refresh
          </button>
          <Link
            href="/admin/registrations"
            className="btn-dark"
            style={{ textDecoration: 'none', padding: '8px 18px', fontSize: '13px' }}
          >
            View Registrations
          </Link>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-title">Total Teams</div>
          <div className="admin-stat-value">{stats.total}</div>
          <div className="admin-stat-sub">Across all tracks</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-title">Shortlisted</div>
          <div className="admin-stat-value" style={{ color: '#2b6cb0' }}>
            {stats.byStatus.shortlisted || 0}
          </div>
          <div className="admin-stat-sub">Passed preliminary review</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-title">Selected for Finals</div>
          <div className="admin-stat-value" style={{ color: '#22543d' }}>
            {stats.byStatus.selected || 0}
          </div>
          <div className="admin-stat-sub">Confirmed finalists</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-title">Under Review</div>
          <div className="admin-stat-value" style={{ color: '#c05621' }}>
            {stats.byStatus.under_review || 0}
          </div>
          <div className="admin-stat-sub">Awaiting evaluation</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* 7-day registration trend (SVG bar chart) */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>7-Day Registration Activity</h2>
          <div style={{ width: '100%', height: '180px', display: 'flex', alignItems: 'flex-end', gap: '16px', padding: '10px 0' }}>
            {stats.trend7d.map((day) => {
              const heightPct = Math.max(10, Math.round((day.count / maxTrend) * 100));
              const displayDate = day.date.slice(5); // MM-DD
              return (
                <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent)', marginBottom: '4px' }}>
                    {day.count}
                  </div>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '36px',
                      height: `${heightPct}%`,
                      background: 'var(--ink)',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.3s ease',
                    }}
                    title={`${day.date}: ${day.count} registrations`}
                  />
                  <div style={{ fontSize: '11px', color: '#7a6a5d', marginTop: '8px', whiteSpace: 'nowrap' }}>
                    {displayDate}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Track distribution breakdown */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Track Breakdown</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(stats.byTrack).map(([trackKey, count]) => {
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={trackKey}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>
                      {trackKey.replace('-', ' ')}
                    </span>
                    <span style={{ color: '#6a594d' }}>{count} teams ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#ede7de', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: 'var(--accent)',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Teams */}
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Recent Registrations</h2>
          <Link href="/admin/registrations" style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
            View all →
          </Link>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reg ID</th>
                <th>Team Name</th>
                <th>Track</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentTeams && stats.recentTeams.length > 0 ? (
                stats.recentTeams.map((team) => (
                  <tr key={team.id}>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{team.reg_code}</td>
                    <td>{team.team_name}</td>
                    <td>{team.track_key}</td>
                    <td>
                      <span className={`badge-status badge-${team.status}`}>
                        {team.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ color: '#7a6a5d' }}>
                      {new Date(team.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <Link
                        href={`/admin/registrations/${team.id}`}
                        style={{ fontSize: '12px', color: 'var(--ink)', textDecoration: 'underline', fontWeight: 500 }}
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#7a6a5d' }}>
                    No registrations recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

