-- ==============================================================================
-- MIGRATION: 20260822000000_cleanup_and_single_admin_schema.sql
-- Purpose: Remove obsolete tables (orders, coupons, reviews, favorites),
--          strip customer fields from profiles, enforce single-admin architecture.
-- ==============================================================================

-- 1. DROP CONFIRMED UNNECESSARY TABLES AND POLICIES
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.favorites CASCADE;

-- 2. DROP OBSOLETE TRIGGERS & FUNCTIONS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 3. CLEAN & RESTRUCTURE PROFILES FOR SINGLE ADMIN
-- Remove customer fields if they exist
ALTER TABLE public.profiles DROP COLUMN IF EXISTS full_name;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS phone;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS default_address;

-- Ensure role constraint only allows admin
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role = 'admin');
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'admin';

-- 4. ENSURE is_admin() FUNCTION
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

-- 5. ENSURE REQUIRED TABLES & STRUCTURES
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  old_price NUMERIC(10,2),
  image_url TEXT NOT NULL,
  tag TEXT,
  rating NUMERIC(3,2) NOT NULL DEFAULT 5.0,
  reviews_count INT NOT NULL DEFAULT 0,
  prep_time TEXT NOT NULL DEFAULT '٧ دقائق',
  calories TEXT NOT NULL DEFAULT '450 سعرة',
  spiciness_default TEXT NOT NULL DEFAULT 'بدون شطة',
  available_spiciness TEXT[] NOT NULL DEFAULT '{"بدون شطة", "بارد", "متوسط", "حار"}',
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_extras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  is_available BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.offers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  tag TEXT,
  discount_badge TEXT,
  description TEXT NOT NULL,
  items TEXT[] NOT NULL DEFAULT '{}',
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  old_price NUMERIC(10,2),
  image_url TEXT NOT NULL,
  associated_product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  valid_until TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.restaurant_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON public.products(is_available);
CREATE INDEX IF NOT EXISTS idx_product_extras_product_id ON public.product_extras(product_id);
CREATE INDEX IF NOT EXISTS idx_offers_is_active ON public.offers(is_active);

-- 6. RESET RLS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles admin read" ON public.profiles;
DROP POLICY IF EXISTS "Profiles admin write" ON public.profiles;
CREATE POLICY "Profiles admin read" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Profiles admin write" ON public.profiles FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Categories public read" ON public.categories;
DROP POLICY IF EXISTS "Categories admin write" ON public.categories;
CREATE POLICY "Categories public read" ON public.categories FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Categories admin write" ON public.categories FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Products public read" ON public.products;
DROP POLICY IF EXISTS "Products admin write" ON public.products;
CREATE POLICY "Products public read" ON public.products FOR SELECT USING (is_available = true OR public.is_admin());
CREATE POLICY "Products admin write" ON public.products FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Extras public read" ON public.product_extras;
DROP POLICY IF EXISTS "Extras admin write" ON public.product_extras;
CREATE POLICY "Extras public read" ON public.product_extras FOR SELECT USING (is_available = true OR public.is_admin());
CREATE POLICY "Extras admin write" ON public.product_extras FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Offers public read" ON public.offers;
DROP POLICY IF EXISTS "Offers admin write" ON public.offers;
CREATE POLICY "Offers public read" ON public.offers FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Offers admin write" ON public.offers FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Settings public read" ON public.restaurant_settings;
DROP POLICY IF EXISTS "Settings admin write" ON public.restaurant_settings;
CREATE POLICY "Settings public read" ON public.restaurant_settings FOR SELECT USING (true);
CREATE POLICY "Settings admin write" ON public.restaurant_settings FOR ALL USING (public.is_admin());

-- 7. GRANT PERMISSIONS FOR PUBLIC ACCESS
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.categories, public.products, public.product_extras, public.offers, public.restaurant_settings TO anon, authenticated;
GRANT ALL ON public.categories, public.products, public.product_extras, public.offers, public.restaurant_settings, public.profiles TO authenticated;
