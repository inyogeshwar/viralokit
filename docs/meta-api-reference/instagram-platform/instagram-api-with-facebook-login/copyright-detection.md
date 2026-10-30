<html><head><title>Copyright Detection</title><meta charset="UTF-8" /><style nonce="ydm86N8E">body { font-family: monospace; margin: 20px; }pre { white-space: pre-wrap; word-wrap: break-word; }</style></head><body><pre data-testid="developer-docs-markdown-page"># Copyright Detection



This guide shows you how to detect copyright violations for a video uploaded or published to Instagram using the Instagram Graph API. This API is available with both the [Instagram API with Facebook Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login) and the [Instagram API with Unified Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login).

We only support Instagram media created via the content publishing API for early copyright detection.

## Before you start

Before you start you will need the following:

* All requirements and limitations for accessing the Instagram Container and Instagram Media endpoints apply

### Best practices

When testing an API call, you can include the `access_token` parameter set to your access token. However, when making secure calls from your app, use the [access token class.](https://developers.facebook.com/documentation/facebook-login/guides/access-tokens#portabletokens)

## Check an uploaded video

To check the copyright status for a video that have been uploaded, but not yet published, send a `GET` request to the `/&#123;ig-containter-id&#125;` endpoint with the `fields` parameter set to `copyright_check_status`.

### Sample Request

```curl
curl -i -X GET &quot;https://graph.facebook.com/v26.0/&#123;ig-containter-id&#125;?fields=copyright_check_status&quot;
```

On success, your app receives a JSON response with a `copyright_check_status` object with the following key-value pairs:

* `status` set to `completed`, `error`, `in_progress`, or `not_started`
* `matches_found` set to:
    * `false` if none are detected
    * `true` if violations are detected and `author`, `content_title`, `matched_segments`, and `owner_copyright_policy` values

### Sample Responses

#### Violation found

```json
&#123;
  &quot;copyright_check_status&quot;: &#123;
    &quot;status&quot;: &quot;complete&quot;,
    &quot;matches_found&quot;: true
  &#125;,
  &quot;id&quot;: &quot;&#123;ig-containter-id&#125;&quot;
&#125;
```

#### No violation found

```json
&#123;
  &quot;copyright_check_status&quot;: &#123;
      &quot;status&quot;: &quot;in_progress&quot;,
      &quot;matches_found&quot;: false
  &#125;
&#125;
```

## Check a published video

To check the copyright status for a video that has been published, send a `GET` request to the `/&#123;ig-media-id&#125;` endpoint with the `fields` parameter set to `copyright_check_information`.

**Warning:** The `media_url` field is omitted for video media that contains copyrighted or licensed audio, including audio added from the Instagram audio library, or that has been flagged for a copyright violation. This applies to all video media, including media the app user owns. It is also omitted for reels whose owner has turned off reel downloads, on requests that read another user&#039;s media: business discovery, tags, mentions, hashtag search, and collaborative media. That condition is evaluated against the reel&#039;s owner, so it can apply to a reel the app user co-authored. All other fields are returned as normal. See [IG Media](https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media) for details.

### Sample Request

```curl
curl -i -X GET &quot;https://graph.facebook.com/v26.0/&#123;ig-media-id&#125;?fields=copyright_check_information&quot;
```

On success, your app receives a JSON response with the `id` set to the video being checked and the `copyright_check_information` object with the following:

* `status` set to a `status` object set to `completed`, `error`, `in_progress`, or `not_started`
* `copyright_matches` set to:
    * `false` – Returned when no copyright violations are detected
    * `true` – Returned when copyright violations are detected and includes the `copyright_check_information` object that contains information about the copyright owner, policy, mitigation steps, and sections of the media that violated the copyright.

### Sample Responses

#### Violation found

```json
&#123;
  &quot;copyright_check_information&quot;: &#123;
     &quot;status&quot;: &#123;
       &quot;status&quot;: &quot;complete&quot;,
       &quot;matches_found&quot;: true
     &#125;,
     &quot;copyright_matches&quot;: [
       &#123;
         &quot;content_title&quot;: &quot;In My Feelings&quot;,
         &quot;author&quot;: &quot;Drake&quot;,
         &quot;owner_copyright_policy&quot;: &#123;
           &quot;name&quot;: &quot;UMG&quot;,
           &quot;actions&quot;: [
             &#123;
               &quot;action&quot;: &quot;BLOCK&quot;,
               &quot;territories&quot;: &quot;3&quot;,
               &quot;geos&quot;: [
                 &quot;Canada&quot;,
                 &quot;India&quot;,
                 &quot;United States of America&quot;
               ]
             &#125;,
             &#123;
               &quot;action&quot;: &quot;MUTE&quot;,
               &quot;territories&quot;: &quot;4&quot;,
               &quot;geos&quot;: [
                 &quot;Taiwan&quot;,
                 &quot;Tanzania&quot;,
                 &quot;Saudi Arabia&quot;,
                 &quot;United Kingdom of Great Britain and Northern Ireland&quot;
               ]
             &#125;
           ]
         &#125;,
         &quot;matched_segments&quot;: [
          &#123;
            &quot;start_time_in_seconds&quot;: 2.4,
            &quot;duration_in_seconds&quot;: 5.1,
            &quot;segment_type&quot;: &quot;AUDIO&quot;
          &#125;,
          &#123;
            &quot;start_time_in_seconds&quot;: 10.2,
            &quot;duration_in_seconds&quot;: 4.5,
            &quot;segment_type&quot;: &quot;VIDEO&quot;
          &#125;
        ]
      &#125;
    ]
  &#125;,
  &quot;id&quot;: &quot;90012800291314&quot;
&#125;
```

#### No violation found

```json
&#123;
  &quot;copyright_check_information&quot;: &#123;
    &quot;status&quot;: &#123;
      &quot;status&quot;: &quot;complete&quot;,
      &quot;matches_found&quot;: false
    &#125;
  &#125;,
  &quot;id&quot;: &quot;&#123;ig-media-id&#125;&quot;
&#125;
```

## See also

- [Instagram Container Reference](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-container)

- [Instagram Media Reference](https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media)

</pre></body></html>