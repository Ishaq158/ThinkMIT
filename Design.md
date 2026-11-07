# Design.md — THINK MIT Visual & Motion Spec

> Companion to `PRD.md` and `data.js`. This file defines **everything visual**: tokens, CSS, layout, animation, responsive rules, and what content goes into each design block.
> The design language comes from a premium "glass + warm cream" landing-page template (originally called *Velia*). **Keep the look exactly**; only the *content* is replaced with THINK MIT content from `data.js`.
> Blocks marked **VERBATIM** must be copied exactly — do not rewrite, simplify or "improve" them.

---

## 0. How this spec maps to the app

| Source template rule | In this project |
|---|---|
| "Single `index.html`, all CSS/JS inline, no build step" | **Relaxed.** The app is Next.js (see PRD §3). Put the CSS in `src/styles/design.css`, the script in `src/motion/MotionProvider.tsx`. Look, class names, behaviour and timings must remain identical. |
| Lenis via CDN | Use npm `lenis@1.1.13` (same version, same options). |
| Hard-coded Velia text | **All text comes from `data.js`** (merged with admin overrides). Keys are in brackets below. |
| "Exactly 4 sections" | Replaced by the section list in §6 (8 sections + register page). |
| Images/videos via CloudFront | Still URLs, but now read from `data.js → media.*` (defaults are the template's CloudFront URLs; organiser replaces them). |

Add `document.documentElement.classList.add('js')` as an **inline script in `<head>`** (before paint) so hidden states apply from first paint and content is still visible if JS fails.

---

## 1. Fonts, libraries, tokens (VERBATIM values)

- Font: Google Font **Inter Tight** (preconnect to `fonts.googleapis.com` and `fonts.gstatic.com`):
  `https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap`
- Smooth scroll: **Lenis** 1.1.13.

```css
:root{
  --bg:#f6f0e7; --ink:#2a1a12; --ink-2:#5b4a3f; --brown:#3b2116; --pill:#ece3d7;
  --line:rgba(42,26,18,.08); --glass:rgba(250,245,238,.55); --glass-b:rgba(255,255,255,.55);
  --r-xl:34px; --ease:cubic-bezier(.22,1,.36,1); --ease-io:cubic-bezier(.65,0,.35,1)
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--ink);font-family:"Inter Tight",system-ui,sans-serif;font-weight:400;line-height:1.5;overflow-x:hidden;-webkit-font-smoothing:antialiased}
img,video{display:block;max-width:100%}
a{color:inherit;text-decoration:none}
button,input,textarea,select{font:inherit}
.wrap{width:100%;max-width:1440px;margin:0 auto;padding:0 24px}
@media (max-width:640px){.wrap{padding:0 16px}}
```
- Do **NOT** set `scroll-behavior:smooth` on `html` (Lenis handles scrolling).
- **IMPORTANT:** never combine `aspect-ratio` with `min-height` on a full-width block (min-height leaks into width via the ratio → horizontal overflow). Use the explicit heights given below.

**Logo mark** (nav, chat avatars, footer; used when `site.logoUrl` is null):
```html
<svg viewBox="0 0 40 40" fill="#2a1a12"><path d="M5 5h13v13H5zM22 22h13v13H22z"/><path d="M22 5a13 13 0 0 1 13 13H22zM18 35A13 13 0 0 1 5 22h13z"/></svg>
```

---

## 2. Animation + heading CSS — VERBATIM

```css
/* content is visible if JS fails; hidden states only apply once JS adds .js to <html> */
.js .rv{opacity:0;transform:translate3d(0,28px,0);filter:blur(8px)}
.rv{transition:opacity 1.1s var(--ease),transform 1.1s var(--ease),filter 1.1s var(--ease);transition-delay:calc(var(--d,0) * 90ms + var(--base,0ms))}
.js .rv-scale{transform:scale(.96) translateY(24px)}
.js .rv.in{opacity:1;transform:none;filter:none}

/* split headings: every word is .w > span */
.split .w{display:inline-block;overflow:hidden;vertical-align:top;padding:0 .02em .12em;margin:0 -.02em -.12em}
.split .w>span{display:inline-block;will-change:transform}
.js .split .w>span{transform:translateY(110%) rotate(4deg);opacity:0;transition:transform 1.2s var(--ease),opacity 1.2s var(--ease);transition-delay:calc(var(--i) * 70ms + var(--base,0ms))}
.js .split.in .w>span{transform:none;opacity:1}

/* hero headline gradient goes on EACH WORD, never on a wrapper */
.h-display{font-weight:400;font-size:clamp(48px,7.6vw,112px);line-height:.96;letter-spacing:-.045em;color:#3a2419}
.h-display .w>span{background:linear-gradient(180deg,#3a2419 0%,#6d5547 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent}

.h2{font-weight:400;font-size:clamp(34px,4.4vw,62px);line-height:1.02;letter-spacing:-.04em;margin-top:18px;color:#2a1a12}
.h2 .lt{color:#8d7b6f;font-weight:300}
.cta h2{font-weight:400;font-size:clamp(56px,8.4vw,128px);line-height:.9;letter-spacing:-.055em;color:#2a1a12}

/* Lenis required CSS */
html.lenis,html.lenis body{height:auto}
.lenis.lenis-smooth{scroll-behavior:auto!important}
.lenis.lenis-stopped{overflow:hidden}

.media{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.media.kb{animation:kb 26s var(--ease-io) infinite alternate}
@keyframes kb{from{transform:scale(1.04)}to{transform:scale(1.12) translate3d(-1.5%,-1%,0)}}

/* typed AI replies sit on top of an invisible full-length copy, so the card never changes height while typing */
.ai-t{display:grid}
.ai-t>span{grid-area:1/1}
.ai-t .ghost{visibility:hidden}

@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation:none!important;transition-duration:.01ms!important;transition-delay:0ms!important}
  .js .rv,.js .split .w>span,.msg,.row{opacity:1!important;transform:none!important;filter:none!important}
}
```
**Stagger rule:** siblings get `style="--d:1"`, `--d:2`, …; above-the-fold items get a fixed delay with `style="--base:700ms"`.

**Heading markup** (the script splits words at runtime; build the `<br>`/`<span class="lt">` from data):
```html
<h1 class="h-display split" data-split style="--base:150ms">{site.heroHeadline[0]}<br>{site.heroHeadline[1]}</h1>
<h2 class="h2 split" data-split>{about.headingLine1}<br><span class="lt">{about.headingLine2}</span></h2>
<h2 class="h2 split" data-split>{journey.headingLine1}<br><span class="lt">{journey.headingLine2}</span></h2>
<h2 class="split" data-split>{cta.headingLine1}<br>{cta.headingLine2}</h2>   <!-- inside .cta -->
```
Other section headings (promo, guidelines, contact, selected, register) use `.h2` with the same `split` markup.

---

## 3. Shared components

### 3.1 Video / image background pattern
Used by hero card, about shell, CTA band. First children of the container:
```html
<video class="media" id="v-hero" autoplay muted loop playsinline preload="auto" data-src="{media.heroVideo}" poster="{media.heroPoster}"></video>
<img class="media kb" data-fallback="v-hero" src="{media.heroPoster}" alt="">
```
(about: id `v-bento`, `preload="metadata"`, `media.aboutVideo/aboutPoster`; CTA: id `v-cta`, `preload="metadata"`, `media.ctaVideo/ctaPoster`.) The `src` is assigned by the script from `data-src`. The still fades out when the video fires `playing`. If a media URL is empty, render only the still (or a flat `#e8dccb` background) — never an empty `<video>`.

### 3.2 Nav (fixed) `<header class="nav" id="nav">`
- `position:fixed; inset:0 0 auto 0; z-index:50; padding:16px 0; transition: background/padding/box-shadow .5s var(--ease)`.
- `.nav.scrolled`: `background:rgba(246,240,231,.72); backdrop-filter:blur(18px) saturate(140%)` (+`-webkit-`), `padding:10px 0`, `box-shadow:0 1px 0 var(--line)`.
- Inner `.wrap`: grid `1fr auto 1fr`, `align-items:center`.
- **Left `.nav-l`** (flex, gap 10px): pill links from `nav.links` (first 3). `.pill`: `background:var(--pill); border-radius:999px; padding:10px 24px; font-size:13px; text-transform:uppercase; letter-spacing:.04em`; hover `background:#e3d6c6; transform:translateY(-1px)`.
- **Centre:** `<a class="logo">` 44×44 grid-centred; 40×40 logo mark that rotates 90° on hover (`.8s var(--ease)`); links to `/`.
- **Right `.nav-r`** (flex, justify-end, gap 22px): `.lang`-slot is **removed** in this project (no language switch) — replace with the 4th nav link (`Contact`) as a text link 13px uppercase; then `<a class="btn-dark" href={nav.ctaHref}>{nav.ctaLabel}</a>`; then `<button class="burger" id="burger" aria-label="Menu">` (hidden on desktop).
- **`.btn-dark`:** `background:var(--brown); color:#f6ede2; border-radius:999px; padding:11px 26px; font-size:13px; text-transform:uppercase; letter-spacing:.05em; border:0; cursor:pointer; position:relative; overflow:hidden; isolation:isolate`. `::before` sheen: `linear-gradient(120deg,transparent 30%,rgba(255,255,255,.22) 50%,transparent 70%)` at `translateX(-120%)`, `z-index:-1`; on hover → `translateX(120%)` (`.9s var(--ease)`). Hover also `translateY(-2px)` + `box-shadow:0 12px 28px -12px rgba(59,33,22,.6)`. Disabled state (registration closed): opacity .5, no hover effects, `cursor:not-allowed`.
- **`.burger`:** 42px circle, `var(--pill)`, no border, flex column centred, gap 5px, two `<i>` lines 16×1.5px `var(--ink)`. `body.menu-open` → X: first line `translateY(3.25px) rotate(45deg)`, last `translateY(-3.25px) rotate(-45deg)`.
- **`.mmenu#mmenu`:** `position:fixed; inset:0; z-index:40; background:rgba(246,240,231,.96); backdrop-filter:blur(20px)`; flex column centred, gap 18px; `opacity:0; pointer-events:none; transition:.5s`. Links 34px, `letter-spacing:-.03em`, start `opacity:0; translateY(16px)`. `body.menu-open` shows menu; links animate in with delays 0, .06s, .12s, .18s, .24s. Links: all `nav.links` + `nav.mobileExtraLabel` (→ `nav.ctaHref`).
- On admin pages the public nav is **not** rendered.

### 3.3 Eyebrow, lead, cards, glass
- `.eyebrow` (class `rv`): `display:inline-block; font-size:10.5px; text-transform:uppercase; letter-spacing:.14em; background:rgba(255,255,255,.65); border:1px solid rgba(255,255,255,.8); padding:6px 12px; border-radius:999px; backdrop-filter:blur(8px); color:var(--ink-2)`.
- `.lead` (class `rv`, `--d:3`): `max-width:440px; margin:16px auto 0; font-size:14px; color:var(--ink-2); line-height:1.55`.
- `.card`: `position:relative; border-radius:24px; overflow:hidden; background:var(--glass); backdrop-filter:blur(22px) saturate(130%); border:1px solid var(--glass-b); box-shadow:inset 0 1px 0 rgba(255,255,255,.6),0 20px 40px -30px rgba(40,30,20,.35); transition:transform .7s var(--ease),box-shadow .7s var(--ease)`; hover `translateY(-6px)` + `0 30px 60px -30px rgba(40,30,20,.45)`. `h4`: 16px/400. `p`: 12px, line-height 1.5, `#5b4a3f`, margin-top 6px.
- `.c-pad`: padding 14px, flex column, min-height 272px; `.txt`: padding `14px 6px 4px`.
- `.btn-white`: block, centred, `background:#fff; color:#2a1a12; border-radius:999px; padding:12px; font-size:13px; margin-top:14px`; hover `translateY(-2px)`.
- `.g-card` (glass card for journey): `background:rgba(255,255,255,.62); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,.85); border-radius:20px; padding:16px; box-shadow:0 20px 40px -30px rgba(40,30,20,.35); transition:.6s`; hover `translateY(-4px)`. `.lbl`: 10px uppercase `letter-spacing:.12em` `#8a7a6e`. `h5`: 17px/400 `letter-spacing:-.01em`. `em`: normal style, 11.5px `#8a7a6e`.

---

## 4. Section 1 — HERO `<section class="hero" id="home">`

`padding-top:118px`. `.hero-head`: centred, `padding:0 16px`, contains the H1 (markup in §2), then
`<p class="hero-sub rv" style="--base:700ms">{hero.subtitle}</p>` — italic, `clamp(16px,1.5vw,20px)`, `var(--ink-2)`, `margin-top:22px`.
Below the subtitle (new): two buttons in a flex row, centred, gap 12px, `margin-top:26px`, class `rv` `style="--base:780ms"`: primary `.btn-dark` ({hero.primaryCta}), secondary `.pill` ({hero.secondaryCta}). Primary follows the registration-state rule (PRD §5.1).

**`.hero-card`** (`class="hero-card rv rv-scale"`, `style="--base:850ms"`): `position:relative; margin-top:34px; border-radius:34px; overflow:hidden; height:clamp(680px,45.5vw,860px)` (**no aspect-ratio, no min-height**); `background:#e8dccb; box-shadow:0 40px 80px -50px rgba(59,33,22,.45)`. Children in order: video pattern (hero) → `<div class="shade">` (`position:absolute; inset:0; background:radial-gradient(60% 70% at 50% 55%,rgba(246,240,231,.18),transparent 70%)`) → the studio panel.

**`#studio.studio`:** `position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:min(920px,74%); display:grid; grid-template-columns:1.7fr 1fr; border-radius:26px; background:rgba(240,232,222,.42); backdrop-filter:blur(26px) saturate(130%); border:1px solid rgba(255,255,255,.55); box-shadow:0 30px 60px -30px rgba(40,20,10,.35),inset 0 1px 0 rgba(255,255,255,.6); overflow:hidden`.

**LEFT `.chat`** (`padding:22px 24px; display:flex; flex-direction:column; gap:12px`). Every child has class `msg`:
1. `.chat-top` — `{hero.panel.chatTitle}` + 10px chevron. 12px uppercase, `letter-spacing:.08em`, `#4b3a30`.
2. For each item in `hero.panel.messages`: `type:"bubble"` → `.bubble`; `type:"ai"` → `.ai` = `<div class="ai-ic">` (20px circle `rgba(255,253,249,.92)` with a 12px logo mark) + `<div class="ai-t" data-text="{text}"></div>`.
3. `.cd` (`margin-top:auto; display:flex; justify-content:space-between; align-items:flex-end; gap:20px; padding-top:6px`): left = `<small>{blueprintLabel}</small>` (block, 11px uppercase, `letter-spacing:.08em`, `#6a594d`) + `<strong>{blueprintTitle}</strong>` (block, weight 400, `clamp(18px,1.7vw,24px)`, `letter-spacing:-.02em`, margin-top 2px). Right = `.slider` (`width:44%; min-width:120px; text-align:right`): `<small>{sliderLabel}</small>` (11.5px, no uppercase) + `.track` (`position:relative; height:8px; border-radius:99px; background:rgba(255,255,255,.55); margin-top:8px`) containing `<b id="hero-track">` (`position:absolute; left:0; top:0; bottom:0; width:0; border-radius:99px; background:linear-gradient(90deg,#e2875c,#d4612f); transition:width 1.8s var(--ease)`). `b::after`: 18px white circle, `2px solid #d4612f` border, `box-shadow:0 4px 10px rgba(0,0,0,.15)`, vertically centred, `right:-9px`. Script sets width to `{sliderValue}%`.
- `.bubble`: `align-self:flex-end; max-width:72%; background:rgba(255,253,249,.9); border-radius:16px; padding:10px 14px; font-size:12.5px; line-height:1.4; color:#3b2a20; box-shadow:0 6px 18px -10px rgba(40,20,10,.25)`.
- `.ai`: `display:flex; flex-direction:column; gap:6px; max-width:82%; font-size:12.5px; line-height:1.5; color:#3d2e25`.
- `.msg`: `opacity:0; transform:translateY(12px) scale(.98); transition:.8s var(--ease)`. `.msg.show`: `opacity:1; transform:none`.
- Typing dots `<span class="typing"><i></i><i></i><i></i></span>`: `.typing{display:inline-flex;gap:4px;padding:6px 0;align-self:start}`; each `i` 5px circle `#7a675b`, `animation:dot 1.2s infinite ease-in-out` (delays 0, .15s, .3s); `@keyframes dot{0%,80%,100%{opacity:.25;transform:none}40%{opacity:1;transform:translateY(-3px)}}`.

**RIGHT `.prod`** (`padding:14px; border-left:1px solid rgba(255,255,255,.45); display:flex; flex-direction:column; gap:10px`):
`<span class="msg">{hero.panel.rightTitle}</span>` (12.5px, `#4b3a30`), then `<figure id="hero-fig" class="msg"><img src="{media.heroPanelImage}" alt="{rightImageAlt}"></figure>`. Figure: `position:relative; flex:1; border-radius:14px; overflow:hidden; min-height:240px`; img `position:absolute; inset:0; object-fit:cover; transform:scale(1.15); transition:transform 2.4s var(--ease)`; `figure.in img{transform:scale(1)}`; `figure::after` sheen `linear-gradient(110deg,transparent 40%,rgba(255,255,255,.45) 50%,transparent 60%)` at `translateX(-100%)`, animated to `translateX(100%)` over 1.6s `var(--ease)` starting at 1.4s (forwards).

The two columns animate as **independent, simultaneous** sequences (script §10).

---

## 5. Section 2 — ABOUT BENTO `<section class="s-bento" id="about">`

`padding-top:120px`. **`.bento-shell`:** `position:relative; border-radius:34px; overflow:hidden; padding:72px 40px 40px; isolation:isolate`. Video pattern (about) with `.media` at `z-index:-2`. `::before` at `z-index:-1`: `linear-gradient(180deg,rgba(220,234,248,.55) 0%,rgba(246,240,231,.05) 40%,rgba(246,240,231,.15) 100%)`.

Centred `.sec-head`: eyebrow `{about.eyebrow}` → H2 (§2) → `<p class="lead rv" style="--d:3">{about.lead}</p>`.

**`.bento`** grid: `margin-top:48px; display:grid; grid-template-columns:1.25fr 1fr 1fr; gap:14px`. Each card has class `rv`, `--d:1…5`:

1. **`.card.c-big`** — `grid-row:span 2; min-height:560px; padding:28px; color:#fff; display:flex; flex-direction:column; justify-content:space-between; background:transparent; border-color:rgba(255,255,255,.35)`. First child `<img src={media.aboutBigCard}>` (absolute cover, `z-index:-2`, `scale(1.05)` on card hover over 1.6s). `::before` at `z-index:-1`: `linear-gradient(180deg,rgba(48,30,20,.62) 0%,rgba(48,30,20,.25) 28%,rgba(60,40,28,0) 45%,rgba(60,40,28,.05) 60%,rgba(40,25,15,.55) 100%)`.
   Top: `<h3>{cards.big.title}<br><span>{cards.big.titleSoft}</span></h3>` (`clamp(28px,2.6vw,38px)`, 400, line-height 1.05, `letter-spacing:-.035em`; span `opacity:.72`) + `<p class="desc">{cards.big.desc}</p>` (12.5px, opacity .85, max-width 300px, margin-top 12px).
   Bottom: footnote line `{cards.big.footnote}` (11.5px) with three overlapping 30px circles (2px white border, `margin-left:-8px` except first) using `media.aboutCollageA/B/aboutFundingImage`; then `<a class="btn-white">{cards.big.ctaLabel}</a>` → `/register`.
2. **`.c-pad` Eligibility** — `.collage` (flex 1, 2-col grid, gap 6px, min-height 140px, radius 16px, overflow hidden) with `media.aboutCollageA/B` (cover, radius 12px, `scale(1.05)` on hover). `.txt`: `h4` `{cards.eligibility.title}`, `p` `{cards.eligibility.text}`.
3. **`.c-pad#gauge-card` Training gauge** — `.gauge` (relative, flex 1, grid centred, min-height 150px) with `<svg viewBox="0 0 180 100" style="width:180px;height:110px;overflow:visible">`: track path `d="M10 95 A80 80 0 0 1 170 95"` stroke `rgba(42,26,18,.1)` width 12 round caps; arc `path#g-arc` same `d`, stroke `url(#gg)` width 12 round caps, `stroke-dasharray:252; stroke-dashoffset:252; transition:stroke-dashoffset 2.2s cubic-bezier(.22,1,.36,1)`; `linearGradient#gg` (x1 0→x2 1) `#a9c6e6 → #e9a77d`. Value `.val` (absolute, top/left 50%, `translate(-50%,-20%)`, 30px, `letter-spacing:-.03em`) = `<span data-count="{cards.training.count}">0</span>{countSuffix}`. `.ends` row (absolute bottom 6px, left/right 12px, space-between, 10px `#7a6a5e`): `{endsLeft}` / `{endsRight}`. The arc **fills 100%** (training is 3 of 3 days). `.txt`: `{cards.training.title}` / `{cards.training.text}`.
4. **`.c-pad` Three roles** — `.rows` (flex 1, column, gap 6px, padding 6px) with **3 `.row`s from `roles[]`** (`style="--i:0/1/2"`). Row: flex, align center, gap 10px, `background:rgba(255,255,255,.62); border-radius:12px; padding:8px; font-size:11.5px`; a 34px avatar tile (radius 8px) showing the role's **initial letter on `var(--pill)`** (no photo needed); `<b>` role label (12px, 500, block) + `<em>` role `summary` (normal style, 10.5px `#8a7a6e`); `.ok` = 18px `#2a1a12` circle on the right (`margin-left:auto`) with a 9px white check SVG. Rows start `opacity:0; translateX(-14px)`, `transition:.8s var(--ease)`, `delay:calc(var(--i)*140ms + 400ms)`; `.in .row` → `opacity:1; transform:none`. `.txt`: `{cards.roles.title}` / `{cards.roles.text}`.
5. **`.c-pad` Funding** — `.insight` (relative, flex 1, radius 16px, overflow hidden, min-height 150px) with `media.aboutFundingImage` (absolute cover, `object-position:50% 25%`, `scale(1.06)` on hover) and a `.chip` (absolute top/right 10px, `rgba(255,255,255,.82)`, blur 10px, radius 12px, padding `8px 10px`, 10.5px, flex gap 8px, shadow `0 8px 20px -10px rgba(0,0,0,.3)`, `animation:float 6s ease-in-out infinite` going `translateY 0→-6px→0`) holding an 8px `#7fb07a` dot with `box-shadow:0 0 0 4px rgba(127,176,122,.2)` and `{cards.funding.chip}`. `.txt`: `{cards.funding.title}` / `{cards.funding.text}`.

---

## 6. Section 3 — JOURNEY `<section class="s-prod" id="journey">`

`padding-top:120px`. **`.prod-shell`:** `position:relative; border-radius:34px; overflow:hidden; padding:72px 40px 40px; background:linear-gradient(180deg,#f3ead8 0%,#efe7da 30%,#dfe8f1 70%,#c9dcef 100%)`. `::before`: 700px circle, `left:50%; transform:translateX(-50%); top:40%; background:radial-gradient(circle,rgba(255,241,214,.9),transparent 65%); filter:blur(10px); pointer-events:none`.
`.sec-head` (relative): eyebrow `{journey.eyebrow}`, H2 (§2), lead `{journey.lead}` (`--d:3`).

**`.stage#stage`:** `position:relative; margin-top:30px; display:grid; grid-template-columns:1fr 1.05fr 1fr; align-items:end; gap:20px`. Side `.col`: flex column, gap 14px, `padding-bottom:48px`.
- **LEFT col:** two `.g-card.rv` (`--d:1`, `--d:2`) for **stages 1 and 2**; **RIGHT col:** two `.g-card.rv` (`--d:3`, `--d:4`) for **stages 3 and 4**. Card content: `.lbl` = `STAGE {n}` + (date or "Date TBA"); `h5` = stage title (margin-top 4px); `em`-style paragraph = stage text; a 22px `#f2c94c` circle with a right-arrow SVG (`#3b2116`) at the card foot (`.g-foot`, flex space-between, margin-top 12px). **Stage 5** is shown as a wide `.g-card` **below the stage grid** (full width, `margin-top:14px`) so all 5 stages are visible.
- **CENTRE `.hand.rv`** (`--d:2`): `position:relative; align-self:end; height:640px; border-radius:24px 24px 0 0; overflow:hidden; mask-image:linear-gradient(180deg,transparent 0%,#000 14%,#000 100%)` (+`-webkit-mask-image`). Inside `<img id="hand-img" src={media.journeyCenterImage} alt={journey.centerImageAlt}>` at `position:absolute; left:0; top:0; width:100%; height:115%; object-fit:cover; will-change:transform`. Parallax driven by the script.

**Funding strip** (new, directly under the stage inside `.prod-shell`, `margin-top:32px`, `padding-bottom:0` of shell becomes `40px`): heading `{journey.funding.heading}` (`.h2`-like, 28px) + sub `{journey.funding.subheading}`; a **4-column grid** of `.g-card.rv` (`--d:1..4`) for `journey.funding.steps` with a numbered 22px `#f2c94c` circle, `h5` title, `em` text; below: the note `{journey.funding.note}` in 12px `#5b4a3f` with a 12px `#f2c94c` dot. The 4 steps connect with a 1px `var(--line)` horizontal rule behind the circles on desktop.

---

## 7. Section 4 — PROMO VIDEO `<section class="s-promo" id="promo">`

Rendered only when `promoVideo.enabled`. `padding-top:120px`. Centred `.sec-head` (eyebrow `{promoVideo.eyebrow}`, `.h2 split` `{promoVideo.heading}`, `.lead` `{promoVideo.caption}`).
**Player frame `.promo` (class `rv rv-scale`):** `max-width:1040px; margin:40px auto 0; aspect-ratio:16/9` (**fixed height is not needed here because it is not full-width-with-min-height; do not add min-height**); `border-radius:34px; overflow:hidden; background:#e8dccb; box-shadow:0 40px 80px -50px rgba(59,33,22,.45); border:1px solid var(--glass-b); position:relative`.
- **Has video:** `<video controls playsinline preload="metadata" poster>` or iframe filling the frame (`position:absolute; inset:0; width:100%; height:100%; object-fit:cover`). For YouTube/Vimeo show poster + 72px glass play button (`background:rgba(250,245,238,.7); backdrop-filter:blur(14px); border-radius:50%`, hover `scale(1.06)`); iframe loads on click.
- **No video (`type:"none"` or empty url):** `{promoVideo.comingSoonText}` centred in the frame over the poster (or the `media.aboutPoster` image) with a glass pill (`.eyebrow` style) and a play icon at 50% opacity. No broken controls.

---

## 8. Section 5 — GUIDELINES `<section class="s-guide" id="guidelines">`

`padding-top:120px`. Centred head (eyebrow `{guidelines.eyebrow}`, `.h2 split` `{guidelines.heading}`, `.lead` `{guidelines.lead}`). Container `.wrap` narrower: `max-width:960px; margin:40px auto 0`.

**Accordion `.acc`** — one `.card.rv` per `guidelines.sections[]` (`--d` increments, max 6), `margin-bottom:12px`, no hover lift. Header `<button class="acc-h">` (`width:100%; display:flex; align-items:center; gap:18px; padding:20px 24px; background:none; border:0; text-align:left; cursor:pointer`): number `01…` (13px, `letter-spacing:.1em`, `#8d7b6f`, min-width 28px), title (`clamp(18px,1.8vw,22px)`, 400, `letter-spacing:-.02em`) with subtitle under it (12.5px `#8a7a6e`), and a 28px circle `var(--pill)` with a plus/minus that rotates `45deg` when open (`.5s var(--ease)`). Panel: `display:grid; grid-template-rows:0fr→1fr` transition `.6s var(--ease)`; inner `overflow:hidden`; padding `0 24px 24px 70px` (`0 20px 20px 20px` ≤640px).
Panel content:
- Block heading: 11px uppercase `letter-spacing:.12em` `#8a7a6e`, margin-top 18px.
- Bullet lists: `ul` with custom 6px `#d4612f`-tint dots (`#e2875c`), 14px `#3d2e25`, line-height 1.6, gap 8px.
- **Embeds:** `roles` → 3 `.g-card` (grid 3 cols → 1 col ≤860px) each with role label, `summary`, `responsibilities` bullets, `training` line. `tracks` → `tracksIntro` paragraph + 3 compact cards (name, description, room). `evaluation` → intro + a table (`criteria`): rows `background:rgba(255,255,255,.62); border-radius:12px; padding:12px 16px`, name 14px/500 and description 13px `#5b4a3f`, stacked on mobile; wrap in `overflow-x:auto` if needed. `funding` → the 4 steps as a numbered list + note. `contact` → coordinator cards (see §10).

---

## 9. Section 6 — SELECTED TEAMS (conditional) `id="selected"`

Only if `announcements.published`. Head (eyebrow, `.h2 split` heading, lead = `intro`). Grid of `.card.rv` (3 cols ≥1100px, 2 cols ≥640px, 1 col below), each: team name (20px, 400), optional track pill (`.pill` style, 11px), optional idea title (13px `#5b4a3f`). Empty state: "To be announced." in a glass card. Same page is also available at `/selected`.

---

## 10. Section 7 — CTA BAND `<section class="s-foot" id="start">` and Section 8 — CONTACT + FOOTER

`padding-top:120px`. **`.cta.rv.rv-scale`:** `position:relative; border-radius:34px; overflow:hidden; min-height:440px; padding:56px; display:flex; flex-direction:column; justify-content:flex-end; isolation:isolate`. Video pattern (CTA) at `z-index:-2`. `::before` at `z-index:-1`: `linear-gradient(90deg,rgba(246,240,231,.78) 0%,rgba(246,240,231,.35) 38%,transparent 65%)`.
- H2 (§2) → `<p class="rv" style="--d:2">{cta.text}</p>` (max-width 340px, margin-top 20px, 14px, `#3d2e25`) → `.btn-dark rv --d:3` (margin-top 22px) `{cta.buttonLabel}` → `{cta.buttonHref}` (registration-state rules apply; show deadline under it in 12.5px when set). (The template's email-signup form is **removed**.)

**Contact `#contact`** (inside `.s-foot`, `margin-top:56px`): centred head (eyebrow, `.h2 split`, lead = `intro`). Cards in a grid (auto-fit `minmax(260px,1fr)`, gap 14px): one `.card.rv` per `contact.coordinators[]` — 44px circle with initials on `var(--pill)`, name 17px, role 12px `#8a7a6e`, phone as `<a href="tel:+91…">` styled as `.pill` with a phone icon; then `.card.rv` for each of `contact.people[]` (role + name) and, if set, `contact.email` as `mailto:` and `contact.department`.

**Footer `.foot`** (`padding:72px 0 28px`): `.foot-grid` = `display:grid; grid-template-columns:1.6fr repeat(3,1fr) auto; gap:32px`; each column `.rv` with `--d` 0–4.
- `.about`: `<h6>` = `{site.name}` (13px, 500, margin-bottom 16px); `<p>` = `{footer.aboutText}` (13px `#6a594d`, max-width 280px); `.socials` (flex, gap 10px, margin-top 24px) — 36px `var(--pill)` circles with 14px Facebook, X, YouTube, Instagram icons, **only for non-empty `footer.socials.*`** (hover `background:#e3d6c6; translateY(-3px)`).
- 3 link columns from `footer.columns` (`h6` title; `ul` no bullets, flex column, gap 10px; links 13px `#6a594d`, `position:relative`, `::after` 1px underline at `bottom:-2px` with `scaleX(0)` origin right; hover colour `#2a1a12` and underline `scaleX(1)` origin left, `.5s var(--ease)`).
- `.mark`: the 40px logo mark.
- `.legal` (flex, space-between, gap 16px, margin-top 64px, padding-top 22px, `border-top:1px solid var(--line)`, 12px `#8a7a6e`): `{legalLeft}` | `{legalCenter}` | `{legalRight}`.

---

## 11. Registration page `/register` (same shell, no hero video)

- Background `var(--bg)` with a soft radial glow (`radial-gradient(60% 50% at 50% 0%,rgba(255,241,214,.9),transparent 70%)`), `padding-top:118px`.
- Head: eyebrow "Registration", `.h2 split` ("Register Your Team"), `.lead` = deadline or open-state text.
- **Stepper:** 4 pills in a row (`form.steps`); active = `.btn-dark` look, done = `var(--pill)` with a check, upcoming = outlined `var(--line)`. On ≤640px show "Step 2 of 4 · Team Members" with a thin 4px progress bar (`#e2875c→#d4612f`) instead.
- **Form container:** `max-width:860px; margin:32px auto 0`, one big glass card (`.card` styling, no hover lift, `padding:32px`, 20px on mobile). Step transitions: content fades/slides in (`opacity 0→1`, `translateY(12px)→0`, `.6s var(--ease)`).
- **Inputs:** height 48px, `border-radius:14px`, `background:rgba(255,255,255,.7)`, `border:1px solid rgba(255,255,255,.9)`, padding `0 16px`, 14px; focus: `box-shadow:0 0 0 4px rgba(59,33,22,.08)` and border `rgba(59,33,22,.35)`. Labels 12px uppercase `letter-spacing:.08em` `#6a594d`, margin-bottom 6px; help text 12px `#8a7a6e`. Error: border `#c8553d`, message 12px `#b0412c` with an 12px icon; `aria-live="polite"`. Text areas: min-height 120px, resize vertical, character counter bottom-right 11px `#8a7a6e` (turns `#b0412c` near the limit).
- **Track cards (radio):** 3 `.card`-style tiles (grid 3 → 1 col ≤860px), selected = `border-color:#3b2116` + 2px inner ring + check badge; hover lift 4px.
- **Member cards:** 3 stacked glass sub-cards; leader card has a small "Team Leader" pill (`#f2c94c` background, `#3b2116` text). Fields in a 2-column grid (1 col ≤640px). **Stream selector** = 3 pill buttons (`.pill` look; selected = `.btn-dark` look) with the role label; tapping a stream already used by another member swaps the two.
- **Review step:** read-only summary cards with "Edit" text-buttons per block; consent checkbox (22px custom box, `#3b2116` when checked); submit `.btn-dark` (full width ≤640px) with a spinner (16px ring, `.8s linear infinite`) while loading.
- **Success state:** replaces the form; big check circle (72px, `#f2c94c` fill, draw-in stroke animation .8s), `successTitle` (`.h2` size), Registration ID in a 28px monospace-feel pill (`letter-spacing:.08em`) with a **Copy** button, `successMessage`, summary list, and buttons "Back to home" (`.pill`) and "Print summary" (`.btn-dark`).
- **Closed / not yet open state:** centred glass card with the corresponding message from `data.js`, and a "Back to home" button.

---

## 12. Admin UI (functional, same tokens, minimal motion)

- Layout: left sidebar 240px (`var(--pill)` background, logo, nav items: Dashboard, Registrations, Content, Promo Video, Media, Settings, Logout) collapsing to a top bar with burger ≤860px; main area `background:var(--bg)`, padding 28px, max-width 1280px.
- Components reuse `.card` (no hover lift), `.btn-dark`, `.pill`, the input styles of §11, and tables with: sticky header, row hover `rgba(255,255,255,.6)`, 13px text, row height 52px, horizontal scroll wrapper on small screens.
- Status badges (11px uppercase pill): submitted `#ece3d7`, under_review `#f6e7b4`, shortlisted `#cfe3f5`, selected `#cdebc9`, not_selected `#f2d2cc`, withdrawn `#e5e0da`.
- Toasts: bottom-right glass card, auto-dismiss 4s. Confirm dialogs for delete/reset (centred glass modal, backdrop `rgba(42,26,18,.35)`).
- No scroll-reveal animations in admin; Lenis is **not** loaded on `/admin`.
- Content editor: two-pane (section list 260px | form). Repeatable cards show a drag handle + up/down buttons + delete; "Add item" is a dashed-border button. Sticky save bar at the bottom with "Unsaved changes" text.

---

## 13. Script — adapted from the template (logic VERBATIM; changes marked `// CHANGED`)

Put in `src/motion/MotionProvider.tsx`: a client component that runs `initMotion()` inside `useEffect` on mount and **again on route change** (`usePathname`), returns a cleanup that disconnects the observer, destroys Lenis and clears timers. Skip entirely on `/admin`. The `js` class is added in `<head>` (see §0).

```js
// CHANGED: no hard-coded VIDEOS map; each <video> carries data-src (from data.js media.*)
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(r => setTimeout(r, ms));

  // 1) background videos: fade the still out once the video actually plays
  document.querySelectorAll('video.media[data-src]').forEach(v => {      // CHANGED
    const id = v.id, url = v.dataset.src;
    const still = document.querySelector('[data-fallback="' + id + '"]');
    if (!url) return;
    v.src = url;
    v.addEventListener('playing', () => {
      if (still) { still.style.transition = 'opacity 1.2s'; still.style.opacity = 0; }
    }, { once: true });
    v.play().catch(() => {});
  });

  // 2) split headings into words, keeping nested spans and <br>
  document.querySelectorAll('[data-split]').forEach(el => {
    let i = 0;
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const s = document.createElement('span'); s.textContent = part; s.style.setProperty('--i', i++);
            w.appendChild(s); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el);
  });

  // 3) count-up
  const countUp = el => {
    const end = +el.dataset.count, t0 = performance.now(), dur = reduce ? 1 : 2000;
    const tick = t => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // 4) reveal on scroll (low threshold so tall blocks, like the stacked hero card on phones, still trigger)
  const reveal = el => {
    if (el.classList.contains('in')) return;
    el.classList.add('in');
    el.querySelectorAll('[data-count]').forEach(countUp);
    if (el.id === 'gauge-card') document.getElementById('g-arc').style.strokeDashoffset = 0;   // CHANGED: gauge fills 100%
    // CHANGED: the template's #match-card / #ring-arc line was removed (no ring in this project)
  };
  const targets = document.querySelectorAll('.rv,[data-split]');
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); }
  }), { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
  targets.forEach(el => io.observe(el));
  // safety net: reveal anything already on screen even if the observer is late
  const sweep = () => targets.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight * 0.94 && r.bottom > 0) reveal(el);
  });
  requestAnimationFrame(() => requestAnimationFrame(sweep));
  addEventListener('load', sweep);

  // 5) hero card: reserve each reply's final height, then run two independent sequences that start together
  document.querySelectorAll('#studio .ai-t').forEach(el => {
    el.innerHTML = '<span class="ghost"></span><span class="live"></span>';
    el.firstChild.textContent = el.dataset.text;
  });
  const typeInto = (el, text, speed = 14) => new Promise(res => {
    const live = el.querySelector('.live');
    if (reduce) { live.textContent = text; return res(); }
    live.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
    setTimeout(() => {
      live.textContent = ''; let k = 0;
      const step = () => { k += 2; live.textContent = text.slice(0, k); k < text.length ? setTimeout(step, speed) : res(); };
      step();
    }, 650);
  });
  const runColumn = async (items, done) => {
    await wait(reduce ? 0 : 1500);
    for (const m of items) {
      m.classList.add('show');
      if (m.id === 'hero-fig') m.classList.add('in');
      const t = m.querySelector('.ai-t');
      if (t) await typeInto(t, t.dataset.text);
      else await wait(reduce ? 0 : 380);
    }
    if (done) done();
  };
  runColumn([...document.querySelectorAll('#studio .chat .msg')], () => {
    const tr = document.getElementById('hero-track');
    if (tr) tr.style.width = (tr.dataset.value || 84) + '%';             // CHANGED: from hero.panel.sliderValue
  });
  runColumn([...document.querySelectorAll('#studio .prod .msg')]);

  // 6) smooth scroll + one scroll handler for nav state and hand parallax
  const nav = document.getElementById('nav');
  const hand = document.getElementById('hand-img');
  const stage = document.getElementById('stage');
  const onScroll = () => {
    nav.classList.toggle('scrolled', scrollY > 20);
    if (!reduce && hand && stage) {
      const r = stage.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)));
      hand.style.transform = 'translate3d(0,' + (-p * 12).toFixed(2) + '%,0)';
    }
  };
  let lenis = null;
  if (!reduce && window.Lenis) {                                          // CHANGED: with npm, assign window.Lenis = Lenis (or pass the class in)
    lenis = new Lenis({ duration: 1.25, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on('scroll', onScroll);
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  } else {
    let ticking = false;
    addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(() => { onScroll(); ticking = false; }); ticking = true; }
    }, { passive: true });
  }
  onScroll();

  // 7) anchor links + mobile menu
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    document.body.classList.remove('menu-open');
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: -70 });
    else target.scrollIntoView({ behavior: 'smooth' });
  }));
  document.getElementById('burger').addEventListener('click', () => document.body.classList.toggle('menu-open'));
})();
```
Implementation notes for React:
- Links like `/#about` are Next `<Link>`s; on the home page intercept same-page hash links with the Lenis `scrollTo(offset:-70)` logic above (extend the selector to `a[href^="/#"]` when `pathname === "/"`).
- Elements inside `.acc` panels and the register form must **not** be `.rv` unless visible on mount (avoid hidden-forever content). Form steps use their own CSS transition, not `.rv`.
- `.row` reveal in the roles card relies on the `.in` class set by `reveal()` on the card (the card has class `rv`).
- Set `data-value={hero.panel.sliderValue}` on `#hero-track`.
- Hero card height must not change during typing (guaranteed by the `.ghost` copy; do not remove it).

---

## 14. Responsive breakpoints

**≤1100px:** `.studio` width 90%; `.hero-card` height 720px. `.bento` columns `1fr 1fr`; `.c-big` → `grid-row:auto; grid-column:span 2; min-height:480px`. `.stage` columns `1fr 1fr`; `.hand` → `grid-column:span 2; order:-1; height:520px; max-width:520px; width:100%; justify-self:center`; `.stage .col` `padding-bottom:0`, last `.col` `padding-bottom:40px`. Funding strip → 2 columns. `.foot-grid` → 3 columns, `.about` spans 3.

**≤860px:** hide `.nav-l` and the right-side text link; `.burger` → `display:flex`. Nav grid → `auto 1fr auto`, logo `order:-1`, `.nav-r` gap 10px. `.hero-card`: `height:auto; padding:120px 14px 14px`. `.studio`: `position:relative; left:auto; top:auto; transform:none; width:100%`; one column. `.prod`: `border-left:0; border-top:1px solid rgba(255,255,255,.45); padding:14px`. `#hero-fig`: `flex:none; min-height:0; aspect-ratio:16/10`; img `object-position:50% 30%`. Guidelines role/track embeds → 1 column. Register track cards → 1 column.

**≤640px:** `.wrap` padding `0 16px`. `.btn-dark` padding `10px 18px`, 12px. `.hero` padding-top 96px. `.hero-card` radius 24px, padding `72px 10px 10px`. `.studio` radius 20px. `.chat` padding `18px 16px`, gap 10px. `.bubble`/`.ai` max-width 92%, font-size 12px. `.cd strong` 20px. `.prod` padding `12px 16px 16px`. `#hero-fig` `aspect-ratio:4/3`. `.cd` → column, align-items start; `.slider` width 100%, text-align left. `.s-bento,.s-prod,.s-promo,.s-guide,.s-foot` padding-top 80px. `.bento-shell` and `.prod-shell` padding `48px 14px 14px`, radius 24px (`.prod-shell` padding-bottom 24px). `.bento` one column; `.c-big` `grid-column:auto; min-height:440px; padding:22px`. `.stage` one column; `.hand` `grid-column:auto; height:420px`. Funding strip → 1 column. `.promo` radius 24px. `.cta` padding `28px 20px`, min-height 460px, radius 24px, `::before` → `linear-gradient(180deg,rgba(246,240,231,.1) 0%,rgba(246,240,231,.55) 45%,rgba(246,240,231,.85) 100%)`. `.foot-grid` → 2 columns, `.about` spans 2, `.mark` hidden. `.legal` → centred column, gap 6px, margin-top 40px.

At **every width from 320px to 2560px**, `document.documentElement.scrollWidth` must not exceed the viewport width, and the hero card must stay fully inside `.wrap`.

---

## 15. Acceptance checks (all must pass)

1. On load the hero headline (`site.heroHeadline`) animates **word by word** (rising from below its line mask), is clearly visible, with the brown vertical gradient on **every word**; no word clipped or invisible.
2. At 1280, 1440 and 1920px the hero card's right edge stays inside the window and the glass studio panel stays fully inside the card.
3. The hero card keeps **exactly the same height** from page load until typing finishes, at every width.
4. On phones the hero card stacks: chat on top, then the "Pitch Preview" block with a 4:3 image. Text readable, no sideways scroll.
5. Every section heading and card reveals once while scrolling, staggered; **nothing stays permanently invisible** (also true with JS disabled).
6. Scrolling is smooth (Lenis), the nav turns frosted after 20px, and the journey image drifts up gently as the section passes.
7. The training gauge counts up to `about.cards.training.count` and its arc draws to full when scrolled into view.
8. The two hero columns start animating at the same moment, independently.
9. All 3 background videos autoplay muted on loop and replace their still images; a missing URL falls back to the still with no errors.
10. Sections appear in the order of PRD §5.1; the Promo section shows the "coming soon" card when no video is set and the player when one is; Selected Teams stays hidden until published.
11. Accordion opens/closes smoothly, keyboard accessible; only the intended panel is open.
12. Registration stepper, track cards, stream swap, inline errors, success state and closed state match §11.
13. `prefers-reduced-motion` users see all content immediately with no animation.
14. Changing text/colour-independent content in `data.js` (e.g. a heading, a stage title, a coordinator) updates the page with **no CSS/markup edits**.
