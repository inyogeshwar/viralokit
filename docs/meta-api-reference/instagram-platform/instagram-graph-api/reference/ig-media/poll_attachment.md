<html><head><title>Poll Attachment</title><meta charset="UTF-8" /><style nonce="HbmbuIK6">body { font-family: monospace; margin: 20px; }pre { white-space: pre-wrap; word-wrap: break-word; }</style></head><body><pre data-testid="developer-docs-markdown-page"># Poll Attachment



Represents the caption add-on poll on an [IG Media](https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media) object, with the share of votes each option received. To attach a poll when you publish, see [Caption add-ons](https://developers.facebook.com/documentation/instagram-platform/content-publishing/caption-add-ons).

### Requirements

|  | Instagram API with Facebook Login |
| --- | --- |
| **Access Tokens** | * [Facebook User access token](https://developers.facebook.com/documentation/facebook-login/guides/access-tokens#usertokens) |
| **Host URL** | `graph.facebook.com` |
| **Login Type** | Facebook Login for Business |
| [**Permissions**](https://developers.facebook.com/docs/permissions/reference#i) | * `instagram_basic` |

## Creating

This operation is not supported. Attach a poll when you create the media container. See [Caption add-ons](https://developers.facebook.com/documentation/instagram-platform/content-publishing/caption-add-ons).

## Reading

### Getting the caption poll on a media object &#123;#poll-attachment&#125;

`GET /&lt;IG_MEDIA_ID&gt;/poll_attachment`

Returns the caption add-on poll on an [IG Media](https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media) object.

#### Limitations

- Story media is not supported.
- This edge does not support [field expansion](https://developers.facebook.com/docs/graph-api/guides/field-expansion). Request it as its own call rather than nesting it in a `fields` parameter on the media object.
- Only available in Instagram API with Facebook Login.

#### Query String Parameters

Query string parameters are optional unless indicated as required.

- `date_format` — The format for `expiration_timestamp`. Set to `U` to return unix seconds. Defaults to ISO 8601.

#### Fields

The response is a single `poll_attachment` object, or `null` when the media has no caption poll.

| Field | Description |
| --- | --- |
| `option_a`&lt;br&gt;&lt;br&gt;`option_b` | Text of the first and second options. Always returned. |
| `option_c`&lt;br&gt;&lt;br&gt;`option_d` | Text of the third and fourth options. Omitted when the poll does not use them. |
| `option_a_votes_percentage`&lt;br&gt;&lt;br&gt;`option_b_votes_percentage` | Share of total votes cast for that option, as a fraction between `0.0` and `1.0`. Always returned. |
| `option_c_votes_percentage`&lt;br&gt;&lt;br&gt;`option_d_votes_percentage` | Share of total votes for the third and fourth options. Omitted together with the option text when the poll does not use them. |
| `total_votes` | Total number of votes cast across all options. Always returned. |
| `expiration_timestamp` | When the poll stops accepting votes. Omitted when the poll does not expire. |

#### Sample Request

```
GET graph.facebook.com
  /17841400039600391/poll_attachment
```

#### Sample Response

```json
&#123;
  &quot;poll_attachment&quot;: &#123;
    &quot;option_a&quot;: &quot;Espresso&quot;,
    &quot;option_b&quot;: &quot;Cold brew&quot;,
    &quot;option_a_votes_percentage&quot;: 0.62,
    &quot;option_b_votes_percentage&quot;: 0.38,
    &quot;total_votes&quot;: 421
  &#125;
&#125;
```

#### Sample Response for a media with no caption poll

```json
&#123;
  &quot;poll_attachment&quot;: null
&#125;
```

## Updating

This operation is not supported.

## Deleting

This operation is not supported.
</pre></body></html>