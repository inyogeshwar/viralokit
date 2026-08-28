# ViraloKit — Production Page & UX State Audit

**Audit date:** 2026-08-28
**Auditor:** Claude (production-readiness review)
**Repository:** `inyogeshwar/viralo-kit`

## 1. Application profile (verified from code)

| Aspect | Evidence | Value |
|---|---|---|
| Type | `README.md`, `app/page.tsx` | AI-powered social media management SaaS (Instagram) |
| Pricing | `README.md` ("100% free", "Free Forever"), `lib/db/schema.ts:39` (`plan` defaults `"free"`), absence of any payment integration | **100% free — no paid plan exists today** |
| Auth | `package.json` (`@clerk/nextjs`), `proxy.ts:1` (`clerkMiddleware`), `app/sign-in/`, `app/sign-up/` | Clerk (Google/GitHub/email) |
| Data | `lib/db/schema.ts`, `lib/crypto.ts` (AES-256-GCM) | Postgres via Neon; Instagram tokens encrypted |
| Background jobs | `lib/inngest/*`, `package.json` (`inngest`) | Inngest scheduler |
| Media | `lib/providers/cloudinary.ts` | Cloudinary (image + video) |
| AI | `lib/providers/ai.ts` | Gemini captions |
| Social platform | `lib/providers/instagram.ts` | Instagram Graph API only |
| Cookies | `app/layout.tsx:96-117` (GTM), `app/cookies` from Clerk + Vercel Analytics, `next-themes` | Yes, plus optional GTM |
| Mock mode | `lib/env.ts:1`, `lib/mock.ts` | Yes — runs with no keys |
| Webhooks | `app/api/webhooks/instagram`, `app/api/webhooks/subscribe` | Instagram webhooks received |
| PWA | `components/pwa-register.tsx` | Yes |
| Error reporting | `sentry.*.config.ts`, `next.config.ts:1` | Sentry |
| Tests | `package.json` scripts | **No test runner configured** — only lint/build |

## 2. Evidence-based audit table (key rows)

### Legal
- Privacy Policy: `app/(legal)/privacy-policy/page.tsx` — EXISTS, dates and contact info need consolidation
- Terms of Service: `app/(legal)/terms-of-service/page.tsx` — EXISTS, references paid plans that don't exist
- Cookie Policy: `app/(legal)/cookie-policy/page.tsx` — EXISTS, mostly adequate
- Refund Policy: `app/(legal)/refund-policy/page.tsx` — EXISTS but describes policies for a paid plan that does not exist
- Disclaimer: APPLICABLE_MISSING — created at `app/(legal)/disclaimer/page.tsx`
- Accessibility Statement: APPLICABLE_MISSING — created at `app/(legal)/accessibility/page.tsx`
- Acceptable Use Policy: APPLICABLE_MISSING — created at `app/(legal)/acceptable-use/page.tsx`
- Security Policy: APPLICABLE_MISSING — created at `app/(legal)/security/page.tsx`
- Responsible Disclosure: APPLICABLE_MISSING — created at `app/(legal)/responsible-disclosure/page.tsx`
- Cancellation / Shipping / Return / DPA / Community: NOT_APPLICABLE (no physical goods, no subscriptions, no public community, B2C not B2B)

### Customer lifecycle
- Login, Register, Email Verification, Forgot/Reset Password: EXISTS_AND_ADEQUATE (Clerk-provided)
- Onboarding: APPLICABLE_MISSING — created at `app/(dashboard)/onboarding/page.tsx`
- Account Settings: EXISTS_NEEDS_IMPROVEMENT — extended at `app/(dashboard)/settings/page.tsx` with data export and deletion
- Billing / Upgrade / Downgrade / Cancel / Payment Success/Failed/Pending: NOT_APPLICABLE (no payments)
- Support: EXISTS_NEEDS_IMPROVEMENT — wired Contact form to `app/api/contact`
- Help Center: APPLICABLE_MISSING — created at `app/(dashboard)/help/page.tsx`

### UX states
- 404: APPLICABLE_MISSING → `app/not-found.tsx`, `app/(dashboard)/not-found.tsx`
- 403: APPLICABLE_MISSING → `app/forbidden/page.tsx`
- 500: APPLICABLE_MISSING → `app/error.tsx`, `app/(dashboard)/error.tsx`, `app/global-error.tsx`
- Maintenance: APPLICABLE_MISSING → `app/maintenance/page.tsx` (gated by `MAINTENANCE_MODE` env)
- Offline: APPLICABLE_MISSING → `components/offline-banner.tsx`
- Empty State: EXISTS_NEEDS_IMPROVEMENT → shared `components/empty-state.tsx`
- Loading: APPLICABLE_MISSING → `app/loading.tsx`, `app/(dashboard)/loading.tsx`, `app/(legal)/loading.tsx`
- Error: APPLICABLE_MISSING → shared per-route `error.tsx` files
- Success: APPLICABLE_MISSING → embedded inline; no toast layer was added
- Session Expired: APPLICABLE_MISSING → `app/session-expired/page.tsx` + `components/session-expired-handler.tsx`

## 3. Items the user must answer

- Legal entity / operator name (currently "ViraloKit")
- Registered business address
- Operating jurisdiction & governing law
- Real support email vs. placeholder (e.g., `support@viralo-kit.app`)
- Minimum user age (Privacy says 13, ToS says 13 — consistent now, but verify)
- Whether billing will ever exist (Refund Policy is kept in the nav with that note)
- Security reporting contact (placeholder `security@viralo-kit.app`)

**The legal pages carry a "Draft for review" banner so they are not presented as final.**

## 4. Verification

- `npx tsc --noEmit` — clean
- `npm run lint` — 0 errors (warnings only)
- `npm run build` — passes; all new routes registered

## 5. Out of scope (with reason)

- Payment pages: no payment provider integrated
- Cancellation / shipping / return: no physical goods, no subscriptions
- Community Guidelines: no public community inside the product
- Data Processing Agreement: B2C, not a B2B data-processor
