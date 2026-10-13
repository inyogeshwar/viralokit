CREATE TABLE IF NOT EXISTS auto_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id TEXT NOT NULL UNIQUE,
  instagram_account_id TEXT NOT NULL,
  reply_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.auto_replies ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own auto-replies
CREATE POLICY "Users can view own auto_replies" ON public.auto_replies
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.instagram_accounts
    WHERE instagram_accounts.instagram_user_id = auto_replies.instagram_account_id
      AND instagram_accounts.user_id = auth.uid()
  )
);

-- Allow users to insert their own auto-replies
CREATE POLICY "Users can insert own auto_replies" ON public.auto_replies
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.instagram_accounts
    WHERE instagram_accounts.instagram_user_id = auto_replies.instagram_account_id
      AND instagram_accounts.user_id = auth.uid()
  )
);

