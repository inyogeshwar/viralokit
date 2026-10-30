-- Migration 0004: Wishlink & Specific Post Funnels
ALTER TABLE public.growth_funnels 
ADD COLUMN IF NOT EXISTS target_media_id TEXT,
ADD COLUMN IF NOT EXISTS target_media_caption TEXT,
ADD COLUMN IF NOT EXISTS target_media_permalink TEXT,
ADD COLUMN IF NOT EXISTS funnel_type TEXT DEFAULT 'keyword';
