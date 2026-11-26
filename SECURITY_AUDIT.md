# ViraloKit — Security Audit Report

Repo: `inyogeshwar/viralokit` (commit `7035252`, 2026-10-31)
Cloned to `/storage/emulated/0/ViraloKit`. Audit method: static source review (no live instance tested).

## ⚠️ User ke sawal ka seedha jawab: "doosre ke ID pe post ho raha hai?"

Publik `POST /api/meta/publish` route **session user ke account hi pe publish karta hai** — body se `userId` nahi liya jata:

- `app/api/meta/publish/route.ts:22` → `getCurrentUser()`
- `app/api/meta/publish/route.ts:30` → `getUserInstagramCredentials(user.id)`  ← session ID
- `app/api/meta/publish/route.ts:105,113,118,125` → `credentials.instagramUserId` (DB/session se aata hai, client se nahi)
- `app/api/meta/publish/route.ts:139` → insert `user_id: user.id`

**Matlab: post ke liye "kisi doosre ka ID" is route se direct nahi chal sakta.** Lekin niche wale confirmed loopholes isko possible banate hain.

---

## 🔴 CRITICAL / CONFIRMED

### 1. `POST /api/meta/discovery` — arbitrary `userId` se doosre user ki credentials use hoti hain
`app/api/meta/discovery/route.ts:86-88`:
```ts
const { action, commentId, moderateAction, userId } = body;
const credentials = await getUserInstagramCredentials(userId);
```
GET me bhi line 17: `const userId = searchParams.get("userId")`.

`getUserInstagramCredentials(userId)` (`lib/meta/user-account.ts:25-31`) `.eq("user_id", userId)` se DB query karta hai. Agar attacker kisi doosre user ka `userId` (auth.users UUID) jaan sake (error message, logs, invite flows, page source, etc.), to wo uski decrypted Meta/Instagram credentials se:
- `moderate_comment` (line 96-99) → doosre ke page pe comment hide/delete kar sakta hai.
- `business` / `publishing_limit` / hashtag discovery → doosre ke account se API calls.

`GET /api/meta/discovery?...&userId=<victim>` publicly accessible (middleware `/api/meta` ko protect karta hai **sirf production me** — point 4 dekho). RLS sirf tab kaam karegi jab query *authenticated* user ki ho; yahan `userId` explicitly override kiya gaya hai.

**Fix:** is route me bhi `getCurrentUser()` call karein aur sirf `getUserInstagramCredentials(user.id)` use karein. Query/body se `userId` kabhi na lenge.

### 2. Webhook POST — koi signature verification nahi (anyone can inject comments/DMs)
`app/api/meta/webhook/route.ts:43-47`: body directly `request.json()` se liya; `X-Hub-Signature-256` ka koi check nahi. GET handshake verify token se hoti hai (line 13-36), lekin POST bilkul unverified hai.

Koi bhi attacker POST kar sakta hai:
```
{"object":"instagram","entry":[{"changes":[{"field":"comments","value":{"id":"x","text":"LINK","from":{"username":"victim","id":"1"},"media":{"id":"m"}}}]}]}
```
→ route default/env credentials (`getUserInstagramCredentials()` with **no userId**, line 51) se:
- kisi bhi comment pe public reply + DM + like bhej deta hai (`processWebhookComment`, lines 117-134),
- gorup of funnels cross-tenant DB se `.eq("is_active",true)` (line 78-81) = **sabhi users ke funnels** ek saath chalte hain.

**Fix:** Meta `X-Hub-Signature-256` (HMAC-SHA256 with app secret, raw body) verify karein, verify_token seedha hardcoded fallbacks hatayein (`config.webhook.verifyToken` me `|| "viralokit_verify_token"` line 34 config.ts), aur entry ke `id` ko configured account se match karein.

### 3. Env fallback = "single global account" har authenticated user ke liye
`lib/meta/user-account.ts:49-59` aur `67-77`: agar DB me user ka account nahi mila (ya DB error aaya) **aur** `IG_ACCESS_TOKEN` / `FB_PAGE_ACCESS_TOKEN` env me set hain, to har user ko wahi default account + token mil jata hai.

Iska matlab: koi bhi naya signup user `POST /api/meta/publish`, `/api/meta/dm`, `/api/meta/facebook`, `/api/meta/threads` se **owner ke Instagram/Facebook/Threads account** pe post/DM kar sakta hai. Yehi waha "doosre ka ID pe post" ka asli loophole hai jo code me hai.

