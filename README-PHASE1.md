# The Bachelors FC — Way 2 Rebuild (Phase 1 DONE in this folder)

**Phase 1 scope:** Design + core pages + squad database. Built 2026-10-24.

## What is in here
- Next.js 14 (App Router) + TypeScript, BFC navy/gold dark design (not Brotherhood lime)
- **Metadata preserved exactly** from https://thebachelorsfc.netlify.app — see `lib/site.ts` + `app/layout.tsx`:
  title, description, canonical, robots, Open Graph, Twitter card, JSON-LD (SportsTeam + WebSite), Google Search Console verification. Do not change these values without owner approval.
- Core pages: `/` Home (hero, counters, pillars, kit, tour, squad preview, Next Session placeholder), `/about`, `/history` (verified events only), `/squad` (DB first, verified seed fallback), `/contact`, `/rules` (placeholder — owner text needed), `/join` (3 steps + original fields listed; live form is Phase 2)
- Real assets copied from the live site: crest, jersey, Atikur Jr. / Parvez / Chowdhury photos (`public/assets/`)
- Supabase migration `supabase/migrations/001_phase1_core.sql`: players, applications (original 9 fields + position/blood group/photo), grounds, sessions, session_rsvps, RLS policies, seed = only the 3 verified players. Open shirts #5,7,9,11,19,26,28 are shown as "Player TBA", never as people.

## Run it
```bash
npm install
cp .env.example .env.local   # fill Supabase keys (optional for Phase 1 — site falls back to seed data)
npm run dev                   # http://localhost:3000
```

## Connect Supabase (10 min)
1. Create a free project at supabase.com
2. SQL Editor → paste `supabase/migrations/001_phase1_core.sql` → Run
3. Project Settings → API → copy URL + anon key into `.env.local`
4. Restart dev server — Squad page now reads live from the `players` table; edit a player in Supabase Table Editor and refresh to prove it.

## Deploy (keep SEO)
Deploy to Netlify or Vercel and **keep the same domain** (thebachelorsfc.netlify.app) for launch, so canonical/OG/verification and Google indexing carry over untouched. Custom domain later = update `lib/site.ts` URL + add redirect.

## Still needed from owner (blocks later phases, not Phase 1)
Full squad list + photos · grounds list · match history / team photos · sell jerseys in a store? · official rules text · admin owner account.

## Next phases
Phase 2: live 3-step Join form → applications + Admin review, Grounds + Sessions. Phase 3: Gallery/Highlights/Facebook feed + Store. Phase 4: Player Login + RSVP + dues.

## Phase 2 (added 2026-10-24)
- **Live Join form** `/join`: 3 steps (About you → Background → Football), original fields preserved + WhatsApp/photo/position/blood group, validation + honeypot, photo upload to `public/uploads/` (5MB limit). Submissions go to Supabase `applications` when connected, otherwise to the local store `data/store.json`.
- **Admin** `/admin`: password login (cookie). Dev default password is `bfc-admin-2026` — set `ADMIN_PASSWORD` in `.env.local` before any public deploy. Tabs: Applications (review + set pending/trial/approved/rejected), Players (add/delete), Sessions (set Next Session — shows on homepage).
- **Data layer** `lib/data.ts`: pages read Supabase when keys exist, local store otherwise — no page code changes when switching.
- **Grounds** `/grounds`: lists grounds from the DB/store; honest empty state until the club confirms its turfs.
- To go fully live: create the Supabase project, run migration 001, put URL + anon key + a strong ADMIN_PASSWORD in `.env.local`, restart. Everything above then runs on Supabase with zero code changes.
