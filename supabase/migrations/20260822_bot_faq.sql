-- ==============================================================================
-- BOT FAQ TABLE
-- Stores dynamic FAQ entries for the homepage chatbot widget.
-- Admin can add/edit/delete via the Settings tab in the admin panel.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.bot_faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  answer TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for ordering
CREATE INDEX IF NOT EXISTS idx_bot_faq_display_order ON public.bot_faq(display_order);
CREATE INDEX IF NOT EXISTS idx_bot_faq_is_active ON public.bot_faq(is_active);

-- Enable RLS
ALTER TABLE public.bot_faq ENABLE ROW LEVEL SECURITY;

-- Public can read active FAQ entries (used by the widget on the site)
DROP POLICY IF EXISTS "BotFaq public read" ON public.bot_faq;
CREATE POLICY "BotFaq public read"
  ON public.bot_faq FOR SELECT
  USING (is_active = true OR public.is_admin());

-- Only admin can write
DROP POLICY IF EXISTS "BotFaq admin write" ON public.bot_faq;
CREATE POLICY "BotFaq admin write"
  ON public.bot_faq FOR ALL
  USING (public.is_admin());

-- Grant access
GRANT SELECT ON public.bot_faq TO anon, authenticated;
GRANT ALL ON public.bot_faq TO authenticated;

