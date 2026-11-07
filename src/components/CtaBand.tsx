import React from 'react';
import Link from 'next/link';
import type { SiteContent } from '@/lib/content';
import { getRegistrationState } from '@/lib/registration-state';

export default function CtaBand({
  content,
}: {
  content: SiteContent;
}) {
  const { cta, media, registration } = content;
  const regState = getRegistrationState(registration);

  return (
    <div className="cta rv rv-scale" style={{ marginTop: '40px' }}>
      {media.ctaVideo && (
        <video
          className="media"
          id="v-cta"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          data-src={media.ctaVideo}
          poster={media.ctaPoster}
        ></video>
      )}
      <img
        className="media kb"
        data-fallback="v-cta"
        src={media.ctaPoster}
        alt=""
      />

      <h2 className="split" data-split>
        {cta.headingLine1}
        <br />
        {cta.headingLine2}
      </h2>

      <p className="rv" style={{ '--d': 2 } as React.CSSProperties}>
        {cta.text}
      </p>

      <div style={{ marginTop: '22px' }}>
        {regState.isClosed ? (
          <button
            className="btn-dark disabled rv"
            style={{ '--d': 3 } as React.CSSProperties}
            disabled
            title={regState.stateMessage}
            aria-disabled="true"
          >
            {cta.buttonLabel}
          </button>
        ) : (
          <Link
            href={cta.buttonHref || '/register'}
            className="btn-dark rv"
            style={{ '--d': 3 } as React.CSSProperties}
          >
            {cta.buttonLabel}
          </Link>
        )}

        {regState.deadlineLabel && (
          <div className="cta-deadline">
            Deadline: {regState.deadlineLabel}
          </div>
        )}
      </div>
    </div>
  );
}
