import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Database } from "@/types/database";
import type { Product, ExtraOption } from "@/types/product";

type DbProduct = Database["public"]["Tables"]["products"]["Row"];
type DbProductExtra = Database["public"]["Tables"]["product_extras"]["Row"];
type DbProductWithCategory = DbProduct & {
  categories: { name: string } | null;
};

export function useAdminAllProducts() {
  return useQuery({
    queryKey: ["admin_products"],
    queryFn: async (): Promise<Product[]> => {
      if (!isSupabaseConfigured) return [];

      const [productsRes, extrasRes] = await Promise.all([
        supabase
          .from("products")
          .select("*, categories(name)")
          .order("created_at", { ascending: false })
          .returns<DbProductWithCategory[]>(),
        supabase
          .from("product_extras")
          .select("*")
          .returns<DbProductExtra[]>(),
      ]);

      if (productsRes.error || !productsRes.data) {
        throw new Error(productsRes.error?.message || "فشل تحميل المنتجات");
      }

      const dbProductsRaw = productsRes.data;
      const dbExtras = extrasRes.data || [];

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

      return dbProductsRaw.map((p) => ({
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
        extras: extrasByProd[p.id] || [],
        isPopular: p.is_popular,
        isAvailable: p.is_available,
      }));
    },
  });
}

export interface CreateProductPayload {
  id: string;
  category_id: string;
  name: string;
  description: string;
  short_description: string;
  price: number;
  old_price?: number | null;
  image_url: string;
  tag?: string | null;
  rating?: number;
  is_popular?: boolean;
  is_available?: boolean;
  extras?: { name: string; price: number }[];
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateProductPayload) => {
      const { extras, ...productData } = payload;

      const { data, error } = await supabase
        .from("products")
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
          rating: productData.rating !== undefined ? Number(productData.rating) : 5.0,
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

        const { error: extrasErr } = await supabase
          .from("product_extras")
          .insert(extrasToInsert);

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
      const { data, error } = await supabase
        .from("products")
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
      const { error } = await supabase.from("products").delete().eq("id", productId);
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
      const { data, error } = await supabase
        .from("product_extras")
        .insert({
          product_id: payload.productId,
          name: payload.name.trim(),
          price: payload.price,
          is_available: true,
        })
        .select()
        .single();

      // DEBUG: log full Supabase error so RLS / type issues are visible in console
      if (error) {
        console.error("[useCreateProductExtra] Supabase error:", error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => {
      console.error("[useCreateProductExtra] mutation error:", err);
    },
  });
}

export function useDeleteProductExtra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (extraId: string) => {
      const { error } = await supabase.from("product_extras").delete().eq("id", extraId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
