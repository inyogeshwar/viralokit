-- Migration 0003: Growth Funnels, DMs & Multi-Platform Channels
-- Created for ViraloKit Mobile Social Automation Suite

CREATE TABLE IF NOT EXISTS public.growth_funnels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  instagram_account_id TEXT NOT NULL,
  keyword TEXT NOT NULL,
  public_reply_template TEXT,
  require_follow BOOLEAN DEFAULT TRUE NOT NULL,
  follow_gate_message TEXT,
  unlocked_content_text TEXT NOT NULL,
  attachment_type TEXT,
  attachment_url TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.growth_funnels ENABLE ROW LEVEL SECURITY;

-- Policies for growth_funnels
CREATE POLICY "Users can view own growth funnels" ON public.growth_funnels
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own growth funnels" ON public.growth_funnels
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own growth funnels" ON public.growth_funnels
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own growth funnels" ON public.growth_funnels
FOR DELETE USING (auth.uid() = user_id);

-- Funnel Execution Logs Table
CREATE TABLE IF NOT EXISTS public.funnel_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funnel_id UUID REFERENCES public.growth_funnels(id) ON DELETE CASCADE,
  comment_id TEXT NOT NULL,
  commenter_username TEXT,
  commenter_id TEXT,
  status TEXT NOT NULL,
  is_follower BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.funnel_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own funnel logs" ON public.funnel_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.growth_funnels
    WHERE growth_funnels.id = funnel_logs.funnel_id
      AND growth_funnels.user_id = auth.uid()
  )
);
