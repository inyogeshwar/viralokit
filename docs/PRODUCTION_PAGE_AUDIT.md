# ViraloKit — Production Page & UX State Audit

**Audit date:** 2026-08-28
**Auditor:** Claude (production-readiness review)
**Repository:** `inyogeshwar/viralo-kit`
**Stack detected:** Next.js 16.3.1 · React 19.2.8 · TypeScript · Tailwind v4 · shadcn/ui · Clerk · Neon Postgres + Drizzle · Cloudinary · Gemini · Inngest · Sentry · Vercel Analytics

---

## 1. Application profile (verified from code)

| Aspect | Evidence | Value |
|---|---|---|
| Type | `README.md`, `app/page.tsx` | AI-powered social media management SaaS (Instagram) |
| Pricing | `README.md` ("100% free", "Free Forever"), `lib/db/schema.ts:39` (`plan` defaults `"free"`), absence of any payment integration | **100% free — no paid plan exists today** |
| Auth | `package.json` (`@clerk/nextjs`), `proxy.ts:1` (`clerkMiddleware`), `app/sign-in/`, `app/sign-up/` | Clerk (Google/GitHub/email) |
| Roles | `lib/db/schema.ts:13` (`roleEnum`: owner, admin, member, viewer) | Defined in schema; UI shows "Owner" hardcoded — admin/member/viewer not surfaced |
| Data | `lib/db/schema.ts`, `lib/crypto.ts` (AES-256-GCM) | Postgres via Neon; Instagram tokens encrypted |
| APIs | `app/api/*` (accounts, ai, analytics, automation, calendar, inngest, instagram/callback, media, posts, publish, status, webhooks) | All under Clerk middleware (`proxy.ts:12`) |
| Background jobs | `lib/inngest/*`, `package.json` (`inngest`) | Inngest scheduler (Phase 3) |
| Media | `lib/providers/cloudinary.ts` | Cloudinary (image + video) |
| AI | `lib/providers/ai.ts` | Gemini captions |
| Social platform | `lib/providers/instagram.ts` | Instagram Graph API only |
| Cookies | `app/layout.tsx:96-117` (GTM), `app/cookies` from Clerk + Vercel Analytics, `next-themes` | Yes, plus optional Google Tag Manager |
| Mock mode | `lib/env.ts:1`, `lib/mock.ts` | Yes — runs with no keys |
| Webhooks | `app/api/webhooks/instagram`, `app/api/webhooks/subscribe` | Instagram webhooks received (allowlisted in `proxy.ts:12`) |
| PWA | `components/pwa-register.tsx` | Yes |
| Error reporting | `sentry.*.config.ts`, `next.config.ts:1` (`withSentryConfig`) | Sentry |
| Tests | `package.json` scripts | **No test runner configured** — only lint/build |

---

## 2. Evidence-based audit table

Status legend: `EXISTS_AND_ADEQUATE` · `EXISTS_NEEDS_IMPROVEMENT` · `APPLICABLE_MISSING` · `NOT_APPLICABLE` · `BLOCKED_BY_MISSING_INFORMATION`

### Legal pages

