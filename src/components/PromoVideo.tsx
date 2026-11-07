'use client';

import React, { useState } from 'react';
import type { SiteContent } from '@/lib/content';

export function parseEmbedVideo(url: string, type: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (type === 'youtube' && (host.includes('youtube.com') || host.includes('youtu.be'))) {
      if (host.includes('youtu.be')) {
        const id = parsed.pathname.slice(1).split('/')[0];
        return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1` : null;
      }
      if (parsed.searchParams.has('v')) {
        const id = parsed.searchParams.get('v');
        return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1` : null;
      }
      if (parsed.pathname.includes('/shorts/')) {
        const id = parsed.pathname.split('/shorts/')[1]?.split('/')[0];
        return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1` : null;
      }
      if (parsed.pathname.includes('/embed/')) {
        const id = parsed.pathname.split('/embed/')[1]?.split('/')[0];
        return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1` : null;
      }
    }

    if (type === 'vimeo' && (host.includes('vimeo.com') || host.includes('player.vimeo.com'))) {
      const match = parsed.pathname.match(/\/([0-9]+)/);
      if (match && match[1]) {
        return `https://player.vimeo.com/video/${match[1]}?autoplay=1`;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export default function PromoVideo({
  content,
}: {
  content: SiteContent;
}) {
  const { promoVideo, media } = content;
  const [isPlaying, setIsPlaying] = useState(false);

  if (promoVideo.enabled === false) {
    return null;
  }

  const hasUrl = Boolean(promoVideo.url && promoVideo.url.trim() !== '');
  const isNone = promoVideo.type === 'none' || !hasUrl;
  const poster = promoVideo.poster || media.aboutPoster;

  let embedUrl: string | null = null;
  if (!isNone && (promoVideo.type === 'youtube' || promoVideo.type === 'vimeo')) {
    embedUrl = parseEmbedVideo(promoVideo.url, promoVideo.type);
  }

  return (
    <section className="s-promo" id="promo">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow rv">{promoVideo.eyebrow}</span>
          <h2 className="h2 split" data-split>
            {promoVideo.heading}
          </h2>
          <p className="lead rv" style={{ '--d': 3 } as React.CSSProperties}>
            {promoVideo.caption}
          </p>
        </div>

        <div className="promo rv rv-scale">
          {isNone || (!embedUrl && promoVideo.type !== 'file') ? (
            <div className="promo-placeholder">
              {poster && <img src={poster} alt="" />}
              <span className="eyebrow" style={{ zIndex: 1, background: 'rgba(255,255,255,.9)' }}>
                {promoVideo.comingSoonText || 'Promo Video Coming Soon'}
              </span>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,.6)',
                  display: 'grid',
                  placeItems: 'center',
                  opacity: 0.5,
                  zIndex: 1,
                }}
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="#2a1a12">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
            </div>
          ) : promoVideo.type === 'file' ? (
            <video
              controls
              playsInline
              preload="metadata"
              poster={poster}
              src={promoVideo.url}
            ></video>
          ) : embedUrl ? (
            isPlaying ? (
              <iframe
                src={embedUrl}
                title="THINK MIT Promo Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div style={{ position: 'absolute', inset: 0 }}>
                {poster && <img src={poster} alt="" className="media" />}
                <button
                  className="promo-play-btn"
                  onClick={() => setIsPlaying(true)}
                  aria-label="Play promo video"
                >
                  <svg viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </button>
              </div>
            )
          ) : (
            <div className="promo-placeholder">
              <span>{promoVideo.comingSoonText}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
