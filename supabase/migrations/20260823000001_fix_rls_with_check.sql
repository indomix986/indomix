-- Fix: Add explicit WITH CHECK to all admin write policies.
-- Previously, FOR ALL policies used USING only — PostgreSQL applies USING as
-- the WITH CHECK expression for INSERT/UPDATE when WITH CHECK is omitted,
-- but is_admin() calls auth.uid() which can evaluate differently in the INSERT
-- security check context on some Supabase configurations, silently blocking
-- inserts while the mutation resolves as "success" (no JS-level error thrown).

-- Profiles
DROP POLICY IF EXISTS "Profiles admin write" ON public.profiles;
CREATE POLICY "Profiles admin write"
  ON public.profiles FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Categories
DROP POLICY IF EXISTS "Categories admin write" ON public.categories;
CREATE POLICY "Categories admin write"
  ON public.categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Products
DROP POLICY IF EXISTS "Products admin write" ON public.products;
CREATE POLICY "Products admin write"
  ON public.products FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Product Extras  <- main fix for reported bug
DROP POLICY IF EXISTS "Extras admin write" ON public.product_extras;
CREATE POLICY "Extras admin write"
  ON public.product_extras FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Offers
DROP POLICY IF EXISTS "Offers admin write" ON public.offers;
CREATE POLICY "Offers admin write"
  ON public.offers FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Restaurant Settings
DROP POLICY IF EXISTS "Settings admin write" ON public.restaurant_settings;
CREATE POLICY "Settings admin write"
  ON public.restaurant_settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Bot FAQ
DROP POLICY IF EXISTS "BotFaq admin write" ON public.bot_faq;
CREATE POLICY "BotFaq admin write"
  ON public.bot_faq FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