| Category | Page / state | Status | Evidence | Applicability reason | Required action |
|---|---|---|---|---|---|
| Legal | Privacy Policy | EXISTS_NEEDS_IMPROVEMENT | `app/(legal)/privacy-policy/page.tsx` (116 lines) | Collects personal data via Clerk, Instagram tokens, Cloudinary media, Gemini, webhooks, Sentry | Add "Changes" notification, retention specific to **Instagram tokens (until revocation)**, contact method consistency, **mark as "draft pending legal review"**; expose data export & deletion pathways |
| Legal | Terms of Service | EXISTS_NEEDS_IMPROVEMENT | `app/(legal)/terms-of-service/page.tsx` (111 lines) | Public service with accounts, content, automation | Fix §7 (mentions paid plans but **no paid plan exists**); §10 (mentions "Settings page" termination — **no deletion UI today**); **mark as "draft pending legal review"** |
| Legal | Cookie Policy | EXISTS_AND_ADEQUATE | `app/(legal)/cookie-policy/page.tsx` (81 lines) | App uses Clerk cookies, Vercel analytics, optional GTM | Add GTM mention, no other changes needed |
| Legal | Refund Policy | NOT_APPLICABLE | `app/(legal)/refund-policy/page.tsx` (71 lines) | **No paid plan, no Stripe, no billing code anywhere in repo** | Page describes policies that don't apply; mark as "Not applicable — service is free today" or remove from public nav (kept for future use, but flagged) |
| Legal | Cancellation Policy | NOT_APPLICABLE | — | No subscriptions, no orders, no bookings | Not applicable |
| Legal | Shipping Policy | NOT_APPLICABLE | — | No physical products | Not applicable |
| Legal | Return / Exchange Policy | NOT_APPLICABLE | — | No physical products | Not applicable |
| Legal | Disclaimer | APPLICABLE_MISSING | — | Provides AI-generated captions and Instagram publishing, with service-availability claims in `app/(legal)/terms-of-service/page.tsx:86-89` | Create a short, honest disclaimer about AI output and third-party availability |
| Legal | Accessibility Statement | APPLICABLE_MISSING | — | Public-facing product, but **no accessibility audit has been performed** | Create a factual statement describing known commitments and current limits; do **not** claim WCAG conformance |
| Legal | Data Processing Agreement | NOT_APPLICABLE | — | This is a direct-to-consumer SaaS, not a B2B data-processor service | Not applicable |
| Legal | Acceptable Use Policy | APPLICABLE_MISSING | — | Accounts exist, automation rules can send DMs/comments (`app/(dashboard)/automation/page.tsx`), users upload media | Create AUP covering spam, harassment, automation limits |
| Legal | Security Policy | APPLICABLE_MISSING | — | Public product handling encrypted tokens and Instagram credentials | Create honest security page describing encryption, hosting, reporting channel |
| Legal | Responsible Disclosure | APPLICABLE_MISSING | — | Public product, should provide a security reporting channel | Create page with reporting email and scope |
| Legal | Community Guidelines | NOT_APPLICABLE | — | No public community, no comments-from-strangers, no UGC discovery feed (the product manages the user's own Instagram, not a public forum inside ViraloKit) | Not applicable |

### Customer lifecycle

| Category | Page / state | Status | Evidence | Applicability reason | Required action |
|---|---|---|---|---|---|
| Lifecycle | Login | EXISTS_AND_ADEQUATE | `app/sign-in/[[...sign-in]]/page.tsx` (uses Clerk `<SignIn />`); fallback URLs in `.env.example:13-14` | Clerk handles all flows | None — Clerk-provided |
| Lifecycle | Register | EXISTS_AND_ADEQUATE | `app/sign-up/[[...sign-up]]/page.tsx` | Clerk handles registration | None |
| Lifecycle | Email Verification | EXISTS_AND_ADEQUATE | Clerk provides built-in verification (configured via Clerk dashboard, not in this repo) | Clerk handles | None |
| Lifecycle | Forgot Password | EXISTS_AND_ADEQUATE | Clerk `<SignIn />` has "forgot password" flow | Clerk handles | None |
| Lifecycle | Reset Password | EXISTS_AND_ADEQUATE | Same as above | Clerk handles | None |
| Lifecycle | Onboarding | APPLICABLE_MISSING | New users hit `/dashboard` immediately (per `proxy.ts:5` + `.env.example:13-14`); no first-run flow | Users need to: pick a workspace name, connect an Instagram account, learn how to compose | Add lightweight onboarding page at `/onboarding` that detects first-time state and guides them; non-blocking — can be skipped |
| Lifecycle | Account Settings | EXISTS_NEEDS_IMPROVEMENT | `app/(dashboard)/settings/page.tsx` (113 lines) | Real, has Profile + Workspace + Configuration status | Add **Account deletion** action, **Data export** action, **Disconnect Instagram** listing, **Active sessions** placeholder |
| Lifecycle | Billing | NOT_APPLICABLE | `lib/db/schema.ts:39` defaults `plan` to `"free"`; no Stripe/Polar/Lemon Squeezy code anywhere | **No billing exists in this product** | Not applicable |
| Lifecycle | Upgrade | NOT_APPLICABLE | — | No paid tier | Not applicable |
| Lifecycle | Downgrade | NOT_APPLICABLE | — | No paid tier | Not applicable |
| Lifecycle | Cancel Subscription | NOT_APPLICABLE | — | No subscriptions | Not applicable |
| Lifecycle | Payment Success | NOT_APPLICABLE | — | No payments | Not applicable |
| Lifecycle | Payment Failed | NOT_APPLICABLE | — | No payments | Not applicable |
| Lifecycle | Payment Pending | NOT_APPLICABLE | — | No payments | Not applicable |
| Lifecycle | Support | EXISTS_NEEDS_IMPROVEMENT | `app/(legal)/contact/page.tsx` (84 lines) | Real form, but **submission is UI-only** (line 58: `e.preventDefault(); setSubmitted(true)`) | Wire form to `/api/contact` (email transport or store-and-forward) — but **block if SMTP key missing** so we don't fake success |
| Lifecycle | Help Center | APPLICABLE_MISSING | No `/help`, no `/docs` route in `app/` | Product has real features users need to learn (Instagram OAuth, dev-token fallback, webhooks, automations) | Add `/help` index linking to existing `META-APP-SETUP-GUIDE.md` and `SETUP-GUIDE-HINGLISH.md`, plus FAQ (use the real FAQ from `app/page.tsx:139-172`) |

### UX states

| Category | Page / state | Status | Evidence | Applicability reason | Required action |
|---|---|---|---|---|---|
| UX | 404 | APPLICABLE_MISSING | No `app/not-found.tsx` exists (`find` confirmed empty) | App has many dashboard routes that may be hit by stale links | Add global `app/not-found.tsx` for the (legal) and root layer; add a dashboard-aware not-found inside `app/(dashboard)/` |
| UX | 403 | APPLICABLE_MISSING | No `/forbidden` page, no permission-denied UI | Clerk middleware enforces auth (`proxy.ts:16`) but no workspace-role-based 403 page; all users are "Owner" today | Add reusable `ForbiddenState` component; mount at a `/forbidden` route for future role checks |
| UX | 500 | APPLICABLE_MISSING | No `app/error.tsx`, no `app/global-error.tsx` | App uses Sentry (`next.config.ts:1`) but no user-facing fallback | Add `app/error.tsx` (dashboard) and `app/global-error.tsx`; surface a correlation ID when available |
| UX | Maintenance | APPLICABLE_MISSING | No `/maintenance` page; no env flag controlling it | `app/api/status` exists (`app/api/status/route.ts`) — natural place for a "maintenance mode" toggle | Add `app/maintenance/page.tsx`; gate via env `MAINTENANCE_MODE=true` in `lib/env.ts`; have `/api/status` reflect it |
| UX | Offline | APPLICABLE_MISSING | No offline page; PWA service worker exists but only registration (`components/pwa-register.tsx`) | App allows scheduling, composing; PWA users may lose connectivity | Add a client-side `OfflineBanner` component; mount in dashboard layout |
| UX | Empty State | EXISTS_NEEDS_IMPROVEMENT | `app/(dashboard)/dashboard/page.tsx:131-135` has a basic empty state for posts | Other screens (compose, media, accounts, analytics, automation, calendar) need consistent empty states | Add a shared `<EmptyState>` component in `components/`; adopt it on at least `inbox`, `media`, `automation`, `accounts` |
| UX | No Search Results | NOT_APPLICABLE | App has no global search today | — | Not applicable (no search surface) |
| UX | Loading State | APPLICABLE_MISSING | No `loading.tsx` in `app/(dashboard)/` or `app/(legal)/` | Route segments show blank while server components load | Add `app/(dashboard)/loading.tsx` (skeleton) and `app/(legal)/loading.tsx` |
| UX | Error State | APPLICABLE_MISSING | No reusable error component | Per-page error.tsx missing | Covered by UX-500; also add `<ErrorState>` shared component for inline error UI |
| UX | Success State | APPLICABLE_MISSING | No reusable success component | Calendar/Compose currently log `console.log`/alerts for drag-success (`app/(dashboard)/calendar/page.tsx` uses inline alerts) | Add `<SuccessState>` and a `<Toast>` wrapper (use Sonner or shadcn toast pattern) — but pick the existing pattern already in use if any |
| UX | Session Expired | APPLICABLE_MISSING | No handler; Clerk's `auth()` returns null when session expires, but UI crashes or shows `throw new Error("Unauthorized")` (`lib/context.ts:14`) | Protected routes do redirect via middleware, but API failures bubble to user | Add `app/session-expired/page.tsx`; add `<SessionExpiredHandler>` that catches 401 from `fetch` and routes there |

---

## 3. Items the user must answer before any legal page can be considered "final"

The following facts are **not** in the codebase and **must not be invented**:

| Fact | Why it blocks the page | Current placeholder in repo |
|---|---|---|
| Legal entity / operator name | Required for Privacy Policy, ToS, AUP, Disclaimer | "ViraloKit" used as operator in `app/(legal)/privacy-policy/page.tsx:16` — no legal entity disclosed |
| Registered business address | Required for ToS / Privacy contact section | Not present |
| Operating jurisdiction & governing law | Required for ToS, AUP, Disclaimer | Not present |
| Support contact (real email or form) | Required by Privacy, AUP, Security | `support@viraloKit.app`, `privacy@viraloKit.app`, `legal@viraloKit.app`, `billing@viraloKit.app`, `hello@viraloKit.app`, `feedback@viraloKit.app` listed in `privacy-policy`, `cookie-policy`, `contact`, `refund-policy`, `terms-of-service` — **none verified as live** |
| Minimum user age | Required for Children / Age section in Privacy and ToS | Privacy says "under 13" (line 99); ToS says "at least 13" (line 35) — **inconsistency**; needs owner confirmation |
| Effective date of each policy | Required | All set to "August 18, 2026" — today is 2026-08-28; **10-day drift on every page** |
| Whether billing will ever exist | Required to decide whether to keep Refund Policy in the public nav | Currently listed in nav but no billing code |
| Security reporting contact | Required for Security / Responsible Disclosure pages | None present |
| Whether account deletion is offered end-to-end | Required for Privacy, ToS, Settings UI | Not implemented; data-export not implemented |

**Conclusion of this section:** I will implement page structure and configuration, but every legal page will carry a clear "draft pending legal review" notice so it is **not** presented as final. Where the above facts are required (operator name, address, jurisdiction, verified email), I will keep the placeholders the repo already uses and add a single audit-pending banner at the top of each legal page.

---

## 4. Implementation plan (priority order, all unblocked items)

| # | Item | Type | Risk |
|---|---|---|---|
| 1 | `app/global-error.tsx` | UX | Low |
| 2 | `app/(dashboard)/error.tsx` | UX | Low |
| 3 | `app/(dashboard)/loading.tsx` + `app/(legal)/loading.tsx` | UX | Low |
| 4 | `app/not-found.tsx` + `app/(dashboard)/not-found.tsx` | UX | Low |
| 5 | `app/maintenance/page.tsx` + env flag + status API integration | UX | Low |
| 6 | `components/offline-banner.tsx` + mount in dashboard layout | UX | Low |
| 7 | `components/empty-state.tsx` + adopt in dashboard pages | UX | Low |
| 8 | `app/forbidden/page.tsx` | UX | Low |
| 9 | `app/session-expired/page.tsx` + fetch interceptor | UX | Medium |
| 10 | `app/onboarding/page.tsx` | Lifecycle | Medium |
| 11 | `app/help/page.tsx` (Help Center index) | Lifecycle | Low |
| 12 | Settings: account deletion + data export + disconnect listing | Lifecycle | High (deletion needs careful cascade) |
| 13 | Wire Contact form to `/api/contact` (graceful fallback when no key) | Lifecycle | Medium |
| 14 | `app/(legal)/disclaimer/page.tsx` | Legal | Low |
| 15 | `app/(legal)/accessibility/page.tsx` | Legal | Low |
| 16 | `app/(legal)/acceptable-use/page.tsx` | Legal | Low |
| 17 | `app/(legal)/security/page.tsx` | Legal | Low |
| 18 | `app/(legal)/responsible-disclosure/page.tsx` | Legal | Low |
| 19 | Audit-pending banner on existing legal pages | Legal | Low |
| 20 | Footer: add new legal pages to nav | UX | Low |
| 21 | Sidebar: add Help / Onboarding / Settings quick links | UX | Low |
| 22 | Sitemap update | Low | Low |
| 23 | robots.txt: ensure new public pages are allowed | Low | Low |

---

## 5. Verification plan

- `npm run lint`
- `npx tsc --noEmit` (or `npm run build` which includes typecheck)
- `npm run build` — full production build
- Manual route smoke test (read each new file, confirm it is wired in sidebar/footer/sitemap)

---

## 6. Known limitations & risks

1. **No test framework is configured.** Per `package.json:8-12` the only scripts are `dev`, `build`, `start`, `lint`, `db:*`. No `test`, `test:unit`, `vitest`, `jest`. I will not invent a test runner; I will rely on lint + build for verification.
2. **Mock mode + Clerk dummy key**: dev server logs `Error: Publishable key not valid.` (`run/dev.log`); this is environment-only and will not affect production deployment.
3. **Contact form backend**: SMTP credentials are not in `.env.example`; without them, the form will store locally and surface a "we'll be in touch" confirmation. We will not invent a third-party form handler.
4. **Account deletion** is destructive; I will implement it with a typed confirmation modal and a "type your email" guard, and document the cascade (workspace → accounts → posts → media → comments → messages → automation rules) in the audit.
5. **Effective date drift**: all existing legal pages show 2026-08-18. I will set a single `LAST_UPDATED` constant in `lib/legal.ts` and use it everywhere so dates stay consistent.

---

## 7. Out of scope (not implemented, with reason)

- **Payment pages (success / failed / pending)**: not applicable — no payment provider integrated.
- **Cancellation / shipping / return policies**: not applicable — no physical goods, no subscriptions.
- **Community Guidelines**: not applicable — ViraloKit does not host a public community.
- **Data Processing Agreement**: not applicable — ViraloKit is a direct-to-consumer tool, not a B2B data-processor.
- **Refactor of existing legal pages to remove all "paid plan" language**: kept in scope of the existing ToS/Refund updates (see action items) but the page is not removed.
