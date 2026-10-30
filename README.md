# 🚀 ViraloKit — Professional Social Growth & Creator Studio Suite

[![Production](https://img.shields.io/badge/Live-https%3A%2F%2Fviralokit.vercel.app-pink?style=for-the-badge&logo=vercel)](https://viralokit.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.1_(App_Router)-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Meta Graph API](https://img.shields.io/badge/Meta_API-v23.0_(Official)-blue?style=for-the-badge&logo=meta)](https://developers.facebook.com)
[![Threads API](https://img.shields.io/badge/Threads_API-Official-black?style=for-the-badge&logo=threads)](https://developers.facebook.com/docs/threads)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_&_Postgres_RLS-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-25GB_Isolated_CDN-3448C5?style=for-the-badge&logo=cloudinary)](https://cloudinary.com)
[![AI Engine](https://img.shields.io/badge/AI-Gemini_1.5_Flash_+_OpenRouter-FF6B6B?style=for-the-badge&logo=google)](https://aistudio.google.com)

> **ViraloKit** is an enterprise-grade social media growth and automation platform designed specifically for **smartphone creators and digital entrepreneurs**. Engineered with **Next.js 15 (App Router)**, official **Meta Graph API v23.0**, **Threads API**, **Supabase PostgreSQL**, **Cloudinary 25 GB Isolated Media Cloud**, and **Google Gemini Multimodal AI Engine**.
> 
> Works 100% in your mobile browser with **zero running PC or laptop required**.

---

## 🌐 Live Production URL
**[https://viralokit.vercel.app](https://viralokit.vercel.app)**

---

## 📱 Mobile-First Social Automation Highlights

### 1. ⚡ Follow-to-Unlock Comment Growth Funnels (ManyChat / Superprofile Killer)
* **Keyword Detection**: Automatically scans incoming comments for triggers (e.g., `LINK`, `GUIDE`, `PDF`, `PRICE`).
* **The Follow Gate**: Automatically queries Meta Graph API to verify if the commenter follows your account.
  * **If Following**: Delivers unlocked resource link, PDF, or voice note directly in DM + sends public reply + auto-likes comment.
  * **If Not Following**: Sends friendly follow-gate prompt in DM: *"Hey! Follow @account first to unlock this exclusive resource! Once followed, reply DONE here 🎁"*
* **24/7 Cloud Execution**: Configured with Meta Webhooks (`/api/meta/webhook`). Runs on Vercel serverless in <500ms even when your phone is locked or your laptop is turned off!

### 2. 💬 Instagram Direct Messaging Studio
* **Voice Notes & Audio**: Deliver `.m4a` / `.wav` voice messages directly into Instagram DM conversation bubbles.
* **Document & File Attachments**: Deliver PDFs, guides, and ebooks directly through the chat composer.
* **Double-Tap Emoji Reactions**: React with `❤️`, `🔥`, `👍` or unreact to any message.
* **Threaded Quoted Replies**: Reply directly to specific message bubbles with visual quotes (`reply_to`).
* **Sender Actions**: Trigger live typing indicators (`typing_on`) and mark conversations as seen (`mark_seen`).

### 3. 🌐 Cross-Platform Channels (Threads & Facebook Pages)
* **Official Threads API**:
  * Publish posts (up to 500 characters) with optional image or video attachments.
  * Reply to threads directly from your mobile browser.
  * Live feed and engagement metrics (views, likes, replies, reposts, quotes).
  * Built-in **60-Day Threads Token Exchanger Tool**.
* **Facebook Page Studio**:
  * Publish text status updates with link attachments.
  * Publish high-definition photos with captions.
  * Stream recent Page posts and follower stats.

### 4. 📸 High-Speed Instagram Publishing Studio
* **Single Image & Carousel Albums (2–10 Slides)**:
  * Client-side Canvas image optimization to bypass serverless payload limits.
  * Parallel child container provisioning with `Promise.all` (sub-4s publish speed).
  * Live interactive mobile Instagram preview supporting `1:1 Square`, `4:5 Portrait`, and `9:16 Story`.

### 5. 🤖 Multimodal AI Caption Engine & Growth Audit
* **Visual Style Extraction**: Detects subject, lighting, mood, color palette, and composition directly from images.
* **8 Dynamic Tones**: `Creator`, `Aesthetic`, `Minimal`, `Casual`, `Professional`, `Hinglish`, `Hindi`, `English`.
* **Bring Your Own Key (BYOK)**: Use your free personal Google Gemini API key with zero billing required.

---

## ⚡ Production Tech Stack

| Component | Technology | Capabilities |
|---|---|---|
| **Frontend & API** | Next.js 15 (App Router) on Vercel | Modern React 19 Server Components, Edge Middleware, Route Handlers |
| **Authentication** | Supabase Auth | Email Magic Links, Passwords, Session Management, CSRF Protected |
| **Database** | Supabase PostgreSQL | Encrypted tokens, Growth funnels, Scheduled posts, Auto-replies with RLS |
| **Webhooks** | Meta Webhooks (`v23.0`) | 24/7 real-time event listener for comments and direct messages |
| **Direct Messaging** | Instagram Messaging API | Voice notes (.m4a/.wav), PDFs, double-tap reactions, quoted replies |
| **Cross-Platform** | Threads API & Facebook Graph API | Status updates, photo posts, threads composer, 60-day token exchanger |
| **Media Hosting** | Cloudinary (25 GB Free Quota) | Isolated creator folders (`viralokit/users/ig_{username}`), instant 1-click purge |
| **AI Engine** | Google Gemini 1.5/2.0 Flash + OpenRouter | Multimodal visual inspection, niche-tailored captions, growth audit |

---

## 🛠️ Environment Variables Configuration

Create a `.env.local` file or configure these variables in Vercel:

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
META_GRAPH_API_VERSION="v23.0"

# Instagram & Facebook Automation Suite
FB_PAGE_ID="your_facebook_page_id"
FB_PAGE_ACCESS_TOKEN="your_facebook_page_access_token"
INSTAGRAM_ID="your_instagram_user_id"
INSTAGRAM_USERNAME="your_instagram_handle"
META_WEBHOOK_VERIFY_TOKEN="viralokit_webhook_secure"

# Threads API Automation
THREADS_USER_ID="your_threads_account_id"
THREADS_ACCESS_TOKEN="your_threads_access_token"
THREADS_APP_SECRET="your_threads_app_secret"

# Cloudinary Media CDN (25 GB Free Storage)
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"

# Multimodal AI Engine (Google Gemini Free Tier)
GEMINI_API_KEY="your_gemini_api_key"

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

# 5. Open in browser (or on smartphone via local network IP)
http://localhost:3000
```

---

## 🔒 Security & Zero Credential Leakage Policy

* **No Hardcoded Tokens**: Zero tokens, passwords, or Page IDs are stored in git repositories.
* **Token Encryption**: Stored tokens in Supabase PostgreSQL are encrypted using AES-256-GCM.
* **Row-Level Security (RLS)**: PostgreSQL tables enforce database-level policies ensuring users only access their own records.
* **Server-Side Token Isolation**: All Meta Graph API and Threads requests run exclusively on secure serverless route handlers.

---

## 📜 License
MIT License. Crafted with ❤️ for creators, developers, and social media managers by [Yogeshwar Kumar](https://github.com/inyogeshwar).
