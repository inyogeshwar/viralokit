<html><head><title>Mentions - Instagram API with Facebook Login</title><meta charset="UTF-8" /><style nonce="9QQeEcmD">body { font-family: monospace; margin: 20px; }pre { white-space: pre-wrap; word-wrap: break-word; }</style></head><body><pre data-testid="developer-docs-markdown-page"># Mentions - Instagram API with Facebook Login



Identify captions, comments, and IG Media in which an Instagram Business or Creator&#039;s alias has been tagged or &#064;mentioned. This API is available with both the [Instagram API with Facebook Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login) and the [Instagram API with Unified Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login).

## Limitations

- Mentions on Stories are not supported.
- Commenting on photos in which you were tagged is not supported.
- [Webhooks](#webhooks) will not be sent if the Media upon which the comment or &#064;mention appears was created by an account that is set to [private](https://www.facebook.com/help/instagram/448523408565555).

## Endpoints

The API consists of the following endpoints:

* [`GET /&#123;ig-user-id&#125;/tags`](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-user/tags) — to get the media objects in which a Business or Creator Account has been tagged
* [`GET /&#123;ig-user-id&#125;?fields=mentioned_comment`](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-user/mentioned_comment#reading) — to get data about a comment that an Business or Creator Account  has been &#064;mentioned in
* [`GET /&#123;ig-user-id&#125;?fields=mentioned_media`](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-user/mentioned_media#reading) — to get data about a media object on which a Business or Creator Account has been &#064;mentioned in a caption
* [`POST /&#123;ig-user-id&#125;/mentions`](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-user/mentions#creating) — to reply to a comment or media object caption that a Business or Creator Account has been &#064;mentioned in by another Instagram user

Refer to each endpoint reference document for usage instructions.

**Warning:** The `media_url` field is omitted for video media that contains copyrighted or licensed audio, including audio added from the Instagram audio library, or that has been flagged for a copyright violation. This applies to all video media, including media the app user owns. It is also omitted for reels whose owner has turned off reel downloads, on requests that read another user&#039;s media: business discovery, tags, mentions, hashtag search, and collaborative media. That condition is evaluated against the reel&#039;s owner, so it can apply to a reel the app user co-authored. All other fields are returned as normal. See [IG Media](https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media) for details.

## Webhooks

Subscribe to the `mentions` field to recieve [Instagram Webhooks](https://developers.facebook.com/documentation/instagram-platform/webhooks) notifications whenever an Instagram user mentions an Instagram Business or Creator Account. Note that we do not store Webhooks notification data, so if you set up a Webhook that listens for mentions, you should store any received data if you plan on using it later.

## Examples

### Listening for and Replying to Comment &#064;Mentions

You can listen for comment &#064;mentions and reply to any that meet your criteria:

1. Set up an [Instagram webhook](https://developers.facebook.com/documentation/instagram-platform/webhooks) that&#039;s subscribed to the `mentions` field.
1. Set up a script that can parse the Webhooks notifications and identify comment IDs.
1. Use the IDs to query the `GET /&#123;ig-user-id&#125;/mentioned_comment` endpoint to get more information about each comment.
1. Analyze the returned results to identify any comments that meet your criteria.
1. Use the `POST /&#123;ig-user-id&#125;/mentions` endpoint to [reply to those comments](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-user/mentions#creating).

The reply will appear as a sub-thread comment on the comment in which the Business or Creator Account was mentioned.

### Listening for and Replying to Caption &#064;Mentions

You can listen for caption &#064;mentions and reply to any that meet your criteria:

1. Set up an [Instagram webhook](https://developers.facebook.com/documentation/instagram-platform/webhooks) that&#039;s subscribed to the `mentions` field.
1. Set up a script that can parse the Webhooks notifications and identify media IDs.
1. Use the IDs to query the `GET /&#123;ig-user-id&#125;/mentioned_media` endpoint to get more information about each media object.
1. Analyze the returned results to identify media objects with captions that meet your criteria.
1. Use the `POST /&#123;ig-user-id&#125;/mentions` endpoint to [comment on those media objects](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-user/mentions#creating).

</pre></body></html>