# THINK MIT Pitchfest Website

Official website for **THINK MIT** — a college-level innovation pitchfest organized by the Department of CSE–AI with the Institution's Innovation Council (IIC) and Entrepreneurship Development Cell (EDC) at MITM.

## Tech Stack
- **Framework**: Next.js 14+ (App Router) with TypeScript & `allowJs`
- **Styling**: Vanilla global CSS (`src/styles/design.css`) adhering to `Design.md`
- **Smooth Scroll**: `lenis@1.1.13`
- **Database, Auth & Storage**: Supabase (PostgreSQL, Supabase Auth, Storage)
- **Validation**: Zod (shared schema generated dynamically from content)
- **Deployment**: Vercel

## Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node 20 / 24)
- npm or pnpm

### 2. Environment Setup
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in the credentials:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role secret (server only, never exposed to client)
- `ADMIN_EMAILS`: Comma-separated list of admin email addresses allowed to access `/admin`
- `NEXT_PUBLIC_SITE_URL`: Base URL (e.g. `http://localhost:3000` or production domain)

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## How Content Works (`data.js`)
`data.js` is the single source of truth for all website text, dates, links, and registration limits.
- **In Development**: Editing `data.js` immediately updates the website on save.
- **In Production**: Any changes to `data.js` take effect upon next git push and Vercel redeploy.
- **Admin Panel Overrides**: Organizers can edit content directly in `/admin/content`. Changes are saved to the Supabase database (`site_content`) and take effect immediately without redeploying. "Reset to default" deletes the override and falls back to `data.js`.
