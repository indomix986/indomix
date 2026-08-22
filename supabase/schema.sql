-- ==============================================================================
-- INDOMIX RESTAURANT SUPABASE DATABASE SCHEMA
-- SINGLE-ADMIN ARCHITECTURE (NO CUSTOMER ACCOUNTS / NO ORDERS / NO REVIEWS)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (Single-admin authorization only)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role = 'admin'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Function to check if current authenticated user is an administrator
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

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- 4. PRODUCTS TABLE
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

-- 5. PRODUCT EXTRAS / TOPPINGS TABLE
CREATE TABLE IF NOT EXISTS public.product_extras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  is_available BOOLEAN NOT NULL DEFAULT true
);

-- 6. OFFERS (Combo Packages) TABLE
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

-- 7. RESTAURANT SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.restaurant_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. BOT FAQ TABLE (Dynamic Chatbot Q&A)
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

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON public.products(is_available);
CREATE INDEX IF NOT EXISTS idx_product_extras_product_id ON public.product_extras(product_id);
CREATE INDEX IF NOT EXISTS idx_offers_is_active ON public.offers(is_active);
CREATE INDEX IF NOT EXISTS idx_bot_faq_display_order ON public.bot_faq(display_order);
CREATE INDEX IF NOT EXISTS idx_bot_faq_is_active ON public.bot_faq(is_active);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_faq ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles admin read" ON public.profiles;
DROP POLICY IF EXISTS "Profiles admin write" ON public.profiles;

CREATE POLICY "Profiles admin read"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Profiles admin write"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- 2. Categories Policies
DROP POLICY IF EXISTS "Categories public read" ON public.categories;
DROP POLICY IF EXISTS "Categories admin write" ON public.categories;

CREATE POLICY "Categories public read"
  ON public.categories FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Categories admin write"
  ON public.categories FOR ALL
  USING (public.is_admin());

-- 3. Products Policies
DROP POLICY IF EXISTS "Products public read" ON public.products;
DROP POLICY IF EXISTS "Products admin write" ON public.products;

CREATE POLICY "Products public read"
  ON public.products FOR SELECT
  USING (is_available = true OR public.is_admin());

CREATE POLICY "Products admin write"
  ON public.products FOR ALL
  USING (public.is_admin());

-- 4. Product Extras Policies
DROP POLICY IF EXISTS "Extras public read" ON public.product_extras;
DROP POLICY IF EXISTS "Extras admin write" ON public.product_extras;

CREATE POLICY "Extras public read"
  ON public.product_extras FOR SELECT
  USING (is_available = true OR public.is_admin());

CREATE POLICY "Extras admin write"
  ON public.product_extras FOR ALL
  USING (public.is_admin());

-- 5. Offers Policies
DROP POLICY IF EXISTS "Offers public read" ON public.offers;
DROP POLICY IF EXISTS "Offers admin write" ON public.offers;

CREATE POLICY "Offers public read"
  ON public.offers FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Offers admin write"
  ON public.offers FOR ALL
  USING (public.is_admin());

-- 6. Restaurant Settings Policies
DROP POLICY IF EXISTS "Settings public read" ON public.restaurant_settings;
DROP POLICY IF EXISTS "Settings admin write" ON public.restaurant_settings;

CREATE POLICY "Settings public read"
  ON public.restaurant_settings FOR SELECT
  USING (true);

CREATE POLICY "Settings admin write"
  ON public.restaurant_settings FOR ALL
  USING (public.is_admin());

-- 7. Bot FAQ Policies
DROP POLICY IF EXISTS "BotFaq public read" ON public.bot_faq;
DROP POLICY IF EXISTS "BotFaq admin write" ON public.bot_faq;

CREATE POLICY "BotFaq public read"
  ON public.bot_faq FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "BotFaq admin write"
  ON public.bot_faq FOR ALL
  USING (public.is_admin());

-- ==============================================================================
-- GRANTS
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.categories, public.products, public.product_extras, public.offers, public.restaurant_settings, public.bot_faq TO anon, authenticated;
GRANT ALL ON public.categories, public.products, public.product_extras, public.offers, public.restaurant_settings, public.bot_faq, public.profiles TO authenticated;

