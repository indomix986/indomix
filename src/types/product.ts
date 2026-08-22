/**
 * Domain types for product-related data.
 * Extracted from data/products.ts to keep types separate from data.
 * 🔮 Supabase future: these interfaces will map to Supabase table row types.
 */

export interface ExtraOption {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: "classic" | "cheese" | "chicken" | "seafood" | "snacks" | "boxes";
  categoryName: string;
  desc: string;
  shortDesc: string;
  price: number;
  oldPrice?: number | null;
  img: string;
  tag?: string;
  rating: number;
  reviewsCount: number;
  prepTime: string;
  calories: string;
  spicinessDefault: string;
  availableSpiciness: string[];
  extras: ExtraOption[];
  isPopular?: boolean;
}

export interface Offer {
  id: string;
  title: string;
  tag: string;
  discountBadge: string;
  desc: string;
  items: string[];
  price: number;
  oldPrice: number;
  img: string;
  associatedProductId: string;
  validUntil: string;
}
