import React, { createContext, useContext, useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  signInAdmin: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOutAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAdminRole = async (userId: string): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      const profile = data as { role?: string } | null;
      if (error || !profile) return false;
      return profile.role === "admin";
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const hasAdminRole = await checkAdminRole(session.user.id);
        setIsAdmin(hasAdminRole);
      } else {
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const hasAdminRole = await checkAdminRole(session.user.id);
        setIsAdmin(hasAdminRole);
      } else {
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInAdmin = async (email: string, password: string): Promise<{ error: Error | null }> => {
    if (!isSupabaseConfigured) {
      return {
        error: new Error("لم يتم إعداد بيانات الاتصال بـ Supabase بشكل صحيح."),
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) return { error };

      if (data.user) {
        const hasAdmin = await checkAdminRole(data.user.id);
        if (!hasAdmin) {
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setIsAdmin(false);
          return { error: new Error("هذا الحساب ليس لديه صلاحيات الإدارة") };
        }
        setIsAdmin(true);
        setUser(data.user);
        setSession(data.session);
      }

      return { error: null };
    } catch (err: unknown) {
      const errorObj =
        err instanceof Error ? err : new Error("حدث خطأ غير متوقع أثناء تسجيل الدخول");
      return { error: errorObj };
    }
  };

  const signOutAdmin = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        isLoading,
        signInAdmin,
        signOutAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
