import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Database } from "@/types/database";
import type { ReviewGalleryItem } from "@/types/review";

type DbReview = Database["public"]["Tables"]["reviews_gallery"]["Row"];

export const FALLBACK_REVIEWS: ReviewGalleryItem[] = [
  {
    id: "sample-review-1",
    image_url: "/assets/cat-cheese.jpg",
    display_order: 1,
    is_active: true,
  },
  {
    id: "sample-review-2",
    image_url: "/assets/cat-classic.jpg",
    display_order: 2,
    is_active: true,
  },
  {
    id: "sample-review-3",
    image_url: "/assets/cat-chicken.jpg",
    display_order: 3,
    is_active: true,
  },
  {
    id: "sample-review-4",
    image_url: "/assets/cat-seafood.jpg",
    display_order: 4,
    is_active: true,
  },
  {
    id: "sample-review-5",
    image_url: "/assets/cat-snacks.jpg",
    display_order: 5,
    is_active: true,
  },
  {
    id: "sample-review-6",
    image_url: "/assets/hero-noodles.jpg",
    display_order: 6,
    is_active: true,
  },
];

export function useReviewsGallery() {
  return useQuery({
    queryKey: ["reviews_gallery"],
    queryFn: async (): Promise<ReviewGalleryItem[]> => {
      if (!isSupabaseConfigured) {
        return FALLBACK_REVIEWS;
      }

      try {
        const { data, error } = await supabase
          .from("reviews_gallery")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true })
          .returns<DbReview[]>();

        if (error || !data || data.length === 0) {
          return FALLBACK_REVIEWS;
        }

        return data;
      } catch {
        return FALLBACK_REVIEWS;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}
