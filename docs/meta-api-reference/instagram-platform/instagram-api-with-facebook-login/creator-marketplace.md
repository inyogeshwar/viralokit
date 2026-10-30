<html><head><title>Creator Discovery API</title><meta charset="UTF-8" /><style nonce="HqgtlYrK">body { font-family: monospace; margin: 20px; }pre { white-space: pre-wrap; word-wrap: break-word; }</style></head><body><pre data-testid="developer-docs-markdown-page"># Creator Discovery API



**Note:** **New: the Discovery API now returns Facebook creators.** Creator search covers creators who publish on Facebook as well as Instagram. Instagram remains the default everywhere in this API — on the `platform` parameter of a creator search, and on `.platform()` for the `insights` field and the `recent_media` edge — so requests you make today return exactly what they return now. Facebook data is always opt-in.

Creator Marketing Hub is where you can discover and evaluate Instagram and Facebook creators for [partnership ads](https://help.instagram.com/292748974937716). The API offers personalized creator recommendations and search using authenticated, real-time first-party data to help your brand find the right creators for your partnership ad campaigns.

This API is available with both the [Instagram API with Facebook Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login) and the [Instagram API with Unified Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login).

## Before you begin

### Permissions

To use these APIs, permissions must be granted using [Facebook Login](https://developers.facebook.com/documentation/facebook-login). These permissions are required to access the Creator Discovery API:

- `instagram_creator_marketplace_discovery`
- `instagram_basic`
- `pages_manage_metadata`
- `pages_show_list`
- `business_management`

Note: For the `instagram_creator_marketplace_discovery` permission, your app must have **advanced access**, which requires app review. When you first get access to `instagram_creator_marketplace_discovery` permission, you will be auto-granted standard access. Standard access will give you access to test data for testing and implementation purposes.

### Eligibility

In the brand onboarding flow, Meta will check if your brand is [eligible for Instagram&#039;s creator marketplace](https://help.instagram.com/672550269221197/?helpref=related_articles). If your brand is eligible but has not onboarded to the creator marketplace, you will need to accept the [Instagram Creator Marketplace Terms of Service](https://www.facebook.com/business/help/488723392994445).

### Access Tokens

This API requires a [Page access token](https://developers.facebook.com/documentation/facebook-login/guides/access-tokens#pagetokens) for a Page that is connected to your brand&#039;s Instagram business account and is either eligible to onboard or has onboarded to Instagram&#039;s creator marketplace as a brand.

If you use the [Instagram API with Unified Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login), use a [Business Integration System User (BISU) access token](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login/authentication) instead. The access token must cover your brand&#039;s Instagram professional account, and that account must be either eligible to onboard or onboarded to Instagram&#039;s creator marketplace as a brand.

## Rate Limits

The Creator Discovery API enforces rate limits at both the Instagram account level and the application level.

- Account-level limits: Requests are capped at 5000 per user per hour.
- Application-level limits: The number of calls an app can make within a rolling one-hour window is calculated as: `Calls per hour = 5000 * Number of Effective Users`. **Number of Effective Users** is determined by the app&#039;s number of unique daily active users (DAUs). If your app experiences fluctuating usage, such as higher activity on weekends and lower activity during weekdays, the calculation may use weekly or monthly active users to better reflect typical usage patterns instead.

## App Review
### Instructions for Developers
Your app review should clearly demonstrate how your app authenticates users and accesses data from Instagram&#039;s creator marketplace.
#### 1. Authentication Process
- **UI (user-facing) apps:**
    - Before you begin recording your demo for app review, ensure that you have included the `instagram_creator_marketplace_discovery` permission in your configuration. You can access this permission by using the existing Instagram Creator Marketplace template during setup.
    - Show the complete, end-to-end Facebook Login flow inside your app. The login flow should match the video in the [Login Flow Experience](#login-flow-experience) section below as closely as possible.
    - Show the user connecting their Instagram account via a linked Facebook Page.
    - Clearly show where the user (brand) reviews and grants consent for creator search. Your app review video should clearly show the list of permissions and ensure that &quot;Discover content creators on the Instagram Creator Marketplace platform&quot; is visible.
    - Example screencast: [How to produce a screencast for app review](https://developers.facebook.com/videos/2021/developing-for-success-how-to-produce-a-screencast-for-app-review/)
- **Server-to-server (S2S, no UI) apps:**
    - Explain your backend authentication setup (system users, tokens, permissions).
    - Clearly state that your app is server-to-server in your submission.
    - Confirm in the screencast that the app operates as S2S.
    - If direct testing isn&#039;t possible, provide detailed use cases and evidence supporting the S2S workflow.
#### 2. End-to-End Permission Usage
1. Explain and demonstrate how you use the `instagram_creator_marketplace_discovery` permission to discover creators. Include the specific purpose for why the app needs this functionality.
2. In your recorded video, demonstrate how you perform a creator search on your app UI using the Creator Discovery API.
3. Show how your app retrieves and processes creator insights, such as creator bio, follower count, and account reach.

### Login Flow Experience

## Discovery API

The Discovery API provides personalized creator recommendations to your authenticated brand by leveraging existing data from all over Instagram, thus allowing you to discover relevant creators personalized to your brand and ad campaigns.

Instagram&#039;s creator marketplace prioritizes creators who will perform well in your brand&#039;s partnership ads campaigns.

### Example request

```html
curl -G \
  -d &#039;access_token=&lt;ACCESS_TOKEN&gt;&#039; \
  &#039;https://graph.facebook.com/v25.0/&lt;IG_USER_ID&gt;/creator_marketplace_creators&#039;
```

### API Parameters
- When a creator username is specified, other filter parameters (e.g., `creator_countries`) cannot be applied.
- When `similar_to_creators` is used, keyword search (`query`) cannot be used.
- `query` can be combined with other filters (e.g., `creator_age_bucket`).
- If the searched username (`username`) matches the username of an eligible professional account, that account will be returned regardless of its creator marketplace onboarding status.

| Name | Description |
| --- | --- |
| `creator_countries` | Filter creators based on their country. Input will be the country ISO code. For example: `creator_countries=[&#039;US&#039;]` |
| `creator_min_followers` | Minimum follower count for creators.&lt;br&gt;**Values:**&lt;br&gt;`0`, `10000`, `25000`, `50000`, `75000`, `100000`, `250000`, `1000000`. |
| `creator_max_followers` | Maximum follower count for creators.&lt;br&gt;**Values:**&lt;br&gt;`10000`, `25000`, `50000`, `75000`, `100000`, `250000`, `1000000`. |
| `creator_age_bucket` | Filter creators based on their age range.&lt;br&gt;**Values:**&lt;br&gt;`18_to_24`,  `25_to_34`, `35_to_44`, `45_to_54`, `55_to_64`, `65_and_above`. |
| `creator_interests` | Filter creators based on category list input.&lt;br&gt;**Values:**&lt;br&gt;`ANIMALS_AND_PETS`, `BOOKS_AND_LITERATURE`, `BUSINESS_FINANCE_AND_ECONOMICS`, `EDUCATION_AND_LEARNING`, `BEAUTY`, `FASHION`, `FITNESS_AND_WORKOUTS`, `FOOD_AND_DRINK`, `GAMES_PUZZLES_AND_PLAY`, `HISTORY_AND_PHILOSOPHY`, `HOLIDAYS_AND_CELEBRATIONS`, `HOME_AND_GARDEN`, `MUSIC_AND_AUDIO`, `PERFORMING_ARTS`, `SCIENCE_AND_TECH`, `SPORTS`, `TV_AND_MOVIES`, `TRAVEL_AND_LEISURE_ACTIVITIES`, `VEHICLES_AND_TRANSPORTATION`, `VISUAL_ARTS_ARCHITECTURE_AND_CRAFTS` |
| `creator_gender` | Filter creators based on their gender.&lt;br&gt;**Values:**&lt;br&gt;`male`, `female`. |
| `creator_states` | Filter creators based on their state or region for available countries. Input will be the state ISO code list.&lt;br&gt;&lt;br&gt;Requires exactly one `creator_countries` value. |
| `creator_min_engaged_accounts` | Minimum engagement metric of the audience for a creator&#039;s content.&lt;br&gt;**Values:**&lt;br&gt;`0`, `2000`, `10000`, `50000`, `100000`. |
| `creator_max_engaged_accounts` | Maximum engagement metric of the audience for a creator&#039;s content.&lt;br&gt;**Values:**&lt;br&gt;`2000`, `10000`, `50000`, `100000` |
| `major_audience_age_bucket` | Filter creators based on their audience&#039;s age group.&lt;br&gt;**Values:**&lt;br&gt;`18_to_24`, `25_to_34`, `35_to_44`, `45_to_54`, `55_to_64`, `65_and_above` |
| `major_audience_gender` | Filter creators based on their audience&#039;s gender.&lt;br&gt;**Values:**&lt;br&gt;`male`, `female` |
| `major_audience_countries` | Filter creators based on the location of their audience. Input will be the country ISO code list. |
| `major_audience_states` | Filter creators based on the state or region of their audience for available countries. Input will be the state ISO code list.&lt;br&gt;&lt;br&gt;Requires exactly one `major_audience_countries` value. |
| `query` | A free-text search to find creators based on a list of keywords (e.g., username or content-related terms).&lt;br&gt;For example: to find travel-related accounts, use `query=travel`. |
| `similar_to_creators` | A list of creators similar to the specified creator. **Limited to only onboarded creators,** input can be a list of usernames and the maximum username input is 5. |
| `recommendation_type` | The recommendation type based on information including creative style, partnership experience, follower demographics and more for your brand. We support the following values:&lt;br&gt;&lt;br&gt;- `most_relevant_for_me`: Return creators most relevant for you.&lt;br&gt;- `high_ad_performance`: Return creators who are expected to deliver high ad performance for you.&lt;br&gt;- `most_ads_experience`: Return creators with the most ads experience.&lt;br&gt;- `similar_brands`: Return creators who&#039;ve partnered with brands like you.&lt;br&gt;- `similar_audience`: Return creators similar to creators you&#039;ve worked with before.&lt;br&gt;- `interested_in_collaboration`: Return creators who are interested in collaborating with you. |
| `username` | The creator&#039;s Instagram username |
| `custom_audience_id` | ID of the custom audience (obtained from the `creator_marketplace_brand_info` endpoint) to filter creators whose follower base overlaps with the specified audience. |
| `reels_interaction_rate` | The percentage of views that liked, commented, shared and saved this creator&#039;s recent reels. This is calculated as the number of views that engaged with the reels divided by the total number of initial views. |
| `major_audience_device_type` | Filter creators based on their audience&#039;s primary device type. Results are filtered to only include creators whose majority audience uses the specified device type(s). Accepts an array of values.&lt;br&gt;**Values:**&lt;br&gt;`ios`, `android` |
| `creator_latest_post_activity` | Filter creators who recently created a public post or reel. Results are filtered to only include creators who have posted within the specified time window.  Accepts a single value.&lt;br&gt;**Values:**&lt;br&gt;`last_7_days`, `last_30_days`, `last_90_days` |
| `creator_follower_growth` | Filter creators with top follower growth within the last 30 days, compared with similar creators. Results are filtered to only include creators whose follower growth ranks in the specified percentile.  Accepts a single value.&lt;br&gt;**Values:**&lt;br&gt;`top_10_percent`, `top_30_percent`, `top_50_percent` |
| `platform`&lt;br&gt;&lt;br&gt;**New** | Filter creators based on the platform they publish on. Accepts a single value, not a list. Defaults to `instagram` when omitted.&lt;br&gt;**Values:**&lt;br&gt;&lt;br&gt;- `instagram`: Creators on Instagram. They may also be on Facebook.&lt;br&gt;- `facebook`: Creators on Facebook. They may also be on Instagram.&lt;br&gt;- `both`: Only creators who are on Instagram and Facebook, with the two accounts linked.&lt;br&gt;- `any`: Creators on either platform. |
| `page_name`&lt;br&gt;&lt;br&gt;**New** | Look up a creator by the name of their Facebook Page. This is a name search rather than an exact Page lookup, and it returns the single best match rather than a ranked list.&lt;br&gt;&lt;br&gt;If you pass both `page_name` and `username`, `username` takes precedence and `page_name` is ignored. |
| `creator_language`&lt;br&gt;&lt;br&gt;**New** | Filter creators based on the language they are predicted to create in. Input will be a list of ISO 639-1 language codes. Maximum of 10 values. |
| `has_portfolio`&lt;br&gt;&lt;br&gt;**New** | Filter creators based on whether they have published a portfolio.&lt;br&gt;**Values:**&lt;br&gt;`true`, `false` |
| `has_public_contact_email`&lt;br&gt;&lt;br&gt;**New** | Filter creators based on whether they offer a public contact email on their profile.&lt;br&gt;**Values:**&lt;br&gt;`true`, `false` |
| `exclude_messaged_creators`&lt;br&gt;&lt;br&gt;**New** | Exclude creators your brand has already messaged.&lt;br&gt;**Values:**&lt;br&gt;`true`, `false` |
| `verified_account`&lt;br&gt;&lt;br&gt;**New** | Filter creators based on whether their Instagram account is verified.&lt;br&gt;**Values:**&lt;br&gt;`true`, `false` |
| `featured_in_paid_ads`&lt;br&gt;&lt;br&gt;**New** | Filter creators based on whether they have been featured in paid ads.&lt;br&gt;**Values:**&lt;br&gt;`true`, `false` |

### Response fields

A search returns creators on Instagram unless you ask for Facebook creators. Without the `platform` parameter, every result is an Instagram creator, so only the Instagram creator column applies. Pass `platform` to include creators on Facebook.

| Name | Description | Instagram creator | Facebook creator&lt;br&gt;&lt;br&gt;**New** |
| --- | --- | --- | --- |
| `username` | The Instagram handle or username of the creator.&lt;br&gt;&lt;br&gt;Use `page_name` when you need a display name for a Facebook creator. | Yes | No |
| `is_account_verified` | Indicates whether the creator&#039;s Instagram account is verified. | Yes | Yes |
| `biography` | The bio or description provided by the creator on their Instagram profile. | Yes | Yes |
| `country` | The country in which the creator is based. | Yes | Yes |
| `gender` | The gender of the creator (only available for onboarded creators). | Yes | Yes |
| `age_bucket` | The age range or bucket to which the creator belongs, only available for onboarded creators. `18-24`, `25-34`. | Yes | Yes |
| `insights` | Metric insights of a creator, such as `account_engaged_count:30` | Yes | Yes, for a subset of metrics |
| `onboarded_status` | Whether a creator has been onboarded to the creator marketplace. | Yes | Yes |
| `id` | Instagram ID&lt;br&gt;&lt;br&gt;For a creator who is only on Facebook this is an app-scoped Facebook user ID, not an Instagram ID. | Yes | Yes |
| `email` | Creator&#039;s email, if available | Yes | Yes |
| `badges` | The badges of the creator. Supported values include:&lt;br&gt;&lt;br&gt;- `Partnership ads`: This creator has experience with partnership ads.&lt;br&gt;- `Branded content`: This creator has experience with branded content.&lt;br&gt;- `Strong hooks`: Users frequently view this creator&#039;s content past the first 3 seconds.&lt;br&gt;- `Engaging reels`: Users like, comment and share this creator&#039;s reels per view more often than similar creators&#039; reels.&lt;br&gt;- `Responsive`: This creator typically responds within 48 hours. | Yes | Yes |
| `portfolio_url` | Creator&#039;s portfolio URL, if available | Yes | Yes |
| `profile_picture_url` | The URL of the creator&#039;s profile picture, if available. | Yes | Yes |
| `has_brand_partnership_experience` | Whether the creator has branded content or partnership ads collaboration experience in the past year.&lt;br&gt;&lt;br&gt;For this field to return values, `username` has to be specified in the API call. | Yes | No |
| `past_brand_partnership_partners` | The brands the creator has collaborated with on branded content or partnership ads in the past year.&lt;br&gt;&lt;br&gt;For this field to return values, `username` has to be specified in the API call. | Yes | No |
| `branded_content_media` | Returns the 30 most recent branded content organic media of a particular creator. See insights section for supported fields.&lt;br&gt;&lt;br&gt;For this field to return values, `username` has to be specified in the API call. | Yes | Yes |
| `recent_media` | Returns the top 30 recent media of a particular creator. See insights section for supported fields.&lt;br&gt;&lt;br&gt;For this field to return values, `username` has to be specified in the API call. | Yes | Yes |
| `past_partnership_ads_media` | Returns media where this creator has partnered with advertisers to co-create ads. Only includes partnership ads that have been active within the past year.&lt;br&gt;&lt;br&gt;For this field to return values, `username` has to be specified in the API call.&lt;br&gt;&lt;br&gt;**Note:** Insights are not available for `past_partnership_ads_media`. | Yes | Yes |
| `platforms`&lt;br&gt;&lt;br&gt;**New** | The platforms where this creator has content that the creator marketplace can surface. An array of strings.&lt;br&gt;&lt;br&gt;**Values:** `[&quot;instagram&quot;]`, `[&quot;facebook&quot;]`, `[&quot;instagram&quot;, &quot;facebook&quot;]` | Yes | Yes |
| `page_id`&lt;br&gt;&lt;br&gt;**New** | The ID of the creator&#039;s Facebook Page. | No | Yes |
| `page_name`&lt;br&gt;&lt;br&gt;**New** | The name of the creator&#039;s Facebook Page. | No | Yes |
| `category`&lt;br&gt;&lt;br&gt;**New** | The category the creator has selected for their professional account, if available. | Yes | Yes |
| `is_brand_following_creator`&lt;br&gt;&lt;br&gt;**New** | Indicates whether your brand follows the creator on Instagram. | Yes | No |
| `is_creator_following_brand`&lt;br&gt;&lt;br&gt;**New** | Indicates whether the creator follows your brand on Instagram. | Yes | No |

#### Example request

```html
curl -G \
  -d &#039;creator_countries=[&quot;US&quot;]&#039; \
  -d &#039;fields=id,username,country,gender&#039; \
  -d &#039;access_token=&lt;ACCESS_TOKEN&gt;&#039; \
  &#039;https://graph.facebook.com/v25.0/&lt;IG_USER_ID&gt;/creator_marketplace_creators&#039;
```

#### Example response

```json
&#123;
  &quot;data&quot;: [
    &#123;
      &quot;id&quot;: &quot;178414869381437360&quot;,
      &quot;username&quot;: &quot;xxx&quot;,
      &quot;country&quot;: &quot;BR&quot;,
      &quot;gender&quot;: &quot;female&quot;
    &#125;,
    &#123;
      &quot;id&quot;: &quot;178414965628223823&quot;,
      &quot;username&quot;: &quot;xxx&quot;,
      &quot;country&quot;: &quot;IN&quot;,
      &quot;gender&quot;: &quot;male&quot;
    &#125;
  ]
&#125;
```

#### Example request: search across both platforms

```html
curl -G \
  -d &#039;platform=any&#039; \
  -d &#039;creator_countries=[&quot;US&quot;]&#039; \
  -d &#039;fields=id,username,page_id,page_name,platforms&#039; \
  -d &#039;access_token=&lt;ACCESS_TOKEN&gt;&#039; \
  &#039;https://graph.facebook.com/v25.0/&lt;IG_USER_ID&gt;/creator_marketplace_creators&#039;
```

#### Example response

```json
&#123;
  &quot;data&quot;: [
    &#123;
      &quot;id&quot;: &quot;17841486938143736&quot;,
      &quot;username&quot;: &quot;xxx&quot;,
      &quot;platforms&quot;: [&quot;instagram&quot;]
    &#125;,
    &#123;
      &quot;id&quot;: &quot;10465259075662&quot;,
      &quot;page_id&quot;: &quot;104965259075662&quot;,
      &quot;page_name&quot;: &quot;Example Page&quot;,
      &quot;platforms&quot;: [&quot;facebook&quot;]
    &#125;,
    &#123;
      &quot;id&quot;: &quot;17841496562822382&quot;,
      &quot;username&quot;: &quot;yyy&quot;,
      &quot;page_id&quot;: &quot;112233445566778&quot;,
      &quot;page_name&quot;: &quot;Another Example Page&quot;,
      &quot;platforms&quot;: [&quot;instagram&quot;, &quot;facebook&quot;]
    &#125;
  ]
&#125;
```

The first creator has no `page_id` or `page_name`, and the second has no `username`. Both are expected. Use `platforms` to decide which fields to read.

#### Example request: look up a creator by Facebook Page name

```html
curl -G \
  -d &#039;page_name=Example Page&#039; \
  -d &#039;fields=id,username,page_id,page_name,platforms&#039; \
  -d &#039;access_token=&lt;ACCESS_TOKEN&gt;&#039; \
  &#039;https://graph.facebook.com/v25.0/&lt;IG_USER_ID&gt;/creator_marketplace_creators&#039;
```

### Error codes

| Error Code | Description |
| --- | --- |
| `10` Permission Denied&lt;br&gt;&lt;br&gt;App Missing Permission&lt;br&gt; | The app lacks the required `instagram_creator_marketplace_discovery` permission. |
| `10` Permission Denied | Brand Eligibility&lt;br&gt;&lt;br&gt;The brand is not eligible to onboard to the creator marketplace, so the API call cannot be made.&lt;br&gt; |
| `100` Invalid Parameter Input | General message for invalid API parameter inputs (e.g., account follower count minimum bound exceeds the upper bound, category exceeds the limit of 5). |

| Error Code | Description |
| --- | --- |
| `100` Invalid Parameter Input&lt;br&gt;&lt;br&gt;No creator matched `page_name`&lt;br&gt; | No creator in the creator marketplace matched the name passed in `page_name`. The Page may not exist, or it may exist without being onboarded to the creator marketplace. |

## Creator Insights API

The Creator Insights API allows you to access performance metrics for individual creators, including follower counts, audience engagement, and reach data. Use the `username` parameter to query insights for a specific creator.

### Creator Insights Metrics

The following metrics are available when querying creator insights. Each metric supports specific time periods, ranges, and granularity breakdowns.

Not every metric is available for both kinds of creator. Requesting a metric for a creator on a platform that does not support it returns error code `100`.

`total_views` and `account_interactions` support their breakdowns only with `period(overall)`. Combining a breakdown with `period(day)` on either metric returns error code `100`. Neither metric supports the `lifetime` time range.

| Metric | Supported Periods | Supported Time Range | Supported Granularity | Instagram creator | Facebook creator&lt;br&gt;&lt;br&gt;**New** |
| --- | --- | --- | --- | --- | --- |
| `total_followers` | Overall | Lifetime | NA | Yes | Yes |
| `creator_engaged_accounts` | Day, Overall | `this_week`, `last_14_days`, `this_month` | `follow_type`, `gender`, `age`, `top_countries`, `top_cities` | Yes | No |
| `creator_reach` | Day, Overall | `this_week`, `last_14_days`, `this_month` | `follow_type`, `media_type` | Yes | No |
| `reels_interaction_rate` | Overall | `last_90_days` | NA | Yes | Yes |
| `reels_hook_rate` | Overall | `last_90_days` | NA | Yes | Yes |
| `total_views`&lt;br&gt;&lt;br&gt;**New** | Day, Overall | `this_week`, `last_14_days`, `this_month` | `follow_type`, `media_type` | Yes | Yes |
| `account_interactions`&lt;br&gt;&lt;br&gt;**New** | Day, Overall | `this_week`, `last_14_days`, `this_month` | `follow_type`, `media_type` | Yes | Yes |

### Example request

```html
curl -G \
  -d &#039;username=&lt;CREATOR_USERNAME&gt;&#039; \
  -d &#039;fields=insights.metrics(creator_reach).breakdown(follow_type)&#039; \
  -d &#039;access_token=&lt;ACCESS_TOKEN&gt;&#039; \
  &#039;https://graph.facebook.com/v25.0/&lt;IG_USER_ID&gt;/creator_marketplace_creators&#039;
```

### Cross-platform creator insights

Add `.platform()` to the `insights` field to choose which platforms a metric is resolved against. Unlike the `platform` parameter on the Discovery API, `.platform()` accepts more than one value.

```html
curl -G \
  -d &#039;username=&lt;CREATOR_USERNAME&gt;&#039; \
  -d &#039;fields=insights.metrics(total_views).period(overall).time_range(last_14_days).platform(instagram,facebook)&#039; \
  -d &#039;access_token=&lt;ACCESS_TOKEN&gt;&#039; \
  &#039;https://graph.facebook.com/v25.0/&lt;IG_USER_ID&gt;/creator_marketplace_creators&#039;
```

Each requested platform returns its own entry, tagged with a `platform` key:

```json
&#123;
  &quot;insights&quot;: &#123;
    &quot;data&quot;: [
      &#123;
        &quot;name&quot;: &quot;total_views&quot;,
        &quot;platform&quot;: &quot;instagram&quot;,
        &quot;period&quot;: &quot;overall&quot;,
        &quot;time_range&quot;: &quot;last_14_days&quot;,
        &quot;total_value&quot;: &#123;
          &quot;value&quot;: 404042
        &#125;
      &#125;,
      &#123;
        &quot;name&quot;: &quot;total_views&quot;,
        &quot;platform&quot;: &quot;facebook&quot;,
        &quot;period&quot;: &quot;overall&quot;,
        &quot;time_range&quot;: &quot;last_14_days&quot;,
        &quot;total_value&quot;: &#123;
          &quot;value&quot;: 321
        &#125;
      &#125;
    ]
  &#125;
&#125;
```

Values are never combined across platforms. There is no cross-platform total, so add the per-platform values yourself if you need one.

If you omit `.platform()`, the response keeps its current shape: Instagram data only, with no `platform` key on each entry. Requesting a metric on a platform that does not support it returns error code `100`.

### Media Insights Metrics

A media edge returns Instagram media unless you ask for Facebook media. Without `.platform()` on `recent_media`, every item is Instagram media, so only the Instagram media column applies. The `insights` field on a media item accepts `.platform()` as well, and all four media metrics, `likes`, `comments`, `views`, and `shares`, are supported on both platforms.

A creator&#039;s media list can mix Instagram and Facebook items. Read the `platform` field on each media item to decide which permalink and type fields to use, rather than reading the creator&#039;s `platforms` field.

| Name | Description | Instagram media | Facebook media&lt;br&gt;&lt;br&gt;**New** |
| --- | --- | --- | --- |
| `id` | Media id of the content&lt;br&gt;&lt;br&gt;**Example:** `17841463918802342` | Yes | Yes |
| `product_type` | The media product type&lt;br&gt;&lt;br&gt;**Example:** `Reels` | Yes | No |
| `media_type` | The media type&lt;br&gt;&lt;br&gt;**Example:** `Image` | Yes | No |
| `permalink` | The permalink of the media&lt;br&gt;&lt;br&gt;**Example:** `https://www.instagram.com/reel/C_Tlbb-sGMi/` | Yes | No |
| `thumbnail_url` | The thumbnail URL of the media&lt;br&gt;&lt;br&gt;**Example:** `https://scontent-sjc3-1.cdninstagram.com/v/t...6A251557` | Yes | No |
| `creation_time` | The time the media was created&lt;br&gt;&lt;br&gt;**Example:** `2024-08-30T19:36:26+0000` | Yes | Yes |
| `caption` | The caption of the media&lt;br&gt;&lt;br&gt;**Example:** `Test Caption` | Yes | Yes |
| `tagged_brand` | The brand that the organic media has been paid to partner with.&lt;br&gt;&lt;br&gt;If the media is not a branded content with partnership, the field will not be returned.&lt;br&gt;&lt;br&gt;**Example:** `instagram` | Yes | Yes |
| `likes` | Total number of likes the media receives.&lt;br&gt;&lt;br&gt;**Example:** `1000` | Yes | Yes |
| `comments` | Total number of comments the media receives.&lt;br&gt;&lt;br&gt;**Example:** `500` | Yes | Yes |
| `views` | Total number of views on the media (only available for video media).&lt;br&gt;&lt;br&gt;**Example:** `30000` | Yes | Yes |
| `shares` | Total number of shares the media gets.&lt;br&gt;&lt;br&gt;**Example:** `800` | Yes | Yes |
| `platform`&lt;br&gt;&lt;br&gt;**New** | The platforms the media was published on. An array of strings.&lt;br&gt;&lt;br&gt;**Example:** `[&quot;facebook&quot;]` | Yes | Yes |
| `facebook_post_id`&lt;br&gt;&lt;br&gt;**New** | The ID of the media on Facebook.&lt;br&gt;&lt;br&gt;**Example:** `98909889290` | No | Yes |
| `facebook_permalink`&lt;br&gt;&lt;br&gt;**New** | The permalink of the media on Facebook.&lt;br&gt;&lt;br&gt;**Example:** `https://www.facebook.com/reel/C_Tlbb-sGMi/` | No | Yes |

### Example request

```html
curl -G \
  -d &#039;username=&lt;CREATOR_USERNAME&gt;&#039; \
  -d &#039;fields=branded_content_media&#123;media_type,insights.metrics(views)&#125;,recent_media&#123;media_type,insights.metrics(views)&#125;&#039; \
  -d &#039;access_token=&lt;ACCESS_TOKEN&gt;&#039; \
  &#039;https://graph.facebook.com/v25.0/&lt;IG_USER_ID&gt;/creator_marketplace_creators&#039;
```

### Cross-platform media

The `recent_media` edge accepts `.platform()`, which selects the platforms the media is drawn from. It accepts more than one value.

```html
curl -G \
  -d &#039;username=&lt;CREATOR_USERNAME&gt;&#039; \
  -d &#039;fields=recent_media.platform(instagram,facebook).limit(30)&#123;id,platform,media_type,product_type,caption,creation_time,permalink,facebook_post_id,facebook_permalink&#125;&#039; \
  -d &#039;access_token=&lt;ACCESS_TOKEN&gt;&#039; \
  &#039;https://graph.facebook.com/v25.0/&lt;IG_USER_ID&gt;/creator_marketplace_creators&#039;
```

#### Cross-platform media insights

```html
curl -G \
  -d &#039;username=&lt;CREATOR_USERNAME&gt;&#039; \
  -d &#039;fields=recent_media.platform(instagram,facebook)&#123;id,platform,insights.metrics(views,likes,comments,shares).platform(instagram,facebook)&#123;name,platform,total_value&#123;value&#125;&#125;&#125;&#039; \
  -d &#039;access_token=&lt;ACCESS_TOKEN&gt;&#039; \
  &#039;https://graph.facebook.com/v25.0/&lt;IG_USER_ID&gt;/creator_marketplace_creators&#039;
```

As with creator insights, each metric returns one entry per requested platform, tagged with a `platform` key:

```json
&#123;
  &quot;id&quot;: &quot;17886595920559627&quot;,
  &quot;platform&quot;: [&quot;instagram&quot;],
  &quot;insights&quot;: &#123;
    &quot;data&quot;: [
      &#123;
        &quot;name&quot;: &quot;views&quot;,
        &quot;platform&quot;: &quot;instagram&quot;,
        &quot;total_value&quot;: &#123;
          &quot;value&quot;: 2220
        &#125;
      &#125;,
      &#123;
        &quot;name&quot;: &quot;views&quot;,
        &quot;platform&quot;: &quot;facebook&quot;,
        &quot;total_value&quot;: &#123;
          &quot;value&quot;: 340
        &#125;
      &#125;
    ]
  &#125;
&#125;
```

### Error codes

| Error Code | Description |
| --- | --- |
| `100` Invalid Parameter Input | General message for invalid API parameter inputs (e.g., the input period is not supported by the provided metrics). |

## Brand Information API
The Brand Information API allows brands and agencies to retrieve custom audiences that are eligible for creator discovery filtering. This is the first step in the Custom Audience-based discovery workflow — call this endpoint to list available audiences, then pass the selected `custom_audience_id` to the discovery API to filter creators.

### Permissions

To use this API, permissions must be granted using [Facebook Login](https://developers.facebook.com/documentation/facebook-login). These permissions are required to access the Brand Information API:

- `instagram_creator_marketplace_discovery`
- `instagram_basic`
- `ads_management`

### Example request

```html
curl -G \
  -d &#039;access_token=&lt;ACCESS_TOKEN&gt;&#039; \
  &#039;https://graph.facebook.com/v25.0/&lt;IG_USER_ID&gt;/creator_marketplace_brand_info&#039;
```

### API Parameters

| Name | Description |
| --- | --- |
| `acting_business_id` | The agency Business ID when accessing on behalf of a client. Required for agencies to see custom audiences from ad accounts shared via Business Suite. Without this parameter, only audiences from the IG user&#039;s directly owned ad accounts are returned. |

### Response fields
| Name | Description |
| --- | --- |
| `custom_audiences_access_status` | Indicates whether the brand has access to custom audiences for creator filtering. |
| `custom_audiences` | List of custom audiences available for creator filtering. |
| `id` | The unique ID of the custom audience. Pass this value as custom_audience_id to the creator_marketplace_creators endpoint. |
| `name` | The display name of the custom audience. |

#### Example request

```html
curl -G \
  -d &#039;acting_business_id=123456&#039; \
  -d &#039;access_token=&lt;ACCESS_TOKEN&gt;&#039; \
  &#039;https://graph.facebook.com/v25.0/&lt;IG_USER_ID&gt;/creator_marketplace_brand_info&#039;
```

#### Example response

```json
&#123;
  &quot;custom_audiences_access_status&quot;: &quot;HAS_ACCESS&quot;,
  &quot;custom_audiences&quot;: [
    &#123;
      &quot;id&quot;: &quot;12354465435359&quot;,
      &quot;name&quot;: &quot;High Value Customers Q1&quot;
    &#125;,
    &#123;
      &quot;id&quot;: &quot;5645451351544564&quot;,
      &quot;name&quot;: &quot;Website Visitors 30d&quot;
    &#125;
  ]
&#125;
```

### Error codes

| Error Code | Description |
| --- | --- |
| `10` Authorization Error | The app lacks the required `ads_management` permission against the targeted ad account. |
| `100` Invalid Parameter Input | The acting_business_id does not have access to the specified IG user&#039;s ad accounts. |

## Learn More

* [App Review](https://developers.facebook.com/docs/app-review) process
* [Facebook Login](https://developers.facebook.com/documentation/facebook-login)
</pre></body></html>