import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { z } from "zod";
import type { Product, ExtraOption } from "@/types/product";
import {
  CART_STORAGE_KEY,
  FAVORITES_STORAGE_KEY,
  DEFAULT_DELIVERY_FEE,
} from "@/constants/restaurant";
import type { CartItem, StoreContextType } from "@/types/store";
import { useRestaurantSettings } from "@/hooks/use-catalog";

export type { CartItem } from "@/types/store";

const ExtraOptionSchema: z.ZodType<ExtraOption> = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().min(0),
});

const ProductSchema: z.ZodType<Product> = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  categoryName: z.string(),
  desc: z.string(),
  shortDesc: z.string(),
  price: z.number().min(0),
  oldPrice: z.number().min(0).nullish(),
  img: z.string(),
  tag: z.string().optional(),
  rating: z.number(),
  reviewsCount: z.number(),
  extras: z.array(ExtraOptionSchema),
  isPopular: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
});

const CartItemSchema: z.ZodType<CartItem> = z.object({
  id: z.string(),
  productId: z.string(),
  product: ProductSchema,
  quantity: z.number().min(1),
  spiciness: z.string(),
  selectedExtras: z.array(ExtraOptionSchema),
  notes: z.string().optional(),
  unitPrice: z.number().min(0),
});

const CartSchema: z.ZodType<CartItem[]> = z.array(CartItemSchema);
const FavoritesSchema: z.ZodType<string[]> = z.array(z.string());

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const isLoadedRef = React.useRef(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { data: settings } = useRestaurantSettings();

  // Load cart & favorites from localStorage on mount (hydration-safe with Zod validation)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const result = CartSchema.safeParse(parsed);
        if (result.success) {
          setCart(result.data);
        } else {
          console.warn("Invalid cart data in localStorage, resetting cart:", result.error);
          localStorage.removeItem(CART_STORAGE_KEY);
        }
      }
      const savedFavs = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (savedFavs) {
        const parsedFavs = JSON.parse(savedFavs);
        const favResult = FavoritesSchema.safeParse(parsedFavs);
        if (favResult.success) {
          setFavorites(favResult.data);
        } else {
          console.warn("Invalid favorites data in localStorage, resetting favorites:", favResult.error);
          localStorage.removeItem(FAVORITES_STORAGE_KEY);
        }
      }
    } catch (err) {
      console.error("Failed to load state from localStorage", err);
    }
    isLoadedRef.current = true;
  }, []);

  // Sync cart to localStorage only after initial load
  useEffect(() => {
    if (!isLoadedRef.current) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      console.error("Failed to save cart to localStorage", err);
    }
  }, [cart]);

  // Sync favorites to localStorage
  useEffect(() => {
    if (!isLoadedRef.current) return;
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (err) {
      console.error("Failed to save favorites to localStorage", err);
    }
  }, [favorites]);

  // ✅ Sprint 2 – Step 4.1: useCallback on all handlers = stable references
  const addToCart = useCallback((
    product: Product,
    quantity = 1,
    spiciness = "",
    selectedExtras: ExtraOption[] = [],
    notes = "",
  ) => {
    const extrasKey = [...selectedExtras]
      .map((e) => e.id)
      .sort()
      .join("_");
    const itemSignature = `${product.id}-${spiciness}-${extrasKey}-${notes.trim()}`;
    const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
    const unitPrice = product.price + extrasTotal;

    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === itemSignature);
      if (existingIdx > -1) {
        const updated = [...prev];
        const existingItem = updated[existingIdx];
        if (existingItem) {
          existingItem.quantity += quantity;
        }
        return updated;
      }
      return [
        ...prev,
        {
          id: itemSignature,
          productId: product.id,
          product,
          quantity,
          spiciness,
          selectedExtras,
          notes,
          unitPrice,
        },
      ];
    });

    toast.success(`تمت إضافة "${product.name}" إلى السلة`, {
      description: `${quantity} × ${unitPrice} ج.م`,
    });
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    setCart((prev) => {
      const item = prev.find((i) => i.id === cartItemId);
      if (item) {
        toast.info(`تم حذف "${item.product.name}" من السلة`);
      }
      return prev.filter((i) => i.id !== cartItemId);
    });
  }, []);

  const updateQuantity = useCallback((cartItemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === cartItemId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const toggleFavorite = useCallback((productId: string, productName?: string) => {
    const name = productName || "المنتج";
    setFavorites((prev) => {
      const isFav = prev.includes(productId);
      if (isFav) {
        toast.info(`تمت إزالة "${name}" من المفضلة`);
        return prev.filter((id) => id !== productId);
      } else {
        toast.success(`تمت إضافة "${name}" إلى المفضلة`);
        return [...prev, productId];
      }
    });
  }, []);

  const isFavorite = useCallback((productId: string) => {
    return favorites.includes(productId);
  }, [favorites]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const baseDeliveryFee =
    settings?.delivery_fee !== undefined ? settings.delivery_fee : DEFAULT_DELIVERY_FEE;
  const deliveryFee = totalItems > 0 ? baseDeliveryFee : 0;

  // ✅ Sprint 2 – Step 4.1: useMemo on context value = new object only when data changes
  const contextValue = useMemo(
    () => ({
      cart,
      favorites,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      subtotal,
      deliveryFee,
      toggleFavorite,
      isFavorite,
    }),
    [cart, favorites, totalItems, subtotal, deliveryFee, addToCart, removeFromCart, updateQuantity, clearCart, toggleFavorite, isFavorite],
  );

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
