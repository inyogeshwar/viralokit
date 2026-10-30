<html><head><title>Access Token</title><meta charset="UTF-8" /><style nonce="TjWrUcFy">body { font-family: monospace; margin: 20px; }pre { white-space: pre-wrap; word-wrap: break-word; }</style></head><body><pre data-testid="developer-docs-markdown-page"># Access Token



The `/access_token` endpoint allows you to exchange short-lived Instagram User Access Tokens, those that expire in one hour, for long-lived Instagram User access Tokens that expire in 60 days.

## Creating

This operation is not supported.

## Reading

**`GET /access_token`**

Exchange a short-lived Instagram User access token, that expires in one hour, for long-lived Instagram User access token that expires in 60 days.

### Limitations

Requests for long-lived tokens include your app secret so should only be made in server-side code, never in client-side code or in an app binary that could be decompiled. Do not share your app secret with anyone, expose it in code, send it to a client, or store it in a device.

### Requirements

#### Access tokens

* An Instagram User access token requested from a person who can send a message from the Instagram professional account

#### Base URL
All endpoints can be accessed via the graph.instagram.com host.

#### Endpoints

* `/access_token`

#### Required Parameters

The following table contains the required parameters for each API request.

| Key | Value |
| --- | --- |
| `client_secret`  &lt;br&gt;**Required**  &lt;br&gt;*String* | Your Instagram app&#039;s secret from the App Dashboard |
| `grant_type`  &lt;br&gt;**Required**  &lt;br&gt;*String* | Set this to `ig_exchange_token` |
| `access_token`  &lt;br&gt;**Required**  &lt;br&gt;*String* | The valid (unexpired) short-lived Instagram User Access Token that you want to exchange for a long-lived token. |

#### Permissions

* `instagram_basic` for apps that implemented Facebook Login for Business
* `instagram_business_basic` for apps that implemented Business Login for Instagram

### Request Syntax

_Formatted for readability._

```
GET https://graph.instagram.com/access_token
  ?grant_type=ig_exchange_token
  &amp;client_secret=&lt;INSTAGRAM_APP_SECRET&gt;
  &amp;access_token=&lt;VALID_SHORT_LIVED_ACCESS_TOKEN&gt;
```

### Response

Upon success, your app receives a JSON-formatted object containing the following:

* `access_token` set to the new, long-lived Instagram User access token; _numeric string_
* `token_type` set to `bearer`; _string_
* `expires_in` set to the number of seconds until the token expires; _integer_

### cURL Example

#### Request

```curl
curl -X GET &quot;https://graph.instagram.com/access_token?grant_type=ig_exchange_token&amp;&amp;client_secret=eb87G...&amp;access_token=IGQVJ...&quot;
```

#### Response

```json
&#123;
  &quot;access_token&quot;: &quot;lZAfb2dhVW...&quot;,
  &quot;token_type&quot;: &quot;bearer&quot;,
  &quot;expires_in&quot;: 5184000
&#125;
```

## Updating

This operation is not supported.

## Deleting

This operation is not supported.
</pre></body></html>