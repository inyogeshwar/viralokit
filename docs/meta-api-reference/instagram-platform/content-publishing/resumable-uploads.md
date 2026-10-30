<html><head><title>Upload Video to Meta Servers</title><meta charset="UTF-8" /><style nonce="7v3Pw0Q4">body { font-family: monospace; margin: 20px; }pre { white-space: pre-wrap; word-wrap: break-word; }</style></head><body><pre data-testid="developer-docs-markdown-page"># Upload Video to Meta Servers



This guide shows you how to upload large video files, from local and publicly hosted content, to be published on Instagram. This is available only for apps that have implemented Facebook Login for Business.

The API allows you resume a local file upload operation after a network interruption or other transmission failure, saving time and bandwidth in the event of network failures.

### Host URLs

* `graph.facebook.com` – Create video media containers and publish and manage uploaded media
* `rupload.facebook.com` – Upload the video to Meta servers

### Endpoints

* `POST https://graph.facebook.com/&lt;IG_USER_ID&gt;/media?upload_type=resumable` — Initialize the upload and create a media container for the video
* `POST https://rupload.facebook.com/ig-api-upload/&lt;IG_MEDIA_CONTAINER_ID&gt;` — Upload the video to Meta servers
* `POST https://graph.facebook.com/&lt;IG_USER_ID&gt;/media_publish?creation_id=&lt;IG_MEDIA_CONTAINER_ID&gt;` — Publish the uploaded video
* `GET /&lt;IG_MEDIA_CONTAINER_ID&gt;?fields=status_code` — Check publishing eligibility and status of the video

### HTML URL encoding hints

* Some of the parameters are supported in list/dict format.
* Some characters need to be encoded into a format that can be transmitted over the Internet. For example: `user_tags=[&#123;username:&#039;ig_user_name&#039;&#125;]` is encoded to `user_tags=%5B%7Busername:ig_user_name%7D%5D` where `[` is encoded to `%5B` and `&#123;` is encoded to `%7B`. For more conversions, please refer to the HTML URL Encoding standard.

## Create a container

To create a resumable upload session for the video, send a `POST` request to the `/&lt;IG_USER_ID&gt;/media` endpoint on the `graph.facebook.com` host with the following required parameters:

* `access_token` – Set to your app user&#039;s access token
* `upload_type` – Set to `resumable`
* `media_type` – Set to `REELS`, `STORIES`, or `VIDEO` (for  videos to be used in carousels)
* `is_carousel_item` – Set to `true` (for videos to be used in carousels)

### Basic example request
_Formatted for readability._

```html
curl &quot;https://graph.facebook.com/&lt;API_VERSION&gt;/&lt;IG_USER_ID&gt;/media&quot;
     -H &quot;Content-Type: application/json&quot;
     -H &quot;Authorization: Bearer &lt;USER_ACCESS_TOKEN&gt;&quot;
     -d &#039;&#123;
            &quot;media_type&quot;: &quot;&lt;REELS_STORIES_VIDEO&gt;&quot;
            &quot;upload_type=resumable&quot;
        &#125;&#039;
```

#### Optional parameters for Reels

* `audio_name` – Set to the name of the audio
* `caption` – Set to the caption for the reel video
* `collaborators` – Set to a comma-separated list of up to 3 Instagram usernames of collaborators
* `cover_url` – Set to the URL to the cover image for the Reels tab
* `is_ai_generated` – Set to `true` to self-disclose that the reel contains AI-generated content
* `location_id` – Set to the ID of a Facebook Page associated with a location
* `thumb_offset` – Set to frame in the video to be used as the thumbnail
* `user_tags` – Set to an array of `username` objects for public Instagram users your app user wants to tag in the video

Other parameters are not supported.

### Sample response

On success your app receives a JSON object with the ID and the Meta URI for the container. These two values will be used in Step 2.

```json
&#123;
   &quot;id&quot;: &quot;&lt;IG_MEDIA_CONTAINER_ID&gt;&quot;,
   &quot;uri&quot;: &quot;https://rupload.facebook.com/ig-api-upload/&lt;API_VERSION&gt;/&lt;IG_MEDIA_CONTAINER_ID&gt;&quot;
&#125;
```

## Upload the Video

Most Graph API calls use the `graph.facebook.com` host however, calls to upload videos for Reels use `rupload.facebook.com`.

The following file sources are supported for uploaded video files:

* A file located on your computer
* A file hosted on a public facing server, such as a CDN

#### Sample request upload a local video file

With the `ig-container-id` returned from a resumable upload session call, upload the video.

* Be sure the host is `rupload.facebook.com`.
* All `media_type` shares the same flow to upload the video.
* `ig-container-id` is the ID returned from resumable upload session calls.
* `access-token` is the same one used in previous steps.
* `offset` is set to the first byte being upload, generally `0`.
* `file_size` is set to the size of your file in bytes.
* `Your_file_local_path` is set to the file path of your local file, for example, if uploading a file from, the **Downloads** folder on macOS, the path is **&#064;Downloads/example.mov**.

