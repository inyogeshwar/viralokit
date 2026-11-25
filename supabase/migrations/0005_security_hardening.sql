-- Migration 0005: Security hardening
-- Closes cross-tenant gaps found in the 2026-11-25 audit.
-- Safe to run on an existing project: every statement is idempotent.

-- 1. growth_funnels.user_id was nullable. A funnel without an owner is not
--    covered by `auth.uid() = user_id` policies, so any row without an owner is
--    unreachable by users and can only be mutated by privileged roles.
--    Backfill from the related Instagram account where possible, then delete
--    any genuinely orphaned rows before making the column NOT NULL.
UPDATE public.growth_funnels AS f
SET user_id = a.user_id
FROM public.instagram_accounts AS a
WHERE f.user_id IS NULL
  AND a.instagram_user_id = f.instagram_account_id;

DELETE FROM public.growth_funnels WHERE user_id IS NULL;

ALTER TABLE public.growth_funnels
  ALTER COLUMN user_id SET NOT NULL;

-- 2. Ensure RLS is enabled everywhere, including tables added by later
--    migrations. Idempotent on projects that already enabled it.
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.instagram_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.post_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.auto_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.growth_funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.funnel_logs ENABLE ROW LEVEL SECURITY;

-- 3. auto_replies only had SELECT/INSERT policies. Add owner-scoped write
--    policies so a compromised anon key cannot modify another tenant's rows.
DROP POLICY IF EXISTS "Users can update own auto_replies" ON public.auto_replies;
CREATE POLICY "Users can update own auto_replies" ON public.auto_replies
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.instagram_accounts
    WHERE instagram_accounts.instagram_user_id = auto_replies.instagram_account_id
      AND instagram_accounts.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete own auto_replies" ON public.auto_replies;
CREATE POLICY "Users can delete own auto_replies" ON public.auto_replies
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.instagram_accounts
    WHERE instagram_accounts.instagram_user_id = auto_replies.instagram_account_id
      AND instagram_accounts.user_id = auth.uid()
  )
);

-- 4. funnel_logs only had SELECT. Add owner-scoped write policies; the webhook
--    uses a service-role key and remains able to write through RLS.
DROP POLICY IF EXISTS "Users can insert own funnel logs" ON public.funnel_logs;
CREATE POLICY "Users can insert own funnel logs" ON public.funnel_logs
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.growth_funnels
    WHERE growth_funnels.id = funnel_logs.funnel_id
      AND growth_funnels.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update own funnel logs" ON public.funnel_logs;
CREATE POLICY "Users can update own funnel logs" ON public.funnel_logs
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.growth_funnels
    WHERE growth_funnels.id = funnel_logs.funnel_id
      AND growth_funnels.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete own funnel logs" ON public.funnel_logs;
CREATE POLICY "Users can delete own funnel logs" ON public.funnel_logs
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.growth_funnels
    WHERE growth_funnels.id = funnel_logs.funnel_id
      AND growth_funnels.user_id = auth.uid()
  )
);
