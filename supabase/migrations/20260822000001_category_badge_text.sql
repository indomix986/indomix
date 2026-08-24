-- ==============================================================================
-- MIGRATION: ADD BADGE_TEXT TO CATEGORIES TABLE
-- Allows admin to customize the badge text shown on category cards (e.g. "أصناف متنوعة")
-- ==============================================================================

ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS badge_text TEXT DEFAULT 'أصناف متنوعة';
