import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Database } from "@/types/database";

export type DbBotFaq = Database["public"]["Tables"]["bot_faq"]["Row"];

export function useAdminAllFaq() {
  return useQuery({
    queryKey: ["admin_bot_faq"],
    queryFn: async (): Promise<DbBotFaq[]> => {
      if (!isSupabaseConfigured) return [];

      const { data, error } = await supabase
        .from("bot_faq")
        .select("*")
        .order("display_order", { ascending: true })
        .returns<DbBotFaq[]>();

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
      const { data, error } = await supabase
        .from("bot_faq")
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
      const { data, error } = await supabase
        .from("bot_faq")
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
      const { error } = await supabase.from("bot_faq").delete().eq("id", faqId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_bot_faq"] });
      queryClient.invalidateQueries({ queryKey: ["bot_faq"] });
    },
  });
}
