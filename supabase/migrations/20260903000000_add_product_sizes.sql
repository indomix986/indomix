-- Migration: Add optional sizes jsonb column to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS sizes jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.products.sizes IS 'Array of size options: [{"id": string, "name": string, "price": number, "oldPrice": number|null, "isDefault": boolean}]';
