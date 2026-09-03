import type { Product, ExtraOption, ProductSize } from "@/types/product";

export interface CartItem {
  id: string; // unique item signature
  productId: string;
  product: Product;
  selectedSize?: ProductSize | undefined;
  quantity: number;
  spiciness: string;
  selectedExtras: ExtraOption[];
  notes?: string | undefined;
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
    selectedSize?: ProductSize,
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
