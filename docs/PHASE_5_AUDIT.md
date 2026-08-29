# Phase 5 — Audit, Error Handling & Data Compliance

> Status: **complete** — 2026-08-29
> Branch: `production-ux-states-legal-pages`
> Tests: 98 / 98 passing (14 new in `tests/phase5.test.ts`)
> Lint / typecheck / build: clean

## Scope (per [viralo_kit_dm_automation_plan.md](viralo_kit_dm_automation_plan.md))

1. Error logging with code classification (Meta error codes 100, 190, 4, 32, 102, 200, 803).
2. Data-deletion callback — Meta App Review mandatory.
3. In-app banner for token-expired accounts.
4. Final code audit.

---

## 1. Error classification

### What was already there
- `lib/providers/instagram.ts` had a typed `InstagramError` but no categorization. Every call site either swallowed the error, logged it, or threw it raw.

### What changed
- `META_ERROR_CODES` constant exported with the documented Meta Graph API error codes:
  - `102` session invalid → `token_expired`
  - `190` invalid OAuth → `token_expired`
  - `4` / `32` rate limits → `rate_limited`
  - `200` permission denied → `permission_denied`
  - `100` parameter → `parameter`
  - `803` invalid ID → `not_found`
- `classifyMetaError(code)` returns a coarse category string.
- `InstagramError` now carries a `category` field and exposes `isTokenExpired()` / `isRateLimited()` predicates for call sites that need to branch.
- `lib/error-reporting.ts` (`reportError`) is a thin wrapper around `Sentry.captureException` that attaches tags — `error.category`, `meta.error_code`, `workspace.id`, `account.id`, `feature` — and is production-only (matches `sentry.server.config.ts` gating).
- `lib/automation.ts` now calls `reportError(...)` in every catch block (`dm_reply`, `comment_reply`, `escalation`, `follow_gate`, `story_mention`) with the relevant feature tag. Failures remain non-fatal at the webhook level — a 500 from us would only cause Meta to retry the same broken request.

### Why
- The dashboard needs to know "is this a token problem?" vs "is this a code bug?" without parsing free-text messages.
- Sentry becomes searchable by category, so the operator can filter to "all token_expired events in the last hour" and see which accounts need re-auth.

---

## 2. Data-deletion callback

### Why this exists
Meta App Review **requires** a Data Deletion Request Callback URL for any app that touches Instagram user data. Without it, the app cannot be approved for `instagram_manage_messages` and friends.

### Implementation
Two routes:

- `app/api/instagram/data-deletion/route.ts` — `POST`.
  - Accepts `application/x-www-form-urlencoded` (Meta's default) or JSON.
  - Verifies `signed_request` via HMAC-SHA256 with `META_APP_SECRET` and a constant-time `crypto.timingSafeEqual` compare.
  - When the app secret is missing (dev / mock mode) we accept the payload unverified — keeps local dev working without leaking signed-request handling.
  - Looks up the social account by Instagram Scoped User ID (`igUserId`).
  - Deletes the account row; the workspace cascade handles the rest.
  - Returns `{ url, confirmation_code }` per Meta's spec.

- `app/api/instagram/data-deletion/status/route.ts` — `GET`.
  - Returns `{ ok, confirmation_code, status: "complete", message }`.
  - In production this would be a real page; today it returns JSON so the same route or a UI page can render it.

### Why split
- The signed-request verification is in `lib/meta-signed-request.ts` (a plain helper) so it's directly testable without standing up an HTTP server. The route is a thin shell that does I/O.

### Mock / dev
- With no `META_APP_SECRET` set, the verifier accepts unverified payloads. A console warning would normally go here, but the dev server already announces mock mode via `env.mockMode`.

---

## 3. In-app token-expired banner

### Files
- `lib/social-account-status.ts` — `getAccountsHealth(workspaceId)` and `hasUnhealthyAccount(...)`.
- `app/api/accounts/health/route.ts` — `GET` returning the health of every connected account.
- `components/account-health-banner.tsx` — client component mounted in the dashboard layout, polls `/api/accounts/health` every 60s (paused while the tab is hidden), and renders a dismissable banner that links to `/accounts`.

### Health states
| State | Meaning | Banner tone |
| --- | --- | --- |
| `ok` | Token valid, expires > 7d | (no banner) |
| `expiring_soon` | Expires in < 7d | amber |
| `expired` | Expires in the past | destructive |
| `revoked` | Live `GET /me` returned 102/190 | destructive |
| `unknown` | Live check failed for a non-token reason | amber (fallback) |

The live `GET /me` check is rate-limited to 1 call per account per 5 minutes via an in-memory cooldown map (`_resetAccountHealthCache()` for tests). This keeps the dashboard cheap even with many connected accounts.

### Why a banner vs a dashboard widget
- Token-expiry is a *now-or-never* problem (Meta's webhooks stop delivering within hours of an expired token). A banner above the app shell is the most discoverable surface; a dashboard widget is easy to ignore.

---

## 4. Final code audit

### What we verified
- All 5 phases ship with tests; total 98/98 passing in ~5s.
- `npx tsc --noEmit` clean.
- `npm run lint` clean (only pre-existing warnings in `app/layout.tsx` and `app/page.tsx`, both unrelated to DM work).
- `npm run build` clean.
- HMAC verification uses `crypto.timingSafeEqual` with explicit length check (constant-time).
- Webhook signature verification and signed-request verification use distinct code paths — the same algorithm but different inputs (body vs. payload).
- Rate limiters (Phase 2) gate both per-account and per-post private replies; the 25/min + 100/hour per-post caps absorb viral storms without the dashboard's API being throttled.
- State machine (Phase 3) and escalation (Phase 4) are idempotent — re-delivery of the same webhook produces no duplicate DMs.
- No user message is logged to disk in plain text. Bot disclosure (`withBotDisclosure`) is always on in automation paths.

### What is explicitly **not** in this PR
- **Compliance certifications.** No claim of GDPR / CCPA / SOC 2. The data-deletion callback gives us the *mechanism* for deletion requests; the legal review is a separate track and out of scope for code.
- **Multi-tenant data partitioning.** That's enforced by the existing Clerk → workspace → accounts cascade and is not changed here.
- **Encryption-at-rest for token DB column.** `accessToken` is encrypted by `lib/crypto.ts` already; not re-implemented.
- **A real status page** for the data-deletion endpoint. The current `/api/instagram/data-deletion/status?code=…` returns JSON; a dedicated UI page is a follow-up.

### Open follow-ups
- Surface per-account health inside `/accounts` (today the banner is the only place token issues show up).
- Move the in-memory health cache to a shared store (Redis) once we run multi-instance.
- Wire the rate-limit metrics to a dashboard (currently console-only).

---

## Files changed / added in Phase 5

```
lib/error-reporting.ts              (new)
lib/meta-signed-request.ts          (new)
lib/social-account-status.ts        (new)
lib/providers/instagram.ts          (extended — META_ERROR_CODES, classifyMetaError, InstagramError.category)
lib/automation.ts                   (wired reportError into every catch)
app/api/instagram/data-deletion/route.ts            (new)
app/api/instagram/data-deletion/status/route.ts     (new)
app/api/accounts/health/route.ts                    (new)
components/account-health-banner.tsx                (new)
app/(dashboard)/layout.tsx          (mount the banner)
tests/phase5.test.ts                (new — 14 tests)
```

---

## Verification commands

```bash
npx tsc --noEmit
npm run lint
node --import tsx --test "tests/**/*.test.ts"
npm run build
```

Last run on 2026-08-29: all clean, 98/98 tests passing.
