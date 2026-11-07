import React from 'react';
import Link from 'next/link';
import type { SiteContent } from '@/lib/content';
import { getRegistrationState } from '@/lib/registration-state';

export default function Hero({
  content,
}: {
  content: SiteContent;
}) {
  const { site, hero, media, registration } = content;
  const regState = getRegistrationState(registration);

  const headlineLine1 = site.heroHeadline?.[0] || 'Your Idea.';
  const headlineLine2 = site.heroHeadline?.[1] || 'Our Campus.';

  return (
    <section className="hero" id="home">
      <div className="wrap">
        <div className="hero-head">
          <h1
            className="h-display split"
            data-split
            style={{ '--base': '150ms' } as React.CSSProperties}
          >
            {headlineLine1}
            <br />
            {headlineLine2}
          </h1>

          <p
            className="hero-sub rv"
            style={{ '--base': '700ms' } as React.CSSProperties}
          >
            {hero.subtitle}
          </p>

          <div
            className="hero-actions rv"
            style={{ '--base': '780ms' } as React.CSSProperties}
          >
            {regState.isClosed ? (
              <button
                className="btn-dark disabled"
                disabled
                title={regState.stateMessage}
                aria-disabled="true"
              >
                {hero.primaryCta.label}
              </button>
            ) : (
              <Link href={hero.primaryCta.href || '/register'} className="btn-dark">
                {hero.primaryCta.label}
              </Link>
            )}

            <a href={hero.secondaryCta.href || '#about'} className="pill">
              {hero.secondaryCta.label}
            </a>
          </div>
        </div>

        <div
          className="hero-card rv rv-scale"
          style={{ '--base': '850ms' } as React.CSSProperties}
        >
          {media.heroVideo && (
            <video
              className="media"
              id="v-hero"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              data-src={media.heroVideo}
              poster={media.heroPoster}
            ></video>
          )}
          <img
            className="media kb"
            data-fallback="v-hero"
            src={media.heroPoster}
            alt=""
          />

          <div className="shade"></div>

          <div id="studio" className="studio">
            <div className="chat">
              <div className="chat-top">
                <span>{hero.panel.chatTitle}</span>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>

              {hero.panel.messages.map((msg, idx) => {
                if (msg.type === 'bubble') {
                  return (
                    <div key={idx} className="msg bubble">
                      {msg.text}
                    </div>
                  );
                }
                return (
                  <div key={idx} className="msg ai">
                    <div className="ai-ic">
                      <svg viewBox="0 0 40 40" fill="#2a1a12">
                        <path d="M5 5h13v13H5zM22 22h13v13H22z" />
                        <path d="M22 5a13 13 0 0 1 13 13H22zM18 35A13 13 0 0 1 5 22h13z" />
                      </svg>
                    </div>
                    <div className="ai-t" data-text={msg.text}>
                      <span className="ghost">{msg.text}</span>
                      <span className="live"></span>
                    </div>
                  </div>
                );
              })}

              <div className="cd msg">
                <div>
                  <small>{hero.panel.blueprintLabel}</small>
                  <strong>{hero.panel.blueprintTitle}</strong>
                </div>
                <div className="slider">
                  <small>{hero.panel.sliderLabel}</small>
                  <div className="track">
                    <b
                      id="hero-track"
                      data-value={hero.panel.sliderValue || 84}
                    ></b>
                  </div>
                </div>
              </div>
            </div>

            <div className="prod">
              <span className="msg">{hero.panel.rightTitle}</span>
              <figure id="hero-fig" className="msg">
                <img
                  src={media.heroPanelImage}
                  alt={hero.panel.rightImageAlt || 'Pitch Preview'}
                />
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
