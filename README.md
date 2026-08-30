# ViraloKit — AI Social Media Management

AI-powered "Creator OS" for Instagram. Manage multiple accounts from one dashboard — publish images, carousels, and Reels, automate comment-to-DM, schedule posts, analyze real insights, and generate AI captions.

Stack: **Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui · Clerk · Neon Postgres + Drizzle · Cloudinary · Meta Graph API · Gemini · Inngest · Sentry · dnd-kit · PWA**.

> SaaS evolution of the proven Flask publisher in `examples/instagram-pilot-web`. Publishing, OAuth, and analytics logic are ported from it.

---

## Features

### Connect & publish
- **LinkDM-style 3-card connect screen** at [`/connect`](app/(dashboard)/connect/page.tsx) — Instagram / Facebook / Both
- Connect multiple **Instagram accounts** via OAuth or a dev-token fallback
- Publish **images, carousels, and Reels (video)** through the Instagram container API
- **Real OAuth** for Instagram; Facebook flow is wired for the day Meta approves the Business app
- Cloudinary uploads for both `image/*` and `video/mp4` (with chunked + eager async for video)

### Automation (Phases 2–4)
- **Comment-to-DM** with anti-viral protection (rate limits, dedupe, 24h messaging window)
- **Follow-gate** before DM send (per-account opt-in)
- **DM state machine** with persistence across webhook events
- **Story mention** responder, **ice-breakers** (first-DM prompts), and **escalation** rules

### Calendar & scheduling
- **Inngest background scheduler** — schedule posts for any future time, serverless delay queue
- **Calendar month grid + list view** at [`/calendar`](app/(dashboard)/calendar/page.tsx)
- **Drag-and-drop rescheduling** with dnd-kit (Drop targets per day, optimistic update)
- **Past-time** sends are auto-published immediately; scheduled sends wait for Inngest

### Analytics & AI
- **Real Instagram insights** per account + per post (impressions, reach, likes, comments, saves)
- **Mock dataset fallback** so the analytics page works with zero keys
- **AI captions** via Gemini (mock fallback)
- **DM analytics**: sends, opens, replies, opt-outs (Phase 5 audit)

### Auth, security & ops
- **Clerk** auth (Google / GitHub / email) with personal workspace per user
- **AES-256-GCM** token encryption at rest
- **HMAC-SHA256** webhook signature verification (constant-time)
- **Meta data-deletion callback** at `POST /api/instagram/data-deletion` — required for App Review, verifies `signed_request` and cascades the workspace delete
- **Error classification** — `InstagramError` maps Meta Graph API codes (100 / 102 / 190 / 4 / 32 / 200 / 803) to coarse categories with Sentry tags
- **Token-health banner** — surfaces expired / revoked / expiring-soon accounts with a re-auth link
- **Rate limiting**, bot disclosure (`lib/bot-disclosure.ts`), 24h messaging window check
- **Sentry** (client/edge/server) with environment-aware DSN
- **PWA** with offline page and service worker
- **Audit log** + **data deletion** (`/api/account/delete`, `/api/account/export`)

### UX & legal
- **Error / loading / not-found / maintenance** states across the dashboard
- **Onboarding** wizard + dedicated **Connect** screen
- **Production / legal pages**: About, Privacy, Terms, Cookie Policy, Refund
- **Dark mode**, theme toggle, account switcher, top-bar, sidebar nav

---

## Quick start (zero accounts / zero keys)

```bash
cp .env.example .env.local
npm install
npm run dev
```

You only need **Clerk keys** to sign in. Without `DATABASE_URL`, `CLOUDINARY_*`, `META_*`, `GEMINI_API_KEY`, or `INNGEST_*`, the app runs in **mock mode**: two demo Instagram accounts, fake publish results, and sample analytics. Every screen is clickable end-to-end.

---

## Setting up real services

