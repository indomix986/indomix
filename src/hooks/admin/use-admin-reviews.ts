import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Database } from "@/types/database";
import type { ReviewGalleryItem } from "@/types/review";

type DbReview = Database["public"]["Tables"]["reviews_gallery"]["Row"];

export function useAdminAllReviews() {
  return useQuery({
    queryKey: ["admin_reviews_gallery"],
    queryFn: async (): Promise<ReviewGalleryItem[]> => {
      if (!isSupabaseConfigured) return [];

      const { data, error } = await supabase
        .from("reviews_gallery")
        .select("*")
        .order("display_order", { ascending: true })
        .returns<DbReview[]>();

      if (error || !data) {
        throw new Error(error?.message || "فشل تحميل معرض تقييمات العملاء");
      }

      return data;
    },
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      image_url: string;
      display_order?: number;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("reviews_gallery")
        .insert({
          image_url: payload.image_url.trim(),
          display_order: payload.display_order ?? 0,
          is_active: payload.is_active !== undefined ? payload.is_active : true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_reviews_gallery"] });
      queryClient.invalidateQueries({ queryKey: ["reviews_gallery"] });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data: updates,
    }: {
      id: string;
      data: Partial<Database["public"]["Tables"]["reviews_gallery"]["Update"]>;
    }) => {
      const { data, error } = await supabase
        .from("reviews_gallery")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_reviews_gallery"] });
      queryClient.invalidateQueries({ queryKey: ["reviews_gallery"] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reviews_gallery").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_reviews_gallery"] });
      queryClient.invalidateQueries({ queryKey: ["reviews_gallery"] });
    },
  });
}

export async function uploadReviewImageFile(file: File): Promise<string> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured");
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `review-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
  const filePath = `gallery/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("reviews")
    .upload(filePath, file, { cacheControl: "3600", upsert: true });

  if (uploadError) {
    // If bucket doesn't exist or permissions fail, provide descriptive error
    throw new Error(`فشل رفع الصورة إلى Storage: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from("reviews").getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
