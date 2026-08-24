import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Database } from "@/types/database";

type DbOffer = Database["public"]["Tables"]["offers"]["Row"];

export function useAdminAllOffers() {
  return useQuery({
    queryKey: ["admin_offers"],
    queryFn: async (): Promise<DbOffer[]> => {
      if (!isSupabaseConfigured) return [];

      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .order("created_at", { ascending: false })
        .returns<DbOffer[]>();

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
      const { data, error } = await supabase
        .from("offers")
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
      const { data, error } = await supabase
        .from("offers")
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
      const { error } = await supabase.from("offers").delete().eq("id", offerId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_offers"] });
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
}
