# 🚀 ViraloKit — Professional Social Growth & Creator Studio Suite

[![Production](https://img.shields.io/badge/Live-https%3A%2F%2Fviralokit.vercel.app-pink?style=for-the-badge&logo=vercel)](https://viralokit.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.1_(App_Router)-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Meta Graph API](https://img.shields.io/badge/Meta_API-v26.0_(Official)-blue?style=for-the-badge&logo=meta)](https://developers.facebook.com)
[![Threads API](https://img.shields.io/badge/Threads_API-Official-black?style=for-the-badge&logo=threads)](https://developers.facebook.com/docs/threads)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_&_Postgres_RLS-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-25GB_Isolated_CDN-3448C5?style=for-the-badge&logo=cloudinary)](https://cloudinary.com)
[![AI Engine](https://img.shields.io/badge/AI-Gemini_1.5_Flash_+_OpenRouter-FF6B6B?style=for-the-badge&logo=google)](https://aistudio.google.com)

> **ViraloKit** is an enterprise-grade social media growth and automation platform designed specifically for **smartphone creators and digital entrepreneurs**. Engineered with **Next.js 15 (App Router)**, official **Meta Graph API v26.0**, **Threads API**, **Supabase PostgreSQL**, **Cloudinary 25 GB Isolated Media Cloud**, and **Google Gemini Multimodal AI Engine**.
> 
> Works 100% in your mobile browser with **zero running PC or laptop required**.

---

## 🌐 Live Production URL
**[https://viralokit.vercel.app](https://viralokit.vercel.app)**

---

## 📱 Mobile-First Social Automation & Intelligence Highlights

### 1. 🔍 Market Intelligence & Discovery Studio (`/discovery`)
* **Competitor & Creator Lookup**: Uses official Meta Business Discovery API to analyze any public `@username` (followers, following, bio, website, and recent 5 public posts) without logging into their account.
* **Hashtag Intelligence**: Search any hashtag keyword to find its permanent static Meta `hashtag_id`, then view top-performing trending media and recently published reels.
* **24-Hour Quota Monitor**: Live meter tracking your account's rolling 24-hour Content Publishing API limit (50 posts limit) to avoid API suspensions.
* **Meta Graph API Error Resolver**: Instant offline troubleshooter that explains codes & subcodes (100, 190, 4, 9, 36000, 2207042, etc.) and provides recommended solutions.

### 2. 📚 Offline Meta Developer Documentation Browser (`/docs`)
* **70 Official Guides Mirrored**: Read Meta's official Markdown documentation directly from your smartphone.
* **Instant Search & Category Filtering**: Browse guides for Webhooks, Content Publishing, Comment Moderation, Discovery, Analytics, Limits, Threads, and Error Codes.
* **Copy Markdown & Direct Meta Links**: Instant export or navigation to Meta for Developers.

### 3. ⚡ Follow-to-Unlock Comment Growth Funnels (ManyChat / Superprofile Killer)
* **Keyword Detection**: Automatically scans incoming comments for triggers (e.g., `LINK`, `GUIDE`, `PDF`, `PRICE`).
* **The Follow Gate**: Automatically queries Meta Graph API to verify if the commenter follows your account.
  * **If Following**: Delivers unlocked resource link, PDF, or voice note directly in DM + sends public reply + auto-likes comment.
  * **If Not Following**: Sends friendly follow-gate prompt in DM: *"Hey! Follow @account first to unlock this exclusive resource! Once followed, reply DONE here 🎁"*
* **24/7 Cloud Execution**: Configured with Meta Webhooks (`/api/meta/webhook`). Runs on Vercel serverless in <500ms even when your phone is locked or your laptop is turned off!

### 4. 💬 Instagram Direct Messaging Studio (`/messages`)
* **Voice Notes & Audio**: Deliver `.m4a` / `.wav` voice messages directly into Instagram DM conversation bubbles.
* **Document & File Attachments**: Deliver PDFs, guides, and ebooks directly through the chat composer.
* **Double-Tap Emoji Reactions**: React with `❤️`, `🔥`, `👍` or unreact to any message.
* **Threaded Quoted Replies**: Reply directly to specific message bubbles with visual quotes (`reply_to`).
* **Sender Actions**: Trigger live typing indicators (`typing_on`) and mark conversations as seen (`mark_seen`).

### 5. 🌐 Cross-Platform Channels (Threads & Facebook Pages) (`/channels`)
* **Official Threads API**:
  * Publish posts (up to 500 characters) with optional image or video attachments.
  * Reply to threads directly from your mobile browser.
  * Live feed and engagement metrics (views, likes, replies, reposts, quotes).
  * Built-in **60-Day Threads Token Exchanger Tool**.
* **Facebook Page Studio**:
  * Publish text status updates with link attachments.
  * Publish high-definition photos with captions.
  * Stream recent Page posts and follower stats.

### 6. 📸 High-Speed Instagram Publishing Studio (`/create`)
* Single Image, Video Reels, and Carousel Albums (2–20 Slides).
* Built-in **AI-Generated Content Disclosure** (`is_ai_generated`) flag compliant with Meta 2026 guidelines.

---

## 🔒 Security & Privacy Notice
This repository contains **zero hardcoded credentials**, tokens, or private IDs. All secrets are loaded dynamically via environment variables or encrypted databases.

Licensed under the MIT License. Built by Yogeshwar Kumar ([@inyogeshwar](https://github.com/inyogeshwar)).