1. **Clerk (auth)** — [clerk.com](https://dashboard.clerk.com) → create app → copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` → add `http://localhost:3000` and your Vercel URL to allowed origins.
2. **Neon Postgres** — [neon.tech](https://neon.tech) → copy the pooled connection string to `DATABASE_URL` → run `npm run db:push`.
3. **Cloudinary** — [cloudinary.com](https://cloudinary.com) → copy `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
4. **Meta app (Instagram OAuth)** — [developers.facebook.com](https://developers.facebook.com) → business app → Instagram Graph API → set `META_CLIENT_ID`, `META_CLIENT_SECRET`, `META_APP_SECRET`, `META_API_VERSION=v23.0`, `INSTAGRAM_REDIRECT_URI=https://<your-domain>/api/instagram/callback`. Configure the **Data Deletion Request Callback** in the App Dashboard to `https://<your-domain>/api/instagram/data-deletion` (required for App Review). Without a Meta dev account, use the dev-token path in `/accounts`.
5. **Gemini (AI)** — [aistudio.google.com](https://aistudio.google.com) → free API key → `GEMINI_API_KEY`.
6. **Inngest (scheduler)** — [inngest.com](https://inngest.com) → create app → set `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`. Local dev: `npx inngest-cli dev`.

Full variable list: [.env.example](.env.example).

---

## Scripts

```bash
npm run dev           # dev server (Turbopack)
npm run build         # production build (typecheck + lint via prebuild)
npm run start         # serve production build
npm run lint          # ESLint
npm run test          # node:test (tsx loader) — 98 tests, no external services
npm run db:push       # push Drizzle schema to Neon
npm run db:generate   # generate SQL migration
npm run db:studio     # open Drizzle Studio
```

---

## Architecture

```
User → Workspace → Social Accounts → Posts → Media → Automations (DM, Inngest)
                                    ↓
                              Webhooks (Meta) → DM State Machine
```

- `lib/db/schema.ts` — Drizzle schema (users, workspaces, members, social_accounts, posts, media_assets, automations, audit_log)
- `lib/providers/instagram.ts` — Graph API: containers, publish, OAuth, analytics, container-ready polling
- `lib/providers/cloudinary.ts` — image + video upload (chunked for video)
- `lib/providers/ai.ts` — Gemini caption generation
- `lib/inngest/*` — background scheduler (`enqueuePostPublish`)
- `lib/crypto.ts` — AES-256-GCM token encryption
- `lib/webhook-signature.ts` — HMAC-SHA256 verification
- `lib/messaging-window.ts` — 24h IG window check
- `lib/bot-disclosure.ts` — automated DM disclosure text
- `app/api/*` — route handlers · `app/(dashboard)/*` — authenticated UI · `app/(legal)/*` — public legal pages
- `proxy.ts` — Clerk middleware + protected matcher
- `public/build-summary.svg` — dev-facing build summary (dev notes)

---

## Deploy (Vercel, free tier)

1. Push this folder to GitHub (already done).
2. [vercel.com/new](https://vercel.com/new) → import the repo.
3. Add every variable from `.env.example` in Project Settings → Environment Variables.
   - Vercel domain goes into `NEXT_PUBLIC_APP_URL`, `INSTAGRAM_REDIRECT_URI`, and Clerk allowed origins.
4. Deploy. Hobby plan is free; keep the database on Neon's free tier.

For background scheduling, also point the Inngest dashboard at your Vercel URL's `/api/inngest` endpoint.

---

## Roadmap

- [x] **Phase 1** — Instagram OAuth, container publish, HMAC webhook, AI captions
- [x] **Phase 2** — Comment-to-DM with anti-viral protection
- [x] **Phase 3** — Follow-gate, DM state machine, Inngest scheduler, Reels, calendar drag-and-drop
- [x] **Phase 4** — Story mentions, ice-breakers, escalation
- [x] **Phase 5** — Audit, error handling, data deletion, production UX states, legal pages
- [x] **Connect redesign** — LinkDM-style 3-card layout (Instagram / Facebook / Both)
- [ ] **Facebook Pages** — wire up real OAuth once Meta business app is approved
- [ ] **More platforms** — Pinterest, X, YouTube, Reddit, Threads, TikTok, LinkedIn
- [ ] **Team members + billing** — Clerk B2B, role-based access control
- [ ] **Mobile** — PWA today, Flutter / React Native later