Specific call sites jo is fallback ko bina user bound kiye use karte hain:
- `app/api/meta/webhook/route.ts:51` → `getUserInstagramCredentials()` (no user)
- `app/api/meta/dm/route.ts:13-14` → `getUserInstagramCredentials(user?.id)` (user null = env fallback)
- `app/api/meta/facebook/route.ts:13-14, 53-54`
- `app/api/meta/threads/route.ts:16-17, 69-70` → `|| config.threads.accessToken` (global token)
- `app/api/meta/growth-funnel/route.ts:60-61`

**Fix:** env fallback sirf explicit `CRON_SECRET`/trusted server context ke liye rakhein. User-facing routes me `if (!user) return 401; if (!credentials) return 403;` karein, env fallback **never**.

### 4. Dev/production auth bypass (`middleware.ts:91-98`)
```ts
if (isApiProtected && !user) {
  if (process.env.NODE_ENV === "production") { return 401 }
}
```
Development/preview deployments me `/api/meta/*` (webhook/docs ke alawa), `/api/cloudinary/*`, `/api/ai/*` bina login ke chalte hain. Individual routes me bhi same pattern: `app/api/meta/dm/route.ts:13-14`, `facebook/route.ts:13-14`, `threads/route.ts:16-17`, `growth-funnel/route.ts:60-61` → `user` null chalne dete hain aur env fallback le lete hain.

**Fix:** `if (!user) return 401` hamesha karein, `NODE_ENV` condition hatayein.

### 5. Cron endpoints unauthenticated when `CRON_SECRET` unset
`app/api/cron/publish/route.ts:12-17` aur `app/api/cron/auto-reply/route.ts:12-18`:
```ts
if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) ...
```
Agar `CRON_SECRET` set nahi (`.env.example` me hai bhi nahi), to **koi bhi** `GET /api/cron/publish` call karke saare users ke scheduled posts foran publish karwa sakta hai (`getUserInstagramCredentials(post.user_id)` line 59) aur `/api/cron/auto-reply` sab accounts pe comments reply kar sakta hai. Ye bhi "doosre ke ID pe post" ka confirmed vector hai.

**Fix:** fail-closed: `if (!process.env.CRON_SECRET || authHeader !== ...) return 401`.

### 6. Cloudinary user-folder client se override — cross-user storage overwrite/delete
`app/api/cloudinary/upload/route.ts:19-21` aur `app/api/cloudinary/cleanup/route.ts:27-29`:
```ts
const customUsername = url.searchParams.get("username") || url.searchParams.get("igUserId");
const userFolderInfo = await getUserCloudinaryFolder(user, customUsername);
```
`getUserCloudinaryFolder` (`lib/cloudinary/user-folder.ts:68-79`) client se aaye username ko **priority** deta hai aur DB me apne account se match nahi karta. Attacker `?username=victim_handle` de kar:
- victim ke `viralokit/users/ig_<victim>/` folder me file upload kar sakta hai,
- `POST /api/cloudinary/cleanup?username=victim_handle` se victim ke saare assets delete kar sakta hai (ownership check `publicId.startsWith(prefix)` usi attacker-chosen prefix se match hoti hai).

**Fix:** `customUsername` parameter hatayein; folder hamesha `user.id` ya authenticated user ke DB account username se derive karein.

---

## 🟠 HIGH

### 7. Webhook cross-tenant funnel processing
`app/api/meta/webhook/route.ts:78-81`: `.from("growth_funnels").select("*").eq("is_active", true)` — koi `.eq("user_id", ...)` filter nahi. Ek user ke comment pe **saare users** ke active funnels trigger hote hain, har funnel apne owner ki credentials se DM/reply bhejta hai. Combined with #2 yaka serious cross-tenant action vector hai.

### 8. Global admin allowlist is dead code (intended protection missing)
`lib/config.ts:65-70` `isAuthorizedUser()` defined hai, lekin `grep` me **kahi use nahi** (app/**/*.ts). `.env.example:18` me `ADMIN_WORKOS_USER_IDS` diya gaya hai — owners ko lagta hai allowlist chal rahi hai jabki koi bhi signed-up user app use kar sakta hai. Security test `tests/security.test.ts:55-59` sirf `assert.ok(true)` hai = false confidence.

