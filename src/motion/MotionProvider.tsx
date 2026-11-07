'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

export default function MotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    // Skip motion entirely on admin routes
    if (pathname && pathname.startsWith('/admin')) {
      return;
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timers: NodeJS.Timeout[] = [];
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const t = setTimeout(resolve, ms);
        timers.push(t);
      });

    // 1) Background videos: fade still image out when video starts playing
    document.querySelectorAll<HTMLVideoElement>('video.media[data-src]').forEach((v) => {
      const id = v.id;
      const url = v.dataset.src;
      const still = document.querySelector<HTMLElement>(`[data-fallback="${id}"]`);
      if (!url) return;
      v.src = url;
      v.addEventListener(
        'playing',
        () => {
          if (still) {
            still.style.transition = 'opacity 1.2s';
            still.style.opacity = '0';
          }
        },
        { once: true }
      );
      v.play().catch(() => {});
    });

    // 2) Split headings into words, keeping nested spans and <br>
    document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
      // Don't split if already split
      if (el.querySelector('.w')) return;

      let i = 0;
      const walk = (node: Node) => {
        Array.from(node.childNodes).forEach((n) => {
          if (n.nodeType === 3) {
            const text = n.textContent || '';
            const frag = document.createDocumentFragment();
            text.split(/(\s+)/).forEach((part) => {
              if (!part) return;
              if (/^\s+$/.test(part)) {
                frag.appendChild(document.createTextNode(' '));
                return;
              }
              const w = document.createElement('span');
              w.className = 'w';
              const s = document.createElement('span');
              s.textContent = part;
              s.style.setProperty('--i', String(i++));
              w.appendChild(s);
              frag.appendChild(w);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1 && (n as HTMLElement).tagName !== 'BR') {
            walk(n);
          }
        });
      };
      walk(el);
    });

    // 3) Count-up
    const countUp = (el: HTMLElement) => {
      const end = +(el.dataset.count || 0);
      const t0 = performance.now();
      const dur = reduce ? 1 : 2000;
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        el.textContent = String(Math.round(end * (1 - Math.pow(1 - p, 4))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    // 4) Reveal on scroll
    const reveal = (el: Element) => {
      if (el.classList.contains('in')) return;
      el.classList.add('in');
      el.querySelectorAll<HTMLElement>('[data-count]').forEach(countUp);
      if (el.id === 'gauge-card') {
        const arc = document.getElementById('g-arc');
        if (arc) arc.style.strokeDashoffset = '0'; // gauge fills 100%
      }
    };

    const targets = document.querySelectorAll('.rv,[data-split]');
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            reveal(e.target);
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
    );
    targets.forEach((el) => io.observe(el));

    // Safety net: reveal anything already on screen
    const sweep = () =>
      targets.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.94 && r.bottom > 0) {
          reveal(el);
        }
      });
    requestAnimationFrame(() => requestAnimationFrame(sweep));
    window.addEventListener('load', sweep);

    // 5) Hero card: reserve each reply's final height, then run two sequences
    document.querySelectorAll<HTMLElement>('#studio .ai-t').forEach((el) => {
      const text = el.dataset.text || '';
      if (!el.querySelector('.ghost')) {
        el.innerHTML = '<span class="ghost"></span><span class="live"></span>';
        if (el.firstChild) {
          el.firstChild.textContent = text;
        }
      }
    });

    const typeInto = (el: HTMLElement, text: string, speed = 14) =>
      new Promise<void>((res) => {
        const live = el.querySelector<HTMLElement>('.live');
        if (!live) return res();
        if (reduce) {
          live.textContent = text;
          return res();
        }
        live.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
        const startTimer = setTimeout(() => {
          live.textContent = '';
          let k = 0;
          const step = () => {
            k += 2;
            live.textContent = text.slice(0, k);
            if (k < text.length) {
              const stepTimer = setTimeout(step, speed);
              timers.push(stepTimer);
            } else {
              res();
            }
          };
          step();
        }, 650);
        timers.push(startTimer);
      });

    const runColumn = async (items: HTMLElement[], done?: () => void) => {
      await wait(reduce ? 0 : 1500);
      for (const m of items) {
        m.classList.add('show');
        if (m.id === 'hero-fig') m.classList.add('in');
        const t = m.querySelector<HTMLElement>('.ai-t');
        if (t) {
          await typeInto(t, t.dataset.text || '');
        } else {
          await wait(reduce ? 0 : 380);
        }
      }
      if (done) done();
    };

    const chatMsgs = Array.from(
      document.querySelectorAll<HTMLElement>('#studio .chat .msg')
    );
    const prodMsgs = Array.from(
      document.querySelectorAll<HTMLElement>('#studio .prod .msg')
    );

    if (chatMsgs.length > 0) {
      runColumn(chatMsgs, () => {
        const tr = document.getElementById('hero-track');
        if (tr) tr.style.width = (tr.dataset.value || 84) + '%';
      });
    }

    if (prodMsgs.length > 0) {
      runColumn(prodMsgs);
    }

    // 6) Smooth scroll + scroll handler for nav state & hand parallax
    const nav = document.getElementById('nav');
    const hand = document.getElementById('hand-img');
    const stage = document.getElementById('stage');

    const onScroll = () => {
      if (nav) {
        nav.classList.toggle('scrolled', window.scrollY > 20);
      }
      if (!reduce && hand && stage) {
        const r = stage.getBoundingClientRect();
        const p = Math.min(
          1,
          Math.max(0, (window.innerHeight - r.top) / (window.innerHeight + r.height))
        );
        hand.style.transform = `translate3d(0, ${(-p * 12).toFixed(2)}%, 0)`;
      }
    };

    let lenis: Lenis | null = null;
    let rafId: number | null = null;

    if (!reduce) {
      lenis = new Lenis({
        duration: 1.25,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      lenis.on('scroll', onScroll);

      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    } else {
      let ticking = false;
      const nativeScroll = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            onScroll();
            ticking = false;
          });
          ticking = true;
        }
      };
      window.addEventListener('scroll', nativeScroll, { passive: true });
    }
    onScroll();

    // 7) Anchor links + mobile menu
    const anchorClickHandlers: Array<{ el: Element; handler: (e: Event) => void }> = [];
    const isHomePage = pathname === '/' || pathname === '';

    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"], a[href^="/#"]').forEach((a) => {
      const handler = (e: Event) => {
        const rawHref = a.getAttribute('href') || '';
        let targetId = '';

        if (rawHref.startsWith('/#')) {
          if (!isHomePage) return; // Allow normal navigation if on another page
          targetId = rawHref.substring(1);
        } else if (rawHref.startsWith('#')) {
          targetId = rawHref;
        }

        document.body.classList.remove('menu-open');
        if (!targetId || targetId.length < 2) return;

        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(target as HTMLElement, { offset: -70 });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      };

      a.addEventListener('click', handler);
      anchorClickHandlers.push({ el: a, handler });
    });

    const burger = document.getElementById('burger');
    const burgerHandler = () => document.body.classList.toggle('menu-open');
    if (burger) {
      burger.addEventListener('click', burgerHandler);
    }

    // Cleanup
    return () => {
      timers.forEach(clearTimeout);
      io.disconnect();
      window.removeEventListener('load', sweep);
      document.body.classList.remove('menu-open');
      if (burger) {
        burger.removeEventListener('click', burgerHandler);
      }
      anchorClickHandlers.forEach(({ el, handler }) => {
        el.removeEventListener('click', handler);
      });
      if (lenis) {
        lenis.destroy();
      }
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [pathname]);

  return <>{children}</>;
}
