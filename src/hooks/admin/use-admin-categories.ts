import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Database } from "@/types/database";

type DbCategory = Database["public"]["Tables"]["categories"]["Row"];

export function useAdminAllCategories() {
  return useQuery({
    queryKey: ["admin_categories"],
    queryFn: async (): Promise<DbCategory[]> => {
      if (!isSupabaseConfigured) return [];

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true })
        .returns<DbCategory[]>();

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
      badge_text?: string | null;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("categories")
        .insert({
          id: payload.id.trim(),
          name: payload.name.trim(),
          display_order: payload.display_order || 0,
          image_url: payload.image_url?.trim() || null,
          badge_text: payload.badge_text?.trim() || "أصناف متنوعة",
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
      const { data, error } = await supabase
        .from("categories")
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
      const { data: assignedProducts, error: checkErr } = await supabase
        .from("products")
        .select("id")
        .eq("category_id", categoryId);

      if (checkErr) throw checkErr;

      if (assignedProducts && assignedProducts.length > 0) {
        throw new Error(
          `لا يمكن حذف هذا القسم لأنه يحتوي على ${assignedProducts.length} وجبات. يرجى نقلها أو حذفها أولاً.`,
        );
      }

      const { error } = await supabase.from("categories").delete().eq("id", categoryId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
