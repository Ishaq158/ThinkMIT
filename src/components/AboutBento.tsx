import React from 'react';
import Link from 'next/link';
import type { SiteContent } from '@/lib/content';

export default function AboutBento({
  content,
}: {
  content: SiteContent;
}) {
  const { about, roles, media } = content;

  return (
    <section className="s-bento" id="about">
      <div className="wrap">
        <div className="bento-shell">
          {media.aboutVideo && (
            <video
              className="media"
              id="v-bento"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              data-src={media.aboutVideo}
              poster={media.aboutPoster}
            ></video>
          )}
          <img
            className="media kb"
            data-fallback="v-bento"
            src={media.aboutPoster}
            alt=""
          />

          <div className="sec-head">
            <span className="eyebrow rv">{about.eyebrow}</span>
            <h2 className="h2 split" data-split>
              {about.headingLine1}
              <br />
              <span className="lt">{about.headingLine2}</span>
            </h2>
            <p
              className="lead rv"
              style={{ '--d': 3 } as React.CSSProperties}
            >
              {about.lead}
            </p>
          </div>

          <div className="bento">
            {/* 1. Big Card */}
            <div
              className="card c-big rv"
              style={{ '--d': 1 } as React.CSSProperties}
            >
              <img src={media.aboutBigCard} alt="" />
              <div>
                <h3>
                  {about.cards.big.title}
                  <br />
                  <span>{about.cards.big.titleSoft}</span>
                </h3>
                <p className="desc">{about.cards.big.desc}</p>
              </div>

              <div>
                <div className="c-big-foot">
                  <div className="c-big-avatars">
                    <img src={media.aboutCollageA} alt="" />
                    <img src={media.aboutCollageB} alt="" />
                    <img src={media.aboutFundingImage} alt="" />
                  </div>
                  <span style={{ fontSize: '11.5px', opacity: 0.9 }}>
                    {about.cards.big.footnote}
                  </span>
                </div>
                <Link href="/register" className="btn-white">
                  {about.cards.big.ctaLabel}
                </Link>
              </div>
            </div>

            {/* 2. Eligibility */}
            <div
              className="card c-pad rv"
              style={{ '--d': 2 } as React.CSSProperties}
            >
              <div className="collage">
                <img src={media.aboutCollageA} alt="" />
                <img src={media.aboutCollageB} alt="" />
              </div>
              <div className="txt">
                <h4>{about.cards.eligibility.title}</h4>
                <p>{about.cards.eligibility.text}</p>
              </div>
            </div>

            {/* 3. Training Gauge */}
            <div
              className="card c-pad rv"
              id="gauge-card"
              style={{ '--d': 3 } as React.CSSProperties}
            >
              <div className="gauge">
                <svg
                  viewBox="0 0 180 100"
                  style={{ width: '180px', height: '110px', overflow: 'visible' }}
                >
                  <defs>
                    <linearGradient id="gg" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#a9c6e6" />
                      <stop offset="100%" stopColor="#e9a77d" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M10 95 A80 80 0 0 1 170 95"
                    stroke="rgba(42,26,18,.1)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    id="g-arc"
                    d="M10 95 A80 80 0 0 1 170 95"
                    stroke="url(#gg)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray="252"
                    strokeDashoffset="252"
                    style={{
                      transition: 'stroke-dashoffset 2.2s cubic-bezier(.22,1,.36,1)',
                    }}
                  />
                </svg>
                <div className="val">
                  <span data-count={about.cards.training.count}>0</span>
                  {about.cards.training.countSuffix}
                </div>
                <div className="ends">
                  <span>{about.cards.training.endsLeft}</span>
                  <span>{about.cards.training.endsRight}</span>
                </div>
              </div>
              <div className="txt">
                <h4>{about.cards.training.title}</h4>
                <p>{about.cards.training.text}</p>
              </div>
            </div>

            {/* 4. Three Roles */}
            <div
              className="card c-pad rv"
              style={{ '--d': 4 } as React.CSSProperties}
            >
              <div className="rows">
                {roles.map((role, idx) => (
                  <div
                    key={role.key || idx}
                    className="row"
                    style={{ '--i': idx } as React.CSSProperties}
                  >
                    <div className="row-avatar">{role.label.charAt(0)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <b>{role.label}</b>
                      <em>{role.summary}</em>
                    </div>
                    <div className="ok">
                      <svg viewBox="0 0 24 24">
                        <polyline
                          points="20 6 9 17 4 12"
                          stroke="#fff"
                          strokeWidth="3"
                          fill="none"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
              <div className="txt">
                <h4>{about.cards.roles.title}</h4>
                <p>{about.cards.roles.text}</p>
              </div>
            </div>

            {/* 5. Funding */}
            <div
              className="card c-pad rv"
              style={{ '--d': 5 } as React.CSSProperties}
            >
              <div className="insight">
                <img src={media.aboutFundingImage} alt="" />
                <div className="chip">
                  <div className="chip-dot"></div>
                  <span>{about.cards.funding.chip}</span>
                </div>
              </div>
              <div className="txt">
                <h4>{about.cards.funding.title}</h4>
                <p>{about.cards.funding.text}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
