<html><head><title>Tags</title><meta charset="UTF-8" /><style nonce="eZ3gWuQe">body { font-family: monospace; margin: 20px; }pre { white-space: pre-wrap; word-wrap: break-word; }</style></head><body><pre data-testid="developer-docs-markdown-page"># Tags



Represents a collection of [IG Media](https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media) objects in which your app user&#039;s [Instagram professional account](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-user) has been tagged by another Instagram user.

## Creating

This operation is not supported.

## Reading

**`GET /&lt;IG_USER_ID&gt;/tags`**

Returns a list of [IG Media](https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media) objects in which an [IG User](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-user) has been tagged by another Instagram user.

**Warning:** The `media_url` field is omitted for video media that contains copyrighted or licensed audio, including audio added from the Instagram audio library, or that has been flagged for a copyright violation. This applies to all video media, including media the app user owns. It is also omitted for reels whose owner has turned off reel downloads, on requests that read another user&#039;s media: business discovery, tags, mentions, hashtag search, and collaborative media. That condition is evaluated against the reel&#039;s owner, so it can apply to a reel the app user co-authored. All other fields are returned as normal. See [IG Media](https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media) for details.

### Limitations

Private [IG Media](https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media) objects will not be returned.

### Requirements

| Type | Description |
| --- | --- |
| Access Tokens | User |
| [Features](https://developers.facebook.com/docs/feature-reference) | Not applicable. |
| [Permissions](https://developers.facebook.com/docs/permissions#i) | `instagram_basic`&lt;br&gt;`instagram_manage_comments`&lt;br&gt;`pages_read_engagement`&lt;br&gt;&lt;br&gt;If the token is from a User whose Page role was granted via the Business Manager, one of the following permissions is also required: `ads_management` or `ads_read`. |
| [Tasks](https://developers.facebook.com/documentation/instagram-platform/overview#tasks) | The app user must be able to perform appropriate Tasks on the Page based on the Permissions requested by the app. |

### Request Syntax

```
GET https://graph.facebook.com/&lt;IG_USER_ID&gt;/tags
  ?fields=&lt;LIST_OF_FIELDS&gt;
  &amp;access_token=&lt;ACCESS_TOKEN&gt;
```

### Query String Parameters

Include the following query string parameters to augment the request.

| Key | Value |
| --- | --- |
| `access_token`  &lt;br&gt;**Required**  &lt;br&gt;*String* | The app user&#039;s Instagram User Access Token. |
| `fields`  &lt;br&gt;*Comma-separated list* | A comma-separated list of [Fields](#fields) and [Edges](#edges) you want included in the response. If omitted, default fields will be returned. |
| `media_type`  &lt;br&gt;**Optional**  &lt;br&gt;*Comma-separated list* | Return only media of the specified type(s). One or more of `IMAGE`, `VIDEO`, or `CAROUSEL_ALBUM` (for example, `media_type=IMAGE,VIDEO`). Any other value returns an error. |
| `posted_after`  &lt;br&gt;**Optional**  &lt;br&gt;*ISO 8601 datetime* | Return only media posted strictly after this time. Accepts an ISO 8601 datetime (for example, `2023-10-11T09:12:31`). A value with no offset is treated as UTC. The bound is strict. |
| `posted_before`  &lt;br&gt;**Optional**  &lt;br&gt;*ISO 8601 datetime* | Return only media posted strictly before this time. Uses the same format as `posted_after`. If you supply both, `posted_before` must be after `posted_after`. |

**Note:** These filters are applied after each page of results is selected, so a page can contain fewer items than the requested page size, or none at all, even when more matching media exist further back. Treat a short or empty page as normal and keep paginating using the returned `after` cursor. This filtering capability is rolling out gradually, so it might not be enabled for your app yet.

### Fields

Use the `fields` query string parameter to specify fields you want included on any returned [IG Media](https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media#read) objects.

### Edges

Use the `fields` query string parameter to specify Edges you want included on any returned [IG Media](https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media#read) objects.

### Response

A JSON-formatted object containing [IG Media](https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media) objects.

```json
&#123;
  &quot;&lt;FIELD&gt;&quot;:&quot;&lt;VALUE&gt;&quot;,
  ...
&#125;
```

### Pagination

This edge supports [cursor-based pagination](https://developers.facebook.com/docs/graph-api/using-graph-api#paging) so the response will include `before` and `after` cursors if the response contains multiple pages of data. Unlike standard cursor-based pagination, however, the response will not include `previous` or `next` fields, so you will have to use the `before` and `after` cursors to construct `previous` and `next` query strings manually in order to page through the returned data set.

### Sample Request

```
GET graph.facebook.com/17841405822304914/tags
    ?fields=id,username
    &amp;access_token=EAADd...
```

### Sample Response

```
&#123;
  &quot;data&quot;: [
    &#123;
      &quot;id&quot;: &quot;18038...&quot;,
      &quot;username&quot;: &quot;keldo...&quot;
    &#125;,
    &#123;
      &quot;id&quot;: &quot;17930...&quot;,
      &quot;username&quot;: &quot;ashla...&quot;
    &#125;,
    &#123;
      &quot;id&quot;: &quot;17931...&quot;,
      &quot;username&quot;: &quot;jaypo...&quot;
    &#125;
  ]
&#125;
```

## Updating

This operation is not supported.

## Deleting

This operation is not supported.
</pre></body></html>