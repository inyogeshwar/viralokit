<html><head><title>Migrate your App</title><meta charset="UTF-8" /><style nonce="rbhFFc2f">body { font-family: monospace; margin: 20px; }pre { white-space: pre-wrap; word-wrap: break-word; }</style></head><body><pre data-testid="developer-docs-markdown-page"># Migrate your App



The [Instagram API with Unified Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login) lets your clients connect their Instagram professional account by logging in with Instagram or Facebook, without a Facebook Page. New Instagram API features ship only on Unified Login. Use this guide to move your Instagram API with Instagram Login app: set up Unified Login in the App Dashboard, update your code, and reconnect your clients.

## Who this guide is for

This guide is for apps that use the Instagram API with Instagram Login (`graph.instagram.com` and `instagram_business_*` permissions).

- **Do you have to move now?** No. Your existing integrations will continue to work. There is no end date yet. We will announce any change in the [Instagram Platform changelog](https://developers.facebook.com/documentation/instagram-platform/changelog).
- **Why move?** New features ship only on the Instagram API with Unified Login.
- **What does it take?** Setup in the App Dashboard, App Review for the `instagram_*` permissions, changes to your login, token, API calls and webhooks, and every client connects again once.
- **New apps.** Newly created apps can&#039;t set up the Instagram API with Instagram Login.

Not your case?

- **You use Facebook Login for Business for the Marketing API.** Your configuration keeps working. To let clients log in with Instagram, create a configuration as described in [Step 1](#step-1--configure-your-app).
- **You&#039;re new to the Instagram API.** Start with [Get started](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login/get-started).

## Why move to Unified Login

- **Instagram or Facebook login, no Page.** Your clients log in with their Instagram account or their Facebook account, then choose a business portfolio and the Instagram account to share. They don&#039;t need a Facebook Page.
- **One token per client.** Your app gets one Business Integration System User Access Token for the accounts the client shares.
- **Messaging, content and ads from one integration.** The same token works with messaging, content publishing and comment moderation. With ads permissions in your configuration, it also works with the Marketing API and the Conversions API, which the Instagram API with Instagram Login doesn&#039;t support.

## Compare Unified Login and Instagram Login

| | Instagram API with Unified Login | Instagram API with Instagram Login |
|---|---|---|
| How clients log in | Instagram account or Facebook account | Instagram account |
| What clients choose | A business portfolio, then the Instagram account to share | — |
| App Dashboard | **API setup with Unified login** | **API setup with Instagram login** |
| Login link | Login URL with your `config_id` | Embed URL with your Instagram app ID and scopes |
| App credentials | Meta app ID and app secret | Instagram app ID and app secret |
| Access token | Business Integration System User Access Token | Instagram User access token, refreshed every 60 days |
| API host | `graph.facebook.com` | `graph.instagram.com` |
| Instagram account ID | `GET /me/assigned_instagram_accounts` | Returned with the token, or `/me` |
| Permissions | `instagram_*` | `instagram_business_*` |
| Webhooks | Callback URL for the **Instagram** object on your Meta app; subscribe with `graph.facebook.com/&#123;ig-user-id&#125;/subscribed_apps` | Callback URL in **API setup with Instagram login**; subscribe with `graph.instagram.com/&#123;ig-user-id&#125;/subscribed_apps` |

## What isn&#039;t supported yet

At launch, the Instagram API with Unified Login doesn&#039;t support:

- The Handover Protocol
- Switching a personal Instagram account to a professional account during login. Clients switch in the Instagram app first.
- Logging in through the Instagram app. Instagram login opens in the browser, so clients need their Instagram password.
- The **API integration helper** in the App Dashboard

If your app depends on one of these, keep using the Instagram API with Instagram Login for now.

## Before you start

You need:

- Your existing Meta app. You don&#039;t need a new app.
- A business portfolio that owns the app. The **API setup with Unified login** tab only appears for apps owned by a business portfolio, so connect your app to one first if it isn&#039;t.
- Admin access to the app, and a Facebook account to use the App Dashboard.
- An Instagram professional account for testing. Test users aren&#039;t supported.
- An HTTPS redirect URL and an HTTPS webhook endpoint.

## Part 1: Set up Unified Login in the App Dashboard

In the App Dashboard, open your app and go to **Use cases** &gt; **Manage messaging &amp; content on Instagram** &gt; **Customize** (or the **Instagram** product). Select **API setup with Unified login**. The tab has four steps.

### Step 1. Configure your app

1. Select **Create new configuration**. This creates a default **Instagram API (Unified Login)** configuration with:
   - A Business Integration System User Access Token. Whether it expires depends on the configuration, and the configuration preview shows it.
   - An Instagram account, and an optional ad account that clients can skip
   - The permissions `instagram_basic` and `instagram_manage_messages` (always included), plus `instagram_manage_comments`, `instagram_content_publish`, `ads_management`, and `ads_read`
2. To change the permissions, open the configuration preview and select **Edit permissions**.
3. Select the configuration with **Use this configuration**.
4. Under **Redirect URL**, enter the HTTPS URL where clients return after they log in, and select **Save**.
5. Copy the **Login URL**. You use it in [Step 5](#step-5--replace-your-login-link).

You can also use an existing Facebook Login for Business configuration if it uses a Business Integration System User Access Token and requests only an Instagram account, or only an Instagram account and an ad account. These are listed with the **Instagram Login Compatible** label.

### Step 2. Generate access tokens

Use this step to test with your own Instagram account while your app is in Development mode.

1. Select **Add account** and invite the Instagram professional account as an **Instagram Tester**. You can add up to 50.
2. Accept the invitation in Instagram on the web: **Settings** &gt; **Website permissions** &gt; **Apps and websites** &gt; **Tester Invites**. The account appears in the table once the invitation is accepted.
3. Select **Generate token** and complete the login. Copy the token; it is shown only once.

The token covers the accounts the client shared with your app during login, not only the account in that row.

### Step 3. Configure webhooks

Unified Login notifications go to the callback URL set for the **Instagram** object on your **Meta app**, not the one in **API setup with Instagram login**.

1. In the App Dashboard, open **Webhooks** for your Meta app and select the **Instagram** object.
2. Enter your **Callback URL** and **Verify token**, and select **Verify and save**. You can use the same server you use today.
3. Subscribe to the fields your app needs.

See [Set up Webhooks](https://developers.facebook.com/documentation/instagram-platform/webhooks/setup) and [Webhook fields](https://developers.facebook.com/documentation/instagram-platform/webhooks/fields).

### Step 4. Complete App Review

First check **App Review** &gt; **Permissions and features**. If your app already has Advanced Access to the `instagram_*` permissions, for example from the Instagram API with Facebook Login, you don&#039;t need to request them again.

Otherwise, select **Go to app review** and request Advanced Access for the permissions in your configuration. These are the `instagram_*` permissions, not the `instagram_business_*` permissions your app uses today:

| You use today | Request |
|---|---|
| `instagram_business_basic` | `instagram_basic` |
| `instagram_business_manage_messages` | `instagram_manage_messages` |
| `instagram_business_manage_comments` | `instagram_manage_comments` |
| `instagram_business_content_publish` | `instagram_content_publish` |
| `instagram_business_manage_insights` | `instagram_manage_insights` |

When you save your configuration in Step 1, your app gets Standard Access to its permissions, which is enough to test with people who have a role on your app. To onboard other clients, you need Advanced Access and your app must be in Live mode. If you reply to messages after the 24-hour window, also request the **Human Agent** feature. See [App Review](https://developers.facebook.com/documentation/instagram-platform/app-review).

## Part 2: Update your code

### Step 5. Replace your login link

Replace your Business Login for Instagram embed URL with the **Login URL** from Step 1, on the same button or link.

What your clients see:

1. **Log in.** A client who isn&#039;t logged in to Facebook sees Facebook and Instagram options. A client who is logged in to Facebook continues as that account, and can switch with the account selector &gt; **Add another account**.
2. **Choose a business portfolio**, then the Instagram account to share, and an ad account if your configuration asks for one.
3. **Allow access to messages.** If your configuration includes `instagram_manage_messages` and the setting is off, a client who logged in with that Instagram account is asked to turn it on. Messaging calls fail while it is off.
4. **Confirm.** The client returns to your redirect URL with a `code`.

### Step 6. Exchange the code for a token

Exchange the `code` for a Business Integration System User Access Token with your **Meta app ID and app secret**, not your Instagram app ID and secret. See [Facebook Login for Business](https://developers.facebook.com/documentation/facebook-login/facebook-login-for-business).

Whether the access token expires depends on your configuration. The configuration preview in the App Dashboard shows it, and you can manage and refresh access tokens with the [Business Integration System User Access Token Management API](https://developers.facebook.com/documentation/facebook-login/facebook-login-for-business#bisu-token-api). An access token also stops working when the client removes your app from their business portfolio, or moves the Instagram account to another business portfolio. When that happens, ask the client to connect again and select the new business portfolio.

### Step 7. Get the Instagram account ID

```
GET https://graph.facebook.com/v26.0/me/assigned_instagram_accounts
```

This returns the `id` of each Instagram account the client shared. Store it; every request uses it.

### Step 8. Update your API calls

Change the host to `graph.facebook.com`, use the new token, and replace `/me` with the Instagram account ID. `/me` doesn&#039;t return the Instagram account.

| | Before | After |
|---|---|---|
| Send a message | `POST graph.instagram.com/&#123;ig-user-id&#125;/messages` | `POST graph.facebook.com/&#123;ig-user-id&#125;/messages` |
| List conversations | `GET graph.instagram.com/me/conversations` | `GET graph.facebook.com/&#123;ig-user-id&#125;/conversations` |
| Messenger Profile | `POST graph.instagram.com/me/messenger_profile` | `POST graph.facebook.com/&#123;ig-user-id&#125;/messenger_profile` |
| Publish content | `POST graph.instagram.com/&#123;ig-user-id&#125;/media` | `POST graph.facebook.com/&#123;ig-user-id&#125;/media` |

Most request bodies stay the same. Message IDs use a different format, so don&#039;t reuse message IDs stored from your Instagram Login integration.

### Step 9. Subscribe each account to webhooks

Your Instagram Login subscriptions don&#039;t carry over. For each client, subscribe your app to every account the client shared:

```
POST https://graph.facebook.com/v26.0/&#123;ig-user-id&#125;/subscribed_apps?subscribed_fields=messages,comments
```

`subscribed_fields` is required. Use `GET` to check the subscription and `DELETE` to remove it.

| Fields | Permission |
|---|---|
| `messages`, `message_reactions`, `messaging_postbacks`, `messaging_referral`, `messaging_seen` | `instagram_manage_messages` |
| `comments`, `live_comments`, `mentions` | `instagram_manage_comments` |

Webhook payloads for Unified Login connections follow the Facebook Login for Business format. See [Webhook notification examples](https://developers.facebook.com/documentation/instagram-platform/webhooks/examples).

## Part 3: Move your clients

### Which clients can connect

Clients need:

- An Instagram professional account (Business or Creator). Personal accounts can&#039;t connect.
- A business portfolio. Every Instagram professional account already has one. Clients who log in with Facebook can also create one during login.

Plan for these cases:

- **Several Instagram accounts.** The client picks the accounts to share. One token covers all of them, and `GET /me/assigned_instagram_accounts` returns each one. Subscribe each one to webhooks.
- **An account moved to another business portfolio.** The old token no longer covers it. The client connects again and picks the new business portfolio.

### Step 10. Move your clients in groups

Instagram User access tokens don&#039;t work with the Instagram API with Unified Login, so each client must connect again once. Move clients in small groups and check each one before you remove the old connection.

For each client:

1. Keep the client&#039;s Instagram Login token and webhook subscription.
2. Send the client your new login link.
3. Get the account IDs (Step 7) and subscribe each account (Step 9).
4. Make one API call and wait for one webhook notification.
5. Move the client&#039;s traffic to the new token, then remove the old token and subscription.

If a step fails, keep the client on the Instagram Login connection and try again later. While a client is connected both ways, you can receive messaging webhooks twice, once per connection.

### Explain the change to your clients

Tell your clients what they will see before you send the new login link. You can adapt this text:

&gt; We&#039;re updating how [app name] connects to Instagram. Please reconnect your Instagram account once to keep getting new features. You can log in with Instagram or Facebook. You&#039;ll choose a business portfolio, then the Instagram account to connect. If you use messaging, turn on **Allow access to messages** when asked. Your current connection keeps working until you reconnect.

Clients who log in with Facebook don&#039;t see **Allow access to messages** during login. They turn it on in the Instagram app.

## Troubleshooting

See [Troubleshooting common problems](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login/eligibility-and-troubleshooting#troubleshooting).

## FAQ

**Does my Instagram Login integration stop working?** No. It keeps working, but new features ship only on the Instagram API with Unified Login. We&#039;ll announce any change in the [changelog](https://developers.facebook.com/documentation/instagram-platform/changelog).

**Do my clients need a Facebook account?** No. Clients can log in with Instagram.

**Do I need to keep both integrations?** Only while you move clients. After every client has connected again, you can remove your Instagram Login code.

## Next steps

- [Get started with Unified Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login/get-started)
- [Business onboarding](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login/business-onboarding)
- [Permissions](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login/permissions)
- [Set up Webhooks](https://developers.facebook.com/documentation/instagram-platform/webhooks/setup)
- [App Review](https://developers.facebook.com/documentation/instagram-platform/app-review)
- [Support](https://developers.facebook.com/documentation/instagram-platform/support)

</pre></body></html>