import { pgTable, text, timestamp, integer, jsonb, uuid } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workosUserId: text("workos_user_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const instagramAccounts = pgTable("instagram_accounts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workosUserId: text("workos_user_id").notNull(),
  instagramUserId: text("instagram_user_id").notNull(),
  username: text("username"),
  profilePictureUrl: text("profile_picture_url"),
  accessTokenEncrypted: text("access_token_encrypted").notNull(),
  tokenExpiresAt: timestamp("token_expires_at"),
  capabilitiesJson: jsonb("capabilities_json").$type<{
    canPublish: boolean;
    canPublishCarousel: boolean;
    canFetchInsights: boolean;
    canDeleteMedia: boolean;
    checkedAt: string;
    reason?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workosUserId: text("workos_user_id").notNull(),
  instagramAccountId: text("instagram_account_id"),
  instagramMediaId: text("instagram_media_id"),
  mediaType: text("media_type").notNull(), // 'IMAGE' | 'CAROUSEL'
  caption: text("caption"),
  status: text("status").notNull().default("draft"), // 'draft' | 'uploading' | 'creating_container' | 'processing' | 'publishing' | 'published' | 'failed' | 'deleting' | 'deleted' | 'delete_failed'
  permalink: text("permalink"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const postMedia = pgTable("post_media", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  postId: text("post_id").notNull(),
  cloudinaryPublicId: text("cloudinary_public_id").notNull(),
  secureUrl: text("secure_url").notNull(),
  width: integer("width"),
  height: integer("height"),
  format: text("format"),
  position: integer("position").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const postMetrics = pgTable("post_metrics", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  postId: text("post_id").notNull(),
  reach: integer("reach"),
  impressions: integer("impressions"),
  likes: integer("likes"),
  comments: integer("comments"),
  shares: integer("shares"),
  saves: integer("saves"),
  totalInteractions: integer("total_interactions"),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

export const aiGenerations = pgTable("ai_generations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workosUserId: text("workos_user_id").notNull(),
  provider: text("provider").notNull(), // 'openrouter' | 'gemini'
  model: text("model").notNull(),
  generationType: text("generation_type").notNull(), // 'image_analysis' | 'caption' | 'account_audit'
  inputMetadata: jsonb("input_metadata"),
  output: text("output").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
