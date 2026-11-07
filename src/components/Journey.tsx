import React from 'react';
import type { SiteContent } from '@/lib/content';

export default function Journey({
  content,
}: {
  content: SiteContent;
}) {
  const { journey, media } = content;

  const stage1 = journey.stages[0];
  const stage2 = journey.stages[1];
  const stage3 = journey.stages[2];
  const stage4 = journey.stages[3];
  const stage5 = journey.stages[4];

  const renderStageCard = (
    stg: (typeof journey.stages)[0] | undefined,
    d: number
  ) => {
    if (!stg) return null;
    return (
      <div
        className="g-card rv"
        style={{ '--d': d } as React.CSSProperties}
      >
        <span className="lbl">
          STAGE {stg.n} · {stg.date || 'Date TBA'}
        </span>
        <h5>{stg.title}</h5>
        <em>{stg.text}</em>
        <div className="g-foot">
          <div className="stage-arrow">
            <svg viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="#3b2116" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="s-prod" id="journey">
      <div className="wrap">
        <div className="prod-shell">
          <div className="sec-head">
            <span className="eyebrow rv">{journey.eyebrow}</span>
            <h2 className="h2 split" data-split>
              {journey.headingLine1}
              <br />
              <span className="lt">{journey.headingLine2}</span>
            </h2>
            <p
              className="lead rv"
              style={{ '--d': 3 } as React.CSSProperties}
            >
              {journey.lead}
            </p>
          </div>

          <div className="stage" id="stage">
            <div className="col">
              {renderStageCard(stage1, 1)}
              {renderStageCard(stage2, 2)}
            </div>

            <div
              className="hand rv"
              style={{ '--d': 2 } as React.CSSProperties}
            >
              <img
                id="hand-img"
                src={media.journeyCenterImage}
                alt={journey.centerImageAlt || 'Journey milestone'}
              />
            </div>

            <div className="col">
              {renderStageCard(stage3, 3)}
              {renderStageCard(stage4, 4)}
            </div>
          </div>

          {stage5 && (
            <div
              className="g-card rv stage-5-card"
              style={{ '--d': 5 } as React.CSSProperties}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span className="lbl">
                    STAGE {stage5.n} · {stage5.date || 'Date TBA'}
                  </span>
                  <h5>{stage5.title}</h5>
                  <em>{stage5.text}</em>
                </div>
                <div className="stage-arrow" style={{ alignSelf: 'center' }}>
                  <svg viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="#3b2116" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Funding strip */}
          <div className="funding-strip">
            <div className="funding-head">
              <h3>{journey.funding.heading}</h3>
              <p>{journey.funding.subheading}</p>
            </div>

            <div className="funding-grid">
              {journey.funding.steps.map((st, idx) => (
                <div
                  key={idx}
                  className="g-card rv funding-step"
                  style={{ '--d': idx + 1 } as React.CSSProperties}
                >
                  <div className="funding-num">{idx + 1}</div>
                  <h5>{st.title}</h5>
                  <em>{st.text}</em>
                </div>
              ))}
            </div>

            <div className="funding-note">
              <div className="funding-note-dot"></div>
              <span>{journey.funding.note}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
