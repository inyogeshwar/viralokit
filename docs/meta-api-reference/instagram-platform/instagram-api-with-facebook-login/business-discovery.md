<html><head><title>Business Discovery</title><meta charset="UTF-8" /><style nonce="yblVgRwG">body { font-family: monospace; margin: 20px; }pre { white-space: pre-wrap; word-wrap: break-word; }</style></head><body><pre data-testid="developer-docs-markdown-page"># Business Discovery



You can use the Instagram API with Facebook Login to get basic metadata and metrics about other Instagram professional accounts. This API is available with both the [Instagram API with Facebook Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login) and the [Instagram API with Unified Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login).

### Limitations  

Data about age-gated Instagram  professional accounts will not be returned.

### Endpoints

The API consists of the following endpoints. Refer to the endpoint&#039;s reference documentation for parameter and permission requirements.

- [`GET /&lt;YOUR_APP_USERS_IG_USER_ID&gt;/business_discovery`](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-user/business_discovery)

## Examples

### Get Follower &amp; Media Count

This sample query shows how to get the number of followers and number of published media objects on the [Blue Bottle Coffee](https://www.instagram.com/bluebottle/) Instagram professional account. Notice that business discovery queries are performed on the app user&#039;s Instagram professional account ID (in this case, `17841405309211844`) with the username of the Instagram professional account that your app user is attempting to get data about (`bluebottle` in this example).

#### Sample Request
_Formatted for readability._

```curl
curl -i -X GET \
 &quot;https://graph.facebook.com/v26.0/17841405309211844 \
  ?fields=business_discovery.username(bluebottle)&#123;followers_count,media_count&#125; \
  &amp;access_token=&lt;YOUR_APP_USERS_INSTAGRAM_USER_ACCESS_TOKEN&gt;&quot;
```

#### Sample Response

```json
&#123;
  &quot;business_discovery&quot;: &#123;
    &quot;followers_count&quot;: 267793,
    &quot;media_count&quot;: 1205,
    &quot;id&quot;: &quot;17841401441775531&quot; // Blue Bottle&#039;s Instagram user ID
  &#125;,
  &quot;id&quot;: &quot;17841405309211844&quot;  // Your app user&#039;s Instagram user ID
&#125;
```

### Get Media

Since you can make nested requests by specifying an edge via the `fields` parameter, you can request the targeted professional account&#039;s `media` edge to get all of its published media objects.

**Warning:** The `media_url` field is omitted for video media that contains copyrighted or licensed audio, including audio added from the Instagram audio library, or that has been flagged for a copyright violation. This applies to all video media, including media the app user owns. It is also omitted for reels whose owner has turned off reel downloads, on requests that read another user&#039;s media: business discovery, tags, mentions, hashtag search, and collaborative media. That condition is evaluated against the reel&#039;s owner, so it can apply to a reel the app user co-authored. All other fields are returned as normal. See [IG Media](https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media) for details.

#### Sample Request
_Formatted for readability._

```curl
curl -i -X GET \
 &quot;https://graph.facebook.com/v26.0/17841405309211844 \
  ?fields=business_discovery.username(bluebottle)&#123;followers_count,media_count,media&#125; \
  &amp;access_token=&lt;YOUR_APP_USERS_INSTAGRAM_USER_ACCESS_TOKEN&gt;&quot;
```

#### Sample Response

```json
&#123;
  &quot;business_discovery&quot;: &#123;
    &quot;followers_count&quot;: 267793,
    &quot;media_count&quot;: 1205,
    &quot;media&quot;: &#123;
      &quot;data&quot;: [
        &#123;
          &quot;id&quot;: &quot;17858843269216389&quot;
        &#125;,
        &#123;
          &quot;id&quot;: &quot;17894036119131554&quot;
        &#125;,
        &#123;
          &quot;id&quot;: &quot;17894449363137701&quot;
        &#125;,
        &#123;
          &quot;id&quot;: &quot;17844278716241265&quot;
        &#125;,
        ... // results truncated for brevity
      ],
    &quot;id&quot;: &quot;17841401441775531&quot;
  &#125;,
  &#125;,
  &quot;id&quot;: &quot;17841405309211844&quot;
&#125;
```

### Get Basic Metrics on Media

You can use both nested requests and field expansion to get public fields for a Business or Creator Account&#039;s media objects. Note that this does not grant you permission to access media objects directly — performing a `GET` on any returned [IG Media](https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media) will fail due to insufficient permissions.

For example, here&#039;s how to get the number of comments and likes for each of the media objects published by Blue Bottle Coffee:

**Warning:** Please note that `view_count` includes both paid and organic metrics

### Sample Request

```
GET graph.facebook.com
  /17841405309211844
    ?fields=business_discovery.username(bluebottle)&#123;media&#123;comments_count,like_count,view_count&#125;&#125;
```

### Sample Response

```
&#123;
  &quot;business_discovery&quot;: &#123;
    &quot;media&quot;: &#123;
      &quot;data&quot;: [
        &#123;
          &quot;comments_count&quot;: 50,
          &quot;like_count&quot;: 5837,
          &quot;view_count&quot;: 7757,
          &quot;id&quot;: &quot;17858843269216389&quot;
        &#125;,
        &#123;
          &quot;comments_count&quot;: 11,
          &quot;like_count&quot;: 2997,
          &quot;id&quot;: &quot;17894036119131554&quot;
        &#125;,
        &#123;
          &quot;comments_count&quot;: 28,
          &quot;like_count&quot;: 3643,
          &quot;id&quot;: &quot;17894449363137701&quot;
        &#125;,
        &#123;
          &quot;comments_count&quot;: 43,
          &quot;like_count&quot;: 4943,
          &quot;id&quot;: &quot;17844278716241265&quot;
        &#125;,
     ],
   &#125;,
   &quot;id&quot;: &quot;17841401441775531&quot;
  &#125;,
  &quot;id&quot;: &quot;17841405976406927&quot;
&#125;
```
</pre></body></html>