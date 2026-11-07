'use client';

import React from 'react';
import Link from 'next/link';
import type { SiteContent } from '@/lib/content';
import { getRegistrationState } from '@/lib/registration-state';

export default function Nav({
  content,
}: {
  content: SiteContent;
}) {
  const { nav, registration, site } = content;
  const regState = getRegistrationState(registration);

  const primaryLinks = nav.links.slice(0, 3);
  const fourthLink = nav.links[3] || { label: 'Contact', href: '/#contact' };

  return (
    <>
      <header className="nav" id="nav">
        <div className="wrap nav-wrap">
          <nav className="nav-l" aria-label="Main Navigation">
            {primaryLinks.map((link, idx) => (
              <a key={idx} href={link.href} className="pill">
                {link.label}
              </a>
            ))}
          </nav>

          <Link href="/" className="logo" aria-label={site.name}>
            <svg viewBox="0 0 40 40" fill="#2a1a12">
              <path d="M5 5h13v13H5zM22 22h13v13H22z" />
              <path d="M22 5a13 13 0 0 1 13 13H22zM18 35A13 13 0 0 1 5 22h13z" />
            </svg>
          </Link>

          <div className="nav-r">
            <a href={fourthLink.href} className="nav-contact-link">
              {fourthLink.label}
            </a>

            {regState.isClosed ? (
              <button
                className="btn-dark disabled"
                disabled
                title={regState.stateMessage}
                aria-disabled="true"
              >
                {nav.ctaLabel}
              </button>
            ) : (
              <Link href={nav.ctaHref} className="btn-dark">
                {nav.ctaLabel}
              </Link>
            )}

            <button className="burger" id="burger" aria-label="Menu">
              <i></i>
              <i></i>
            </button>
          </div>
        </div>
      </header>

      <div className="mmenu" id="mmenu">
        {nav.links.map((link, idx) => (
          <a key={idx} href={link.href}>
            {link.label}
          </a>
        ))}
        {nav.mobileExtraLabel && (
          <a href={regState.isClosed ? '#' : nav.ctaHref}>
            {nav.mobileExtraLabel}
          </a>
        )}
      </div>
    </>
  );
}
