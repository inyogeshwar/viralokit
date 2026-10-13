# 🚀 ViraloKit — Professional Instagram Creator Studio & Publishing Platform

[![Production](https://img.shields.io/badge/Live-https%3A%2F%2Fviralokit.vercel.app-pink?style=for-the-badge&logo=vercel)](https://viralokit.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.1_(App_Router)-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Meta Graph API](https://img.shields.io/badge/Meta_API-v23.0_(Official)-blue?style=for-the-badge&logo=meta)](https://developers.facebook.com)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_&_Postgres_RLS-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-25GB_Isolated_CDN-3448C5?style=for-the-badge&logo=cloudinary)](https://cloudinary.com)
[![AI Engine](https://img.shields.io/badge/AI-Gemini_1.5_Flash_+_OpenRouter-FF6B6B?style=for-the-badge&logo=google)](https://aistudio.google.com)

> **ViraloKit** is a modern, high-performance Instagram Creator Studio engineered with **Next.js 15 (App Router)**, official **Meta Graph API v23.0 & Instagram Business Login**, **Supabase PostgreSQL (Row-Level Security)**, **Cloudinary 25 GB Isolated Media Cloud**, and **Multimodal AI Engine (Google Gemini 1.5 Flash + OpenRouter)**.

---

## 🌐 Live Production URL
**[https://viralokit.vercel.app](https://viralokit.vercel.app)**

---

## 📖 Complete Setup & Architecture Guide
For a zero-to-hero step-by-step setup guide covering Meta Developer App configuration, Instagram Business Login, Supabase database schemas, and Vercel production deployment:
👉 **[Read the Complete Setup Guide](docs/VIRALOKIT_COMPLETE_SETUP_GUIDE.md)**

---

## ⚡ Production Tech Stack

Every component of ViraloKit is optimized for performance, security, and generous free-tier operation:

| Component | Technology | Capabilities |
|---|---|---|
| **Frontend & API** | Next.js 15 (App Router) on Vercel | Modern React 19 Server Components, Edge Middleware, Route Handlers |
| **Authentication** | Supabase Auth | Email Magic Links, Passwords, Session Management, CSRF Protected |
| **Database** | Supabase PostgreSQL | Encrypted Instagram access tokens, Scheduled posts, Auto-replies with RLS |
| **Media Hosting & CDN** | Cloudinary (25 GB Free Quota) | Isolated creator folders (`viralokit/users/ig_{username}`), instant 1-click purge |
| **Instagram Platform** | Meta Graph API (`v23.0`) | Official Instagram Business Login, Carousel publishing (2–10 slides), Verified Insights |
| **Multimodal AI Engine** | Google Gemini 1.5 Flash + OpenRouter | Visual style/mood image analysis, multi-tone caption generator, dynamic model routing |
| **Security Scanning** | GitGuardian (`ggshield`) | Automated pre-commit secret prevention & zero credential leakage policy |

---

## ✨ Core Features & Highlights

### 1. 📸 High-Speed Instagram Publishing Studio
* **Single Image & Carousel Albums (2–10 Slides)**:
  * **Client-Side Image Optimization**: High-resolution photos are pre-optimized via HTML5 Canvas to 1080px to bypass Vercel serverless body limits.
  * **Parallel Container Generation**: Meta child containers are provisioned simultaneously with `Promise.all`, cutting upload wait times from ~20s to ~4s.
  * **Form-Urlencoded Payload**: Safe `application/x-www-form-urlencoded` payloads supporting full 2,200-character captions, emojis, and hashtags without URL truncation.
* **Live Instagram Mobile Preview**:
  * Real-time device frame supporting `1:1 Square`, `4:5 Portrait`, and `9:16 Story` aspect ratios.
  * Interactive slide carousel with indicator dots, counter pill (`1/4`), like counter, and simulated comments.

### 2. 🤖 Multimodal AI Caption & Visual Intelligence
* **Multimodal Visual Analysis**:
  * Extracts subject, aesthetic scene, mood, lighting, color palette, and composition directly from uploaded imagery.
* **Smart Caption & Hashtag Generator**:
  * **8 Tone Modes**: `Creator`, `Aesthetic`, `Minimal`, `Casual`, `Professional`, `Hinglish`, `Hindi`, `English`.
  * **Quick Modifiers**: `Generate with AI`, `Shorten`, `Improve`, `Add CTA`, `AI Hashtags`.
  * **Bulletproof JSON Sanitizer**: Multi-tier AST parser ensuring raw JSON strings never appear in final post captions.
* **AI Account Growth Audit**:
  * Multilingual account analysis delivering customized growth strategies and post timing recommendations based on real account metrics.

### 3. 📊 Verified Meta Insights (Zero Dummy Data)
* **Official Graph API Metrics**:
  * Follower count, Media count, 28-day Reach, Impressions, Profile Views, and Total Interactions.
  * Top-performing posts leaderboard dynamically ranked by engagement volume and comments.
* **Absolute Transparency**:
  * If a metric is restricted by Meta permissions, displays `—` instead of generating fabricated numbers.

### 4. 🗄️ Isolated 25 GB Cloudinary Storage & Auto-Cleanup
* **Per-User Directory Isolation**:
  * Every creator receives a segregated folder under `viralokit/users/ig_{username}/`.
* **Zero-Quota Anxiety**:
  * Once Meta publishes media, Instagram caches the assets on its own CDN servers. Creators can purge uploaded files from Cloudinary with 1 click to keep their 25 GB free quota empty permanently.

---

## 🛠️ Environment Variables Configuration

Create a `.env.local` file in your project root or configure these variables in Vercel:

```env
# Application URLs
NEXT_PUBLIC_APP_URL="https://viralokit.vercel.app"
ALLOWED_ORIGIN="https://viralokit.vercel.app"

# Supabase Backend
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key_here"

# Meta / Instagram Graph API v23.0
META_APP_ID="your_meta_app_id"
META_APP_SECRET="your_meta_app_secret"
INSTAGRAM_APP_ID="your_instagram_app_id"
INSTAGRAM_APP_SECRET="your_instagram_app_secret"
META_GRAPH_API_VERSION="v23.0"

# Optional Default Fallback Account
IG_USER_ID="your_instagram_user_id"
IG_ACCESS_TOKEN=""

# Cloudinary Media CDN (25 GB Free Storage)
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"

# Multimodal AI Engine
GEMINI_API_KEY="your_gemini_api_key"
OPENROUTER_API_KEY="your_openrouter_api_key"

# AES-256 Token Encryption Key (32 bytes hex)
ENCRYPTION_KEY="your_32_byte_hex_encryption_key"
```

---

## 💻 Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/inyogeshwar/viralokit.git
cd viralokit

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local

# 4. Start local development server
npm run dev

# 5. Open in browser
http://localhost:3000
```

---

## 📁 Repository Directory Structure

```text
viralokit/
├── app/
│   ├── ai-analysis/                 # Strategic AI Account Growth Audit Page
│   ├── analytics/                   # Official Meta Insights Dashboard
│   ├── api/
│   │   ├── ai/                      # Caption, Image Analysis & Model Routing
│   │   ├── auth/                    # Supabase Authentication Endpoints
│   │   ├── cloudinary/              # Media upload & user directory cleanup
│   │   ├── cron/                    # Scheduled post publisher & auto-replies
│   │   └── meta/                    # Meta OAuth, handshake, publishing & deletion
│   ├── create/                      # Post Studio with live preview & carousel builder
│   ├── dashboard/                   # Main overview & quick actions
│   ├── data-deletion/               # Meta-compliant user data deletion instructions
│   ├── login/                       # Supabase Glassmorphism login & signup
│   ├── posts/                       # Post manager & bulk actions
│   ├── privacy/ & terms/            # Meta-compliant legal pages
│   └── settings/                    # Connected account & Cloudinary storage manager
├── components/
│   ├── instagram/                   # Live interactive Instagram preview
│   ├── layout/                      # Header, Sidebar, and MobileNav
│   ├── settings/                    # Cloudinary isolated storage manager
│   └── ui/                          # Tailwind Glassmorphism UI primitives
├── docs/
│   └── VIRALOKIT_COMPLETE_SETUP_GUIDE.md  # Comprehensive zero-to-hero guide
├── lib/
│   ├── ai/                          # Gemini & OpenRouter multimodal wrappers
│   ├── cloudinary/                  # Isolated user folder paths & upload handlers
│   ├── meta/                        # Meta Graph API v23.0 client & publishing
│   ├── security/                    # AES-256 token encryption & sanitizers
│   └── supabase/                    # Supabase SSR browser & server clients
├── supabase/
│   ├── migrations/                  # PostgreSQL schema definitions with RLS
│   └── config.toml                  # Remote Supabase config & allowed redirect URLs
├── next.config.ts                   # Strict Content-Security-Policy & CORS headers
└── package.json                     # ViraloKit package dependencies & scripts
```

---

## 🔒 Security & Best Practices

* **Server-Side Token Isolation**: All Meta access tokens, Cloudinary secrets, and encryption keys are processed strictly in server Route Handlers and never transmitted to client bundles.
* **Database Token Encryption**: Stored Instagram access tokens in Supabase are encrypted using AES-256-GCM.
* **Row-Level Security (RLS)**: PostgreSQL tables enforce database-level policies so users can strictly access only their own records.
* **Payload Sanitation**: Client-side canvas compression prevents HTTP 413 payload rejections on Vercel's 4.5MB Serverless limit.
* **GitGuardian Cleanliness**: The repository is verified clean with `ggshield` secret scanning before all commits.

---

## 📜 License
MIT License. Crafted with ❤️ for creators, social media managers, and developers.
