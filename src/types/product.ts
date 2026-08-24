/**
 * Domain types for product-related data.
 */

export interface ExtraOption {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: "classic" | "cheese" | "chicken" | "seafood" | "snacks" | "boxes" | string;
  categoryName: string;
  desc: string;
  shortDesc: string;
  price: number;
  oldPrice?: number | null | undefined;
  img: string;
  tag?: string | undefined;
  rating: number;
  reviewsCount: number;
  extras: ExtraOption[];
  isPopular?: boolean | undefined;
  isAvailable?: boolean | undefined;
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
