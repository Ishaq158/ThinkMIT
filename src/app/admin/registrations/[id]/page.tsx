'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Member {
  id: string;
  name: string;
  usn: string;
  email: string;
  phone: string;
  programme: string;
  branch: string;
  semester: number;
  role: string;
  is_leader: boolean;
}

interface TeamDetail {
  id: string;
  reg_code: string;
  team_name: string;
  track_key: string;
  idea_title: string;
  idea_abstract: string;
  ppt_url?: string;
  status: string;
  score: number | null;
  internal_notes: string | null;
  created_at: string;
  updated_at?: string;
  members: Member[];
}

export default function TeamDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [status, setStatus] = useState('registered');
  const [score, setScore] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [teamName, setTeamName] = useState('');
  const [trackKey, setTrackKey] = useState('');
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaAbstract, setIdeaAbstract] = useState('');
  const [pptUrl, setPptUrl] = useState('');
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/teams/${params.id}`);
        if (!res.ok) {
          throw new Error('Team not found or unauthorized');
        }
        const data = await res.json();
        const t: TeamDetail = data.team;
        setTeam(t);
        setStatus(t.status || 'registered');
        setScore(t.score !== null && t.score !== undefined ? String(t.score) : '');
        setNotes(t.internal_notes || '');
        setTeamName(t.team_name || '');
        setTrackKey(t.track_key || 'track-1');
        setIdeaTitle(t.idea_title || '');
        setIdeaAbstract(t.idea_abstract || '');
        setPptUrl(t.ppt_url || '');
        setMembers(t.members || []);
      } catch (err: any) {
        setError(err.message || 'Error fetching team');
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [params.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/admin/teams/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          score: score === '' ? null : Number(score),
          internal_notes: notes,
          team_name: teamName,
          track_key: trackKey,
          idea_title: ideaTitle,
          idea_abstract: ideaAbstract,
          ppt_url: pptUrl || null,
          members,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update team');
      }

      setTeam(data.team);
      setSuccessMsg('Team details updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Error saving changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete team "${team?.team_name}" (${team?.reg_code})? This action cannot be undone.`)) {
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/admin/teams/${params.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete team');
      }
      router.push('/admin/registrations');
    } catch (err: any) {
      alert(err.message || 'Error deleting team');
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', color: '#6a594d' }}>Loading team details...</div>;
  }

  if (error || !team) {
    return (
      <div style={{ padding: '24px', background: '#fff5f5', color: '#c53030', borderRadius: '12px' }}>
        {error || 'Team not found'}
        <div style={{ marginTop: '12px' }}>
          <Link href="/admin/registrations">← Back to Registrations</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link href="/admin/registrations" style={{ color: '#6a594d', textDecoration: 'none', fontSize: '13px' }}>
              ← Registrations
            </Link>
            <span style={{ color: '#ccc' }}>/</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--ink)' }}>{team.reg_code}</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--ink)', marginTop: '4px' }}>
            {team.team_name}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #fed7d7',
              background: '#fff5f5',
              color: '#c53030',
              fontWeight: 500,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Delete Team
          </button>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 18px', background: '#c6f6d5', color: '#22543d', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: 500 }}>
          ✓ {successMsg}
        </div>
      )}

      {error && (
        <div style={{ padding: '12px 18px', background: '#fff5f5', color: '#c53030', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* Status & Evaluation Card */}
        <div className="admin-card" style={{ borderLeft: '4px solid var(--accent)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
            Evaluation & Status
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label>Team Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--tint)', background: 'var(--surface)', fontWeight: 600 }}
              >
                <option value="registered">Registered</option>
                <option value="under_review">Under Review</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="selected">Selected for Finals</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="form-group">
              <label>Judge Evaluation Score (0 - 100)</label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="e.g. 85"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--tint)' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label>Internal Organizer & Judge Notes (Private)</label>
            <textarea
              rows={3}
              placeholder="Private comments, interview remarks, pitch deck feedback..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--tint)' }}
            />
          </div>
        </div>

        {/* Team & Idea Information */}
        <div className="admin-card">
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Team & Project Submission</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label>Team Name</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Track</label>
              <select
                value={trackKey}
                onChange={(e) => setTrackKey(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--tint)', background: 'var(--surface)' }}
              >
                <option value="track-1">Track 1</option>
                <option value="track-2">Track 2</option>
                <option value="track-3">Track 3</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label>Idea Title</label>
            <input
              type="text"
              value={ideaTitle}
              onChange={(e) => setIdeaTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label>Idea Abstract</label>
            <textarea
              rows={4}
              value={ideaAbstract}
              onChange={(e) => setIdeaAbstract(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label>Pitch Deck / Presentation Link</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="url"
                value={pptUrl}
                onChange={(e) => setPptUrl(e.target.value)}
                placeholder="https://..."
                style={{ flex: 1 }}
              />
              {pptUrl && (
                <a
                  href={pptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-dark"
                  style={{ textDecoration: 'none', padding: '9px 16px', fontSize: '13px', whiteSpace: 'nowrap' }}
                >
                  Open Deck ↗
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="admin-card">
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
            Team Roster ({members.length} Members)
          </h2>

          <div className="admin-table-container" style={{ margin: 0 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Full Name</th>
                  <th>USN</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Programme / Branch</th>
                  <th>Semester</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m, idx) => (
                  <tr key={m.id || idx}>
                    <td>
                      <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                        {m.role} {m.is_leader && <span style={{ color: 'var(--accent)', fontSize: '11px' }}>(Leader)</span>}
                      </span>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={m.name}
                        onChange={(e) => {
                          const copy = [...members];
                          copy[idx].name = e.target.value;
                          setMembers(copy);
                        }}
                        style={{ padding: '6px 8px', fontSize: '12px', border: '1px solid var(--tint)', borderRadius: '6px' }}
                      />
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>
                      <input
                        type="text"
                        value={m.usn}
                        onChange={(e) => {
                          const copy = [...members];
                          copy[idx].usn = e.target.value;
                          setMembers(copy);
                        }}
                        style={{ padding: '6px 8px', fontSize: '12px', border: '1px solid var(--tint)', borderRadius: '6px', width: '130px' }}
                      />
                    </td>
                    <td>
                      <input
                        type="email"
                        value={m.email}
                        onChange={(e) => {
                          const copy = [...members];
                          copy[idx].email = e.target.value;
                          setMembers(copy);
                        }}
                        style={{ padding: '6px 8px', fontSize: '12px', border: '1px solid var(--tint)', borderRadius: '6px' }}
                      />
                    </td>
                    <td>
                      <input
                        type="tel"
                        value={m.phone}
                        onChange={(e) => {
                          const copy = [...members];
                          copy[idx].phone = e.target.value;
                          setMembers(copy);
                        }}
                        style={{ padding: '6px 8px', fontSize: '12px', border: '1px solid var(--tint)', borderRadius: '6px', width: '110px' }}
                      />
                    </td>
                    <td>
                      {m.programme} - {m.branch}
                    </td>
                    <td>Sem {m.semester}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fixed Save Bar */}
        <div style={{ position: 'sticky', bottom: '20px', background: 'var(--surface)', padding: '16px 24px', borderRadius: '12px', border: '1px solid var(--tint)', display: 'flex', justifyContent: 'flex-end', gap: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
          <Link
            href="/admin/registrations"
            style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid var(--tint)', background: 'transparent', textDecoration: 'none', color: 'var(--ink)', fontSize: '13px', fontWeight: 500 }}
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="btn-dark"
            disabled={saving}
            style={{ padding: '10px 24px', fontSize: '13px' }}
          >
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

