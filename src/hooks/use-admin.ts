import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Database } from "@/types/database";
import type { Product, ExtraOption, Offer } from "@/types/product";

type DbCategory = Database["public"]["Tables"]["categories"]["Row"];
type DbExtra = Database["public"]["Tables"]["product_extras"]["Row"];
type DbOffer = Database["public"]["Tables"]["offers"]["Row"];
export type DbBotFaq = Database["public"]["Tables"]["bot_faq"]["Row"];

// ============================================================================
// 1. PRODUCTS & EXTRAS
// ============================================================================

export function useAdminAllProducts() {
  return useQuery({
    queryKey: ["admin_products"],
    queryFn: async (): Promise<Product[]> => {
      if (!isSupabaseConfigured) return [];

      // ✅ Sprint 1 – Step 3.1: Parallel queries via Promise.all (eliminates waterfall)
      const [productsRes, extrasRes] = await Promise.all([
        (supabase.from("products") as any)
          .select("*, categories(name)")
          .order("created_at", { ascending: false }),
        (supabase.from("product_extras") as any).select("*"),
      ]);

      if (productsRes.error || !productsRes.data) {
        throw new Error(productsRes.error?.message || "فشل تحميل المنتجات");
      }

      const dbProductsRaw = productsRes.data;
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

      return dbProductsRaw.map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category_id,
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
        isAvailable: p.is_available,
      }));
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      id: string;
      category_id: string;
      name: string;
      description: string;
      short_description: string;
      price: number;
      old_price?: number | null;
      image_url: string;
      tag?: string | null;
      prep_time?: string;
      calories?: string;
      spiciness_default?: string;
      available_spiciness?: string[];
      is_popular?: boolean;
      is_available?: boolean;
      extras?: { name: string; price: number }[];
    }) => {
      const { extras, ...productData } = payload;

      const { data, error } = await (supabase.from("products") as any)
        .insert({
          id: productData.id.trim(),
          category_id: productData.category_id,
          name: productData.name.trim(),
          description: productData.description.trim(),
          short_description: productData.short_description.trim(),
          price: productData.price,
          old_price: productData.old_price || null,
          image_url: productData.image_url.trim(),
          tag: productData.tag?.trim() || null,
          prep_time: productData.prep_time?.trim() || "٧ دقائق",
          calories: productData.calories?.trim() || "450 سعرة",
          spiciness_default: productData.spiciness_default || "بدون شطة",
          available_spiciness: productData.available_spiciness || [
            "بدون شطة",
            "بارد",
            "متوسط",
            "حار",
          ],
          is_popular: Boolean(productData.is_popular),
          is_available: productData.is_available !== undefined ? productData.is_available : true,
        })
        .select()
        .single();

      if (error) throw error;

      if (extras && extras.length > 0) {
        const extrasToInsert = extras.map((e) => ({
          product_id: productData.id.trim(),
          name: e.name.trim(),
          price: e.price,
          is_available: true,
        }));

        const { error: extrasErr } = await (supabase.from("product_extras") as any).insert(
          extrasToInsert,
        );

        if (extrasErr) throw extrasErr;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data: updates,
    }: {
      id: string;
      data: Partial<Database["public"]["Tables"]["products"]["Update"]>;
    }) => {
      const { data, error } = await (supabase.from("products") as any)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await (supabase.from("products") as any).delete().eq("id", productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useCreateProductExtra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { productId: string; name: string; price: number }) => {
      const { data, error } = await (supabase.from("product_extras") as any)
        .insert({
          product_id: payload.productId,
          name: payload.name.trim(),
          price: payload.price,
          is_available: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProductExtra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (extraId: string) => {
      const { error } = await (supabase.from("product_extras") as any).delete().eq("id", extraId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ============================================================================
// 2. CATEGORIES
// ============================================================================

export function useAdminAllCategories() {
  return useQuery({
    queryKey: ["admin_categories"],
    queryFn: async (): Promise<DbCategory[]> => {
      if (!isSupabaseConfigured) return [];

      const { data, error } = await (supabase.from("categories") as any)
        .select("*")
        .order("display_order", { ascending: true });

      if (error || !data) {
        throw new Error(error?.message || "فشل تحميل الأقسام");
      }

      return data;
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      id: string;
      name: string;
      display_order?: number;
      image_url?: string | null;
      is_active?: boolean;
    }) => {
      const { data, error } = await (supabase.from("categories") as any)
        .insert({
          id: payload.id.trim(),
          name: payload.name.trim(),
          display_order: payload.display_order || 0,
          image_url: payload.image_url?.trim() || null,
          is_active: payload.is_active !== undefined ? payload.is_active : true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data: updates,
    }: {
      id: string;
      data: Partial<Database["public"]["Tables"]["categories"]["Update"]>;
    }) => {
      const { data, error } = await (supabase.from("categories") as any)
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      const { data: assignedProducts, error: checkErr } = await (supabase.from("products") as any)
        .select("id")
        .eq("category_id", categoryId);

      if (checkErr) throw checkErr;

      if (assignedProducts && assignedProducts.length > 0) {
        throw new Error(
          `لا يمكن حذف هذا القسم لأنه يحتوي على ${assignedProducts.length} وجبات. يرجى نقلها أو حذفها أولاً.`,
        );
      }

      const { error } = await (supabase.from("categories") as any).delete().eq("id", categoryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

// ============================================================================
// 3. OFFERS
// ============================================================================

export function useAdminAllOffers() {
  return useQuery({
    queryKey: ["admin_offers"],
    queryFn: async (): Promise<DbOffer[]> => {
      if (!isSupabaseConfigured) return [];

      const { data, error } = await (supabase.from("offers") as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !data) {
        throw new Error(error?.message || "فشل تحميل العروض");
      }

      return data;
    },
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      id: string;
      title: string;
      tag?: string | null;
      discount_badge?: string | null;
      description: string;
      items: string[];
      price: number;
      old_price?: number | null;
      image_url: string;
      associated_product_id?: string | null;
      valid_until: string;
      is_active?: boolean;
    }) => {
      const { data, error } = await (supabase.from("offers") as any)
        .insert({
          id: payload.id.trim(),
          title: payload.title.trim(),
          tag: payload.tag?.trim() || null,
          discount_badge: payload.discount_badge?.trim() || null,
          description: payload.description.trim(),
          items: payload.items || [],
          price: payload.price,
          old_price: payload.old_price || null,
          image_url: payload.image_url.trim(),
          associated_product_id: payload.associated_product_id || null,
          valid_until: payload.valid_until.trim() || "عرض ساري",
          is_active: payload.is_active !== undefined ? payload.is_active : true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_offers"] });
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
}

export function useUpdateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data: updates,
    }: {
      id: string;
      data: Partial<Database["public"]["Tables"]["offers"]["Update"]>;
    }) => {
      const { data, error } = await (supabase.from("offers") as any)
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_offers"] });
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
}

export function useDeleteOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offerId: string) => {
      const { error } = await (supabase.from("offers") as any).delete().eq("id", offerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_offers"] });
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
}

// ============================================================================
// 4. RESTAURANT SETTINGS
// ============================================================================

export function useUpdateRestaurantSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      phone: string;
      whatsapp: string;
      working_hours: string;
      is_open: boolean;
      delivery_fee: number;
    }) => {
      const now = new Date().toISOString();

      const { error: genErr } = await (supabase.from("restaurant_settings") as any).upsert({
        key: "general",
        value: {
          restaurant_name: "إندومكس",
          phone: payload.phone.trim(),
          whatsapp: payload.whatsapp.trim(),
          working_hours: payload.working_hours.trim(),
          is_open: payload.is_open,
        },
        updated_at: now,
      });

      if (genErr) throw genErr;

      const { error: delErr } = await (supabase.from("restaurant_settings") as any).upsert({
        key: "delivery",
        value: {
          base_fee: payload.delivery_fee,
        },
        updated_at: now,
      });

      if (delErr) throw delErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurant_settings"] });
    },
  });
}

// ============================================================================
// 5. BOT FAQ (Chatbot Knowledge Base)
// ============================================================================

export function useAdminAllFaq() {
  return useQuery({
    queryKey: ["admin_bot_faq"],
    queryFn: async (): Promise<DbBotFaq[]> => {
      if (!isSupabaseConfigured) return [];

      const { data, error } = await (supabase.from("bot_faq") as any)
        .select("*")
        .order("display_order", { ascending: true });

      if (error || !data) {
        throw new Error(error?.message || "فشل تحميل الأسئلة الشائعة");
      }

      return data;
    },
  });
}

export function useCreateFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      question: string;
      keywords: string[];
      answer: string;
      display_order?: number;
      is_active?: boolean;
    }) => {
      const { data, error } = await (supabase.from("bot_faq") as any)
        .insert({
          question: payload.question.trim(),
          keywords: payload.keywords,
          answer: payload.answer.trim(),
          display_order: payload.display_order ?? 0,
          is_active: payload.is_active !== undefined ? payload.is_active : true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_bot_faq"] });
      queryClient.invalidateQueries({ queryKey: ["bot_faq"] });
    },
  });
}

export function useUpdateFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data: updates,
    }: {
      id: string;
      data: Partial<Database["public"]["Tables"]["bot_faq"]["Update"]>;
    }) => {
      const { data, error } = await (supabase.from("bot_faq") as any)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_bot_faq"] });
      queryClient.invalidateQueries({ queryKey: ["bot_faq"] });
    },
  });
}

export function useDeleteFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (faqId: string) => {
      const { error } = await (supabase.from("bot_faq") as any).delete().eq("id", faqId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_bot_faq"] });
      queryClient.invalidateQueries({ queryKey: ["bot_faq"] });
    },
  });
}
