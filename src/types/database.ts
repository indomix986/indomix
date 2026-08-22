export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: "admin";
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          display_order: number;
          image_url: string | null;
          is_active: boolean;
        };
        Insert: {
          id: string;
          name: string;
          display_order?: number;
          image_url?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          display_order?: number;
          image_url?: string | null;
          is_active?: boolean;
        };
      };
      products: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          description: string;
          short_description: string;
          price: number;
          old_price: number | null;
          image_url: string;
          tag: string | null;
          rating: number;
          reviews_count: number;
          prep_time: string;
          calories: string;
          spiciness_default: string;
          available_spiciness: string[];
          is_popular: boolean;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
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
          reviews_count?: number;
          prep_time?: string;
          calories?: string;
          spiciness_default?: string;
          available_spiciness?: string[];
          is_popular?: boolean;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          description?: string;
          short_description?: string;
          price?: number;
          old_price?: number | null;
          image_url?: string;
          tag?: string | null;
          rating?: number;
          reviews_count?: number;
          prep_time?: string;
          calories?: string;
          spiciness_default?: string;
          available_spiciness?: string[];
          is_popular?: boolean;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_extras: {
        Row: {
          id: string;
          product_id: string | null;
          name: string;
          price: number;
          is_available: boolean;
        };
        Insert: {
          id?: string;
          product_id?: string | null;
          name: string;
          price: number;
          is_available?: boolean;
        };
        Update: {
          id?: string;
          product_id?: string | null;
          name?: string;
          price?: number;
          is_available?: boolean;
        };
      };
      offers: {
        Row: {
          id: string;
          title: string;
          tag: string | null;
          discount_badge: string | null;
          description: string;
          items: string[];
          price: number;
          old_price: number | null;
          image_url: string;
          associated_product_id: string | null;
          valid_until: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          title: string;
          tag?: string | null;
          discount_badge?: string | null;
          description: string;
          items?: string[];
          price: number;
          old_price?: number | null;
          image_url: string;
          associated_product_id?: string | null;
          valid_until: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          tag?: string | null;
          discount_badge?: string | null;
          description?: string;
          items?: string[];
          price?: number;
          old_price?: number | null;
          image_url?: string;
          associated_product_id?: string | null;
          valid_until?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      restaurant_settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string;
        };
      };
      bot_faq: {
        Row: {
          id: string;
          question: string;
          keywords: string[];
          answer: string;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question: string;
          keywords?: string[];
          answer: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          question?: string;
          keywords?: string[];
          answer?: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
  };
}
