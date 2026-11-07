import React from 'react';
import Link from 'next/link';
import type { SiteContent } from '@/lib/content';

export default function Footer({
  content,
}: {
  content: SiteContent;
}) {
  const { footer, site } = content;
  const socials = footer.socials || { facebook: '', x: '', youtube: '', instagram: '' };

  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid">
          <div className="about rv" style={{ '--d': 0 } as React.CSSProperties}>
            <h6>{site.name}</h6>
            <p>{footer.aboutText}</p>
            <div className="socials">
              {socials.facebook && (
                <a
                  href={socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon"
                  aria-label="Facebook"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              )}
              {socials.x && (
                <a
                  href={socials.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon"
                  aria-label="X (Twitter)"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                  </svg>
                </a>
              )}
              {socials.youtube && (
                <a
                  href={socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon"
                  aria-label="YouTube"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#fff" />
                  </svg>
                </a>
              )}
              {socials.instagram && (
                <a
                  href={socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon"
                  aria-label="Instagram"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {footer.columns?.map((col, idx) => (
            <div
              key={idx}
              className="foot-col rv"
              style={{ '--d': idx + 1 } as React.CSSProperties}
            >
              <h6>{col.title}</h6>
              <ul>
                {col.links.map((link, li) => (
                  <li key={li}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div
            className="foot-mark rv"
            style={{ '--d': 4 } as React.CSSProperties}
          >
            <svg viewBox="0 0 40 40" fill="#2a1a12">
              <path d="M5 5h13v13H5zM22 22h13v13H22z" />
              <path d="M22 5a13 13 0 0 1 13 13H22zM18 35A13 13 0 0 1 5 22h13z" />
            </svg>
          </div>
        </div>

        <div className="legal">
          <div>
            <Link href="/privacy">{footer.legalLeft || 'Privacy notice'}</Link>
          </div>
          <div>{footer.legalCenter}</div>
          <div>{footer.legalRight}</div>
        </div>
      </div>
    </footer>
  );
}

