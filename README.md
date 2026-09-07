# PostGram (ViraloKit) — Instagram Publishing & Creator Studio 🚀

[![Production](https://img.shields.io/badge/Live-https%3A%2F%2Fviralokit.vercel.app-pink?style=for-the-badge&logo=vercel)](https://viralokit.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.5_(App_Router)-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Meta Graph API](https://img.shields.io/badge/Meta_API-v23.0_(Official)-blue?style=for-the-badge&logo=meta)](https://developers.facebook.com)
[![WorkOS AuthKit](https://img.shields.io/badge/WorkOS-AuthKit-6366F1?style=for-the-badge)](https://workos.com)
[![Neon](https://img.shields.io/badge/Neon-Serverless_Postgres-00E599?style=for-the-badge&logo=postgresql)](https://neon.tech)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media_CDN-3448C5?style=for-the-badge&logo=cloudinary)](https://cloudinary.com)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-Dynamic_FREE_Model_Routing-FF6B6B?style=for-the-badge)](https://openrouter.ai)

> A modern, free-tier optimized production Instagram Creator Studio built with **Next.js 15 (App Router)**, official **Meta Graph API v23.0**, **WorkOS AuthKit**, **Neon PostgreSQL**, **Cloudinary CDN**, and **OpenRouter Dynamic Free Model Routing** (with Gemini Flash fallback).

---

## 🌐 Live Production URL
**[https://viralokit.vercel.app](https://viralokit.vercel.app)**

---

## ⚡ Free-Tier Optimized Production Stack

Every component of PostGram is engineered to run on generous, verified free tiers with zero paid subscriptions required:

| Component | Provider | Tier & Capabilities |
|---|---|---|
| **Frontend & API** | Next.js 15 on Vercel | Free Hobby Tier Serverless Edge with Fluid Compute |
| **Authentication** | WorkOS AuthKit | Free up to 1,000,000 MAUs (Hosted UI, Google OAuth, Sessions) |
| **Database** | Neon PostgreSQL | 0.5 GiB free serverless Postgres + Drizzle ORM |
| **Media Hosting & CDN** | Cloudinary | 25 monthly free credits (Signed image uploads & CDN distribution) |
| **Instagram Platform** | Meta Graph API (`v23.0`) | Official Instagram Content Publishing & Insights API |
| **AI Text & Vision** | OpenRouter Dynamic FREE Models | Live discovery of active models with prompt/completion = 0 |
| **AI Fallback** | Google Gemini API | Free Tier Gemini 1.5 Flash for vision and multilingual generation |

---

## ✨ Core Features & Architecture

### 1. 📸 Advanced Instagram Publishing Studio
* **Single Image Publishing**:
  * One-click container generation, automated status polling (`waitForContainer`), and instant live publishing.
* **Multi-Slide Carousel Posts (2–10 Slides)**:
  * **Client-Side Image Optimization**: Large photos (>1920px or >1.2MB) are automatically downscaled via Canvas to prevent Vercel's 4.5MB Serverless request body limit.
  * **Sequential Chunk Uploads**: Slides are uploaded individually to Cloudinary with real-time UI progress (`Uploading slide 1 of N...`).
  * **High-Speed Parallel Meta Containers**: Child item containers are created and polled simultaneously (`Promise.all`), cutting publishing time from ~20s down to ~4s.
  * **Form-Urlencoded Payload**: Meta API requests use standard `application/x-www-form-urlencoded` bodies to support full 2,200-character captions, emojis, and hashtags without query length limitations.
* **Live Instagram Mobile Preview**:
  * Accurate real-time rendering supporting `1:1 Square`, `4:5 Portrait`, and `9:16 Story` aspect ratios.
  * Interactive slide carousel with indicator dots, counter pill (`1/4`), like counter, and comment simulations.

### 2. 🤖 Bulletproof Multimodal AI Engine
* **Dynamic OpenRouter Model Discovery**:
  * Queries `https://openrouter.ai/api/v1/models` in real time, automatically filtering 100% free models.
  * Categorizes models into Vision/Multimodal (`input_modalities.includes("image")`) and Text generation.
* **Deep Visual Image Analysis**:
  * Extracts Subject, Scene, Mood, Style, Color Palette, and Keywords directly from uploaded images.
* **Smart Caption & Hashtag Generator**:
  * **8 Tone Modes**: `Creator`, `Aesthetic`, `Minimal`, `Casual`, `Professional`, `Hinglish`, `Hindi`, `English`.
  * **Quick Modifiers**: `Generate with AI`, `Shorten`, `Improve`, `Add CTA`, `AI Hashtags`.
  * **Bulletproof JSON Sanitizer**: Uses multi-tier regex and ast decoding to guarantee captions never display raw JSON formatting (`{"caption": ...}`) even if free models return truncated tokens or unescaped newlines.
* **Strategic Account Performance Audit**:
  * Multilingual AI audit that analyzes real account metrics, engagement trends, and top posts to deliver actionable growth proposals in your preferred language (Hinglish, Hindi, English, etc.).

### 3. 📊 100% Real Meta Analytics (Zero Dummy Data)
* **Official Graph API Metrics**:
  * Follower Count, Media Count, Impressions, 28-day Reach, Profile Views, Total Interactions.
  * Top-performing posts leaderboard computed dynamically from live media comments, likes, and engagement volume.
* **Absolute Transparency Policy**:
  * If a metric is unsupported or restricted by Meta's API permissions, the system displays `—` or `Not available` instead of fabricating fake numbers.

### 4. 🗑️ Meta-Compliant Post Management & Deletion
* **Grid & List Views**: Filter and inspect published content with thumbnail previews, permalinks, and publication timestamps.
* **Bulk Post Selection**: Floating bottom control bar with multi-selection and select-all capabilities.
* **Paced Meta Deletion Protocol**:
  * Deletions respect Meta rate-limiting with sequential pacing.
  * Transparent error reporting showing per-post results (`✓ Deleted` or `✕ Failed: [Meta API reason]`).

---

## 🛠️ Environment Variables Configuration

Create a `.env.local` file in your project root or add these variables to your Vercel Project Settings:

```env
# ==========================================
# 🌐 APPLICATION URL
# ==========================================
NEXT_PUBLIC_APP_URL=https://viralokit.vercel.app

# ==========================================
# 📷 META GRAPH API (INSTAGRAM PROFESSIONAL)
# ==========================================
META_GRAPH_API_VERSION=v23.0
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
IG_USER_ID=your_instagram_user_id
IG_ACCESS_TOKEN=your_long_lived_user_access_token

# ==========================================
# 🔐 WORKOS AUTHKIT (https://workos.com)
# ==========================================
WORKOS_API_KEY=sk_live_...
WORKOS_CLIENT_ID=client_...
WORKOS_COOKIE_PASSWORD=your_secure_32_character_password

# ==========================================
# 🗄️ NEON POSTGRESQL (https://neon.tech)
# ==========================================
DATABASE_URL=postgresql://neondb_owner:...@ep-example.us-east-2.aws.neon.tech/neondb?sslmode=require

# ==========================================
# ☁️ CLOUDINARY CDN (https://cloudinary.com)
# ==========================================
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ==========================================
# 🧠 AI ENGINE (OpenRouter & Gemini)
# ==========================================
OPENROUTER_API_KEY=sk-or-v1-...
GEMINI_API_KEY=AIzaSy...
```

---

## 📱 Meta Graph API (Instagram) Setup Guide

To publish posts and fetch analytics for your Instagram account:

1. **Connect Instagram to a Facebook Page**:
   * Switch your Instagram account to a **Professional / Creator / Business Account**.
   * Open Facebook Page Settings ➔ **Linked Accounts** ➔ Connect your Instagram account.
2. **Create a Meta Developer App**:
   * Go to [developers.facebook.com](https://developers.facebook.com).
   * Create an app with type **Business** (e.g. `ViraloKit`).
   * Add the **Instagram Graph API** product.
3. **Required Permissions**:
   * `instagram_basic`
   * `instagram_content_publish`
   * `instagram_manage_insights`
   * `pages_show_list`
   * `pages_read_engagement`
   * `public_profile`
4. **Find Your `IG_USER_ID`**:
   * In Graph API Explorer, run `GET /v23.0/me/accounts?fields=instagram_business_account{id,username,name}`.
   * Copy the `instagram_business_account.id` (e.g. `17841400000000000`).
5. **Generate 60-Day Long-Lived Token (`IG_ACCESS_TOKEN`)**:
   * Generate a User Token in the Explorer.
   * Exchange it for a long-lived token via:
     ```bash
     curl -i -X GET "https://graph.facebook.com/v23.0/oauth/access_token?grant_type=fb_exchange_token&client_id={app-id}&client_secret={app-secret}&fb_exchange_token={short-lived-token}"
     ```

---

## 🔐 WorkOS AuthKit Setup Guide

1. Go to [dashboard.workos.com](https://dashboard.workos.com) and create an environment.
2. In **Redirects**, add:
   * `http://localhost:3000/callback` (for local development)
   * `https://viralokit.vercel.app/callback` (for production)
3. Set default sign-out redirect to `https://viralokit.vercel.app`.
4. Copy `Client ID` and `API Key` into your environment variables.

---

## 💻 Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/your-repo/postgram.git
cd postgram

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# (Fill in .env.local with credentials)

# 4. Run database migrations (optional for Neon)
npx drizzle-kit push

# 5. Start development server
npm run dev

# 6. Open in browser
http://localhost:3000
```

---

## 🚀 Deployment to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy directly to production
vercel --prod
```

Or connect the repository to the [Vercel Dashboard](https://vercel.com) and add the environment variables listed above.

---

## 📁 Repository Structure

```text
d:/PostGram/
├── app/
│   ├── api/
│   │   ├── ai/
│   │   │   ├── account-analysis/    # Strategic multilingual AI audit
│   │   │   ├── analyze-image/       # Multimodal visual analysis
│   │   │   ├── generate-caption/    # Smart caption & hashtag generator
│   │   │   └── models/              # Live OpenRouter dynamic free models
│   │   ├── auth/                    # WorkOS login, logout, & current-user state
│   │   ├── cloudinary/upload/       # Single-file signed asset upload
│   │   └── meta/
│   │       ├── account/             # Handshake & profile info
│   │       ├── analytics/           # 100% verified Meta insights & leaderboard
│   │       ├── delete/              # Paced Meta container deletion
│   │       ├── posts/               # Feed media listing
│   │       ├── publish/             # Single & Carousel container publishing
│   │       └── refresh-token/       # Long-lived token refresher
│   ├── ai-analysis/                 # Strategic AI Account Audit Page
│   ├── analytics/                   # Official Meta Insights Dashboard
│   ├── callback/                    # WorkOS AuthKit redirect handler
│   ├── create/                      # Post Studio with live preview
│   ├── dashboard/                   # Main overview & quick actions
│   ├── posts/                       # Post manager & bulk actions
│   ├── settings/                    # Connected account & preferences
│   ├── layout.tsx                   # App Root layout
│   └── page.tsx                     # Landing page
├── components/
│   ├── instagram/
│   │   └── post-preview.tsx         # Live interactive Instagram device preview
│   ├── layout/                      # Sidebar, MobileNav, and Header
│   └── ui/                          # Tailwind UI primitives (Button, Card, Badge)
├── db/
│   ├── index.ts                     # Neon PostgreSQL client
│   └── schema.ts                    # Drizzle ORM tables (posts, media, ai_generations)
├── lib/
│   ├── ai/
│   │   ├── caption-generator.ts     # Caption generator & robust JSON parser
│   │   ├── gemini.ts                # Gemini Free Tier fallback
│   │   ├── image-analysis.ts        # Multimodal vision prompts
│   │   └── openrouter.ts            # Dynamic model discovery & completions
│   ├── auth/                        # WorkOS session helpers & middleware
│   ├── cloudinary/                  # Cloudinary image upload utility
│   ├── meta/
│   │   ├── insights.ts              # Meta Graph API analytics queries
│   │   └── publishing.ts            # High-speed parallel Carousel & Single Image publishing
│   └── config.ts                    # Centralized environment validator
├── middleware.ts                    # WorkOS AuthKit route protection
└── package.json
```

---

## 🔒 Security & Best Practices

* **Server-Side Token Isolation**: `IG_ACCESS_TOKEN`, `META_APP_SECRET`, `CLOUDINARY_API_SECRET`, and `WORKOS_API_KEY` are executed strictly inside Next.js Route Handlers and never leaked to client bundles.
* **Payload Sanitation**: Client-side canvas compression prevents HTTP 413 payload rejections on Vercel's 4.5MB Serverless limit.
* **Rate-Limit Guardrails**: Bulk actions and container status polling implement exponential backoff and delay pacing to respect Meta Graph API threshold limits.

---

## 📜 License
MIT License. Crafted with ❤️ for creators and social media teams.
