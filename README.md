# PostGram — Instagram Publishing & Analytics Studio

A focused, production-ready Instagram creator web application built with **Next.js App Router**, **Meta Graph API v23.0**, **WorkOS AuthKit**, **Neon PostgreSQL**, **Cloudinary**, and **dynamic OpenRouter FREE AI models** (with Gemini Free Tier fallback).

---

## ⚡ Zero-Cost / Free-Tier Production Architecture

PostGram is engineered to run seamlessly across verified free tiers with zero paid subscriptions required:

| Component | Provider | Free Tier Specification |
|---|---|---|
| **Frontend & Backend** | Next.js 15 (App Router) on Vercel | Hobby Tier Serverless Edge |
| **Authentication** | WorkOS AuthKit | Up to 1,000,000 MAUs free (Hosted UI, social login, sessions) |
| **Database** | Neon Serverless PostgreSQL | 0.5 GiB free serverless Postgres with Drizzle ORM |
| **Image Hosting & CDN** | Cloudinary | 25 monthly free credits (Signed server uploads & delivery) |
| **Instagram Platform** | Meta Graph API (`v23.0`) | Official Instagram Content Publishing & Insights API |
| **Primary AI Engine** | OpenRouter Dynamic FREE Models | Real-time discovery of models with prompt/completion = 0 |
| **Multimodal AI Fallback** | Google Gemini API | Free Tier Gemini Flash for vision & captioning |

---

## 🚀 Key Features

1. **Instagram Single Image & Carousel Posts**:
   - Single image container publishing with automatic status polling.
   - 2 to 10 image carousel albums with drag-and-drop reordering, slide counter, and aspect ratio validation.
   - Live pixel-perfect Instagram feed preview with slide arrows, swipe dots, and hashtag highlighting.
2. **Post Management & Deletion**:
   - Grid and List views of published media.
   - Multi-select system with floating bulk action bar.
   - Single and pace-controlled bulk deletion with live per-post results (`✓ Deleted`, `✕ Failed: [Reason]`).
   - Zero fake deletions: only marks an item deleted after actual Meta API HTTP confirmation.
3. **Official Meta Analytics**:
   - Account overview: Followers, Following, Published Media, 28-day Reach, Impressions, Total Interactions, Profile Views.
   - Best-performing posts leaderboard ranked by verified engagement volume.
   - Absolute zero-fabrication policy: missing or unsupported metrics display "—" or "Not available".
4. **Dynamic AI Engine**:
   - Live fetching from `https://openrouter.ai/api/v1/models` filtered by free pricing.
   - Automatic separation between Text models and Vision models (`input_modalities.includes("image")`).
   - `openrouter/free` auto-routing mode.
   - Deep multimodal image analysis: Subject, Scene, Mood, Style, Colors, Keywords, Alt text.
   - Caption generator with 8 tone options (Creator, Aesthetic, Minimal, Casual, Professional, Hinglish, Hindi, English) and quick modifiers (Shorten, Improve, Add CTA, Add Hashtags).
   - AI Account Performance Audit combining real Meta analytics + recent posts + images into strategic content proposals.
5. **Security & Tokens**:
   - Server-side only token usage (`IG_ACCESS_TOKEN`, `CLOUDINARY_API_SECRET`, `WORKOS_API_KEY`, etc.).
   - Access tokens are never transmitted to client JavaScript.
   - Strict Zod validation on all API endpoints.

---

## 🛠️ Environment Variables Setup

Copy `.env.example` to `.env.local` and configure your credentials:

```bash
cp .env.example .env.local
```

```env
# Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Meta Graph API (Instagram Professional Account)
META_GRAPH_API_VERSION=v23.0
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
IG_USER_ID=your_instagram_user_id
IG_ACCESS_TOKEN=your_instagram_access_token

# WorkOS AuthKit (https://workos.com)
WORKOS_API_KEY=your_workos_api_key
WORKOS_CLIENT_ID=your_workos_client_id
WORKOS_COOKIE_PASSWORD=your_cookie_password_minimum_32_characters

# Neon PostgreSQL (https://neon.tech)
DATABASE_URL=postgresql://user:password@ep-example-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require

# Cloudinary (https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Providers
OPENROUTER_API_KEY=your_openrouter_api_key
GEMINI_API_KEY=your_gemini_api_key
```

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
http://localhost:3000
```

---

## 📂 Project Structure

```text
d:/PostGram/
├── app/
│   ├── api/
│   │   ├── ai/                # Dynamic models, vision analysis, caption generation, account audit
│   │   ├── auth/              # User profile & session state
│   │   ├── cloudinary/        # Signed image upload
│   │   └── meta/              # Account handshake, posts listing, publish, delete, analytics
│   ├── callback/              # WorkOS AuthKit redirect callback
│   ├── dashboard/             # Creator home dashboard
│   ├── create/                # Post creation studio & live preview
│   ├── posts/                 # Grid/list post manager with bulk deletion
│   ├── analytics/             # Official Meta performance metrics & leaderboard
│   ├── ai-analysis/           # AI strategic account audit
│   ├── settings/              # Connected account & AI preferences
│   ├── globals.css            # Instagram aesthetic design tokens
│   ├── layout.tsx             # Root layout with QueryClient & Toaster
│   └── page.tsx               # Product landing page
├── components/
│   ├── instagram/             # Live preview card & capability badges
│   ├── layout/                # Sidebar, mobile nav, and header
│   └── ui/                    # Button, Badge, Card components
├── db/
│   ├── index.ts               # Neon serverless client with resilient dev fallback
│   └── schema.ts              # Drizzle ORM schema
├── lib/
│   ├── ai/                    # OpenRouter dynamic free engine & Gemini fallback
│   ├── auth/                  # WorkOS AuthKit session helpers
│   ├── cloudinary/            # Cloudinary upload & asset management
│   ├── meta/                  # Official Meta container publishing, deletion, & insights
│   ├── config.ts              # Centralized configuration (v23.0)
│   └── utils.ts               # Classnames, formatters
├── middleware.ts              # WorkOS AuthKit route protection
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind design tokens
└── tsconfig.json              # Strict TypeScript configuration
```
