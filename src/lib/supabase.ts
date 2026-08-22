import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl =
  (import.meta.env["VITE_SUPABASE_URL"] as string | undefined) ||
  "https://placeholder-indomix.supabase.co";
const supabaseAnonKey =
  (import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined) || "placeholder-anon-key";

export const isSupabaseConfigured =
  Boolean(import.meta.env["VITE_SUPABASE_URL"]) &&
  Boolean(import.meta.env["VITE_SUPABASE_ANON_KEY"]) &&
  import.meta.env["VITE_SUPABASE_URL"] !== "https://placeholder-indomix.supabase.co";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
