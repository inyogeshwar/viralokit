# 🚀 ViraloKit — Complete Zero-to-Hero Setup & Architecture Guide
> **Language:** Hinglish (Hindi + English) | **Target Audience:** Non-Coders, Creators, & Developers  
> **Platform Version:** Meta Graph API v23.0 & Instagram Business Login | Next.js 15 App Router | Supabase

---

## 📌 Index / Table of Contents
1. [ViraloKit Kya Hai? (System Architecture Overview)](#1-viralokit-kya-hai)
2. [Prerequisites (Setup Karne Se Pehle Kya Chahiye)](#2-prerequisites)
3. [Step 1: Meta for Developers App Setup (Zero Se Hero)](#step-1-meta-for-developers-app-setup)
   - 1.1 Meta Developer Account aur Business App Banana
   - 1.2 Instagram Business Login Add Karna
   - 1.3 Domains aur Website Platform Add Karna (Domain Whitelist)
   - 1.4 OAuth Redirect URI, Deauthorize aur Data Deletion URLs Set Karna
   - 1.5 Instagram App ID & Secret Praapt Karna
   - 1.6 Account Link Karna (`in.yogeshwar` Professional Account)
4. [Step 2: Supabase Backend & Database Setup](#step-2-supabase-backend-setup)
   - 2.1 Supabase Project Create Karna
   - 2.2 Database Schema & Tables Run Karna
   - 2.3 Authentication & URL Whitelist Fix (Localhost vs Production)
   - 2.4 Supabase API Keys Praapt Karna
5. [Step 3: Cloudinary & AI Setup (25 GB Free Storage & Caption AI)](#step-3-cloudinary--ai-setup)
   - 3.1 Cloudinary CDN Credentials
   - 3.2 AI Engine (Gemini & OpenRouter)
6. [Step 4: Environment Variables (`.env.local`) Configuration](#step-4-environment-variables-configuration)
7. [Step 5: Vercel Production Deployment](#step-5-vercel-production-deployment)
   - 5.1 Project Deploy Karna
   - 5.2 Environment Variables Upload Karna (BOM Bug Prevention)
8. [Step 6: Security & Git Cleanliness (GitGuardian / ggshield)](#step-6-security--git-cleanliness)
   - 6.1 Secrets Ko Git Me Push Hone Se Rokna
   - 6.2 Agar Secret Leaked Ho Jaye Toh Rotate & Purge Kaise Karein
9. [Debugging & Troubleshooting Hall of Fame (Sabhi Errors Ka Solution)](#debugging--troubleshooting-guide)

---

<a name="1-viralokit-kya-hai"></a>
## 1. 🌟 ViraloKit Kya Hai? (System Architecture)

**ViraloKit** ek professional Instagram Creator Studio hai jisme aap:
- Multi-slide Instagram Carousels (2–10 images) publish kar sakte hain.
- Meta Graph API v23.0 se real-time Insights (reach, impressions, saves, demographics) track kar sakte hain.
- AI (Gemini 1.5 Flash + OpenRouter) se viral captions generate aur comments auto-reply kar sakte hain.
- 25 GB isolated Cloudinary CDN storage use kar sakte hain jo feed publish hone ke baad free space empty kar deta hai.

### 🏗️ Complete Tech Stack Architecture:
```
[User Browser]
       │
       ▼
[Next.js 15 Frontend on Vercel] ──────► [Supabase Auth & PostgreSQL]
       │                                     (User Sessions, Tokens, Schedules)
       ├───► [Cloudinary CDN] ─────────────── (Temp Image Uploads)
       │
       ├───► [OpenRouter / Google Gemini] ── (AI Captions & Multi-modal Analysis)
       │
       └───► [Meta / Instagram Graph API v23.0]
                 ├─── api.instagram.com/oauth/access_token (Token Exchange)
                 ├─── graph.instagram.com/v23.0/me (Account Profile & Stats)
                 └─── graph.facebook.com/v23.0 (Carousel Publishing & Insights)
```

---

<a name="2-prerequisites"></a>
## 2. 📋 Prerequisites (Shuruat Me Kya Ready Rakhna Hai)

Aapke paas neeche di gayi cheezein ready honi chahiye:
1. **Instagram Professional (Creator ya Business) Account:**
   - Personal account par Meta API kaam nahi karti. Instagram app me **Settings ➔ Account Type ➔ Switch to Professional / Creator Account** kar lein.
2. **Meta / Facebook Account** (Meta Developer console login karne ke liye).
3. **GitHub Account** (Code host karne ke liye).
4. **Vercel Account** (Website live host karne ke liye).
5. **Supabase Account** (Database aur user login ke liye).
6. **Cloudinary Account** (Free 25 GB image hosting ke liye).

---

<a name="step-1-meta-for-developers-app-setup"></a>
## 3. 🛠️ Step 1: Meta for Developers App Setup (Zero Se Hero)

Meta ka setup sabse critical aur sensitive part hai. Agar yahan ek bhi URL miss ho jaye toh Facebook permission error deta hai.

### 1.1 Meta Developer Account & App Banana
1. Open karein: [developers.facebook.com](https://developers.facebook.com/)
2. Apne Facebook account se log in karein aur top-right me **My Apps** par click karein.
3. Click on **Create App** (Green button):
   - **App type:** Choose **Business** (Isme Instagram graph access full milta hai).
   - **App display name:** `ViraloKit` (Ya aapka manpasand naam).
   - **App contact email:** Apna email enter karein.
   - Click **Create app**.

---

### 1.2 Instagram Business Login Add Karna
1. App dashboard ke left sidebar me ya middle me **Add product** / **Set up** par jaiye.
2. **Instagram** product ke neeche **Set up** par click karein.
3. Left menu me aapko options dikhenge:
   - `API setup with Instagram login` (👈 Is par click karein).

---

### 1.3 Domains & Website Platform Add Karna (Domain Whitelist)
> [!IMPORTANT]
> Agar ye step miss ho gaya toh Facebook yeh error dega:  
> *"Can't load URL: The domain of this URL isn't included in the app's domains."*

1. Left sidebar me **App settings** (Gear icon) ➔ **Basic** par click karein.
2. **App Domains** box me type karein:
   ```text
   viralokit.vercel.app
   ```
   *(Aapka jo bhi Vercel ya custom domain ho, bina `https://` ke likhein).*
3. Page ke bottom me scroll karein aur **+ Add Platform** par click karein:
   - Choose **Website**.
   - **Site URL** me dalein:
     ```text
     https://viralokit.vercel.app/
     ```
4. Page ke bottom-right me **Save changes** par click karein.

---

### 1.4 OAuth Redirect, Deauthorize & Data Deletion URLs Set Karna
1. Left sidebar me wapas jaiye: **Instagram** ➔ **API setup with Instagram login**.
2. Scroll karke Section 3: **Set up Instagram business login** par aaiye aur **Set up** (ya edit settings) par click karein.
3. Ek popup khulega jiska naam hoga **"Business login settings"**:
   - **OAuth redirect URIs:**
     ```text
     https://viralokit.vercel.app/api/meta/oauth/callback
     ```
     *(Type karke Enter dabayein aur `x` tag banne dein).*
   - **Deauthorize callback URL:**
     ```text
     https://viralokit.vercel.app/api/meta/oauth/disconnect
     ```
   - **Data deletion request URL:**
     ```text
     https://viralokit.vercel.app/data-deletion
     ```
4. Click **Save**.

---

### 1.5 Instagram App ID & Secret Praapt Karna
Ussi page par sabse upar Section me:
- **Instagram app name:** ViraloKit - IG
- **Instagram app ID:** Note kar lein (e.g., `YOUR_INSTAGRAM_APP_ID`).
- **Instagram app secret:** **Show** button par click karein aur apna secret copy kar lein (kisi ke sath share na karein).

> [!CAUTION]
> **Secret ko kabhi bhi GitHub code me hardcode mat kijiye!** Isko hamesha `.env.local` aur Vercel Environment Variables me secret ki tarah save karein.

---

### 1.6 Account Link Karna (Tester / Live Account)
1. Section 1 **Generate access tokens** me jaiye.
2. Click **Add account** aur apna Instagram account add karein.
3. Instagram mobile app par notification aayegi: **"ViraloKit is requesting access"** ➔ Click **Allow / Accept**.
4. Ab aapka Instagram username wahan visible ho jayega!

---

<a name="step-2-supabase-backend-setup"></a>
## 4. 🗄️ Step 2: Supabase Backend & Database Setup

Supabase ViraloKit ka primary database aur user authentication engine hai.

### 2.1 Supabase Project Create Karna
1. Jaiye: [supabase.com](https://supabase.com/) aur login karein.
2. Click **New Project**:
   - **Name:** `viralokit`
   - **Database Password:** Strong password banayein aur save rakhein.
   - **Region:** Apne paas ka region chunein (e.g. `ap-south-1` Mumbai / India).
   - Click **Create new project**.

---

### 2.2 Database Tables Run Karna (SQL Editor)
1. Supabase dashboard me left sidebar se **SQL Editor** par click karein.
2. Click **New query** aur neeche diya gaya SQL paste karke **Run** (Ctrl+Enter) karein:

```sql
-- 1. Instagram Connected Accounts Table
CREATE TABLE IF NOT EXISTS public.instagram_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  instagram_user_id TEXT NOT NULL,
  username TEXT,
  profile_picture_url TEXT,
  access_token_encrypted TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_instagram UNIQUE(user_id)
);

-- 2. Scheduled Posts Table
CREATE TABLE IF NOT EXISTS public.scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  media_urls JSONB NOT NULL,
  caption TEXT NOT NULL,
  scheduled_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PUBLISHING', 'PUBLISHED', 'FAILED')),
  published_media_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AI Auto-Reply Comments Table
CREATE TABLE IF NOT EXISTS public.comment_auto_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL,
  comment_id TEXT NOT NULL UNIQUE,
  commenter_username TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  reply_text TEXT NOT NULL,
  status TEXT DEFAULT 'REPLIED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.instagram_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_auto_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Users can only read & edit their own records)
CREATE POLICY "Users can manage own accounts" ON public.instagram_accounts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage scheduled posts" ON public.scheduled_posts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage auto replies" ON public.comment_auto_replies
  FOR ALL USING (auth.uid() = user_id);
```

---

### 2.3 Authentication & URL Whitelist Fix (Localhost Redirection Bug)
> [!IMPORTANT]
> Default Supabase projects me Site URL `http://localhost:3000` set hoti hai. Is wajah se production me email confirmation link par click karne se user `localhost` par redirect ho jata tha.

1. Supabase Dashboard me left sidebar se **Authentication** ➔ **URL Configuration** par jaiye.
2. **Site URL:**
   ```text
   https://viralokit.vercel.app
   ```
3. **Redirect URLs** (Add URL par click karke ye sabhi add karein):
   - `https://viralokit.vercel.app/**`
   - `https://viralokit.vercel.app/api/auth/callback`
   - `http://localhost:3000/**` *(Local development ke liye)*
4. Click **Save**.

---

### 2.4 Supabase API Keys Copy Karna
Left sidebar me **Project Settings** (Gear icon) ➔ **API** par jaiye:
- **Project URL:** `https://<project-ref>.supabase.co` ➔ Note karein (`NEXT_PUBLIC_SUPABASE_URL`).
- **anon / public key:** Project API keys section me `anon` `public` key copy karein (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).

---

<a name="step-3-cloudinary--ai-setup"></a>
## 5. ☁️ Step 3: Cloudinary & AI Setup

### 3.1 Cloudinary (25 GB Isolated Media Cloud)
Instagram par multi-slide carousel publish karne se pehle Meta ko ek public HTTPS image URL chahiye hota hai. ViraloKit Cloudinary use karta hai taaki image direct high-speed CDN se Meta server par transfer ho sake:
1. Jaiye: [cloudinary.com](https://cloudinary.com/) (Free account banayein).
2. Dashboard par aapko 3 values dikhengi:
   - **Cloud Name:** Copy kar lein
   - **API Key:** Copy kar lein
   - **API Secret:** Copy kar lein

### 3.2 AI Engine (Google Gemini Free Tier - Bring Your Own Key)
1. **Google Gemini API Key:** [aistudio.google.com](https://aistudio.google.com/) par jakar 100% Free API key create karein (`GEMINI_API_KEY`).
2. Har user apne account/settings page me apni personal free Gemini key daal sakta hai, jisse developer ka quota exhaust nahi hota aur har user ko 15 requests/minute free milte hain.

---

<a name="step-4-environment-variables-configuration"></a>
## 6. 🔐 Step 4: Environment Variables (`.env.local`) Configuration

Project ke root folder me ek `.env.local` file banayein (ya existing file me update karein). Is file me sabhi keys is format me hongi:

```env
# ==============================================================================
# VIRALOKIT CORE CONFIGURATION (.env.local)
# ==============================================================================

# Application URLs
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
ALLOWED_ORIGIN="https://your-domain.vercel.app"

# ------------------------------------------------------------------------------
# SUPABASE CONFIGURATION (Public Browser Client + Server)
# ------------------------------------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key_here"

# ------------------------------------------------------------------------------
# META / INSTAGRAM GRAPH API CREDENTIALS
# ------------------------------------------------------------------------------
META_APP_ID="your_meta_app_id_here"
META_APP_SECRET="your_meta_app_secret_here"
INSTAGRAM_APP_ID="your_instagram_app_id_here"
INSTAGRAM_APP_SECRET="your_instagram_app_secret_here"
META_GRAPH_API_VERSION="v23.0"

# Optional: Default fallback user credentials
IG_USER_ID="your_instagram_user_id_here"
IG_ACCESS_TOKEN=""

# ------------------------------------------------------------------------------
# CLOUDINARY CDN (25 GB Free Quota)
# ------------------------------------------------------------------------------
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"

# ------------------------------------------------------------------------------
# AI ENGINE KEYS (Google Gemini 1.5/2.0 Flash)
GEMINI_API_KEY="your_gemini_api_key_here"

# ------------------------------------------------------------------------------
# SECURITY ENCRYPTION (AES-256 Token Storage)
# ------------------------------------------------------------------------------
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY="your_32_byte_hex_encryption_key_here"
```

---

<a name="step-5-vercel-production-deployment"></a>
## 7. 🚀 Step 5: Vercel Production Deployment

### 5.1 Project Deploy Karna
1. Jaiye: [vercel.com](https://vercel.com/)
2. Click **Add New** ➔ **Project** ➔ Apni GitHub repository `viralokit` select karein.
3. Framework: **Next.js** automatically detect ho jayega.

---

### 5.2 Environment Variables Upload Karna (BOM Bug Prevention)
> [!CAUTION]
> **Windows PowerShell Warning:**  
> Windows PowerShell me `"my-key" | npx vercel env add` pipe karne se string ke aage invisible UTF-16 Byte Order Mark (`\uFEFF`, code 65279) lag jata hai.  
> Iski wajah se browser me ye fatal error aata tha:  
> `Failed to execute 'fetch' on 'Window': String contains non ISO-8859-1 code point`!

**Safe Tarika:**
1. Vercel Web Dashboard me jaiye ➔ Apne project **`viralokit`** par click karein.
2. **Settings** ➔ **Environment Variables** par click karein.
3. `.env.local` ki sabhi keys ko directly Vercel UI me manually paste karke save karein.
4. **Deploy** par click karein.

---

<a name="step-6-security--git-cleanliness"></a>
## 8. 🛡️ Step 6: Security & Git Cleanliness (GitGuardian / ggshield)

ViraloKit me automated secret scanning integrate kiya gaya hai taaki koi bhi private key galti se open-source ya public git me na jaye.

### 8.1 `.gitignore` Rules
Ensure karein ki [`.gitignore`](file:///d:/ANTIGRAVITY/viralokit/.gitignore) me ye lines maujood hon:
```gitignore
# Environment variables
.env
.env*.local
.env.local

# Temporary Scratch Scripts
scratch/

# Vercel and build cache
.vercel
.next/
```

### 8.2 Scanning with `ggshield`
Aapke computer me GitGuardian CLI (`ggshield`) installed hai:
```bash
# Poore repository ke commits scan karne ke liye:
ggshield secret scan repo .

# Sirf current working folder scan karne ke liye:
ggshield secret scan path --recursive .
```

### 8.3 Agar Secret Galti Se Push Ho Jaye Toh Kya Karein?
1. **Never Just Delete and Commit:** Sirf nayi commit me delete karne se puraana commit Git history me rehta hai aur GitGuardian alert deta hai.
2. **Force-rewrite History:**
   ```powershell
   # Pichle commit ko uncommit karein (files intact rehti hain)
   git reset --soft HEAD~1

   # Files me se secret clean karein
   git add -A
   git commit -m "fix: sanitize credentials from codebase"
   git push origin main --force
   ```
3. **Secret Rotation:** Meta/Supabase portal me jakar secret ko hamesha **Rotate / Reset** kar lein.

---

<a name="debugging--troubleshooting-guide"></a>
## 9. 🩺 Debugging & Troubleshooting Hall of Fame (Sabhi Errors Ka Solution)

Yahan un sabhi real issues ki summary hai jo setup ke dauran aaye aur unka exact fix:

| # | Error Message / Issue | Root Cause (Kyu Aaya) | Exact Solution (Kese Fix Hua) |
|---|---|---|---|
| **1** | `404 This page could not be found` on `/login` | `middleware.ts` protected routes par unauthenticated user ko `/login` par bhej raha tha, par Supabase migration ke baad dedicated login page nahi bana tha. | [`app/login/page.tsx`](file:///d:/ANTIGRAVITY/viralokit/app/login/page.tsx) banaya gaya jisme Email Magic Link, Password, aur Google login Glassmorphism UI ke sath integrate kiya. |
| **2** | `Failed to execute 'fetch' on 'Window': String contains non ISO-8859-1 code point` | Windows PowerShell ne Vercel CLI me environment variable upload karte waqt UTF-16 Byte Order Mark (`\uFEFF`) attach kar diya tha. | Node.js clean buffer script se Vercel env re-upload kiya aur [`lib/supabase/client.ts`](file:///d:/ANTIGRAVITY/viralokit/lib/supabase/client.ts) me `clean()` string sanitizer lagaya jo `\u200B-\u200D\uFEFF` ko strip kar deta hai. |
| **3** | `Unsupported provider: provider is not enabled` | Supabase me Google OAuth credentials (Client ID & Secret) configure nahi the. | Users ke liye **Email Magic Link** aur **Email & Password** options provide kiye jo out-of-the-box bina Google Cloud setup ke kaam karte hain. |
| **4** | Login/Signup par click karne se `localhost:3000` par redirect ho raha tha | Supabase Project me default **Site URL** `http://localhost:3000` thi aur **Redirect URLs** empty thi. | `supabase/config.toml` me `site_url = "https://viralokit.vercel.app"` aur allowed redirect URLs set karke `npx supabase config push --yes` se update kiya. |
| **5** | `Can't load URL: The domain of this URL isn't included in the app's domains` | Meta Developer App Settings me `viralokit.vercel.app` whitelist nahi tha. | Meta App Settings ➔ **Basic** me **App Domains** aur **Website Platform Site URL** add kiya. |
| **6** | `Invalid OAuth access token - Cannot parse access token` | Instagram Business Login se mila token (`IGAA...`) verification ke liye `graph.facebook.com` par bheja ja raha tha jo sirf Facebook tokens accept karta hai. | [`lib/config.ts`](file:///d:/ANTIGRAVITY/viralokit/lib/config.ts) me dynamic router banaya: `IG...` tokens automatically **`graph.instagram.com/v23.0/me`** par route hote hain. |

---

## 🎯 Final Verification Checklist
- [x] Instagram Professional Account linked in Meta Developers
- [x] Instagram Business Login Embed URL configured
- [x] Supabase Auth whitelisted to `https://viralokit.vercel.app`
- [x] Tokens securely stored in Supabase with AES-256 encryption
- [x] Git commits completely sanitized and scanned with `ggshield`
- [x] Production site live and verified on Vercel: [https://viralokit.vercel.app](https://viralokit.vercel.app)
