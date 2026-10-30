<html><head><title>Prompt Response</title><meta charset="UTF-8" /><style nonce="1IQFtnPZ">body { font-family: monospace; margin: 20px; }pre { white-space: pre-wrap; word-wrap: break-word; }</style></head><body><pre data-testid="developer-docs-markdown-page"># Prompt Response



Represents the collection of responses to the caption add-on comment prompt on an [IG Media](https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media) object. To attach a comment prompt when you publish, see [Caption add-ons](https://developers.facebook.com/documentation/instagram-platform/content-publishing/caption-add-ons).

Responses are read through the same pipeline as [Comments](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-media/comments), so ordering, integrity filtering, and cursor behavior match that edge.

### Requirements

|  | Instagram API with Facebook Login |
| --- | --- |
| **Access Tokens** | * [Facebook User access token](https://developers.facebook.com/documentation/facebook-login/guides/access-tokens#usertokens) |
| **Host URL** | `graph.facebook.com` |
| **Login Type** | Facebook Login for Business |
| [**Permissions**](https://developers.facebook.com/docs/permissions/reference#i) | * `instagram_basic`&lt;br&gt;* `instagram_manage_comments` — required for the `username` field only |

## Creating

This operation is not supported. Attach a comment prompt when you create the media container. See [Caption add-ons](https://developers.facebook.com/documentation/instagram-platform/content-publishing/caption-add-ons).

## Reading

### Getting the comment prompt responses on a media object &#123;#prompt-response&#125;

`GET /&lt;IG_MEDIA_ID&gt;/prompt_response`

Returns a list of the responses to the caption add-on comment prompt on an [IG Media](https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media) object.

#### Limitations

- Story media is not supported.
- This edge does not support [field expansion](https://developers.facebook.com/docs/graph-api/guides/field-expansion). Request it as its own call rather than nesting it in a `fields` parameter on the media object.
- `data` is `null` when the media has no comment prompt, and an empty array when the prompt exists but has no visible responses. An empty array can still be followed by more pages, so page on the cursor rather than on an empty `data`.
- Responses are hidden when the media owner has turned comments off. The endpoint returns `data: null` in that case.
- Only available in Instagram API with Facebook Login.

#### Query String Parameters

Query string parameters are optional unless indicated as required.

- `fields` — A comma-separated list of the fields to return. Defaults to `id`.
- `date_format` — The format for `timestamp`. Set to `U` to return unix seconds. Defaults to ISO 8601.
- `after` — The cursor from a previous response, to request the next page.
- `limit` — The maximum number of responses to return per page.

#### Fields

| Field | Description |
| --- | --- |
| `id` | The ID of the response comment. |
| `text` | The text of the response. |
| `timestamp` | When the response was created. |
| `username` | The username of the person who responded. Omitted unless the access token carries `instagram_manage_comments`. |

#### Sample Request

```
GET graph.facebook.com
  /17841400039600391/prompt_response
    ?fields=id,text,timestamp,username
```

#### Sample Response

```json
&#123;
  &quot;data&quot;: [
    &#123;
      &quot;id&quot;: &quot;17870913679156914&quot;,
      &quot;text&quot;: &quot;Cold brew, no contest&quot;,
      &quot;timestamp&quot;: &quot;2026-09-12T19:16:02+0000&quot;,
      &quot;username&quot;: &quot;coffee_fan&quot;
    &#125;,
    &#123;
      &quot;id&quot;: &quot;17873440459141021&quot;,
      &quot;text&quot;: &quot;Please bring back the flat white&quot;,
      &quot;timestamp&quot;: &quot;2026-09-12T18:10:30+0000&quot;,
      &quot;username&quot;: &quot;morning_regular&quot;
    &#125;
  ],
  &quot;paging&quot;: &#123;
    &quot;cursors&quot;: &#123;
      &quot;after&quot;: &quot;QVFIUkxOWZAG...&quot;
    &#125;,
    &quot;next&quot;: &quot;https://graph.facebook.com/v26.0/17841400039600391/prompt_response?after=QVFIUkxOWZAG...&quot;
  &#125;
&#125;
```

#### Sample Response for a media with no comment prompt

```json
&#123;
  &quot;data&quot;: null
&#125;
```

## Updating

This operation is not supported.

## Deleting

This operation is not supported.
</pre></body></html>