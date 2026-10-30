<html><head><title>Instagram Webhooks</title><meta charset="UTF-8" /><style nonce="Op0SY60F">body { font-family: monospace; margin: 20px; }pre { white-space: pre-wrap; word-wrap: break-word; }</style></head><body><pre data-testid="developer-docs-markdown-page"># Instagram Webhooks


Instagram Webhooks send real-time notifications to your server when supported activity occurs for an Instagram professional account connected to your app. Depending on the fields your app subscribes to, notifications can describe comments, mentions, story insights, messages, and other activity.

## Setup overview

Receiving notifications requires four steps:

1. Create and verify an HTTPS callback endpoint on your server.
2. Subscribe your Meta app to the Instagram webhook fields required by your integration.
3. Enable notifications for each app user&#039;s Instagram professional account.
4. Test the callback, subscription, and payload handling together.

Follow [Set up Instagram Webhooks](https://developers.facebook.com/documentation/instagram-platform/webhooks/setup) for the complete workflow.

## Previous setup links

The following sections moved to the Webhooks setup guide:

- [Setup steps](https://developers.facebook.com/documentation/instagram-platform/webhooks/setup#the-steps)
- [Requirements](https://developers.facebook.com/documentation/instagram-platform/webhooks/setup#requirements)
- [Limitations](https://developers.facebook.com/documentation/instagram-platform/webhooks/setup#limitations)
- [Create a callback endpoint](https://developers.facebook.com/documentation/instagram-platform/webhooks/setup#create-an-endpoint)
- [Verification requests](https://developers.facebook.com/documentation/instagram-platform/webhooks/setup#verification-requests)
- [Event notifications](https://developers.facebook.com/documentation/instagram-platform/webhooks/setup#event-notifications)
- [Validate verification requests](https://developers.facebook.com/documentation/instagram-platform/webhooks/setup#verification-requests)
- [Validate payloads](https://developers.facebook.com/documentation/instagram-platform/webhooks/setup#event-notifications)
- [Enable subscriptions](https://developers.facebook.com/documentation/instagram-platform/webhooks/setup#enable-subscriptions)
- [Test delivery](https://developers.facebook.com/documentation/instagram-platform/webhooks/setup#test-setup)
- [Sample application](https://developers.facebook.com/documentation/instagram-platform/webhooks/setup#sample-app-on-github)
- [Verify the sample application](https://developers.facebook.com/documentation/instagram-platform/webhooks/setup#verifying-the-sample-app)
- [mTLS for Webhooks](https://developers.facebook.com/documentation/instagram-platform/webhooks/setup#mtls-for-webhooks)
- [Configure mTLS](https://developers.facebook.com/documentation/instagram-platform/webhooks/setup#mtls-for-webhooks)

## Choose instructions for your API setup

Webhook configuration differs by Instagram API setup. In particular, the API host, access token, account identifier, and available fields are not interchangeable.

| API setup | Webhook model |
|---|---|
| [Instagram API with Unified Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login) | Uses a Business Integration System User Access Token and `graph.facebook.com`. Set the callback URL and fields in **Configure webhooks** on the **API setup with Unified login** tab in the App Dashboard. |
| [Instagram API with Instagram Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login) | Uses an Instagram User access token and `graph.instagram.com`. |
| [Instagram API with Facebook Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login) | Uses Facebook Login authorization and `graph.facebook.com`. Requires the Instagram professional account to be linked to a Facebook Page. |

## Webhook fields &#123;#fields&#125;

Field availability and required permissions depend on the API setup used by your app. See the [Instagram webhook fields and permissions](https://developers.facebook.com/documentation/instagram-platform/webhooks/fields) matrix.

## Payloads and testing

Use [Webhook notification examples](https://developers.facebook.com/documentation/instagram-platform/webhooks/examples) to compare payloads for each authorization setup and test your parser against the event types used by your integration.

Your endpoint must validate notification signatures, return a successful HTTPS response promptly, and handle duplicate deliveries. Webhooks do not provide a historical notification store, so retain the event data required by your product.

## Next steps

- [Set up Instagram Webhooks](https://developers.facebook.com/documentation/instagram-platform/webhooks/setup)
- [Review webhook fields](https://developers.facebook.com/documentation/instagram-platform/webhooks/fields)
- [Review notification examples](https://developers.facebook.com/documentation/instagram-platform/webhooks/examples)
</pre></body></html>