import { useQuery, queryOptions } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  RESTAURANT_PHONE,
  RESTAURANT_WHATSAPP,
  RESTAURANT_WORKING_HOURS,
  DEFAULT_DELIVERY_FEE,
} from "@/constants/restaurant";
import type { Product, ExtraOption, Offer } from "@/types/product";
import type { Database } from "@/types/database";

type DbCategory = Database["public"]["Tables"]["categories"]["Row"];
type DbExtra = Database["public"]["Tables"]["product_extras"]["Row"];
type DbOffer = Database["public"]["Tables"]["offers"]["Row"];
type DbSettings = Database["public"]["Tables"]["restaurant_settings"]["Row"];

export interface RestaurantSettings {
  restaurant_name: string;
  phone: string;
  whatsapp: string;
  is_open: boolean;
  working_hours: string;
  delivery_fee: number;
}

export const DEFAULT_SETTINGS: RestaurantSettings = {
  restaurant_name: "إندومكس",
  phone: RESTAURANT_PHONE,
  whatsapp: RESTAURANT_WHATSAPP,
  is_open: true,
  working_hours: RESTAURANT_WORKING_HOURS,
  delivery_fee: DEFAULT_DELIVERY_FEE,
};

export function useRestaurantSettings() {
  return useQuery({
    queryKey: ["restaurant_settings"],
    queryFn: async (): Promise<RestaurantSettings> => {
      if (!isSupabaseConfigured) {
        return DEFAULT_SETTINGS;
      }

      try {
        const { data, error } = await supabase.from("restaurant_settings").select("*");

        const settingsRows = (data as DbSettings[] | null) || [];

        if (error || settingsRows.length === 0) {
          return DEFAULT_SETTINGS;
        }

        const generalRow = settingsRows.find((r) => r.key === "general");
        const deliveryRow = settingsRows.find((r) => r.key === "delivery");

        const general = (generalRow?.value as Record<string, unknown>) || {};
        const delivery = (deliveryRow?.value as Record<string, unknown>) || {};

        return {
          restaurant_name:
            typeof general["restaurant_name"] === "string"
              ? general["restaurant_name"]
              : DEFAULT_SETTINGS.restaurant_name,
          phone: typeof general["phone"] === "string" ? general["phone"] : DEFAULT_SETTINGS.phone,
          whatsapp:
            typeof general["whatsapp"] === "string"
              ? general["whatsapp"]
              : DEFAULT_SETTINGS.whatsapp,
          is_open:
            typeof general["is_open"] === "boolean" ? general["is_open"] : DEFAULT_SETTINGS.is_open,
          working_hours:
            typeof general["working_hours"] === "string"
              ? general["working_hours"]
              : DEFAULT_SETTINGS.working_hours,
          delivery_fee:
            typeof delivery["base_fee"] === "number"
              ? delivery["base_fee"]
              : DEFAULT_SETTINGS.delivery_fee,
        };
      } catch {
        return DEFAULT_SETTINGS;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

export const categoriesQueryOptions = () =>
  queryOptions({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        return [];
      }
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        const categoriesData = (data as DbCategory[] | null) || [];

        if (error || categoriesData.length === 0) {
          return [];
        }

        return [
          {
            id: "all",
            name: "الكل",
            count: `${categoriesData.length} أصناف`,
            img: categoriesData[0]?.image_url || "/assets/cat-classic.jpg",
          },
          ...categoriesData.map((c) => ({
            id: c.id,
            name: c.name,
            count: "أصناف متنوعة",
            img: c.image_url || "/assets/cat-classic.jpg",
          })),
        ];
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

export function useCategories() {
  return useQuery(categoriesQueryOptions());
}

export const productsQueryOptions = () =>
  queryOptions({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      if (!isSupabaseConfigured) {
        return [];
      }

      try {
        // ✅ Sprint 1 – Step 3.1: Parallel queries via Promise.all (eliminates waterfall)
        const [productsRes, extrasRes] = await Promise.all([
          supabase
            .from("products")
            .select("*, categories(name)")
            .eq("is_available", true),
          supabase
            .from("product_extras")
            .select("*")
            .eq("is_available", true),
        ]);

        const dbProducts = (productsRes.data as any[] | null) || [];

        if (productsRes.error || dbProducts.length === 0) {
          return [];
        }

        const dbExtras = (extrasRes.data as DbExtra[] | null) || [];

        const extrasByProd = dbExtras.reduce<Record<string, ExtraOption[]>>((acc, extra) => {
          if (!extra.product_id) return acc;
          if (!acc[extra.product_id]) acc[extra.product_id] = [];
          acc[extra.product_id]?.push({
            id: extra.id,
            name: extra.name,
            price: Number(extra.price),
          });
          return acc;
        }, {});

        return dbProducts.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category_id as any,
          categoryName: p.categories?.name || p.category_id,
          desc: p.description,
          shortDesc: p.short_description,
          price: Number(p.price),
          oldPrice: p.old_price ? Number(p.old_price) : null,
          img: p.image_url,
          tag: p.tag || undefined,
          rating: Number(p.rating),
          reviewsCount: p.reviews_count,
          prepTime: p.prep_time,
          calories: p.calories,
          spicinessDefault: p.spiciness_default,
          availableSpiciness: p.available_spiciness || ["بدون شطة", "بارد", "متوسط", "حار"],
          extras: extrasByProd[p.id] || [],
          isPopular: p.is_popular,
        }));
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

export function useProducts() {
  return useQuery(productsQueryOptions());
}

export function useProductDetails(id: string) {
  const { data: allProducts } = useProducts();
  return allProducts?.find((p) => p.id === id) || null;
}

// ✅ Sprint 1 – Step 3.2: Targeted single-product query (prevents full catalog over-fetch)
export const singleProductQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["product", id],
    queryFn: async (): Promise<Product | null> => {
      if (!isSupabaseConfigured || !id) return null;

      try {
        const [prodRes, extrasRes] = await Promise.all([
          supabase
            .from("products")
            .select("*, categories(name)")
            .eq("id", id)
            .maybeSingle(),
          supabase
            .from("product_extras")
            .select("*")
            .eq("product_id", id)
            .eq("is_available", true),
        ]);

        if (prodRes.error || !prodRes.data) return null;

        const p = prodRes.data as any;
        const dbExtras = (extrasRes.data as DbExtra[] | null) || [];

        return {
          id: p.id,
          name: p.name,
          category: p.category_id as any,
          categoryName: p.categories?.name || p.category_id,
          desc: p.description,
          shortDesc: p.short_description,
          price: Number(p.price),
          oldPrice: p.old_price ? Number(p.old_price) : null,
          img: p.image_url,
          tag: p.tag || undefined,
          rating: Number(p.rating),
          reviewsCount: p.reviews_count,
          prepTime: p.prep_time,
          calories: p.calories,
          spicinessDefault: p.spiciness_default,
          availableSpiciness: p.available_spiciness || ["بدون شطة", "بارد", "متوسط", "حار"],
          extras: dbExtras.map((e) => ({
            id: e.id,
            name: e.name,
            price: Number(e.price),
          })),
          isPopular: p.is_popular,
        };
      } catch {
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
    enabled: Boolean(id),
  });

export function useSingleProduct(id: string) {
  return useQuery(singleProductQueryOptions(id));
}

export const offersQueryOptions = () =>
  queryOptions({
    queryKey: ["offers"],
    queryFn: async (): Promise<Offer[]> => {
      if (!isSupabaseConfigured) {
        return [];
      }

      try {
        const { data, error } = await supabase.from("offers").select("*").eq("is_active", true);

        const offersData = (data as DbOffer[] | null) || [];

        if (error || offersData.length === 0) {
          return [];
        }

        return offersData.map((o) => ({
          id: o.id,
          title: o.title,
          tag: o.tag || "عرض خاص",
          discountBadge: o.discount_badge || "",
          desc: o.description,
          items: o.items || [],
          price: Number(o.price),
          oldPrice: o.old_price ? Number(o.old_price) : Number(o.price) + 30,
          img: o.image_url,
          associatedProductId: o.associated_product_id || "",
          validUntil: o.valid_until,
        }));
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

export function useOffers() {
  return useQuery(offersQueryOptions());
}

export interface BotFaqItem {
  id: string;
  question: string;
  keywords: string[];
  answer: string;
  display_order: number;
  is_active: boolean;
}

export function useBotFaq(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["bot_faq"],
    queryFn: async (): Promise<BotFaqItem[]> => {
      if (!isSupabaseConfigured) {
        return [];
      }

      try {
        const { data, error } = await (supabase.from("bot_faq") as any)
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (error || !data) {
          return [];
        }

        return data as BotFaqItem[];
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled ?? true,
  });
}
