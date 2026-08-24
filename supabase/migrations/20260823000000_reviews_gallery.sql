-- ==============================================================================
-- MIGRATION: 20260823000000_reviews_gallery.sql
-- Purpose: Create reviews_gallery table with proper RLS policies & permissions
-- ==============================================================================

-- 1. ENSURE is_admin() FUNCTION (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 2. CREATE reviews_gallery TABLE IF NOT EXISTS
CREATE TABLE IF NOT EXISTS public.reviews_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for ordering and filtering
CREATE INDEX IF NOT EXISTS idx_reviews_gallery_display_order ON public.reviews_gallery(display_order ASC);
CREATE INDEX IF NOT EXISTS idx_reviews_gallery_is_active ON public.reviews_gallery(is_active);

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.reviews_gallery ENABLE ROW LEVEL SECURITY;

-- 4. RESET & APPLY RLS POLICIES
DROP POLICY IF EXISTS "Reviews gallery public read" ON public.reviews_gallery;
DROP POLICY IF EXISTS "Reviews gallery admin write" ON public.reviews_gallery;
DROP POLICY IF EXISTS "Allow public read active reviews" ON public.reviews_gallery;
DROP POLICY IF EXISTS "Allow admin full access on reviews_gallery" ON public.reviews_gallery;

-- Public can read active reviews OR admin can read all reviews
CREATE POLICY "Reviews gallery public read"
ON public.reviews_gallery
FOR SELECT
USING (is_active = true OR public.is_admin());

-- Admin full access (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Reviews gallery admin write"
ON public.reviews_gallery
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 5. GRANT TABLE PERMISSIONS
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.reviews_gallery TO anon, authenticated;
GRANT ALL ON public.reviews_gallery TO authenticated;

-- 6. STORAGE BUCKET (Optional if using Supabase Storage for reviews)
INSERT INTO storage.buckets (id, name, public)
VALUES ('reviews', 'reviews', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Reviews storage public read" ON storage.objects;
DROP POLICY IF EXISTS "Reviews storage admin write" ON storage.objects;

CREATE POLICY "Reviews storage public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'reviews');

CREATE POLICY "Reviews storage admin write"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'reviews' AND public.is_admin())
WITH CHECK (bucket_id = 'reviews' AND public.is_admin());
