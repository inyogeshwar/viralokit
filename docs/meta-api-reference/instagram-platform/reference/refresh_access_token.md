<html><head><title>Refresh Access Token</title><meta charset="UTF-8" /><style nonce="pnkHdcfz">body { font-family: monospace; margin: 20px; }pre { white-space: pre-wrap; word-wrap: break-word; }</style></head><body><pre data-testid="developer-docs-markdown-page"># Refresh Access Token



This endpoint allows you to refresh long-lived Instagram User Access Tokens.

## Creating

This operation is not supported.

## Reading

**`GET /refresh_access_token`**

Refresh a long-lived accesstoken that is at least 24 hours old but has not expired. Refreshed tokens are valid for 60 days from the date at which they are refreshed.

### Requirements

| Type | Requirement |
| --- | --- |
| Access tokens | Instagram User (long-lived) |
| Permissions | `instagram_business_basic` |

### Request Syntax

```html
GET https://graph.instagram.com/refresh_access_token
  ?grant_type=ig_refresh_token
  &amp;access_token=&lt;LONG_LIVED_ACCESS_TOKENS&gt;
```

### Query String Parameters

Include the following query string parameters to augment the request.

| Key | Value |
| --- | --- |
| `grant_type`  &lt;br&gt;**Required**  &lt;br&gt;*String* | Set this to `ig_refresh_token`. |
| `access_token`  &lt;br&gt;**Required**  &lt;br&gt;*String* | The valid (unexpired) long-lived Instagram User Access Token that you want to refresh. |

### Response

A JSON-formatted object containing the following properties and values.

```json
&#123;
  &quot;access_token&quot;: &quot;&lt;ACCESS_TOKEN&gt;&quot;,
  &quot;token_type&quot;: &quot;&lt;TOKEN_TYPE&gt;&quot;,
  &quot;expires_in&quot;: &lt;EXPIRES_IN&gt;
&#125;
```

**Response Contents**

| Value Placeholder | Value |
| --- | --- |
| `&lt;ACCESS_TOKEN&gt;`  &lt;br&gt;*Numeric string* | A long-lived Instagram User Access Token. |
| `&lt;TOKEN_TYPE&gt;`  &lt;br&gt;*String* | `bearer` |
| `&lt;EXPIRES_IN&gt;`  &lt;br&gt;_Integer_ | The number of seconds until the long-lived token expires. |

### cURL Example

#### Request

```html
curl -X GET \
  &#039;https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&amp;access_token=F4RVB...&#039;
```

#### Response

```json
&#123;
  &quot;access_token&quot;: &quot;c3oxd...&quot;,
  &quot;token_type&quot;: &quot;bearer&quot;,
  &quot;expires_in&quot;: 5183944
&#125;
```

## Updating

This operation is not supported.

## Deleting

This operation is not supported.
</pre></body></html>