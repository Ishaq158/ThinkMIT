'use client';

import React, { useState } from 'react';
import type { SiteContent } from '@/lib/content';

export default function Guidelines({
  content,
}: {
  content: SiteContent;
}) {
  const { guidelines, roles, tracks, tracksIntro, evaluation, journey, contact } = content;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const renderEmbed = (embedType?: string) => {
    if (!embedType) return null;

    if (embedType === 'roles') {
      return (
        <div className="embed-roles">
          {roles.map((r, i) => (
            <div key={r.key || i} className="g-card">
              <span className="lbl">{r.label}</span>
              <h5>{r.summary}</h5>
              <ul style={{ marginTop: '10px', fontSize: '12px', paddingLeft: '14px' }}>
                {r.responsibilities?.map((item, ri) => (
                  <li key={ri} style={{ marginBottom: '4px' }}>
                    {item}
                  </li>
                ))}
              </ul>
              {r.training && (
                <div style={{ marginTop: '10px', fontSize: '11px', color: '#8a7a6e' }}>
                  <strong>Training:</strong> {r.training}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (embedType === 'tracks') {
      return (
        <div className="embed-tracks">
          {tracksIntro && (
            <p style={{ fontSize: '13.5px', color: '#5b4a3f', lineHeight: '1.55' }}>
              {tracksIntro}
            </p>
          )}
          <div className="embed-tracks-grid">
            {tracks.map((t, i) => (
              <div key={t.key || i} className="g-card">
                <span className="lbl">Track {i + 1}</span>
                <h5>{t.name}</h5>
                <em>{t.description}</em>
                {t.room && (
                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#6a594d' }}>
                    <strong>Venue:</strong> {t.room}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (embedType === 'evaluation') {
      return (
        <div style={{ marginTop: '14px' }}>
          {evaluation.intro && (
            <p style={{ fontSize: '13.5px', color: '#5b4a3f', marginBottom: '10px' }}>
              {evaluation.intro}
            </p>
          )}
          <div className="embed-eval-table">
            {evaluation.criteria.map((c, i) => (
              <div key={i} className="embed-eval-row">
                <span className="embed-eval-name">{c.name}</span>
                <span className="embed-eval-desc">{c.description}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (embedType === 'funding') {
      return (
        <div style={{ marginTop: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {journey.funding.steps.map((st, i) => (
              <div key={i} className="embed-eval-row">
                <span className="embed-eval-name">Step {i + 1}: {st.title}</span>
                <span className="embed-eval-desc">{st.text}</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '12px', fontSize: '12px', color: '#6a594d', fontStyle: 'italic' }}>
            {journey.funding.note}
          </p>
        </div>
      );
    }

    if (embedType === 'contact') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '14px' }}>
          {contact.coordinators.map((c, i) => (
            <div key={i} className="g-card" style={{ padding: '12px' }}>
              <span className="lbl">{c.role}</span>
              <h5 style={{ fontSize: '15px' }}>{c.name}</h5>
              {c.phone && (
                <a href={`tel:+91${c.phone}`} style={{ fontSize: '12px', color: '#d4612f', marginTop: '4px', display: 'inline-block' }}>
                  +91 {c.phone}
                </a>
              )}
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <section className="s-guide" id="guidelines">
      <div className="wrap guide-wrap">
        <div className="sec-head">
          <span className="eyebrow rv">{guidelines.eyebrow}</span>
          <h2 className="h2 split" data-split>
            {guidelines.heading}
          </h2>
          <p className="lead rv" style={{ '--d': 3 } as React.CSSProperties}>
            {guidelines.lead}
          </p>
        </div>

        <div className="acc" style={{ marginTop: '40px' }}>
          {guidelines.sections.map((section, idx) => {
            const isOpen = openIndex === idx;
            const numStr = String(idx + 1).padStart(2, '0');

            return (
              <div
                key={section.key || idx}
                className="card acc-card rv"
                style={{ '--d': Math.min(idx + 1, 6) } as React.CSSProperties}
              >
                <button
                  type="button"
                  className="acc-h"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  aria-controls={`panel-${idx}`}
                  id={`header-${idx}`}
                >
                  <span className="acc-num">{numStr}</span>
                  <div className="acc-title-wrap">
                    <div className="acc-title">{section.title}</div>
                    {section.subtitle && (
                      <div className="acc-sub">{section.subtitle}</div>
                    )}
                  </div>
                  <div className="acc-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" fill="none">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                </button>

                <div
                  id={`panel-${idx}`}
                  role="region"
                  aria-labelledby={`header-${idx}`}
                  className={`acc-panel ${isOpen ? 'open' : ''}`}
                >
                  <div className="acc-panel-inner">
                    {section.blocks?.map((block, bi) => (
                      <div key={bi}>
                        {block.heading && (
                          <div className="acc-block-heading">{block.heading}</div>
                        )}
                        {block.items && (
                          block.items.length === 1 ? (
                            <p style={{ marginTop: '8px', fontSize: '14px', color: '#3d2e25', lineHeight: '1.6' }}>
                              {block.items[0]}
                            </p>
                          ) : (
                            <ul>
                              {block.items.map((item, ii) => (
                                <li key={ii}>{item}</li>
                              ))}
                            </ul>
                          )
                        )}
                      </div>
                    ))}

                    {renderEmbed(section.embed)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
