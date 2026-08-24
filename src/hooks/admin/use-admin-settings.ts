import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

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

      const { error: genErr } = await supabase
        .from("restaurant_settings")
        .upsert({
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

      const { error: delErr } = await supabase
        .from("restaurant_settings")
        .upsert({
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
