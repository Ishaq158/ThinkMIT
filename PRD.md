# PRD — THINK MIT Pitchfest Website

> **Audience:** an AI coding agent (Antigravity). Build exactly what is written here.
> **Companion files (must be in the project root before you start):**
> `PRD.md` (this file) · `Design.md` (all visual/UX/animation specs) · `data.js` (all editable content + config).
> **Precedence if files conflict:** `data.js` for content/config values → `Design.md` for anything visual → `PRD.md` for behaviour, data, security.
> **Never invent content.** Every visible string comes from `data.js` (merged with admin overrides). If something is missing, add a key to `data.js`, do not hard-code.

---

## 1. Product summary

**THINK MIT** is a college-level innovation pitchfest ("Your Idea. Our Campus. From Pitch to Implementation.") run by the **CSE–AI department** with **IIC** and **EDC**. Students find a problem on campus and pitch a solution; selected ideas may receive institutional funding and implementation support.

The website has three jobs:

1. **Inform** — show the event, guidelines, journey, roles, tracks, evaluation criteria, funding path, contact, and a promo video (added later).
2. **Register** — teams of exactly **3** register online and submit their idea (replaces a Google Form).
3. **Administer** — the organiser logs in, views/edits/exports registrations, edits any site content, uploads the promo video, tracks screening status, and publishes the selected-teams announcement.

### 1.1 Event flow (context for the data model)

| Stage | Activity |
|---|---|
| 1 | Online registration + idea submission (this website) |
| 2 | Screening and shortlisting of ideas |
| 3 | Domain training: 1 hour/day for 3 days. Each of the 3 members is trained in a different stream: **Business Lead**, **Innovation Lead**, **Technical Lead** |
| 4 | One-day Pitchfest, evaluated by a panel |
| 5 | Selection of ideas for possible funding and campus implementation |

Teams are also divided into **3 tracks**; volunteers are assigned per team and guide teams to rooms. Eligibility: MITM 2nd/3rd/4th-year UG, MBA, MCA.

### 1.2 Users

| User | Needs |
|---|---|
| **Student** (public, no login) | Read info, register a team, see confirmation, later see selected teams |
| **Admin** (organiser, 1–5 people, login) | Everything in §8 |

### 1.3 Out of scope (v1)
Payments, student accounts/login, automatic emails/SMS (optional v2), live Google Sheets sync (optional v2), multi-language, evaluator scoring portal with multiple judges (admin keeps one score + notes per team).

---

## 2. Assumptions (flagged — owner may change in `data.js`)

1. **Team Leader = Member 1.** A team has exactly 3 members; the leader is one of them. Registration therefore collects 3 member records, where Member 1 is the leader.
2. **Training stream per member.** Each member selects one of the 3 streams (roles). The default order is Member 1 → Business, Member 2 → Innovation, Member 3 → Technical, but the form lets them change it. **All three streams must be unique within a team.**
3. **Track of interest is chosen once per team** (3 tracks). Track names are placeholders in `data.js` until the organiser finalises them.
4. Role name conflict in source documents ("Innovation Lead" vs "Idea Defence Lead"). **Use "Innovation Lead"** (key `innovation`); display names are editable in `data.js`.
5. Extra per-member fields beyond the requested list — **Programme, Year, Department** — are included to verify eligibility. They can be hidden with `form.member.<field>.enabled = false`.
6. Idea submission fields (title, problem, solution, uniqueness, impact, optional link) are added because the event requires idea submission at registration.
7. Dates, pitch duration, venue, and track names are not final → show "TBA" when `null`.

---

## 3. Tech stack (fixed — do not substitute)

