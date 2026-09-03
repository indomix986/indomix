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
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          display_order: number;
          image_url: string | null;
          badge_text: string | null;
          is_active: boolean;
        };
        Insert: {
          id: string;
          name: string;
          display_order?: number;
          image_url?: string | null;
          badge_text?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          display_order?: number;
          image_url?: string | null;
          badge_text?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
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
          is_popular: boolean;
          is_available: boolean;
          sizes?: Json | null;
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
          is_popular?: boolean;
          is_available?: boolean;
          sizes?: Json | null;
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
          is_popular?: boolean;
          is_available?: boolean;
          sizes?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "product_extras_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
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
          valid_until?: string;
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };
      reviews_gallery: {
        Row: {
          id: string;
          image_url: string;
          display_order: number;
          is_active: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          image_url: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          image_url?: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
