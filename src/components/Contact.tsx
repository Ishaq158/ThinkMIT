import React from 'react';
import type { SiteContent } from '@/lib/content';

export default function Contact({
  content,
}: {
  content: SiteContent;
}) {
  const { contact } = content;

  return (
    <div className="contact-section" id="contact">
      <div className="sec-head">
        <span className="eyebrow rv">{contact.eyebrow}</span>
        <h2 className="h2 split" data-split>
          {contact.heading}
        </h2>
        <p className="lead rv" style={{ '--d': 3 } as React.CSSProperties}>
          {contact.intro}
        </p>
      </div>

      <div className="contact-grid">
        {/* Coordinators */}
        {contact.coordinators.map((c, idx) => {
          const initials = c.name
            .split(' ')
            .map((p) => p[0])
            .join('')
            .slice(0, 2);

          return (
            <div
              key={idx}
              className="card coord-card rv"
              style={{ '--d': idx + 1 } as React.CSSProperties}
            >
              <div className="coord-top">
                <div className="coord-avatar">{initials}</div>
                <div>
                  <div className="coord-name">{c.name}</div>
                  <div className="coord-role">{c.role}</div>
                </div>
              </div>
              {c.phone && (
                <a href={`tel:+91${c.phone}`} className="pill coord-phone">
                  <svg
                    viewBox="0 0 24 24"
                    width="12"
                    height="12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginRight: '6px' }}
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  +91 {c.phone}
                </a>
              )}
            </div>
          );
        })}

        {/* Leadership People */}
        {contact.people.map((p, idx) => (
          <div
            key={idx}
            className="card coord-card rv"
            style={{ '--d': (contact.coordinators.length + idx + 1) } as React.CSSProperties}
          >
            <div className="coord-top">
              <div className="coord-avatar">{p.role}</div>
              <div>
                <div className="coord-name">{p.name}</div>
                <div className="coord-role">{contact.department || 'Event Leadership'}</div>
              </div>
            </div>
          </div>
        ))}

        {/* Optional Email */}
        {contact.email && (
          <div
            className="card coord-card rv"
            style={{ '--d': contact.coordinators.length + contact.people.length + 1 } as React.CSSProperties}
          >
            <div className="coord-top">
              <div className="coord-avatar">@</div>
              <div>
                <div className="coord-name">Email Support</div>
                <a
                  href={`mailto:${contact.email}`}
                  style={{ fontSize: '13px', color: '#d4612f', marginTop: '4px', display: 'inline-block' }}
                >
                  {contact.email}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

