<html><head><title>Children</title><meta charset="UTF-8" /><style nonce="izNWcI5M">body { font-family: monospace; margin: 20px; }pre { white-space: pre-wrap; word-wrap: break-word; }</style></head><body><pre data-testid="developer-docs-markdown-page"># Children



Represents a collection of [IG Media](https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media) objects on an album [IG Media](https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media).

**Warning:** The `media_url` field is omitted for video media that contains copyrighted or licensed audio, including audio added from the Instagram audio library, or that has been flagged for a copyright violation. This applies to all video media, including media the app user owns. It is also omitted for reels whose owner has turned off reel downloads, on requests that read another user&#039;s media: business discovery, tags, mentions, hashtag search, and collaborative media. That condition is evaluated against the reel&#039;s owner, so it can apply to a reel the app user co-authored. All other fields are returned as normal. See [IG Media](https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media) for details.

### Requirements

|  | Instagram API with Unified Login | Instagram API with Instagram Login | Instagram API with Facebook Login |
| --- | --- | --- | --- |
| **Access Tokens** | * [Business Integration System User access token](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login/authentication) | * Instagram User user access token | * [Facebook User access token](https://developers.facebook.com/documentation/facebook-login/guides/access-tokens#usertokens) |
| **Host URL** | `graph.facebook.com` | `graph.instagram.com` | `graph.facebook.com` |
| **Login Type** | Facebook Login for Business | Business Login for Instagram | Facebook Login for Business |
| [**Permissions**](https://developers.facebook.com/docs/permissions/reference#i) | * `instagram_basic` | * `instagram_business_basic` | * `instagram_basic`&lt;br&gt;* `pages_read_engagement`&lt;br&gt;&lt;br&gt;If the app user was granted a role via the Business Manager on the [Page](https://developers.facebook.com/documentation/instagram-platform/overview#pages) connected to the targeted IG User, you will also need one of:&lt;br&gt;&lt;br&gt;* `ads_management`&lt;br&gt;* `ads_read` |

## Creating &#123;#create&#125;

This operation is not supported.

## Reading &#123;#read&#125;

### Getting Child Media Objects &#123;#children&#125;

`GET /&lt;IG_MEDIA_ID&gt;/children`

Returns a list of [IG Media](https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media) objects on an album [IG Media](https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media) object.

#### Limitations

- Some fields, such as `permalink`, cannot be used on photos within albums (children).

#### Sample Request

```
GET graph.facebook.com
  /17896450804038745/children
```

#### Sample Response

```
&#123;
  &quot;data&quot;: [
    &#123;
      &quot;id&quot;: &quot;17880997618081620&quot;
    &#125;,
    &#123;
      &quot;id&quot;: &quot;17871527143187462&quot;
    &#125;
  ]
&#125;
```

## Updating &#123;#update&#125;

This operation is not supported.

## Deleting &#123;#delete&#125;

This operation is not supported.
</pre></body></html>