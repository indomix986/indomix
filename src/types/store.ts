import type { Product, ExtraOption } from "@/types/product";

export interface CartItem {
  id: string; // unique item signature
  productId: string;
  product: Product;
  quantity: number;
  spiciness: string;
  selectedExtras: ExtraOption[];
  notes?: string;
  unitPrice: number;
}

export interface StoreContextType {
  cart: CartItem[];
  favorites: string[];
  addToCart: (
    product: Product,
    quantity?: number,
    spiciness?: string,
    selectedExtras?: ExtraOption[],
    notes?: string,
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  toggleFavorite: (productId: string, productName?: string) => void;
  isFavorite: (productId: string) => boolean;
}
