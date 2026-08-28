# 🚀 Viralo-Kit: Instagram DM & Comment Automation Master Plan
**Target Entity:** AI Coding Agent (Claude Code / OpenCode)
**Project Context:** Adding a complete, production-ready Instagram Messaging automation suite to `inyogeshwar/viralo-kit`, functioning similarly to Manychat, RapidDM, or Superprofile.

---

## 🤖 AGENT DIRECTIVES (CRITICAL INSTRUCTIONS)
As the AI Agent executing this plan, you must adhere to the following workflow for EVERY phase:
1. **Code Generation:** Write clean, modular, and well-documented code (preferably TypeScript/Node.js). Use MVC architecture.
2. **Testing (All to All):** Write automated tests (Unit & Integration) for every webhook and API utility using mocked Meta Webhook payloads.
3. **Security Audit:** Validate `X-Hub-Signature-256` for all incoming webhooks. Ensure access tokens are securely managed.
4. **Error Handling & Fixing:** Implement robust `try/catch` blocks. If Meta APIs return errors (e.g., rate limits, invalid tokens), implement retry logic or graceful degradation. If your tests fail, autonomously debug and fix the errors before proceeding.

---

## 📚 META OFFICIAL DOCUMENTATION REFERENCE
*Always refer to these official endpoints when building requests.*
*   **Core API:** [Getting Started](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/get-started) | [Sample Experience](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/sample-experience)
*   **Sending & Templates:** [Send Message API](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/features/send-message) | [Generic Template](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/generic-template) | [Button Template](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/button-template) | [Product Template](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/features/product-template)
*   **Interactions:** [Quick Replies](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/features/quick-replies) | [Ice Breakers](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/features/ice-breakers) | [Persistent Menu](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/features/persistent-menu)
*   **Triggers:** [Private Replies (Comment to DM)](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/features/private-replies) | [Story Mentions](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/features/story-mention) | [ig.me Links](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/features/ig-me-links)
*   **Management:** [User Profile (Follower Check)](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/features/user-profile) | [Attachment Upload](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/features/attachment-upload) | [Sender Actions (Typing...)](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/features/sender-actions)
*   **Routing & Admin:** [Conversation Routing](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/features/conversation-routing) | [Human Agent Escalation](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/features/human-agent-escalation) | [Moderate Conversations](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/features/moderate-conversations)
*   **Infrastructure:** [Webhooks](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/webhooks) | [Webhook Debugging](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/webhooks/debugging)
*   **Compliance:** [App Review](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/app-review)

---

## 🛠️ PHASE 1: Webhook Infrastructure & Security
**Objective:** Set up the gateway to receive real-time updates from Instagram securely.

1.  **Setup Express Router:** Create `/webhook/instagram` endpoints.
2.  **Verification Endpoint (GET):** Handle Meta's `hub.challenge`, `hub.mode`, and `hub.verify_token`.
3.  **Event Receiver (POST):** 
    *   Implement middleware to verify `X-Hub-Signature-256` using the App Secret.
    *   Parse `entry[].messaging[]` (for DMs) and `entry[].changes[]` (for comments).
    *   Acknowledge Meta within 200ms (`res.status(200).send('EVENT_RECEIVED')`) before processing logic.
4.  **Agent Task:** Write a test simulating a valid and invalid signature payload.

---

## 💬 PHASE 2: Comment-to-DM (Private Replies)
**Objective:** Automatically DM users when they comment a specific keyword (e.g., "automation").

1.  **Comment Listener:** Listen for `feed` webhooks where `field: "comments"`.
2.  **Keyword Matching Logic:** Check if `value.text` contains trigger words configured by the user.
3.  **Private Reply Execution:** 
    *   Use the [Private Replies API](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/features/private-replies).
    *   Payload: Send a `POST` to `/me/messages` with `recipient: { "comment_id": "<ID>" }`.
    *   *Message Strategy:* Since we can't check follower status from a comment, send: "Hey! I have the resource ready. Reply 'SEND' to this message to get it."
4.  **Agent Task:** Implement rate-limiting protection to avoid Meta spam flags if a post goes viral.

---

## 🚪 PHASE 3: The "Follow-Gate" & DM Logic
**Objective:** Check if the user follows the account via DM, and deliver the asset if true.

1.  **DM Listener:** Listen for `messages` webhooks.
2.  **State Machine (Redis):** Track the conversation context (e.g., user is requesting the "AI Coding Guide").
3.  **Follower Check:** 
    *   Extract `sender.id` (Instagram Scoped ID).
    *   Query the [User Profile API](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/features/user-profile): `GET /{ig-user-id}?fields=is_user_follow_business`.
4.  **Conditional Routing:**
    *   **If `is_user_follow_business` is TRUE:** Deliver a [Button Template](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/button-template) with the final URL/File.
    *   **If FALSE:** Send a text: "Please follow this page first to unlock the resource! Reply 'DONE' once you've followed."
5.  **Agent Task:** Build the Redis caching layer to avoid querying the Profile API too frequently for the same user.

---

## ✨ PHASE 4: Advanced Engagement Features
**Objective:** Add ManyChat/Superprofile style interactive elements.

1.  **Story Mention Automation:** Listen for story mentions and automatically reply with a thank you or a promo code using the [Story Mention API](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/features/story-mention).
2.  **Ice Breakers:** Configure initial conversation starters for users who DM the page directly ([Ice Breakers API](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/features/ice-breakers)).
3.  **Human Escalation:** If a user types "help" or "human", use the [Human Agent Escalation API](https://developers.facebook.com/documentation/business-messaging/instagram-messaging/features/human-agent-escalation) to pause the bot and flag the chat in the Meta Business Suite Inbox.

---

## 🔒 PHASE 5: Audit, Error Handling & Data Compliance
**Objective:** Ensure the application is stable and compliant with Meta's policies.

1.  **Error Logging:** Implement global error catching. If Meta returns a `100` or `190` error code (token expired), trigger a notification mechanism.
2.  **Data Deletion Callback:** Implement the mandatory URL required by Meta for users to request data deletion.
3.  **Agent Task:** Perform a final code audit. Ensure no sensitive tokens are hardcoded. Generate a `tests/` folder with complete coverage of all above phases.
