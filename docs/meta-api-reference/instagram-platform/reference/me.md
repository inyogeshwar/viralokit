<html><head><title>Me</title><meta charset="UTF-8" /><style nonce="epkN2gJr">body { font-family: monospace; margin: 20px; }pre { white-space: pre-wrap; word-wrap: break-word; }</style></head><body><pre data-testid="developer-docs-markdown-page"># Me



This is a special endpoint that examines the Instagram User Access Token included in the request, determines the ID of the Instagram user who granted the token, and uses the ID to query the User endpoint.

## Creating

This operation is not supported.

## Reading

**`GET /me`**

Get fields and edges on the User whose Instagram User Access Token is being used in the query. This endpoint translates to `GET /&#123;user-id&#125;`, based on the User ID identified by the access token used in the query.

### Request Syntax

```
GET https://graph.instagram.com/v26.0/me
  ?fields=&#123;fields&#125;
  &amp;access_token=&#123;access-token&#125;
```

Refer to the User node reference for requirements and usage details.

## Updating

This operation is not supported.

## Deleting

This operation is not supported.
</pre></body></html>