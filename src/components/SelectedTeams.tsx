import React from 'react';
import type { SiteContent } from '@/lib/content';

export interface SelectedTeamItem {
  teamName: string;
  trackName?: string;
  ideaTitle?: string;
}

export default function SelectedTeams({
  content,
  teams = [],
}: {
  content: SiteContent;
  teams?: SelectedTeamItem[];
}) {
  const { announcements } = content;

  if (!announcements.published) {
    return null;
  }

  return (
    <section className="s-selected" id="selected">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow rv">{announcements.eyebrow}</span>
          <h2 className="h2 split" data-split>
            {announcements.heading}
          </h2>
          <p className="lead rv" style={{ '--d': 3 } as React.CSSProperties}>
            {announcements.intro}
          </p>
        </div>

        <div className="selected-grid">
          {teams.length === 0 ? (
            <div
              className="card rv"
              style={{
                gridColumn: '1 / -1',
                padding: '40px 24px',
                textAlign: 'center',
                color: 'var(--ink-2)',
              }}
            >
              <p style={{ fontSize: '16px' }}>To be announced.</p>
            </div>
          ) : (
            teams.map((t, idx) => (
              <div
                key={idx}
                className="card rv"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  '--d': (idx % 6) + 1,
                } as React.CSSProperties}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '20px', fontWeight: 400 }}>{t.teamName}</h4>
                  {announcements.showTrack && t.trackName && (
                    <span className="pill" style={{ fontSize: '11px', padding: '4px 12px' }}>
                      {t.trackName}
                    </span>
                  )}
                </div>
                {announcements.showIdeaTitle && t.ideaTitle && (
                  <p style={{ fontSize: '13px', color: '#5b4a3f', marginTop: '4px' }}>
                    {t.ideaTitle}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
