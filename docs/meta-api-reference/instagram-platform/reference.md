<html><head><title>Instagram Platform API reference</title><meta charset="UTF-8" /><style nonce="8GA4UrRD">body { font-family: monospace; margin: 20px; }pre { white-space: pre-wrap; word-wrap: break-word; }</style></head><body><pre data-testid="developer-docs-markdown-page"># Instagram Platform API reference



The Instagram (IG) Platform consists of nodes (objects), edges (collections) on those nodes, and fields (object properties). Nodes and Root Edges (edges that are not on a node) are listed below. API requests are sent to one of two Meta host URLs.

| Host URL | Login type |
| --- | --- |
| `graph.facebook.com` | [Instagram API with Facebook Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login/business-login-for-instagram) |
| `graph.instagram.com` | [Instagram API with Instagram Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/business-login) |

## Nodes

| Node | Description |
| --- | --- |
| [IG Comment](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-comment) | Represents an Instagram comment |
| [IG Container](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-container) | Represents a media container for publishing an Instagram media object. |
| [IG Hashtag](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-hashtag) | Represents an Instagram hashtag. Only available for Instagram API with Facebook Login. |
| [IG Media](https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media) | Represents an Instagram photo, video, story, or album. |
| [IG User](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-user) | Represents an Instagram Business Account or Instagram Creator Account. |
| [Page](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/page) | Represents a Facebook Page. Only available for Instagram API with Facebook Login. |

## Root Edges

| Root Edge | Actions |
| --- | --- |
| [ig_hashtag_search](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-hashtag-search) | Gets the ID of an [IG Hashtag](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-hashtag). Only available for Instagram API with Facebook Login. |

</pre></body></html>