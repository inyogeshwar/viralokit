<html><head><title>Creator Messaging API</title><meta charset="UTF-8" /><style nonce="YHSiJnXv">body { font-family: monospace; margin: 20px; }pre { white-space: pre-wrap; word-wrap: break-word; }</style></head><body><pre data-testid="developer-docs-markdown-page"># Creator Messaging API



The Creator Messaging API allows a brand using your app to send messages to creators through the **Partnership folder** on Instagram. This provides a dedicated channel for brand-to-creator communication, supporting collaboration opportunities, campaign briefs, and partnership management. This API is only available with the [Instagram API with Facebook Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login).

## Before you begin

### Permissions

To use these APIs, permissions must be granted using [Facebook Login for Business](https://developers.facebook.com/documentation/facebook-login/guides/access-tokens). These permissions are required to access the Creator Messaging API:

- `instagram_creator_marketplace_messaging`
- `instagram_basic`
- `pages_read_user_content`
- `pages_show_list`
- `business_management`

### Eligibility

In the brand onboarding flow, Meta checks if your brand is [eligible for Instagram&#039;s creator marketplace](https://help.instagram.com/1389278101788752). If your brand is eligible but has not onboarded to the creator marketplace, you will need to accept the [Instagram Creator Marketplace Terms of Service](https://www.facebook.com/business/help/488723392994445).

### Access tokens

This API requires a [Page access token](https://developers.facebook.com/documentation/facebook-login/guides/access-tokens#pagetokens) for a Page that is connected to your brand&#039;s Instagram business account and is either eligible to onboard or has onboarded to Instagram&#039;s creator marketplace as a brand.

## Creator eligibility

To receive partnership messages through the API, a creator must:

- Be [eligible](https://help.instagram.com/1389278101788752) for and onboarded to the Instagram creator marketplace as a creator.
- Have a follower count of 250,000 or fewer.
- Enable message access by going to **Settings** &gt; **Messages and story replies** &gt; **Message requests** &gt; **Allow access to messages** and selecting **Everyone**.

To send partnership messages, a brand must be [eligible](https://help.instagram.com/1389278101788752) for and onboarded to the Instagram creator marketplace as a brand.

Creator eligibility is checked only when a new conversation thread is initiated. If a thread with the creator already exists, you can continue messaging them even if their eligibility changes later, such as when their follower count rises above 250,000.

## Rate limits

### Outreach, before a creator replies

Send Message API:

- You can send to up to 250 unique creators per 24-hour rolling window per Instagram account.
- You can send up to 2 messages per 30-day period, regardless of message type such as text, audio, video, or file attachments.
- Requests may be throttled if a creator receives too many messages across brands. If throttled, retry the next day.

Conversations API:

- Up to 2 calls per second per Facebook Page.

### Conversation, after a creator replies

Once the creator replies, standard Instagram messaging rate limits apply.

Send Message API:

- Up to 300 calls per second per Facebook Page for messages containing text.
- Up to 10 calls per second per Facebook Page for messages containing audio or video.
- You may be rate limited if too many messages are sent to a single thread.
- Requests may be throttled if a creator receives too many messages across brands. If throttled, retry later.

Conversations API:

- Up to 2 calls per second per Facebook Page.

## App review

### Instructions for developers

Your app review should clearly demonstrate how your app authenticates users and accesses data from Instagram&#039;s creator marketplace.

#### 1. Authentication process

- **UI (user-facing) apps:**
    - Before you begin recording your demo for app review, ensure that you have included the `instagram_creator_marketplace_messaging` permission in your configuration.
    - Show the complete, end-to-end Facebook Login flow inside your app. The login flow should match the video in the [Login flow experience](#login-flow-experience) section below as closely as possible.
    - Show the user connecting their Instagram account through a linked Facebook Page.
    - Clearly show where the user (brand) reviews and grants consent for creator messaging. Your app review video should clearly show the list of permissions and ensure that &quot;Access to brand&#039;s partnership conversations and a creator&#039;s messaging ID to send paid partnership messages&quot; is visible.
    - Example screencast: [How to produce a screencast for app review](https://developers.facebook.com/videos/2021/developing-for-success-how-to-produce-a-screencast-for-app-review/)
- **Server-to-server (S2S, no UI) apps:**
    - Explain your backend authentication setup, including system users, tokens, and permissions.
    - Clearly state that your app is server-to-server in your submission.
    - Confirm in the screencast that the app operates as S2S.
    - If direct testing isn&#039;t possible, provide detailed use cases and evidence supporting the S2S workflow.

#### 2. End-to-end permission usage

1. Explain and demonstrate how you use the `instagram_creator_marketplace_messaging` permission to allow a brand to send paid partnership messages to creators. Include the specific purpose for why the app needs this functionality. See [Permissions Reference for Meta Technologies API](https://developers.facebook.com/docs/permissions) for details.
2. In your recorded video, demonstrate how you send and retrieve partnership conversations and messages to creators on your app UI using the Creator Messaging API.

### Login flow experience

### Sandboxed test account

Apps with standard access to the Creator Discovery and Creator Messaging APIs receive mocked data from the Discovery API to support App Review. For the Creator Messaging API, you can use **Instagram Testers** on your app to test the end-to-end flow before App Review.

To use this, add two public [professional Instagram accounts](https://help.instagram.com/502981923235522/) to your app as **Instagram Testers** and accept both invitations: one business account linked to a Facebook Page, acting as the brand, and one creator account, acting as the creator.

Once both accounts are accepted testers on the same app, Creator Marketplace bypasses onboarding and eligibility checks for them. The Discovery API returns a real `messaging_id` for the creator test account, and you can send a paid partnership message to create a real thread.

This sandbox applies only to apps with standard access. Apps with advanced access always follow the production path.

#### Requirements

- **Access level** — Standard access to `instagram_creator_marketplace_messaging` and `instagram_creator_marketplace_discovery`.
- **App configuration** — The Instagram product must be added to your app.
- **Test accounts** — Two public Instagram accounts: a professional business account for the brand and a creator account for the creator. Private accounts do not receive tester invitations, and the brand account must be a professional account. Personal accounts are rejected.
- **Brand Page** — The brand Instagram account must be linked to a Facebook Page so you can generate a Page access token.
- **Token** — A Page access token for the brand account&#039;s linked Page, issued by the same app the testers are registered on.

#### 1. How to set up Instagram accounts as Instagram Testers

#### 2. Generate a Page access token for the brand test account

1. Open the [Graph API Explorer](https://developers.facebook.com/tools/explorer/) and select your app.
2. Request the permissions your integration needs for the Creator Discovery and Creator Messaging APIs, then generate a user access token.
3. Call `GET /me/accounts?fields=access_token` and copy the `access_token` for the brand account&#039;s linked Page.

The app associated with the token must be the same app you added the testers to. Tokens issued by any other app do not resolve the sandbox test accounts.

#### 3. Get the creator messaging ID

Call the Discovery API with the brand test account&#039;s Page access token to get a real `messaging_id` for the creator test account:

```html
curl -G \
  -d &#039;fields=id,messaging_id&#039; \
  -d &#039;access_token=&lt;ACCESS_TOKEN&gt;&#039; \
  &#039;https://graph.facebook.com/v25.0/&lt;BRAND_IG_USER_ID&gt;/creator_marketplace_creators&#039;
```

Real `id` and `messaging_id` values are returned for the accepted creator test account, even though neither account is onboarded to the creator marketplace. The returned `id` matches the creator account listed under **App Roles** &gt; **Roles**.

Only `id`, `username` and `messaging_id` return real data. Any other requested field returns mocked data or null. If the calling brand account is not an accepted tester, the request follows the standard eligibility path and returns mocked data.

#### 4. Send a message to the creator

Send a message from the brand test account to the `messaging_id` you retrieved in step 3:

```html
curl -X POST \
  -H &#039;Content-Type: application/json&#039; \
  -d &#039;&#123;
        &quot;recipient&quot;: &#123;&quot;id&quot;: &quot;&lt;MESSAGING_ID&gt;&quot;&#125;,
        &quot;message&quot;: &#123;&quot;text&quot;: &quot;Hello creator!&quot;&#125;,
        &quot;folder&quot;: &quot;partnership&quot;,
        &quot;access_token&quot;: &quot;&lt;ACCESS_TOKEN&gt;&quot;
      &#125;&#039; \
  &#039;https://graph.facebook.com/v25.0/&lt;PAGE_ID&gt;/messages&#039;
```

The send succeeds when an accepted brand test account messages an accepted creator test account on the same app. A new paid partnership thread is created on the first send, and the message is delivered to the creator Instagram inbox.

`POST /&lt;PAGE_ID&gt;/messages` is the only Messaging endpoint available in the sandbox. All other Messaging endpoints return `Application does not have permission for this action`.

#### Sandbox boundaries

The sandbox is intentionally narrow. The following cases are expected to fail:

- **Only the brand account is an accepted tester** — No `messaging_id` is returned, and the send is denied.
- **Only the creator account is an accepted tester** — Discovery follows the standard eligibility path and returns an eligibility error.
- **Tester invitation sent but not accepted** — The account is treated as not a tester.
- **Token issued by a different app than the one the testers belong to** — The test accounts are not resolved. Cross-app lookups are blocked by design.
- **Brand account is a personal, non-professional account** — Blocked with an error requiring a professional account.
- **Creator account is not a creator account** — The account is omitted from the sandbox creator list.
- **Recipient is a `messaging_id` for a non-sandbox account** — `Application does not have permission for this action`.
- **Malformed, empty, or `0` recipient ID** — Permission denied.
- **App has advanced access** — The sandbox is not used. Standard production behavior and eligibility checks apply.

## Get creator messaging information

Use the [Creator Discovery API](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login/creator-marketplace) to retrieve a creator&#039;s messaging ID.

### Example request

```html
curl -G \
  -d &#039;username=&lt;CREATOR_USERNAME&gt;&#039; \
  -d &#039;fields=messaging_id&#039; \
  -d &#039;access_token=&lt;ACCESS_TOKEN&gt;&#039; \
  &#039;https://graph.facebook.com/v25.0/&lt;IG_USER_ID&gt;/creator_marketplace_creators&#039;
```

### Response fields

| Name | Description |
| --- | --- |
| `messaging_id` | The unique identifier used to send messages to this creator. |

### Example response

```json
&#123;
  &quot;data&quot;: [
    &#123;
      &quot;messaging_id&quot;: &quot;942925708205890&quot;
    &#125;
  ]
&#125;
```

The Discovery API does not return `messaging_id` if any of the following is true:

- The creator is not onboarded to the creator marketplace.
- The creator&#039;s follower count is greater than 250,000.
- The creator has opted out of partnership messaging.

## Send a message to a creator

Send messages to creators through the Partnership folder.

### Example request

```html
curl -X POST \
  -H &#039;Content-Type: application/json&#039; \
  -d &#039;&#123;
        &quot;recipient&quot;: &#123;&quot;id&quot;: &quot;&lt;MESSAGING_ID&gt;&quot;&#125;,
        &quot;message&quot;: &#123;&quot;attachment&quot;: &#123;&quot;type&quot;: &quot;image&quot;, &quot;payload&quot;: &#123;&quot;url&quot;: &quot;&lt;IMAGE_URL&gt;&quot;&#125;&#125;&#125;,
        &quot;folder&quot;: &quot;partnership&quot;,
        &quot;access_token&quot;: &quot;&lt;ACCESS_TOKEN&gt;&quot;
      &#125;&#039; \
  &#039;https://graph.facebook.com/v25.0/&lt;PAGE_ID&gt;/messages&#039;
```

### API parameters

| Name | Required | Description |
| --- | --- | --- |
| `recipient` | Yes | JSON object containing the creator&#039;s messaging ID. |
| `message` | Yes | JSON object containing the message content. |
| `folder` | Yes | Must be set to `partnership` to send to the Partnership folder. |

Messages support text, images, audio, video, and PDF files.

### Media types and specifications

| Media type | Supported formats | Maximum size |
| --- | --- | --- |
| Audio | AAC, M4A, WAV, MP4 | 25 MB |
| Image | PNG, JPEG | 8 MB |
| Video | MP4, OGG, AVI, MOV, WEBM | 25 MB |
| File | PDF | 25 MB |

### Example response

```json
&#123;
  &quot;recipient_id&quot;: &quot;942925708205890&quot;,
  &quot;message_id&quot;: &quot;mid.xxxxx&quot;
&#125;
```

## List partnership conversations

Fetch conversation threads in the Partnership folder.

### Example request

```html
curl -G \
  -d &#039;platform=instagram&#039; \
  -d &#039;folder=partnership&#039; \
  -d &#039;access_token=&lt;ACCESS_TOKEN&gt;&#039; \
  &#039;https://graph.facebook.com/v25.0/&lt;PAGE_ID&gt;/conversations&#039;
```

### API parameters

| Name | Description |
| --- | --- |
| `platform` | The platform the Messaging API is running on. Set it to `instagram`. |
| `folder` | The inbox folder to query. Set it to `partnership`. |

### Example response

```json
&#123;
  &quot;data&quot;: [
    &#123;
      &quot;id&quot;: &quot;aWdfZAG06MTpJR01lc3N3Njkz&quot;,
      &quot;updated_time&quot;: &quot;2026-03-11T22:35:59+0000&quot;,
      &quot;folder&quot;: &quot;partnership&quot;
    &#125;
  ]
&#125;
```

## Read messages in a conversation thread

Retrieve messages within a specific conversation thread. Get the `&lt;CONVERSATION_ID&gt;` from the Conversations API.

### Example request

```html
curl -G \
  -d &#039;fields=id,created_time,from,to,message&#039; \
  -d &#039;access_token=&lt;ACCESS_TOKEN&gt;&#039; \
  &#039;https://graph.facebook.com/v25.0/&lt;CONVERSATION_ID&gt;/messages&#039;
```

### Response fields

| Name | Type | Description |
| --- | --- | --- |
| `id` | String | The unique message ID, such as `mid.xxxxx`. |
| `created_time` | String | ISO 8601 timestamp of when the message was sent. |
| `from` | Object | The sender. Contains `username` and `id`. |
| `to` | Object | The recipients. Contains a `data` array with `username` and `id`. |
| `message` | String | The text content of the message. |

### Example response

```json
&#123;
  &quot;data&quot;: [
    &#123;
      &quot;id&quot;: &quot;mid.xxxxx&quot;,
      &quot;created_time&quot;: &quot;2026-03-11T22:35:59+0000&quot;,
      &quot;from&quot;: &#123;
        &quot;username&quot;: &quot;creator_username&quot;,
        &quot;id&quot;: &quot;942925708205890&quot;
      &#125;,
      &quot;to&quot;: &#123;
        &quot;data&quot;: [
          &#123;
            &quot;username&quot;: &quot;brand_page&quot;,
            &quot;id&quot;: &quot;123456789&quot;
          &#125;
        ]
      &#125;,
      &quot;message&quot;: &quot;Hi, I&#039;d love to collaborate!&quot;
    &#125;
  ]
&#125;
```

## Error codes

| Error code | Subcode | Scenario | Error message |
| --- | --- | --- | --- |
| `200` Permission | `2207092` | Creator not onboarded | This creator is not onboarded to Creator Marketplace and is not available for messaging via the Partnership Messaging API. |
| `200` Permission | `2207093` | Follower shield | This creator has a high follower count and is not available for messaging via the Partnership Messaging API. |
| `9` Rate limit | `2207094` | Brand daily outreach limit | Brand has exceeded the daily outreach cap. Maximum 250 unique creators can be contacted per day. |
| `9` Rate limit | `2207095` | Messaging frequency limit | Maximum 2 messages per 30 days to this creator has been reached. |
| `9` Rate limit | `2207096` | Creator inbound threshold | The creator has received messages from too many brands. |

## Learn more

* [Creator Discovery API](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login/creator-marketplace)
* [Page access tokens](https://developers.facebook.com/documentation/facebook-login/guides/access-tokens#pagetokens)
* [Instagram creator marketplace eligibility](https://help.instagram.com/1389278101788752)
* [App Review](https://developers.facebook.com/docs/app-review) process
* [Facebook Login](https://developers.facebook.com/documentation/facebook-login)

</pre></body></html>