-- LP Chat Widget — standalone infrastructure
-- Managed from lp-tiktok-auto-poster repo, independent of rocketwa-suite.

-- Drop existing table if carried over from old setup
DROP TABLE IF EXISTS public.lp_chat_incoming CASCADE;

-- Re-create clean
CREATE TABLE public.lp_chat_incoming (
  id          uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id   uuid        NOT NULL,
  phone       text        NOT NULL,
  message     text        NOT NULL,
  session_id  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_lp_chat_incoming_session ON public.lp_chat_incoming(session_id)
  WHERE session_id IS NOT NULL;

ALTER TABLE public.lp_chat_incoming ENABLE ROW LEVEL SECURITY;

-- Open SELECT for anon — needed for Realtime subscriptions from the widget
CREATE POLICY "anon_select_lp_chat" ON public.lp_chat_incoming
  FOR SELECT USING (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.lp_chat_incoming;
ALTER TABLE public.lp_chat_incoming REPLICA IDENTITY FULL;
