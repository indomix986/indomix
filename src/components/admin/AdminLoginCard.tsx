import { useState } from "react";
import { Shield, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export function AdminLoginCard() {
  const { signInAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }
    setSubmitting(true);
    const { error } = await signInAdmin(email, password);
    setSubmitting(false);
    if (error) {
      toast.error("فشل تسجيل الدخول", {
        description: error.message || "بيانات الإدارة غير صحيحة",
      });
    } else {
      toast.success("مرحباً بك في لوحة تحكم إدارة إندومكس");
    }
  };

  return (
    <div className="rounded-3xl border border-chili/30 bg-card p-6 sm:p-8 shadow-soft">
      <div className="text-center">
        <div className="grid size-14 place-items-center rounded-2xl bg-chili text-chili-foreground mx-auto shadow-md">
          <Shield className="size-7" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-foreground">بوابة إدارة إندومكس</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          الوصول مقيد لإدارة المطعم فقط عبر نظام المصادقة الآمن.
        </p>
      </div>

      <form onSubmit={handleAdminLogin} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5">
            البريد الإلكتروني
          </label>
          <div className="relative">
            <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@indomix.com"
              className="w-full rounded-xl border border-border bg-surface py-2.5 ps-10 pe-3.5 text-xs outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5">
            كلمة المرور
          </label>
          <div className="relative">
            <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-border bg-surface py-2.5 ps-10 pe-3.5 text-xs outline-none focus:border-primary"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-chili py-3 text-xs sm:text-sm font-extrabold text-chili-foreground shadow-md hover:bg-chili/90 transition-transform hover:scale-[1.02] disabled:opacity-50"
        >
          {submitting ? (
            <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Shield className="size-4" />
          )}
          <span>{submitting ? "جاري التحقق..." : "دخول لوحة الإدارة"}</span>
        </button>
      </form>
    </div>
  );
}
