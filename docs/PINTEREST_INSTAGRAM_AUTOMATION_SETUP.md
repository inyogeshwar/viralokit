# Pinterest to Instagram Automation

## Setup
1. Apply `supabase/migrations/0001_pinterest_instagram_automation.sql` to the Supabase project.
2. Configure Pinterest OAuth in your Pinterest developer app and register this exact redirect URI: `https://YOUR_DOMAIN/api/pinterest/callback`.
3. Add the server-only Vercel environment variables `PINTEREST_CLIENT_ID`, `PINTEREST_CLIENT_SECRET`, `CRON_SECRET`, and `SUPABASE_SERVICE_ROLE_KEY`. Keep `ENCRYPTION_KEY` unchanged so existing encrypted Instagram credentials remain readable.
4. Deploy the feature branch, sign in, connect Instagram Professional in Settings, then open `/pinterest` and connect Pinterest.
5. Select a Board, choose an interval, and import up to 50 image Pins into the queue.

## Permissions
Pinterest OAuth requests `boards:read`, `pins:read`, and `user_accounts:read`. Your Pinterest developer app must be approved for the relevant API access. Instagram publishing continues through the existing connected-account flow and official Meta API permissions.

## Worker
The Vercel cron endpoint is `/api/cron/pinterest-publish`. It uses `CRON_SECRET` and a server-only Supabase service-role key. Check that your Vercel plan supports the configured 15-minute cron cadence; if it does not, use a scheduler cadence supported by the plan or an authorized external scheduler that calls the endpoint with `Authorization: Bearer <CRON_SECRET>`.

## Limits
- Only public HTTPS image Pins are imported, from the first page of the selected board.
- Captions are prefilled from Pin title, description, and source link; review them and ensure you have rights to repost the images.
- The worker queues a maximum of five due posts per invocation. Actual publishing time depends on cron cadence, Instagram API permissions, and media availability.
- Pinterest CDN URLs may not always be accepted by Instagram. If a post fails, use an image URL from media you control, such as your authorized Cloudinary storage.
