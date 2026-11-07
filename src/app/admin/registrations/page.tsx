'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

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

interface Team {
  id: string;
  reg_code: string;
  team_name: string;
  track_key: string;
  idea_title: string;
  idea_abstract: string;
  ppt_url?: string;
  status: string;
  score?: number | null;
  internal_notes?: string | null;
  created_at: string;
  members: Member[];
}

export default function RegistrationsAdminPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Pagination
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [track, setTrack] = useState('');
  const [programme, setProgramme] = useState('');
  const [sort, setSort] = useState('created_at:desc');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState('under_review');
  const [isBulkOperating, setIsBulkOperating] = useState(false);

  // Add Team Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTeam, setNewTeam] = useState({
    teamName: '',
    trackKey: 'track-1',
    ideaTitle: '',
    ideaAbstract: '',
    pptUrl: '',
    members: [
      { name: '', usn: '', email: '', phone: '', programme: 'BE', branch: 'CSE', semester: 5, role: 'technical', isLeader: true },
      { name: '', usn: '', email: '', phone: '', programme: 'BE', branch: 'ECE', semester: 5, role: 'business', isLeader: false },
      { name: '', usn: '', email: '', phone: '', programme: 'BE', branch: 'ME', semester: 5, role: 'innovation', isLeader: false },
    ],
  });
  const [addError, setAddError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (status) params.set('status', status);
      if (track) params.set('track', track);
      if (programme) params.set('programme', programme);
      params.set('sort', sort);
      params.set('page', page.toString());
      params.set('pageSize', pageSize.toString());

      const res = await fetch(`/api/admin/teams?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch teams');
      }
      const data = await res.json();
      setTeams(data.teams || []);
      setTotalPages(data.totalPages || 1);
      setTotalRecords(data.total || 0);
      setSelectedIds([]);
    } catch (err: any) {
      setError(err.message || 'Error loading teams');
    } finally {
      setLoading(false);
    }
  }, [query, status, track, programme, sort, page, pageSize]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Bulk actions
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(teams.map((t) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsBulkOperating(true);
      const res = await fetch('/api/admin/teams/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status', teamIds: selectedIds, status: bulkStatus }),
      });
      if (!res.ok) {
        throw new Error('Failed to update status');
      }
      await fetchTeams();
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    } finally {
      setIsBulkOperating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to permanently delete ${selectedIds.length} team(s)?`)) {
      return;
    }
    try {
      setIsBulkOperating(true);
      const res = await fetch('/api/admin/teams/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', teamIds: selectedIds }),
      });
      if (!res.ok) {
        throw new Error('Failed to delete teams');
      }
      await fetchTeams();
    } catch (err: any) {
      alert(err.message || 'Error deleting teams');
    } finally {
      setIsBulkOperating(false);
    }
  };

  // Manual Add Team
  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setIsAdding(true);
    try {
      const res = await fetch('/api/admin/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTeam,
          agreedToRules: true,
          honeypot: '',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add team');
      }

      setShowAddModal(false);
      await fetchTeams();
    } catch (err: any) {
      setAddError(err.message || 'Could not register team');
    } finally {
      setIsAdding(false);
    }
  };

  const handleExportCSV = (mode: 'all' | 'filtered' | 'selected') => {
    const params = new URLSearchParams();
    if (mode === 'selected' && selectedIds.length > 0) {
      params.set('ids', selectedIds.join(','));
    } else if (mode === 'filtered') {
      if (status) params.set('status', status);
      if (track) params.set('track', track);
      if (programme) params.set('programme', programme);
      if (query) params.set('q', query);
    }
    window.location.href = `/api/admin/export?${params.toString()}`;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--ink)' }}>Registrations</h1>
          <p style={{ fontSize: '13px', color: '#6a594d', marginTop: '4px' }}>
            Manage, evaluate, filter and export registered teams ({totalRecords} total).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Export dropdown */}
          <button
            onClick={() => handleExportCSV(selectedIds.length > 0 ? 'selected' : 'all')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid var(--tint)',
              background: 'var(--surface)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Export CSV {selectedIds.length > 0 ? `(${selectedIds.length} selected)` : 'All'}
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-dark"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            + Add Team Manually
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#7a6a5d', textTransform: 'uppercase', marginBottom: '4px' }}>
              Search
            </label>
            <input
              type="text"
              placeholder="Team, USN, Name, Email, Phone..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--tint)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#7a6a5d', textTransform: 'uppercase', marginBottom: '4px' }}>
              Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--tint)', background: 'var(--surface)' }}
            >
              <option value="">All Statuses</option>
              <option value="registered">Registered</option>
              <option value="under_review">Under Review</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="selected">Selected</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#7a6a5d', textTransform: 'uppercase', marginBottom: '4px' }}>
              Track
            </label>
            <select
              value={track}
              onChange={(e) => {
                setTrack(e.target.value);
                setPage(1);
              }}
              style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--tint)', background: 'var(--surface)' }}
            >
              <option value="">All Tracks</option>
              <option value="track-1">Track 1</option>
              <option value="track-2">Track 2</option>
              <option value="track-3">Track 3</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#7a6a5d', textTransform: 'uppercase', marginBottom: '4px' }}>
              Sort By
            </label>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              style={{ width: '100%', padding: '7px 10px', fontSize: '13px', borderRadius: '8px', border: '1px solid var(--tint)', background: 'var(--surface)' }}
            >
              <option value="created_at:desc">Newest First</option>
              <option value="created_at:asc">Oldest First</option>
              <option value="score:desc">Highest Score</option>
              <option value="team_name:asc">Team Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div style={{ background: '#f5f0e9', border: '1px solid var(--tint)', borderRadius: '10px', padding: '12px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
            {selectedIds.length} team{selectedIds.length > 1 ? 's' : ''} selected
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--tint)', background: 'var(--surface)' }}
            >
              <option value="registered">Set: Registered</option>
              <option value="under_review">Set: Under Review</option>
              <option value="shortlisted">Set: Shortlisted</option>
              <option value="selected">Set: Selected</option>
              <option value="rejected">Set: Rejected</option>
            </select>
            <button
              onClick={handleBulkStatusChange}
              disabled={isBulkOperating}
              style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--tint)', background: 'var(--surface)', fontWeight: 500, cursor: 'pointer' }}
            >
              Apply Status
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isBulkOperating}
              style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px', border: '1px solid #e53e3e', background: '#fff5f5', color: '#c53030', fontWeight: 500, cursor: 'pointer' }}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="admin-card" style={{ padding: 0 }}>
        {error && (
          <div style={{ padding: '16px', color: '#c53030', background: '#fff5f5' }}>
            {error}
          </div>
        )}

        <div className="admin-table-container" style={{ margin: 0, border: 'none' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={teams.length > 0 && selectedIds.length === teams.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Reg ID</th>
                <th>Team Name</th>
                <th>Track</th>
                <th>Team Leader</th>
                <th>Members</th>
                <th>Status</th>
                <th>Score</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '36px', color: '#7a6a5d' }}>
                    Loading teams data...
                  </td>
                </tr>
              ) : teams.length > 0 ? (
                teams.map((t) => {
                  const leader = t.members?.find((m) => m.is_leader) || t.members?.[0];
                  return (
                    <tr key={t.id} style={{ background: selectedIds.includes(t.id) ? 'rgba(42, 26, 18, 0.03)' : undefined }}>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(t.id)}
                          onChange={() => handleSelectOne(t.id)}
                        />
                      </td>
                      <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                        {t.reg_code}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{t.team_name}</div>
                        <div style={{ fontSize: '11px', color: '#7a6a5d', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.idea_title}>
                          {t.idea_title}
                        </div>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>
                        {t.track_key.replace('-', ' ')}
                      </td>
                      <td>
                        {leader ? (
                          <div>
                            <div style={{ fontWeight: 500 }}>{leader.name}</div>
                            <div style={{ fontSize: '11px', color: '#7a6a5d' }}>{leader.email}</div>
                          </div>
                        ) : (
                          <span style={{ color: '#aaa' }}>-</span>
                        )}
                      </td>
                      <td>{t.members?.length || 0}</td>
                      <td>
                        <span className={`badge-status badge-${t.status}`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {t.score !== null && t.score !== undefined ? `${t.score}/100` : '-'}
                      </td>
                      <td style={{ color: '#7a6a5d', fontSize: '12px' }}>
                        {new Date(t.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <Link
                          href={`/admin/registrations/${t.id}`}
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            background: 'var(--surface)',
                            border: '1px solid var(--tint)',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: 'var(--ink)',
                          }}
                        >
                          View / Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: '#7a6a5d' }}>
                    No teams found matching current criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--tint)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '13px', color: '#7a6a5d' }}>
              Page {page} of {totalPages}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--tint)', background: 'var(--surface)', cursor: page > 1 ? 'pointer' : 'default', opacity: page > 1 ? 1 : 0.5 }}
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--tint)', background: 'var(--surface)', cursor: page < totalPages ? 'pointer' : 'default', opacity: page < totalPages ? 1 : 0.5 }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Add Team Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Add Team Manually</h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {addError && (
              <div style={{ padding: '12px', background: '#fff5f5', color: '#c53030', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
                {addError}
              </div>
            )}

            <form onSubmit={handleAddTeam}>
              <div className="form-group">
                <label>Team Name *</label>
                <input
                  type="text"
                  required
                  value={newTeam.teamName}
                  onChange={(e) => setNewTeam({ ...newTeam, teamName: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginTop: '14px' }}>
                <label>Track *</label>
                <select
                  value={newTeam.trackKey}
                  onChange={(e) => setNewTeam({ ...newTeam, trackKey: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--tint)', background: 'var(--surface)' }}
                >
                  <option value="track-1">Track 1</option>
                  <option value="track-2">Track 2</option>
                  <option value="track-3">Track 3</option>
                </select>
              </div>

              <div className="form-group" style={{ marginTop: '14px' }}>
                <label>Idea Title *</label>
                <input
                  type="text"
                  required
                  value={newTeam.ideaTitle}
                  onChange={(e) => setNewTeam({ ...newTeam, ideaTitle: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginTop: '14px' }}>
                <label>Idea Abstract *</label>
                <textarea
                  rows={3}
                  required
                  value={newTeam.ideaAbstract}
                  onChange={(e) => setNewTeam({ ...newTeam, ideaAbstract: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginTop: '14px' }}>
                <label>Pitch Deck / PPT URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newTeam.pptUrl}
                  onChange={(e) => setNewTeam({ ...newTeam, pptUrl: e.target.value })}
                />
              </div>

              <h3 style={{ fontSize: '15px', fontWeight: 600, marginTop: '24px', marginBottom: '12px' }}>
                Members (3 Required)
              </h3>

              {newTeam.members.map((m, idx) => (
                <div key={idx} style={{ background: '#f8f5f0', padding: '14px', borderRadius: '10px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
                    {idx === 0 ? 'Team Leader' : `Member ${idx + 1}`} ({m.role})
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      value={m.name}
                      onChange={(e) => {
                        const copy = [...newTeam.members];
                        copy[idx].name = e.target.value;
                        setNewTeam({ ...newTeam, members: copy });
                      }}
                    />
                    <input
                      type="text"
                      placeholder="USN (e.g. 4MT21CS001)"
                      required
                      value={m.usn}
                      onChange={(e) => {
                        const copy = [...newTeam.members];
                        copy[idx].usn = e.target.value;
                        setNewTeam({ ...newTeam, members: copy });
                      }}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      required
                      value={m.email}
                      onChange={(e) => {
                        const copy = [...newTeam.members];
                        copy[idx].email = e.target.value;
                        setNewTeam({ ...newTeam, members: copy });
                      }}
                    />
                    <input
                      type="tel"
                      placeholder="10-digit Phone"
                      required
                      value={m.phone}
                      onChange={(e) => {
                        const copy = [...newTeam.members];
                        copy[idx].phone = e.target.value;
                        setNewTeam({ ...newTeam, members: copy });
                      }}
                    />
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--tint)', background: 'transparent', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-dark"
                  disabled={isAdding}
                  style={{ padding: '8px 20px' }}
                >
                  {isAdding ? 'Adding...' : 'Save Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