### 9. Scheduled-post DELETE ownership ID pe depend (RLS recovery possible but verify karein)
`app/api/meta/scheduled/route.ts:213-220`: pehle `post_media.delete().eq("post_id", postId)` (media table pe user filter nahi), phir `posts.delete().eq("id", postId).eq("user_id", user.id)` (posts table pe filter hai). RLS policies (0000_initial.sql:136-138, 158-164) delete ko `auth.uid() = user_id` tak restrict karti hain **agar migration sach me apply hui ho**. Lekin `executePublishPost` (line 26-29) status update bhi bina user filter ke karta hai — RLS update policy (line 132-134) hi single defense hai. DB me policies missing/old ho to cross-user delete/publish possible.

**Fix:** har query me explicit `.eq("user_id", user.id)` add karein (defense in depth).

---

## 🟡 MEDIUM

### 10. In-memory rate limiter serverless me ineffective
`lib/security/rate-limit.ts:18` `Map` singleton, `middleware.ts:22` isse call karta hai. Vercel serverless me har instance ka alag memory hota hai; distributed attacks har instance pe fresh limit paate hain. IP `x-forwarded-for` se aata hai (getClientIp) — header spoof possible agar proxy sanitize na kare.

### 11. OAuth state CSRF cookie kingdom single global cookie
`app/api/meta/oauth/start/route.ts:43-49` `oauth_state` cookie `path: "/"` set karta hai; callback `app/api/meta/oauth/callback/route.ts:28-31` isse compare karta hai. Multi-account browser me do parallel OAuth flows ek dusre ka state overwrite kar dete hain. State cookie me user ID bind nahi hai (getCurrentUser check hai, lekin cookie doosre user ke flow se overwrite ho sakta hai). Minor, par fix karein: cookie name `oauth_state_<user.id>` ya state signed + user bound.

### 12. Prompt injection filter easily bypassable
`lib/security/sanitize.ts:13-44` blacklist patterns (`ignore previous instructions`, `[INST]`, etc.). Known weak defense; `sanitizePromptInput` AI routes me consistently call bhi nahi hota. LLM features (account-analysis, caption-generator) user text se prompt banate hain. Low direct security impact, note karna zaroori.

