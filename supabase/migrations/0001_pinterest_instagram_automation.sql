-- Pinterest -> Instagram automation
CREATE TABLE IF NOT EXISTS public.pinterest_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  pinterest_user_id TEXT,
  username TEXT,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pinterest_instagram_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pinterest_pin_id TEXT NOT NULL,
  pinterest_board_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  source_url TEXT,
  caption TEXT NOT NULL DEFAULT '',
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'publishing', 'published', 'failed', 'cancelled')),
  instagram_media_id TEXT,
  instagram_permalink TEXT,
  error_message TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, pinterest_pin_id)
);

ALTER TABLE public.pinterest_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pinterest_instagram_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own Pinterest account"
  ON public.pinterest_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own Pinterest account"
  ON public.pinterest_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own Pinterest account"
  ON public.pinterest_accounts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own Pinterest account"
  ON public.pinterest_accounts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own Pinterest Instagram queue"
  ON public.pinterest_instagram_queue FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own Pinterest Instagram queue"
  ON public.pinterest_instagram_queue FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own Pinterest Instagram queue"
  ON public.pinterest_instagram_queue FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own Pinterest Instagram queue"
  ON public.pinterest_instagram_queue FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS pinterest_instagram_queue_due_idx
  ON public.pinterest_instagram_queue (status, scheduled_for);
