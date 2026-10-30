<html><head><title>Recently Searched Hashtags</title><meta charset="UTF-8" /><style nonce="bssuLmUP">body { font-family: monospace; margin: 20px; }pre { white-space: pre-wrap; word-wrap: break-word; }</style></head><body><pre data-testid="developer-docs-markdown-page"># Recently Searched Hashtags



This edge allows you to determine which [IG Hashtags](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-hashtag) are currently counting against an [IG User](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-user)&#039;s hashtag query limit.

## Reading

`GET /&#123;ig-user-id&#125;/recently_searched_hashtags`

Get the hashtags currently counting against an [IG User](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-user)&#039;s limit of 30 unique hashtags.

IG Users can query a maximum of 30 unique hashtags within a rolling, 7 day period. A queried hashtag will count against that user&#039;s limit as soon as it is queried. Subsequent queries on that hashtag within 7 days of the initial query will not count against the user&#039;s limit, and will not reset its initial query 7 day timer.

A hashtag drops out of this edge 7 days after the query that first added it, regardless of how often it is queried in the meantime. The slot frees itself at that point, so you do not need to stop querying the hashtag to get it back. Requests to `GET /&#123;ig-hashtag-id&#125;/recent_media` and `GET /&#123;ig-hashtag-id&#125;/top_media` count as queries, so a hashtag you only ever reach by ID still occupies a slot until its 7 days elapse. Querying a hashtag again after it has dropped out starts a new 7 day window and counts against your limit again.

**Limitations**

- Emojis in hashtag queries are not supported.
- The API returns 25 results per page by default, but you can use the `limit` parameter to get up to 30 per page (`limit=30`).

#### Requirements

| Type | Description |
| --- | --- |
| [Features](https://developers.facebook.com/docs/apps/review/feature) | [`Instagram Public Content Access`](https://developers.facebook.com/docs/apps/review/feature#reference-INSTAGRAM_PUBLIC_CONTENT_ACCESS) |
| [Permissions](https://developers.facebook.com/docs/apps/review/login-permissions) | [`instagram_basic`](https://developers.facebook.com/docs/facebook-login/permissions#reference-instagram_basic)&lt;br&gt;&lt;br&gt;If the token is from a User whose Page role was granted via the Business Manager, one of the following permissions is also required: `ads_management`, `ads_read`, or `pages_read_engagement`. |
| [Tokens](https://developers.facebook.com/documentation/facebook-login/guides/access-tokens) | A Facebook User [access token](https://developers.facebook.com/documentation/instagram-platform/overview#authentication). |

#### Sample Request

```
GET graph.facebook.com/17841405309211844/recently_searched_hashtags?limit=30
```

#### Sample Response

```
&#123;
  &quot;data&quot;: [
    &#123;
      &quot;id&quot;: &quot;17841562906103814&quot;
    &#125;,
    &#123;
      &quot;id&quot;: &quot;17841563587120501&quot;
    &#125;
  ]
&#125;
```

## Creating

This operation is not supported.

## Updating

This operation is not supported.

## Deleting

This operation is not supported.
</pre></body></html>