### 13. SSRF check DNS rebinding se bypass
`lib/security/sanitize.ts:50-99` hostname string check karta hai, DNS resolve karke IP verify nahi karta. `https://attacker.example` → 127.0.0.1 resolve kar sakta hai (DNS rebinding). Publish route (#50-58) aur upload route (#33-38) isi par depend hain. Production me `fetch` external network pe restricted honi chahiye ya resolved IP validate karna chahiye.

### 14. API error messages information disclosure
Kai routes raw `err.message` return karte hain: `app/api/meta/discovery/route.ts:79`, `growth-funnel/route.ts:54`, `app/api/meta/dm/route.ts:113`, `facebook/route.ts:102`, `threads/route.ts:61`. Meta API errors me token/user ID/URL leak ho sakte hain. `sanitizeErrorMessage` available hai, use karein.

### 15. Weak verification token fallbacks
`lib/config.ts:34`: `META_WEBHOOK_VERIFY_TOKEN` na ho to `"viralokit_verify_token"` default. Webhook GET (line 22-25) to 3 aur hardcoded tokens accept karta hai (`viralokit_webhook_secure`, etc.). Production me fail-closed + single configured token.

### 16. `NEXT_PUBLIC_*` config values client bundle me
`lib/config.ts` me `config.supabase.url`/`anonKey` `NEXT_PUBLIC_` env se aate hain — ye expected hai (anon key public hota hai) lekin App Router me `lib/config.ts` client components me import hone par **poora config object** (jaise `app.url`, `meta.appId`) bundle me aa sakta hai. Secrets (appSecret, encryptionKey, GEMINI_API_KEY) server-only file me move karein.

### 17. Tests false-positive/security theater
`tests/security.test.ts:45-59` RLS test sirf `assert.ok(true)` karta hai, DB query nahi. Server na chalne par tests "skipped/pass" ho jate hain (line 34-37). Real integration tests likhein: user A token se user B ke rows access karne ki koshish, fail honi chahiye.

---

## ✅ Jo theek hai (verified)
- `POST /api/meta/publish` session-bound, body se ID nahi leta.
- `POST /api/meta/delete` session credentials + DB update me `.eq("user_id", user.id)` (lines 25, 55-56, 80-81).
- `GET/DELETE /api/meta/scheduled` list/delete me `.eq("user_id", user.id)` (lines 115, 162, 220).
- OAuth start/callback state cookie compare + user bound token storage (`.eq("user_id", user.id)` lines 153, 167).
- Token encryption AES-256-GCM (`lib/security/encryption.ts`) — sahi.
- RLS policies migrations 0000 me maujood hain (SELECT/INSERT/UPDATE/DELETE on all core tables) — par runtime verify nahi kiya (DB access nahi).
- Security headers HSTS/CSP/X-Frame-Options configured (`next.config.ts`).

## Recommended fix priority
1. #1 discovery userId override hatao
2. #2 webhook HMAC verify + #7 funnel tenant filter
3. #3 env fallback user routes se hatao
4. #4 NODE_ENV bypass + #5 CRON_SECRET fail-closed
5. #6 Cloudinary customUsername hatao
6. #9 explicit user_id filters har query me

## Fixes applied (2026-11-25)

Static source review ke baad ye changes working tree me hain (abhi commit nahi kiye):

1. `/api/meta/discovery`, `/api/meta/dm`, `/api/meta/facebook`, `/api/meta/threads`,
   `/api/meta/growth-funnel` — ab har request session user se bound hai; client se aane wala
   `userId`/custom folder selection hata diya gaya.
2. `getUserInstagramCredentials()` ka global env fallback ab sirf trusted webhook ke liye
   opt-in (`allowEnvironmentFallback: true`) hai; user-facing routes me disabled hai.
3. Webhook GET verify token ab sirf `META_WEBHOOK_VERIFY_TOKEN` se aata hai (hardcoded
   tokens hataaye gaye). POST par `X-Hub-Signature-256` HMAC + constant-time check hai.
4. `/api/cron/publish` aur `/api/cron/auto-reply` me `CRON_SECRET` unset hone par ab 401
   (pehle open tha). Middleware me `NODE_ENV !== production` auth bypass hata diya gaya.
5. Cloudinary folder ab sirf authenticated user ke DB account / email se derive hota hai;
   `?username=` aur `?igUserId=` query parameters ignored hain.
6. Scheduled post cancel aur publish status updates par ownership filters add kiye gaye.
7. Growth funnel queries/inserts/deletes par `user_id` filters; OAuth state user-bound aur
   single-use (cookie clear), Threads token exchange client secret se nahi hota.
8. SSRF check ab DNS-resolved IPs bhi validate karta hai; raw `error.message` responses
   sanitized; `.env.example` me `CRON_SECRET` aur webhook token requirements documented.
9. `tests/security.test.ts` me fake assertions hata kar real unit/integration assertions
   add kiye gaye (401 expectations, SSRF, sanitization, admin fail-closed).

Verification status (2026-11-25, Instabox par clean copy se):
- `git diff --check`: clean
- `npm run lint` (= `tsc --noEmit`): pass (exit 0)
- `npx tsx tests/security.test.ts`: 17/17 pass, 0 fail
- `npm run build`: pass (exit 0)
- Local server (dummy Supabase URL/key ke saath) HTTP smoke:
  `/api/meta/account`, `/api/meta/discovery`, `/api/meta/dm`,
  `/api/cloudinary/storage`, `/api/ai/analyze-image`, `/api/cron/publish` → 401;
  `/api/meta/webhook` GET → 403 (verify token unset), POST bad signature → 401.
Live deployed instance aur real Supabase DB ke against abhi test nahi kiya gaya.

## Database migration
`supabase/migrations/0005_security_hardening.sql` add kiya gaya:
- `growth_funnels.user_id` ka NULL backfill (related Instagram account se) + orphan rows
  delete + column ko `NOT NULL` (Nullable owner RLS se bachne ke liye).
- Sab tables par RLS enable (idempotent).
- `auto_replies` aur `funnel_logs` me owner-scoped UPDATE/DELETE/INSERT policies.
- Migration `libpg-query` se parsed: **22 statements, PARSE_OK**. Real DB par apply nahi hua.

Audit date: 2026-11-24. Live instance/DB ke against test nahi kiya gaya — findings static evidence par based hain.