```http
curl -X POST &quot;https://rupload.facebook.com/ig-api-upload/&lt;API_VERSION&gt;/&lt;IG_MEDIA_CONTAINER_ID&gt;&quot; \
     -H &quot;Authorization: OAuth &lt;ACCESS_TOKEN&gt;&quot; \
     -H &quot;offset: 0&quot; \
     -H &quot;file_size: Your_file_size_in_bytes&quot; \
     --data-binary &quot;&#064;my_video_file.mp4&quot;
```

#### Sample request upload a public hosted video

```http
curl -X POST &quot;https://rupload.facebook.com/ig-api-upload/&lt;API_VERSION&gt;/&lt;IG_MEDIA_CONTAINER_ID&gt;&quot; \
     -H &quot;Authorization: OAuth &lt;ACCESS_TOKEN&gt;&quot; \
     -H &quot;file_url: https://example_hosted_video.com&quot;
```

#### Sample Response

```http
// Success Response Message
&#123;
  &quot;success&quot;:true,
  &quot;message&quot;:&quot;Upload successful.&quot;
&#125;

// Failure Response Message
&#123;
  &quot;debug_info&quot;:&#123;
    &quot;retriable&quot;:false,
    &quot;type&quot;:&quot;ProcessingFailedError&quot;,
    &quot;message&quot;:&quot;&#123;\&quot;success\&quot;:false,\&quot;error\&quot;:&#123;\&quot;message\&quot;:\&quot;unauthorized user request\&quot;&#125;&#125;&quot;
  &#125;
&#125;
```

## Step 3: (Carousel Only) Create Carousel Containers

You can reuse step 1 and 2 to create multiple `ig-container-ids` with the `is_carousel_item` parameter set to `true`. Then create a Carousel Container to include all the carousel items, the carousel items can be mixed with Image and Videos.

```http
curl -X POST &quot;https://graph.facebook.com/&lt;API_VERSION&gt;/&lt;IG_USER_ID&gt;/media&quot; \
    -d &quot;media_type=CAROUSEL&quot; \
    -d &quot;caption=&#123;caption&#125;&quot;\
    -d &quot;collaborators=&#123;collaborator-usernames&#125;&quot; \
    -d &quot;location_id=&#123;location-id&#125;&quot; \
    -d &quot;product_tags=&#123;product-tags&#125;&quot; \
    -d &quot;children=[&lt;IG_MEDIA_CONTAINER_ID_1&gt;,&lt;IG_MEDIA_CONTAINER_ID_2&gt;...]&quot; \
    -H &quot;Authorization: OAuth &lt;ACCESS_TOKEN&gt;&quot;
```

## Step 4: Publish the Media

For Reels and Video Stories, the `&lt;IG_MEDIA_CONTAINER_ID&gt;` created in step 1 is used to publish the Video, and for Carousel Container, the `&lt;IG_MEDIA_CONTAINER_ID&gt;` created in step 3 is used to publish the Carousel Container.

```http
curl -X POST &quot;https://graph.facebook.com/&lt;API_VERSION&gt;/&lt;IG_USER_ID&gt;/media_publish&quot; \
    -d &quot;creation_id=&lt;IG_MEDIA_CONTAINER_ID&gt;&quot; \
    -H &quot;Authorization: OAuth &lt;ACCESS_TOKEN&gt;&quot;
```

## Step 5: Get Media Status

`graph.facebook.com` provides a `GET` endpoint to read the status of the upload, the `video_status` field contains details about the local upload process.

* The `uploading_phase` tells whether the file has been uploaded successfully, and how many bytes transferred.
* The `processing_phase` contains the details about the status of video processing after the video file is uploaded.

```http
// GET status from graph.facebook.com
curl -X GET &quot;https://graph.facebook.com/v19.0/&lt;IG_MEDIA_CONTAINER_ID&gt;?fields=id,status,status_code,video_status&quot; \
    -H &quot;Authorization: OAuth &lt;ACCESS_TOKEN&gt;&quot;
```

#### Sample Response from the `graph.facebook.com` endpoint

```http
// A successfully created ig container
&#123;
  &quot;id&quot;: &quot;&lt;IG_MEDIA_CONTAINER_ID&gt;&quot;,
  &quot;status&quot;: &quot;Published: Media has been successfully published.&quot;,
  &quot;status_code&quot;: &quot;PUBLISHED&quot;,
  &quot;video_status&quot;: &#123;
    &quot;uploading_phase&quot;: &#123;
      &quot;status&quot;: &quot;complete&quot;,
      &quot;bytes_transferred&quot;: 37006904
    &#125;,
    &quot;processing_phase&quot;: &#123;
      &quot;status&quot;: &quot;complete&quot;
    &#125;
  &#125;
&#125;

// An interrupted ig container creation, from here you can resume your upload in step 2 with offset=50002.
&#123;
  &quot;id&quot;: &quot;&lt;IG_MEDIA_CONTAINER_ID&gt;&quot;,
  &quot;status&quot;: &quot;Published: Media has been successfully published.&quot;,
  &quot;status_code&quot;: &quot;PUBLISHED&quot;,
  &quot;video_status&quot;: &#123;
    &quot;uploading_phase&quot;: &#123;
      &quot;status&quot;: &quot;in_progress&quot;,
      &quot;bytes_transferred&quot;: 50002
    &#125;,
    &quot;processing_phase&quot;: &#123;
      &quot;status&quot;: &quot;not_started&quot;
    &#125;
  &#125;
&#125;
```
</pre></body></html>