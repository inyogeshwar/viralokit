<html><head><title>User Likes</title><meta charset="UTF-8" /><style nonce="St2ssKZ6">body { font-family: monospace; margin: 20px; }pre { white-space: pre-wrap; word-wrap: break-word; }</style></head><body><pre data-testid="developer-docs-markdown-page"># User Likes



You can like and unlike Instagram Media (Feed, Reels, Carousel) and Comments (Comments, Replies) on behalf of an Instagram User.

## Like a Media or Comment
Publish a &quot;Like&quot; on an Instagram Media or Comment on behalf of an Instagram User.

**Note:** If the object was already liked by the Instagram User, the API has no effect.

**`POST /&lt;IG_USER_ID&gt;/likes`**
### Limitations
* Supports Feed Image, Reels and Carousel objects and their Comments/Replies.
* Stories is not supported.
* Burst rate limit: more than 50 requests in 5 seconds results in a 1-hour lockout for the Instagram User.
* Media and Comments from Private Accounts cannot be liked.
### Requirements
| Type | Description |
| --- | --- |
| [Access Tokens](https://developers.facebook.com/documentation/facebook-login/guides/access-tokens#usertokens) | [User](https://developers.facebook.com/documentation/facebook-login/guides/access-tokens#usertokens) – The Instagram User on whose behalf the Like is being published. |
| [Permissions](https://developers.facebook.com/docs/permissions) | `instagram_basic`  &lt;br&gt;`instagram_manage_engagement` |

**Note:** You can supply either `media_id` or `comment_id` as a query string parameter or in the request body — but not both parameters at the same time.

### Example Request – Like a Media (Query String)

```html
curl -i -X POST &quot;https://graph.facebook.com/v26.0/&lt;IG_USER_ID&gt;/likes?access_token=&lt;USER_ACCESS_TOKEN&gt;&amp;media_id=&lt;IG_MEDIA_ID&gt;&quot;
```

### Example Response

```json
&#123;
  &quot;success&quot;: true
&#125;
```

### Example Request – Like a Media (Request Body)

```html
curl -i -X POST &quot;https://graph.facebook.com/v26.0/&lt;IG_USER_ID&gt;/likes&quot; \
  -H &quot;Content-Type: application/json&quot; \
  -H &quot;Authorization: Bearer &lt;USER-ACCESS-TOKEN&gt;&quot; \
  -d &#039;&#123;&quot;media_id&quot;: &quot;&lt;IG_MEDIA_ID&gt;&quot;&#125;&#039;
```

### Example Response

```json
&#123;
  &quot;success&quot;: true
&#125;
```

### Example Request – Like a Comment (Query String)

```html
curl -i -X POST &quot;https://graph.facebook.com/v26.0/&lt;IG_USER_ID&gt;/likes?access_token=&lt;USER_ACCESS_TOKEN&gt;&amp;comment_id=&lt;IG_COMMENT_ID&gt;&quot;
```

### Example Response  

```json
&#123;
  &quot;success&quot;: true
&#125;
```

### Example Request – Like a Comment (Request Body)

```html
curl -i -X POST &quot;https://graph.facebook.com/v26.0/&lt;IG_USER_ID&gt;/likes&quot; \
  -H &quot;Content-Type: application/json&quot; \
  -H &quot;Authorization: Bearer &lt;USER-ACCESS-TOKEN&gt;&quot; \
  -d &#039;&#123;&quot;comment_id&quot;: &quot;&lt;IG_COMMENT_ID&gt;&quot;&#125;&#039;
```

### Example Response

```json
&#123;
  &quot;success&quot;: true
&#125;
```

### Path Parameters

| Placeholder | Value |
| --- | --- |
| `&lt;API_VERSION&gt;` | The API [version](https://developers.facebook.com/docs/graph-api/guides/versioning): v26.0.&lt;br&gt; |
| `&lt;IG_USER_ID&gt;`&lt;br&gt;*Required string* | The ID for your app user&#039;s Instagram User. |

### Query String Parameters

| Key | Placeholder | Value |
| --- | --- | --- |
| `access_token`&lt;br&gt;&lt;br&gt;*Required string* | `&lt;USER_ACCESS_TOKEN&gt;` | Your app user&#039;s [User](https://developers.facebook.com/documentation/facebook-login/guides/access-tokens#usertokens) access token. |
| `media_id`&lt;br&gt;&lt;br&gt;*Optional string* | `&lt;IG_MEDIA_ID&gt;` | The ID of the target Instagram Media to like. Supply this parameter to like a Media object. |
| `comment_id`&lt;br&gt;&lt;br&gt;*Optional string* | `&lt;IG_COMMENT_ID&gt;` | The ID of the target Instagram Comment or Reply to like. Supply this parameter to like a Comment object. |

### Response Fields

| Field Name | Description |
| --- | --- |
| `success` | Boolean flag to indicate whether the Like was published successfully. |

## Unlike a Media or Comment
Remove a &quot;Like&quot; from an Instagram Media or Comment on behalf of an Instagram User.

**Note:** If the object was not previously liked by the Instagram User, the API has no effect.

**`DELETE /&lt;IG_USER_ID&gt;/likes`**
### Limitations
* Supports Feed Image, Reels and Carousel objects and their Comments/Replies.
* Stories is not supported.
* Burst rate limit: more than 50 requests in 5 seconds results in a 1-hour lockout for the Instagram User.
### Requirements
| Type | Description |
| --- | --- |
| [Access Tokens](https://developers.facebook.com/documentation/facebook-login/guides/access-tokens#usertokens) | [User](https://developers.facebook.com/documentation/facebook-login/guides/access-tokens#usertokens) – The Instagram User on whose behalf the Like is being removed. |
| [Permissions](https://developers.facebook.com/docs/permissions) | `instagram_basic`  &lt;br&gt;`instagram_manage_engagement` |

**Note:** You can supply either `media_id` or `comment_id` as a query string parameter or in the request body — but not both parameters at the same time.

### Example Request – Unlike a Media (Query String)

```html
curl -i -X DELETE &quot;https://graph.facebook.com/v26.0/&lt;IG_USER_ID&gt;/likes?access_token=&lt;USER_ACCESS_TOKEN&gt;&amp;media_id=&lt;IG_MEDIA_ID&gt;&quot;
```

### Example Response

```json
&#123;
  &quot;success&quot;: true
&#125;
```

### Example Request – Unlike a Media (Request Body)

```html
curl -i -X DELETE &quot;https://graph.facebook.com/v26.0/&lt;IG_USER_ID&gt;/likes&quot; \
  -H &quot;Content-Type: application/json&quot; \
  -H &quot;Authorization: Bearer &lt;USER-ACCESS-TOKEN&gt;&quot; \
  -d &#039;&#123;&quot;media_id&quot;: &quot;&lt;IG_MEDIA_ID&gt;&quot;&#125;&#039;
```

### Example Response

```json
&#123;
  &quot;success&quot;: true
&#125;
```

### Example Request – Unlike a Comment (Query String)

```html
curl -i -X DELETE &quot;https://graph.facebook.com/v26.0/&lt;IG_USER_ID&gt;/likes?access_token=&lt;USER_ACCESS_TOKEN&gt;&amp;comment_id=&lt;IG_COMMENT_ID&gt;&quot;
```

### Example Response

```json
&#123;
  &quot;success&quot;: true
&#125;
```

### Example Request – Unlike a Comment (Request Body)

```html
curl -i -X DELETE &quot;https://graph.facebook.com/v26.0/&lt;IG_USER_ID&gt;/likes&quot; \
  -H &quot;Content-Type: application/json&quot; \
  -H &quot;Authorization: Bearer &lt;USER-ACCESS-TOKEN&gt;&quot; \
  -d &#039;&#123;&quot;comment_id&quot;: &quot;&lt;IG_COMMENT_ID&gt;&quot;&#125;&#039;
```

### Example Response

```json
&#123;
  &quot;success&quot;: true
&#125;
```

### Path Parameters

| Placeholder | Value |
| --- | --- |
| `&lt;API_VERSION&gt;` | The API [version](https://developers.facebook.com/docs/graph-api/guides/versioning): v26.0.&lt;br&gt; |
| `&lt;IG_USER_ID&gt;`&lt;br&gt;*Required string* | The ID for your app user&#039;s Instagram User. |

### Query String Parameters

| Key | Placeholder | Value |
| --- | --- | --- |
| `access_token`&lt;br&gt;*Required string* | `&lt;USER_ACCESS_TOKEN&gt;` | Your app user&#039;s [User](https://developers.facebook.com/documentation/facebook-login/guides/access-tokens#usertokens) access token. |
| `media_id`&lt;br&gt;&lt;br&gt;*Optional string* | `&lt;IG_MEDIA_ID&gt;` | The ID of the target Instagram Media to unlike. Supply this parameter to unlike a Media object. |
| `comment_id`&lt;br&gt;&lt;br&gt;*Optional string* | `&lt;IG_COMMENT_ID&gt;` | The ID of the target Instagram Comment or Reply to unlike. Supply this parameter to unlike a Comment object. |

### Response Fields

| Field Name | Description |
| --- | --- |
| `success` | Boolean flag to indicate whether the Unlike was performed successfully. |

</pre></body></html>