<html><head><title>Caption Add-ons</title><meta charset="UTF-8" /><style nonce="NgakAYkA">body { font-family: monospace; margin: 20px; }pre { white-space: pre-wrap; word-wrap: break-word; }</style></head><body><pre data-testid="developer-docs-markdown-page"># Caption Add-ons



A caption add-on is an interactive element attached to a post&#039;s caption. Two types are supported:

* A **poll**, which offers two to four options for end users to vote on.
* A **comment prompt**, which invites end users to answer in the comments.

This guide shows you how to attach an add-on when you create a media container, and how to read the results after the post is published. This is available only for Instagram API with Facebook Login

### Endpoints

* `POST /&lt;IG_USER_ID&gt;/media` — Attach an add-on when you create the media container
* `POST /&lt;IG_USER_ID&gt;/media_publish` — Publish the container and learn whether the add-on attached
* `GET /&lt;IG_MEDIA_ID&gt;/poll_attachment` — Read the poll and its vote tallies
* `GET /&lt;IG_MEDIA_ID&gt;/prompt_response` — Read the responses to a comment prompt

### Limitations

* A media can carry at most one add-on. A poll and a comment prompt cannot be combined on the same post.
* An add-on requires a non-empty `caption`. The caption is the poll question or the prompt.
* Supported on feed photos, carousels, and reels. Stories are not supported.
* On a carousel, set the add-on on the carousel container, not on its item children.
* Add-ons are write-once at creation. There is no endpoint to add, change, or remove an add-on after publishing.
* The `poll_attachment` object must contain at least 2 options and no more than 4 options.

## Attach a poll

Set the `poll_attachment` parameter when you [create the media container](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-user/media#creating).

### Parameters

* `poll_attachment` — A JSON object describing the poll options. The serialized value must be 200 characters or fewer.
* `is_poll_duration_extended` — Set to `true` to give the poll an extended voting duration. Can only be used together with `poll_attachment`.

The `poll_attachment` object takes up to four options:

| Key | Description |
| --- | --- |
| `option_a`&lt;br&gt;&lt;br&gt;**Required** | Text of the first option. Between 1 and 25 characters, inclusive. Emoji are supported and count as single characters. Leading and trailing whitespace is trimmed. |
| `option_b`&lt;br&gt;&lt;br&gt;**Required** | Text of the second option. Same length limits as `option_a`. |
| `option_c` | Text of the third option. Same length limits as `option_a`. |
| `option_d` | Text of the fourth option. Same length limits as `option_a`. Options are ordered, so `option_d` cannot be set unless `option_c` is also set. |

### Example request

_Formatted for readability._

```
POST graph.facebook.com
  /17841400039600391/media
    ?image_url=https://www.example.com/images/coffee.jpg
    &amp;caption=Which one should we add to the menu?
    &amp;poll_attachment=&#123;&quot;option_a&quot;:&quot;Espresso&quot;,&quot;option_b&quot;:&quot;Cold brew&quot;&#125;
```

### Example response

```json
&#123;
  &quot;id&quot;: &quot;987654321&quot;
&#125;
```

## Attach a comment prompt

Set `is_comment_prompt_used` to `true` when you create the media container. The caption becomes the prompt that end users answer in the comments.

### Example request

_Formatted for readability._

```
POST graph.facebook.com
  /17841400039600391/media
    ?image_url=https://www.example.com/images/coffee.jpg
    &amp;caption=What should we add to the menu?
    &amp;is_comment_prompt_used=true
```

## Publish the container

Publish the container with [`POST /&lt;IG_USER_ID&gt;/media_publish`](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-user/media_publish). A post can publish successfully even when its add-on fails to attach, so check the response for a `caption_add_on_attachment_status` field:

```json
&#123;
  &quot;id&quot;: &quot;1234567890&quot;,
  &quot;caption_add_on_attachment_status&quot;: &quot;POLL_CREATION_FAILURE&quot;
&#125;
```

The field is omitted when the add-on attached, and when no add-on was requested. Possible values are `POLL_CREATION_FAILURE` and `PROMPT_CREATION_FAILURE`.

## Read the results

Two endpoints for reading the add-on data of a post:

* [`GET /&lt;IG_MEDIA_ID&gt;/poll_attachment`](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-media/poll_attachment) returns the poll options with the share of votes each one received.
* [`GET /&lt;IG_MEDIA_ID&gt;/prompt_response`](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-media/prompt_response) returns a paginated list of the responses to a comment prompt.

Neither endpoint supports [field expansion](https://developers.facebook.com/docs/graph-api/guides/field-expansion), so request each one as its own call rather than nesting it in a `fields` parameter on the media object.

### Example request for a poll

```
GET graph.facebook.com
  /17895695668004550/poll_attachment
```

### Example response for a poll

Vote shares are fractions between `0.0` and `1.0`. Options C and D are omitted, together with their percentages, when the poll does not use them.

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

`poll_attachment` is `null` when the media has no caption poll:

```json
&#123;
  &quot;poll_attachment&quot;: null
&#125;
```

### Example request for a comment prompt

```
GET graph.facebook.com
  /17895695668004550/prompt_response
    ?fields=id,text,timestamp,username
```

### Example response for a comment prompt

Reading `username` requires the `instagram_manage_comments` permission. Without it, the field is omitted from each response.

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
    &quot;next&quot;: &quot;https://graph.facebook.com/v26.0/17895695668004550/prompt_response?after=QVFIUkxOWZAG...&quot;
  &#125;
&#125;
```

`data` is `null` when the media has no comment prompt, and also when the media owner has turned comments off. It is an empty array when the prompt exists but has no visible responses. An empty array can still be followed by more pages, so page on the cursor rather than on an empty `data`. See [Prompt response](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-media/prompt_response) for the full field and pagination reference.

```json
&#123;
  &quot;data&quot;: null
&#125;
```

## Error codes

Validation runs when you create the container, so these errors are returned by `POST /&lt;IG_USER_ID&gt;/media`.

| Subcode | Description |
| --- | --- |
| `2207101` | The `poll_attachment` parameter is not a valid JSON object. |
| `2207102` | The poll is missing `option_a` or `option_b`, or `option_d` was set without `option_c`. |
| `2207103` | A poll option is outside the 1 to 25 character range. |
| `2207104` | `is_poll_duration_extended` was set without a `poll_attachment`. |
| `2207105` | An add-on was set on a carousel item child. Set it on the carousel container instead. |
| `2207106` | An add-on was requested without a caption. |
| `2207107` | Both `poll_attachment` and `is_comment_prompt_used` were set. A media can carry at most one add-on. |

</pre></body></html>