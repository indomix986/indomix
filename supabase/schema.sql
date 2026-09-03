--
-- PostgreSQL database dump
--

\restrict ey0DUGBAh6rJPWVzmXoRpW4DHjuO4HxROcFb12FGzboy85LHPhqTScphawUn2Xm

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
      SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      );
    $$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bot_faq; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bot_faq (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question text NOT NULL,
    keywords text[] DEFAULT '{}'::text[] NOT NULL,
    answer text NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id text NOT NULL,
    name text NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    image_url text,
    is_active boolean DEFAULT true NOT NULL,
    badge_text text DEFAULT 'أصناف متنوعة'::text
);


--
-- Name: offers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.offers (
    id text NOT NULL,
    title text NOT NULL,
    tag text,
    discount_badge text,
    description text NOT NULL,
    items text[] DEFAULT '{}'::text[] NOT NULL,
    price numeric(10,2) NOT NULL,
    old_price numeric(10,2),
    image_url text NOT NULL,
    associated_product_id text,
    valid_until text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT offers_price_check CHECK ((price >= (0)::numeric))
);


--
-- Name: product_extras; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_extras (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id text,
    name text NOT NULL,
    price numeric(10,2) NOT NULL,
    is_available boolean DEFAULT true NOT NULL,
    CONSTRAINT product_extras_price_check CHECK ((price >= (0)::numeric))
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id text NOT NULL,
    category_id text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    short_description text NOT NULL,
    price numeric(10,2) NOT NULL,
    old_price numeric(10,2),
    image_url text NOT NULL,
    tag text,
    rating numeric(3,2) DEFAULT 5.0 NOT NULL,
    reviews_count integer DEFAULT 0 NOT NULL,
    is_popular boolean DEFAULT false NOT NULL,
    is_available boolean DEFAULT true NOT NULL,
    sizes jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT products_price_check CHECK ((price >= (0)::numeric))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    role text DEFAULT 'admin'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT profiles_role_check CHECK ((role = 'admin'::text))
);


--
-- Name: restaurant_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.restaurant_settings (
    key text NOT NULL,
    value jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: reviews_gallery; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews_gallery (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    image_url text NOT NULL,
    title text DEFAULT ''::text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: bot_faq bot_faq_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bot_faq
    ADD CONSTRAINT bot_faq_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: offers offers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_pkey PRIMARY KEY (id);


--
-- Name: product_extras product_extras_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_extras
    ADD CONSTRAINT product_extras_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: restaurant_settings restaurant_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.restaurant_settings
    ADD CONSTRAINT restaurant_settings_pkey PRIMARY KEY (key);


--
-- Name: reviews_gallery reviews_gallery_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews_gallery
    ADD CONSTRAINT reviews_gallery_pkey PRIMARY KEY (id);


--
-- Name: idx_offers_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_offers_is_active ON public.offers USING btree (is_active);


--
-- Name: idx_product_extras_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_extras_product_id ON public.product_extras USING btree (product_id);


--
-- Name: idx_products_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_category_id ON public.products USING btree (category_id);


--
-- Name: idx_products_is_available; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_is_available ON public.products USING btree (is_available);


--
-- Name: idx_reviews_gallery_display_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_gallery_display_order ON public.reviews_gallery USING btree (display_order);


--
-- Name: idx_reviews_gallery_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_gallery_is_active ON public.reviews_gallery USING btree (is_active);


--
-- Name: offers offers_associated_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_associated_product_id_fkey FOREIGN KEY (associated_product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: product_extras product_extras_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_extras
    ADD CONSTRAINT product_extras_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: bot_faq BotFaq admin write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "BotFaq admin write" ON public.bot_faq TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: bot_faq BotFaq public read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "BotFaq public read" ON public.bot_faq FOR SELECT USING (((is_active = true) OR public.is_admin()));


--
-- Name: categories Categories admin write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Categories admin write" ON public.categories TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: categories Categories public read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Categories public read" ON public.categories FOR SELECT USING (((is_active = true) OR public.is_admin()));


--
-- Name: product_extras Extras admin write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Extras admin write" ON public.product_extras TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: product_extras Extras public read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Extras public read" ON public.product_extras FOR SELECT USING (((is_available = true) OR public.is_admin()));


--
-- Name: offers Offers admin write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Offers admin write" ON public.offers TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: offers Offers public read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Offers public read" ON public.offers FOR SELECT USING (((is_active = true) OR public.is_admin()));


--
-- Name: products Products admin write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Products admin write" ON public.products TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: products Products public read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Products public read" ON public.products FOR SELECT USING (((is_available = true) OR public.is_admin()));


--
-- Name: profiles Profiles admin write policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profiles admin write policy" ON public.profiles TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: profiles Profiles read policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profiles read policy" ON public.profiles FOR SELECT TO authenticated USING (((auth.uid() = id) OR public.is_admin()));


--
-- Name: reviews_gallery Reviews admin delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Reviews admin delete" ON public.reviews_gallery FOR DELETE TO authenticated USING (public.is_admin());


--
-- Name: reviews_gallery Reviews admin insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Reviews admin insert" ON public.reviews_gallery FOR INSERT TO authenticated WITH CHECK (public.is_admin());


--
-- Name: reviews_gallery Reviews admin update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Reviews admin update" ON public.reviews_gallery FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: reviews_gallery Reviews gallery admin write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Reviews gallery admin write" ON public.reviews_gallery TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: reviews_gallery Reviews gallery public read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Reviews gallery public read" ON public.reviews_gallery FOR SELECT USING (((is_active = true) OR public.is_admin()));


--
-- Name: reviews_gallery Reviews public read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Reviews public read" ON public.reviews_gallery FOR SELECT USING (((is_active = true) OR public.is_admin()));


--
-- Name: restaurant_settings Settings admin write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Settings admin write" ON public.restaurant_settings TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: restaurant_settings Settings public read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Settings public read" ON public.restaurant_settings FOR SELECT USING (true);


--
-- Name: bot_faq; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bot_faq ENABLE ROW LEVEL SECURITY;

--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- Name: offers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

--
-- Name: product_extras; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.product_extras ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: restaurant_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: reviews_gallery; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reviews_gallery ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict ey0DUGBAh6rJPWVzmXoRpW4DHjuO4HxROcFb12FGzboy85LHPhqTScphawUn2Xm