| Layer | Choice |
|---|---|
| Framework | **Next.js 14+ (App Router)**, TypeScript with `allowJs: true` (so `data.js` imports cleanly) |
| Styling | Plain global CSS from `Design.md` (`styles/design.css`). **No Tailwind, no UI kit** for the public site |
| Database / Auth / Storage | **Supabase** (Postgres + Auth + Storage) |
| Validation | `zod` (shared schema used on client and server) |
| Smooth scroll | `lenis` (npm, pinned `1.1.13`) |
| Hosting | Vercel (auto-deploy from Git) |
| Forms | Controlled React forms; **no `<form>` quirks that break Next** — standard `<form onSubmit>` is fine in Next |

**Env vars** (`.env.local`, document in `README`, never commit):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server only, NEVER sent to browser
ADMIN_EMAILS=a@x.com,b@x.com    # comma list; only these may use /admin
NEXT_PUBLIC_SITE_URL=
```

---

## 4. Project structure

```
/data.js                          ← provided; single source of content/config
/src
  /app
    layout.tsx                    ← fonts, <html>, MotionProvider, Nav, Footer
    page.tsx                      ← landing (sections in §5.1)
    /register/page.tsx            ← registration form (§7)
    /register/success/page.tsx    ← (or in-page success state)
    /selected/page.tsx            ← selected teams (only if published)
    /admin
      layout.tsx                  ← auth guard + admin shell
      page.tsx                    ← dashboard
      /registrations/page.tsx     ← table + filters + export
      /registrations/[id]/page.tsx← detail/edit
      /content/page.tsx           ← site content editor (§8.4)
      /video/page.tsx             ← promo video (§8.5)
      /media/page.tsx             ← media library (upload/replace)
      /settings/page.tsx          ← registration open/close, deadline, announcement toggle
      /login/page.tsx
    /api
      /register/route.ts
      /content/route.ts           (GET merged content - optional)
      /selected/route.ts
      /admin/...                  (see §9)
  /components                     ← Nav, Hero, AboutBento, Journey, PromoVideo, Guidelines, Evaluation, Contact, CtaBand, Footer, RegisterForm, admin/*
  /lib
    content.ts                    ← getContent() merge logic (§6)
    supabase-server.ts            ← service-role client (server only)
    supabase-browser.ts           ← anon client (auth only)
    schema.ts                     ← zod schemas built from data.js rules
    csv.ts                        ← CSV builder (§8.3)
    auth.ts                       ← requireAdmin()
  /motion/MotionProvider.tsx      ← Design.md §10 script as a hook
  /styles/design.css              ← Design.md CSS
/supabase/schema.sql              ← §10 (run once in Supabase SQL editor)
README.md                         ← setup steps incl. how to edit data.js and how to add admin
```

---

## 5. Public site

### 5.1 Landing page (`/`) — section order

Visual specs are in `Design.md`. Content keys in brackets.

| # | Anchor | Section | Content source |
|---|---|---|---|
| 1 | `#home` | Hero (headline, subtitle, 2 CTAs, glass "studio" panel with typed demo chat) | `site`, `hero`, `media.hero*` |
| 2 | `#about` | About (bento cards: vision, eligibility, training gauge, three roles, funding) | `about`, `roles`, `media.about*` |
| 3 | `#journey` | Journey (5 stages timeline + "what happens after selection" 4 steps) | `journey`, `media.journey*` |
| 4 | `#promo` | Promo video | `promoVideo` (§5.3) |
| 5 | `#guidelines` | Guidelines accordion (9 sections) with embedded blocks | `guidelines`, `evaluation`, `roles`, `tracks`, `journey.funding`, `contact` |
| 6 | `#selected` | Selected teams (rendered **only if** `announcements.published`) | DB (§5.4) |
| 7 | `#start` | CTA band with registration button | `cta`, `media.cta*` |
| 8 | `#contact` | Contact cards + footer | `contact`, `footer` |

Rules:
- Registration CTAs must reflect state: open → link to `/register`; not yet open → disabled with `notYetOpenMessage`; closed (isOpen false or past `deadline`) → disabled with `closedMessage`. Show the deadline ("Register by 5 Dec 2026") when set.
- Anchor links on other routes use `/#about` etc.
- Entire page must render correctly with **JavaScript disabled for animations** (content visible) — see `Design.md` §4.

### 5.2 Guidelines section behaviour
- Accordion; first item open by default; keyboard accessible (`button` + `aria-expanded`).
- Numbers `01…09` are generated from array order.
- `embed` values render ready-made blocks: `roles` (3 role cards), `tracks` (3 track cards + `tracksIntro`), `evaluation` (table from `evaluation.criteria`), `funding` (4 steps + note from `journey.funding`), `contact` (coordinators).
- Blocks `{heading, items[]}` render as heading + bullet list; a single-item block renders as a paragraph.

### 5.3 Promo video section
- Controlled by `promoVideo` (editable in admin §8.5).
- `type: "none"` or empty `url` → show a styled placeholder card with `comingSoonText` (**no broken player**).
- `type: "file"` → `<video controls playsinline preload="metadata" poster>`; `youtube`/`vimeo` → privacy-friendly responsive 16:9 iframe (`youtube-nocookie.com`, `player.vimeo.com`) built by parsing the pasted normal link (watch / youtu.be / shorts / vimeo.com/ID). Reject other hosts.
- Lazy: iframe/video loads only when scrolled near; for iframes show a poster + play button (click-to-load).
- `enabled: false` hides the section and its nav references.

### 5.4 Selected teams (`/selected` and `#selected`)
- Visible only if `announcements.published === true`.
- Shows teams with status `selected` (see §10 statuses): team name, track (if `showTrack`), idea title (if `showIdeaTitle`). **Never show names, USN, email or phone publicly.**
- Public data comes from `GET /api/selected` (server-filtered; never expose other columns).

---

## 6. `data.js` — the editable content system (CRITICAL)

**Goal:** the owner can change anything in `data.js` and the app reflects it; the admin can change the same things from the UI without touching code.

### 6.1 Merge rule
```
finalContent[section] = dbOverride[section] ?? siteData[section]
```
- Sections = the top-level keys of the default export of `data.js` (`site`, `nav`, `registration`, `form`, `roles`, `tracks`, `tracksIntro`, `hero`, `about`, `journey`, `promoVideo`, `guidelines`, `evaluation`, `announcements`, `contact`, `cta`, `footer`, `media`).
- Overrides live in table `site_content(section text primary key, value jsonb, updated_at)`.
- Implement `getContent()` in `lib/content.ts`: loads `data.js`, loads all `site_content` rows (service role, server-side), merges per section, returns a fully typed object. Wrap in `unstable_cache` with tag `"site-content"`.
- **Deep-fill safety:** after merging, if an override is missing keys that exist in `data.js` (because the developer added new keys later), fill the missing keys from `data.js` (recursive for objects; arrays are taken from the override as-is). This prevents crashes after future `data.js` upgrades.
- Admin saves call `revalidateTag("site-content")` and `revalidatePath("/", "layout")` so changes appear instantly without redeploy.

### 6.2 Behaviour guarantees
| Action | Result |
|---|---|
| Edit `data.js` in dev | Hot reload shows change immediately (unless that section has an admin override) |
| Edit `data.js`, redeploy to production | Change appears (for sections without an override) |
| Edit in admin | Saved to DB, live immediately, overrides `data.js` |
| Admin "Reset to default" on a section | Deletes the DB row → falls back to `data.js` |
| Add a brand-new key to `data.js` | Appears automatically in the admin editor (editor is generated from the data shape, §8.4) |

> Tell the owner plainly in `README`: *in production, a `data.js` change needs a redeploy (a `git push` auto-deploys on Vercel). For instant no-code changes use the Admin panel.*

### 6.3 Registration rules are read from `data.js`
`registration.validation.*`, `ideaLimits`, `form.*` labels/required flags, `roles`, `tracks`, `programmeOptions` drive both the form UI and the server-side zod schema (`lib/schema.ts` builds the schema from content at request time). **Never duplicate these rules in code.**

---

## 7. Registration (`/register`)

### 7.1 Data collected

**Team**
| Field | Rules |
|---|---|
| Team Name | required, `teamNameMin`–`teamNameMax` chars, unique (case-insensitive) |
| Track of Interest | required, one of `tracks[].key` |

**Members ×3** (Member 1 = Team Leader). For each:
| Field | Rules |
|---|---|
| Full Name | required, 2–80 chars, trimmed |
| USN | required, uppercase-normalised, matches `usnRegex`, **unique across all teams** and within the form |
| Email ID | required, valid email, lower-cased, **unique across all teams** and within the form; honour `emailDomainAllowList` if non-empty |
| Contact Number | required, matches `phoneRegex` (strip spaces, `+91`, leading `0`) |
| Training Stream (role) | required, one of `roles[].key`; **the 3 members must have 3 different streams** |
| Programme / Year / Department | required if `enabled`; programme from `programmeOptions` |

**Idea** (one per team): title, problem, solution, uniqueness, impact (all required, max lengths from `ideaLimits`, show live counters), supporting link (optional, must be `http(s)://`).

**Consent checkbox** (`registration.consentText`) — required.

### 7.2 UX (stepper, 4 steps from `form.steps`)
1. **Team & Track** — team name, track cards (radio cards showing track name/description).
2. **Team Members** — three member cards (leader highlighted). Stream selector as 3 pill buttons; picking a stream already used by another member **swaps** the two members' streams automatically (so uniqueness is always satisfied).
3. **Your Idea** — text areas with counters.
4. **Review & Submit** — read-only summary with "Edit" links per step, consent checkbox, submit.

Behaviour:
- Per-step validation before "Next"; errors inline under the field (`aria-live`), focus first error.
- **Draft autosave** to `localStorage` (key `thinkmit-draft-v1`), restored on reload, cleared after success. Show "Draft saved".
- Disable submit while sending; prevent double submit (idempotency key generated client-side, sent as header, stored on the team row `submission_key unique`).
- On success: show success state with **Registration ID** (e.g. `TMIT-0007`), team summary, `successMessage`, a "Copy ID" button, and a "Download summary (PDF/print)" optional via `window.print()` stylesheet.
- If registration is closed / not open / `maxTeams` reached: show the corresponding message instead of the form (check on page load **and** on submit server-side).
- Server field errors (duplicate USN/email/team name) map back to the exact field and step.

### 7.3 Server (`POST /api/register`)
1. Rate limit: max 5 requests/min/IP (simple DB or in-memory-per-instance limiter; document limitation).
2. Honeypot field `website` must be empty → else return fake 200.
3. Check registration window/`maxTeams`.
4. Validate with zod built from `getContent()`; sanitise strings (trim, collapse internal whitespace for single-line fields, strip control chars). Store text as plain text; **escape on render, never `dangerouslySetInnerHTML` with user data**.
5. Call Postgres function `register_team(payload jsonb, submission_key text)` (§10) — atomic insert of 1 team + 3 members; unique violations returned as `{field, message}`.
6. Respond `201 {regCode}`; never leak internal ids or other teams' data.
7. Errors: `400` validation (with field map), `409` duplicates, `429` rate limit, `403` closed, `500` generic.

---

## 8. Admin

Route group `/admin`, protected by middleware + server check `requireAdmin()` (Supabase Auth session **and** email ∈ `ADMIN_EMAILS`). Non-admin → redirect to `/admin/login`. All admin APIs re-check on the server. Admin UI follows `Design.md` §9 (functional, same tokens).

### 8.1 Dashboard
Cards: total teams, total students, by track (3), by status, today's registrations, last 7 days mini bar chart (inline SVG), registration status (open/closed/deadline countdown). Quick actions: Export CSV, Open registrations, Edit content.

### 8.2 Registrations table
- Columns: Reg ID, Team Name, Track, Leader name, Leader contact, Idea Title, Status, Score, Submitted at.
- Search (team, USN, name, email, phone, reg ID), filters (status, track, programme), sort, pagination (25/50/100).
- Row click → detail drawer/page showing all fields (3 members + idea) with **edit-in-place** for every field (same validation as registration but admin may override uniqueness warnings with confirm), status select, score (0–100, optional), private admin notes, delete (confirm dialog, hard delete).
- Bulk select → bulk status change, bulk export, bulk delete (with confirm).
- Statuses (enum): `submitted` (default) → `under_review` → `shortlisted` → `selected` → `not_selected`. Also `withdrawn`.
- "Selected" = shown on public Selected Teams page when announcements are published.
- Admin can **add a team manually** (walk-in registrations) using the same form UI.

### 8.3 CSV export (must behave like exporting a Google Form)
Buttons: **Export all**, **Export filtered**, **Export selected rows**. Two formats via toggle:

1. **One row per team** (default) — columns, in this exact order:
`Registration ID, Submitted At, Team Name, Track, Status, Idea Title, Problem Statement, Proposed Solution, Innovation & Uniqueness, Expected Impact & Implementation, Supporting Link,`
then for N in 1..3 (Member 1 is Team Leader): `Member N Name, Member N USN, Member N Email, Member N Contact, Member N Stream, Member N Programme, Member N Year, Member N Department`,
then (checkbox "Include internal columns") `Score, Admin Notes`.
2. **One row per member** — `Registration ID, Team Name, Track, Status, Idea Title, Member Position, Is Team Leader, Name, USN, Email, Contact, Stream, Programme, Year, Department`.

Implementation requirements (`lib/csv.ts`, server route `GET /api/admin/export`):
- UTF-8 **with BOM** (`\uFEFF`) so Excel opens it correctly; CRLF line breaks; RFC-4180 quoting (quote fields containing `, " \n \r`; double internal quotes).
- **Formula-injection guard:** if a text cell starts with `= + - @ \t \r`, prefix with `'`.
- Phone numbers are 10-digit strings; export them as plain text (never as numbers) so Excel does not use scientific notation.
- Dates formatted `YYYY-MM-DD HH:mm` in **Asia/Kolkata**.
- Track and Stream exported as **display names** (from current content), not keys.
- Filename `think-mit-registrations-YYYY-MM-DD.csv`; headers `Content-Type: text/csv; charset=utf-8`, `Content-Disposition: attachment`, `Cache-Control: no-store`.
- Stream the response for large sets (≤ 5 000 rows expected; plain build is fine).
- Respects the current filters/search/selection passed as query params.

### 8.4 Site content editor (`/admin/content`)
- Left list = every top-level section from `data.js` (friendly names: Brand & SEO, Navigation, Registration rules, Form labels, Roles, Tracks, Hero, About, Journey, Promo video, Guidelines, Evaluation, Announcements, Contact, CTA, Footer, Media).
- Right panel = a **generic recursive form generated from the section's value shape**:
  string → input (textarea if > 80 chars or contains `\n`); number → number input; boolean → toggle; `null` → empty input that saves as `null` when blank; array of strings → editable list; array of objects → repeatable cards with **add / delete / drag-or-arrow reorder**; nested object → grouped fieldset.
  Keys ending `Url`, `url`, `poster`, `image`, `Video`, `Poster`, or under `media` get an **Upload** button (§8.6) next to the URL input; keys named `date`, `deadline`, `opensOn` get a datetime picker (stored ISO with +05:30).
- Buttons per section: **Save** (writes `site_content`), **Reset to default** (deletes row, confirm), **Preview** (open `/` in new tab). Show "Unsaved changes" guard. Show a small diff badge on sections that currently have an override.
- Validate before save: `registration.validation.*Regex` must compile; `roles` must keep exactly 3 items with unique `key`; `tracks` must have ≥1 item with unique `key`; **warn** (don't block) when removing a role/track key that existing registrations use.

### 8.5 Promo video (`/admin/video`)
Simple dedicated screen (writes the `promoVideo` section):
- Toggle "Show promo section".
- Choose source: **Upload file** (mp4/webm, ≤ 100 MB, progress bar) · **YouTube/Vimeo link** · **Direct video URL**.
- Optional poster image upload, title, caption.
- Live preview using the same `PromoVideo` component. "Remove video" returns to the "coming soon" placeholder.

### 8.6 Media uploads
- Supabase Storage bucket `media` (public read). Admin-only upload through `POST /api/admin/upload` which returns a signed upload URL (client uploads directly; avoids Vercel body limits), then the public URL is written into the field.
- Allowed: png, jpg, webp, svg(sanitised: reject files containing `<script`), mp4, webm. Max 100 MB video / 10 MB images. Filename randomised.
- `/admin/media` lists uploaded files with copy-URL and delete.

### 8.7 Settings (`/admin/settings`)
Quick controls backed by the `registration` and `announcements` sections: Registration open/closed switch, opens-on and deadline pickers, max teams, "Publish selected teams" switch. Changes are live instantly.

### 8.8 Admin management
Admins are defined by `ADMIN_EMAILS` + Supabase Auth users created in the Supabase dashboard (document in README). No in-app user management in v1.

---

## 9. API contract

All JSON. Admin routes require admin session (`401/403` otherwise).

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/register` | Public registration (§7.3) |
| GET | `/api/selected` | Public selected teams (only if published) |
| GET | `/api/admin/stats` | Dashboard numbers |
| GET | `/api/admin/teams` | List with `q,status,track,programme,sort,page,pageSize` |
| GET/PATCH/DELETE | `/api/admin/teams/[id]` | Read / edit team+members+status+score+notes / delete |
| POST | `/api/admin/teams` | Manual add |
| POST | `/api/admin/teams/bulk` | `{ids[], action:"status"\|"delete", status?}` |
| GET | `/api/admin/export` | CSV (§8.3). Params: `format=team\|member`, `ids`, filters, `internal=1` |
| PUT/DELETE | `/api/admin/content/[section]` | Save override / reset to default |
| POST | `/api/admin/upload` | Signed upload URL |
| GET/DELETE | `/api/admin/media` | List / delete files |

---

## 10. Database (`/supabase/schema.sql`) — generate exactly this

```sql
create extension if not exists pgcrypto;

-- Registration code sequence
create sequence if not exists team_reg_seq start 1;

create type team_status as enum
  ('submitted','under_review','shortlisted','selected','not_selected','withdrawn');

create table public.teams (
  id               uuid primary key default gen_random_uuid(),
  reg_code         text unique not null,
  submission_key   text unique,                     -- idempotency
  team_name        text not null,
  track_key        text not null,
  idea_title       text not null,
  problem          text not null,
  solution         text not null,
  uniqueness       text not null,
  impact           text not null,
  reference_link   text,
  status           team_status not null default 'submitted',
  score            numeric(5,2),
  admin_notes      text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create unique index teams_name_uq on public.teams (lower(team_name));

create table public.members (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  position    smallint not null check (position between 1 and 3), -- 1 = Team Leader
  role_key    text not null,                                       -- business|innovation|technical
  name        text not null,
  usn         text not null,
  email       text not null,
  phone       text not null,
  programme   text,
  year        text,
  department  text,
  unique (team_id, position),
  unique (team_id, role_key)
);
create unique index members_usn_uq   on public.members (upper(usn));
create unique index members_email_uq on public.members (lower(email));

create table public.site_content (
  section     text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

-- updated_at trigger
create or replace function public.touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end $$ language plpgsql;
create trigger teams_touch before update on public.teams
  for each row execute function public.touch_updated_at();

-- Security: lock everything; the app uses the service role on the server only.
alter table public.teams        enable row level security;
alter table public.members      enable row level security;
alter table public.site_content enable row level security;
-- (No public policies on purpose. Never expose these tables to the anon key.)

-- Atomic registration. Called ONLY from the server (service role).
create or replace function public.register_team(payload jsonb, p_submission_key text, p_prefix text)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_team_id uuid; v_code text; m jsonb; i int := 0;
begin
  -- idempotent retry
  select reg_code into v_code from teams where submission_key = p_submission_key;
  if v_code is not null then return v_code; end if;

  v_code := p_prefix || '-' || lpad(nextval('team_reg_seq')::text, 4, '0');

  insert into teams (reg_code, submission_key, team_name, track_key, idea_title,
                     problem, solution, uniqueness, impact, reference_link)
  values (v_code, p_submission_key, payload->>'team_name', payload->>'track_key',
          payload->>'idea_title', payload->>'problem', payload->>'solution',
          payload->>'uniqueness', payload->>'impact', nullif(payload->>'reference_link',''))
  returning id into v_team_id;

  for m in select * from jsonb_array_elements(payload->'members') loop
    i := i + 1;
    insert into members (team_id, position, role_key, name, usn, email, phone,
                         programme, year, department)
    values (v_team_id, i, m->>'role_key', m->>'name', upper(m->>'usn'),
            lower(m->>'email'), m->>'phone', m->>'programme', m->>'year', m->>'department');
  end loop;
  return v_code;
end $$;
revoke all on function public.register_team(jsonb,text,text) from public, anon, authenticated;

-- Storage bucket for uploads (public read)
insert into storage.buckets (id, name, public) values ('media','media',true)
on conflict (id) do nothing;
```
Map unique-violation constraint names to fields: `teams_name_uq → team_name`, `members_usn_uq → usn`, `members_email_uq → email`. Because the unique index is global, report **which member** (compare the payload against existing rows on error to identify position).

---

## 11. Non-functional requirements

- **Security:** service-role key only on server; all writes via API routes; zod validation; output escaping; admin check on every admin route; security headers (CSP allowing only: self, Google Fonts, `youtube-nocookie.com`, `player.vimeo.com`, the Supabase project URL, and the CloudFront media host; Lenis is bundled so no script CDN is needed); `frame-ancestors 'self'`; no secrets in client bundle; CSV injection guard; upload type/size checks.
- **Privacy:** collect only listed fields; public pages never show PII; add a simple `/privacy` page (linked from `footer.legalLeft`) with a short notice: data is used only for event administration and is not shared publicly.
- **Performance:** LCP < 2.5 s on 4G — videos `preload="metadata"` except hero, posters shown first, images with width/height, fonts `display=swap`; Lighthouse ≥ 90 performance/accessibility on mobile for `/`.
- **Accessibility:** WCAG 2.1 AA — labels on all inputs, visible focus, `prefers-reduced-motion` honoured (spec in `Design.md`), contrast ≥ 4.5:1 for body text, keyboard-operable accordion/stepper/menu.
- **Responsive:** 320 px–2560 px with **no horizontal scroll** (verify).
- **SEO:** `<title>` = `site.seoTitle`, meta description = `site.description`, Open Graph tags, emoji favicon from `site.faviconEmoji`.
- **Error handling:** friendly error pages (404/500), form errors never lose entered data.
- **Timezone:** all displayed dates in IST.
- **Resilience:** if Supabase is unreachable, the public landing page still renders from `data.js`; registration shows "temporarily unavailable, try again".

---

## 12. Build order (milestones — do in this order, verify each)

1. **Scaffold** Next.js + TS (`allowJs`), install deps (`@supabase/supabase-js`, `@supabase/ssr`, `zod`, `lenis@1.1.13`), copy `data.js` to `/data.js`, add `design.css` per `Design.md`.
2. **Content system:** `getContent()` with merge + deep-fill + cache; render a bare page from it.
3. **Landing page** pixel-faithful to `Design.md`, all sections, animations, responsive.
4. **DB:** run `schema.sql`; storage bucket.
5. **Registration form** + `/api/register` + success state + closed states.
6. **Admin auth** + dashboard + registrations table/detail/edit/bulk.
7. **CSV export** (both formats) — test opening in Excel and Google Sheets.
8. **Content editor** (generic recursive form) + reset + revalidation.
9. **Promo video** admin + public component + uploads/media library.
10. **Settings + Selected teams** announcement flow.
11. **Polish:** a11y, SEO, security headers, error pages, README.

---

## 13. Acceptance tests (all must pass)

**Registration**
- [ ] Submitting a valid team creates 1 team + 3 members and returns `TMIT-0001`; second team returns `TMIT-0002`.
- [ ] Reusing any USN or email (any case) is rejected with an inline error on that exact field; nothing partial is saved.
- [ ] Duplicate team name (any case) rejected.
- [ ] Two members with the same stream cannot be submitted (UI swaps; server also rejects).
- [ ] Invalid phone/USN/email blocked by client **and** server (test with `curl` bypassing UI).
- [ ] Double-click on Submit or network retry creates **one** team.
- [ ] After deadline / `isOpen=false` / `maxTeams` reached, both UI and `POST /api/register` refuse.
- [ ] Draft survives page refresh and is cleared after success.

**Admin**
- [ ] Non-admin and logged-out users cannot open `/admin` or call `/api/admin/*`.
- [ ] Table search finds by USN, phone, email, team and reg ID; filters and sort work.
- [ ] Editing any field of a team (incl. members) persists; status change reflects in dashboard counts.
- [ ] CSV opens cleanly in Excel & Google Sheets with correct columns/order (§8.3), special characters (commas, quotes, line breaks, Kannada/Hindi text) intact, and a cell starting with `=` is neutralised.
- [ ] Filtered export contains only the filtered rows; both formats work.

**Content / `data.js`**
- [ ] Changing a string in `data.js` (e.g. `site.tagline`) updates the page in dev with no other code change.
- [ ] Editing the same field in admin overrides it immediately; "Reset to default" restores `data.js`'s value.
- [ ] Adding a new key to a section in `data.js` appears in the admin editor and does not crash the site if an old override exists.
- [ ] Adding/removing a guideline section, an evaluation criterion, a stage, a coordinator, or a track in admin changes the public page accordingly.

**Promo video**
- [ ] With `type:"none"` the section shows the "coming soon" card (no empty player).
- [ ] Uploading an mp4, pasting a YouTube link, and pasting a Vimeo link each play correctly on desktop and phone; "Remove video" restores the placeholder.

**Announcement**
- [ ] With `published=false`, `/selected` and `#selected` are hidden. After setting statuses to `selected` and publishing, only team name/track/idea title appear; no PII in the page source or API response.

**Design / quality**
- [ ] All items in `Design.md` §12 pass.
- [ ] No console errors; no horizontal scroll 320–2560 px; Lighthouse targets met.

---

## 14. Do / Don't

**Do:** read every visible string from content; keep the three files in sync; write a clear README (Supabase setup, env vars, how to add an admin, how to edit `data.js`, how to deploy); comment non-obvious code.

**Don't:** hard-code event text, dates, names or phone numbers; add Tailwind/UI libraries to the public site; expose the service-role key; store plain secrets; use `localStorage` for anything except the registration draft; change the visual design in `Design.md`; skip server-side validation; show PII publicly.

---

## 15. Open items the owner must fill in `data.js` (site works with placeholders)

1. Final **track names/descriptions/rooms** (`tracks`).
2. Confirm **role name**: "Innovation Lead" vs "Idea Defence Lead" (`roles[1].label`).
3. **Dates**: registration open/deadline, each journey stage date, training and Pitchfest dates/venue.
4. **Pitch rules**: time limit, Q&A duration, format (`guidelines` → Pitching).
5. **Contact email** (`contact.email`) and social links.
6. **USN pattern** if stricter validation is wanted (`registration.validation.usnRegex`).
7. Replace the template images/videos in `media` with real event media; add the **promo video** later via Admin → Promo Video.
8. Admin emails in `ADMIN_EMAILS` and create those users in Supabase Auth.
