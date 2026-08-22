import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Shield,
  Utensils,
  Layers,
  Sparkles,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  LogOut,
  Lock,
  Mail,
  Search,
  ExternalLink,
  Eye,
  EyeOff,
  Star,
  Flame,
  Clock,
  Phone,
  MessageCircle,
  Truck,
  Bot,
  HelpCircle,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useAuth } from "@/context/AuthContext";
import {
  useAdminAllProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCreateProductExtra,
  useDeleteProductExtra,
  useAdminAllCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useAdminAllOffers,
  useCreateOffer,
  useUpdateOffer,
  useDeleteOffer,
  useUpdateRestaurantSettings,
  useAdminAllFaq,
  useCreateFaq,
  useUpdateFaq,
  useDeleteFaq,
  type DbBotFaq,
} from "@/hooks/use-admin";
import { useRestaurantSettings } from "@/hooks/use-catalog";
import { toast } from "sonner";
import type { Product, ExtraOption } from "@/types/product";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "لوحة إدارة مطعم إندومكس | نظام إدارة المحتوى" },
      {
        name: "description",
        content: "إدارة قائمة الطعام، الأقسام، العروض، وإعدادات مطعم إندومكس.",
      },
    ],
  }),
  component: AdminRouteWrapper,
});

function AdminRouteWrapper() {
  const { isAdmin, isLoading, signInAdmin, signOutAdmin } = useAuth();
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground" dir="rtl">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-xs font-bold text-muted-foreground">
            جاري التحقق من صلاحيات الدخول...
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground" dir="rtl">
        <Header />

        <main className="flex-1 w-full mx-auto max-w-md px-4 pb-20 pt-28">
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
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground" dir="rtl">
      <Header />
      <AdminCMSDashboard onSignOut={signOutAdmin} />
      <Footer />
    </div>
  );
}

function AdminCMSDashboard({ onSignOut }: { onSignOut: () => void }) {
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "offers" | "settings">(
    "products",
  );

  const { data: products = [], isLoading: productsLoading } = useAdminAllProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useAdminAllCategories();
  const { data: offers = [], isLoading: offersLoading } = useAdminAllOffers();

  return (
    <main className="flex-1 w-full mx-auto max-w-6xl px-4 pb-20 pt-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-chili">
            <Shield className="size-4" />
            <span>نظام إدارة محتوى إندومكس (CMS)</span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">لوحة التحكم الإدارية</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            إدارة قائمة الوجبات، الأصناف، العروض الترويجية، وأرقام التواصل والتوصيل.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive/20 transition-colors"
          >
            <LogOut className="size-3.5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* CMS Navigation Tabs */}
      <div className="mt-8 flex items-center gap-2 border-b border-border/60 pb-3 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("products")}
          className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
            activeTab === "products"
              ? "bg-heat text-primary-foreground shadow-heat"
              : "bg-surface text-foreground/80 hover:text-foreground"
          }`}
        >
          <Utensils className="size-4" />
          <span>قائمة الوجبات ({products.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("categories")}
          className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
            activeTab === "categories"
              ? "bg-heat text-primary-foreground shadow-heat"
              : "bg-surface text-foreground/80 hover:text-foreground"
          }`}
        >
          <Layers className="size-4" />
          <span>الأقسام ({categories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("offers")}
          className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
            activeTab === "offers"
              ? "bg-heat text-primary-foreground shadow-heat"
              : "bg-surface text-foreground/80 hover:text-foreground"
          }`}
        >
          <Sparkles className="size-4" />
          <span>العروض والبوكسات ({offers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
            activeTab === "settings"
              ? "bg-heat text-primary-foreground shadow-heat"
              : "bg-surface text-foreground/80 hover:text-foreground"
          }`}
        >
          <Settings className="size-4" />
          <span>إعدادات التواصل والتوصيل</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="mt-6">
        {activeTab === "products" && (
          <ProductsManagerTab
            products={products}
            categories={categories}
            loading={productsLoading}
          />
        )}
        {activeTab === "categories" && (
          <CategoriesManagerTab categories={categories} loading={categoriesLoading} />
        )}
        {activeTab === "offers" && (
          <OffersManagerTab offers={offers} products={products} loading={offersLoading} />
        )}
        {activeTab === "settings" && <SettingsManagerTab />}
      </div>
    </main>
  );
}

// ============================================================================
// TAB 1: PRODUCTS MANAGER
// ============================================================================

function ProductsManagerTab({
  products,
  categories,
  loading,
}: {
  products: Product[];
  categories: any[];
  loading: boolean;
}) {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  const filtered = products.filter((p) => {
    const matchCat = selectedCat === "all" || p.category === selectedCat;
    const matchSearch =
      search.trim() === "" || p.name.includes(search.trim()) || p.desc.includes(search.trim());
    return matchCat && matchSearch;
  });

  const handleToggleAvailability = async (p: Product) => {
    const nextVal = !(p as any).isAvailable;
    try {
      await updateProductMutation.mutateAsync({
        id: p.id,
        data: { is_available: nextVal },
      });
      toast.success(nextVal ? `تم تفعيل إتاحة "${p.name}"` : `تم إيقاف إتاحة "${p.name}"`);
    } catch {
      toast.error("فشل تحديث حالة المنتج");
    }
  };

  const handleDelete = async (p: Product) => {
    if (!window.confirm(`هل أنت متأكد من حذف الوجبة "${p.name}" نهائياً؟`)) return;
    try {
      await deleteProductMutation.mutateAsync(p.id);
      toast.success(`تم حذف "${p.name}" بنجاح`);
    } catch (err: any) {
      toast.error("فشل حذف المنتج", { description: err.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث في الوجبات..."
              className="w-full rounded-xl border border-border bg-surface py-2 ps-9 pe-3 text-xs outline-none focus:border-primary"
            />
          </div>

          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="rounded-xl border border-border bg-surface px-3 py-2 text-xs outline-none focus:border-primary font-bold"
          >
            <option value="all">كل الأقسام</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-heat px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-heat hover:scale-105 transition-transform"
        >
          <Plus className="size-4" />
          <span>إضافة وجبة جديدة</span>
        </button>
      </div>

      {/* Modal: Create Product */}
      {isCreating && (
        <ProductFormModal categories={categories} onClose={() => setIsCreating(false)} />
      )}

      {/* Modal: Edit Product */}
      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          categories={categories}
          onClose={() => setEditingProduct(null)}
        />
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-muted-foreground">جاري تحميل الوجبات...</div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-xs text-muted-foreground">لا توجد وجبات مطابقة.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const isAvail = (p as any).isAvailable !== false;
            return (
              <div
                key={p.id}
                className={`rounded-2xl border bg-card p-4 shadow-soft space-y-3 transition-all ${
                  isAvail ? "border-border" : "border-border/40 opacity-70 bg-surface/50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.img}
                      alt={p.name}
                      className="size-16 rounded-xl object-cover ring-1 ring-border shrink-0"
                    />
                    <div>
                      <h3 className="text-sm font-extrabold text-foreground">{p.name}</h3>
                      <span className="text-[10px] text-muted-foreground block">
                        {p.categoryName}
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-xs font-extrabold text-primary">{p.price} ج.م</span>
                        {p.oldPrice && (
                          <span className="text-[10px] text-muted-foreground line-through">
                            {p.oldPrice} ج.م
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                      isAvail
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : "bg-destructive/10 text-destructive border border-destructive/20"
                    }`}
                  >
                    {isAvail ? "متاح للطلب" : "غير متاح"}
                  </span>
                </div>

                <p className="text-[11px] text-muted-foreground line-clamp-2">
                  {p.shortDesc || p.desc}
                </p>

                <div className="flex items-center justify-between border-t border-border/40 pt-2.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      title={isAvail ? "إخفاء من المنيو" : "إظهار في المنيو"}
                      onClick={() => handleToggleAvailability(p)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isAvail
                          ? "border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                          : "border-border text-muted-foreground hover:bg-surface"
                      }`}
                    >
                      {isAvail ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                    </button>
                    {p.isPopular && (
                      <span className="rounded-md bg-amber-500/10 text-amber-600 px-2 py-0.5 text-[10px] font-bold">
                        مميز ★
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(p)}
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-[11px] font-bold hover:border-primary transition-colors"
                    >
                      <Edit2 className="size-3" />
                      <span>تعديل</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(p)}
                      className="p-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SMART PRICE & DISCOUNT SECTION
// ============================================================================

function SmartPriceSection({
  price,
  oldPrice,
  onPriceChange,
  onOldPriceChange,
  onBadgeSuggest,
}: {
  price: number;
  oldPrice?: number | null | undefined;
  onPriceChange: (val: number) => void;
  onOldPriceChange: (val: number | undefined) => void;
  onBadgeSuggest?: (badge: string) => void;
}) {
  const initialBase = oldPrice && oldPrice > 0 ? oldPrice : price > 0 ? price : 65;
  const [basePrice, setBasePrice] = useState<number | "">(initialBase);
  const [discountType, setDiscountType] = useState<"percentage" | "amount">("percentage");
  const [discountValue, setDiscountValue] = useState<number | "">(() => {
    if (oldPrice && oldPrice > price) {
      return Number((((oldPrice - price) / oldPrice) * 100).toFixed(1));
    }
    return "";
  });

  const updatePrices = (base: number | "", type: "percentage" | "amount", val: number | "") => {
    const numBase = typeof base === "number" ? base : 0;
    const numVal = typeof val === "number" ? val : 0;

    if (numBase <= 0) {
      onPriceChange(0);
      onOldPriceChange(undefined);
      return;
    }

    if (numVal <= 0) {
      onPriceChange(numBase);
      onOldPriceChange(undefined);
      return;
    }

    let exactFinal = 0;
    if (type === "percentage") {
      exactFinal = numBase * (1 - numVal / 100);
    } else {
      exactFinal = numBase - numVal;
    }

    if (exactFinal < 0) exactFinal = 0;
    const roundedFinal = Math.ceil(exactFinal);
    const savings = numBase - roundedFinal;

    onPriceChange(roundedFinal);
    onOldPriceChange(numBase);

    if (onBadgeSuggest && savings > 0) {
      onBadgeSuggest(`وفر ${savings} ج.م`);
    }
  };

  const handleBaseChange = (newBaseStr: string) => {
    const newBase = newBaseStr === "" ? "" : Number(newBaseStr);
    setBasePrice(newBase);
    updatePrices(newBase, discountType, discountValue);
  };

  const handleDiscountTypeChange = (newType: "percentage" | "amount") => {
    setDiscountType(newType);
    updatePrices(basePrice, newType, discountValue);
  };

  const handleDiscountValueChange = (newValStr: string) => {
    const newVal = newValStr === "" ? "" : Number(newValStr);
    setDiscountValue(newVal);
    updatePrices(basePrice, discountType, newVal);
  };

  const numBase = typeof basePrice === "number" ? basePrice : 0;
  const numVal = typeof discountValue === "number" ? discountValue : 0;
  const hasDiscount = numBase > 0 && numVal > 0 && price < numBase;

  const exactFinal =
    numBase > 0 && numVal > 0
      ? discountType === "percentage"
        ? numBase * (1 - numVal / 100)
        : numBase - numVal
      : price;

  const isRounded = hasDiscount && exactFinal !== price;
  const savings = numBase > 0 && price < numBase ? numBase - price : 0;
  const actualPercent = numBase > 0 && savings > 0 ? ((savings / numBase) * 100).toFixed(1) : 0;

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
          <Sparkles className="size-4 text-chili" />
          <span>السعر ونظام الخصم الذكي</span>
        </span>

        {hasDiscount && (
          <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
            توفير {savings} ج.م ({actualPercent}%)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 1. Base price input */}
        <div>
          <label className="block font-bold mb-1 text-xs text-foreground">
            السعر الأصلي الأساسي (ج.م) *
          </label>
          <input
            type="number"
            min={0}
            required
            value={basePrice}
            onChange={(e) => handleBaseChange(e.target.value)}
            placeholder="مثال: 100"
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs font-bold outline-none focus:border-primary"
          />
        </div>

        {/* 2. Discount inputs: type toggle + value */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block font-bold text-xs text-foreground">الخصم (اختياري)</label>
            <div className="inline-flex rounded-lg border border-border bg-surface p-0.5 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => handleDiscountTypeChange("percentage")}
                className={`rounded px-2 py-0.5 transition-colors ${
                  discountType === "percentage"
                    ? "bg-heat text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                نسبة (%)
              </button>
              <button
                type="button"
                onClick={() => handleDiscountTypeChange("amount")}
                className={`rounded px-2 py-0.5 transition-colors ${
                  discountType === "amount"
                    ? "bg-heat text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                مبلغ (ج.م)
              </button>
            </div>
          </div>

          <input
            type="number"
            min={0}
            max={discountType === "percentage" ? 100 : undefined}
            step={discountType === "percentage" ? 0.5 : 1}
            value={discountValue}
            onChange={(e) => handleDiscountValueChange(e.target.value)}
            placeholder={
              discountType === "percentage"
                ? "أدخل النسبة % (مثال: 15)"
                : "أدخل المبلغ بالجنيه (مثال: 20)"
            }
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs font-bold outline-none focus:border-primary text-primary"
          />
        </div>
      </div>

      {/* Quick percentage buttons when in percentage mode */}
      {discountType === "percentage" && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[10px] font-bold text-muted-foreground">نسب جاهزة:</span>
          {[0, 10, 15, 20, 25, 30, 50].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => {
                const val = pct === 0 ? "" : pct;
                setDiscountValue(val);
                updatePrices(basePrice, "percentage", val);
              }}
              className={`rounded-lg px-2 py-0.5 text-[10px] font-bold transition-all ${
                (pct === 0 && discountValue === "") || discountValue === pct
                  ? "bg-heat text-primary-foreground shadow-sm"
                  : "border border-border bg-surface text-foreground/80 hover:border-primary/40"
              }`}
            >
              {pct === 0 ? "بدون خصم" : `${pct}%`}
            </button>
          ))}
        </div>
      )}

      {/* 3. Output Final Price Result and Explicit Rounding Explanation */}
      <div className="rounded-xl border border-border bg-surface/80 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div>
          <span className="text-[10px] text-muted-foreground block font-bold">
            السعر النهائي المحسوب تلقائياً (سعر البيع):
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-extrabold text-primary">{price} ج.م</span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">{numBase} ج.م</span>
            )}
          </div>
        </div>

        {hasDiscount && (
          <div className="text-start sm:text-end text-[11px] font-bold text-emerald-600">
            وفر {savings} ج.م (نسبة فعلية {actualPercent}%)
          </div>
        )}
      </div>

      {/* Explicit rounding note */}
      {isRounded && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px] leading-relaxed text-amber-700 dark:text-amber-400 font-bold flex items-start gap-1.5">
          <span className="shrink-0 mt-0.5">⚠️</span>
          <span>
            تنبيه التقريب: السعر الأصلي <span className="underline">{numBase} ج.م</span>، والسعر بعد
            الخصم الدقيق كان <span className="underline">{Number(exactFinal.toFixed(2))} ج.م</span>،
            وتم تقريبه للأعلى تلقائياً إلى{" "}
            <span className="font-extrabold text-foreground">{price} ج.م</span> لتجنب الكسور.
          </span>
        </div>
      )}
    </div>
  );
}

function ProductFormModal({ categories, onClose }: { categories: any[]; onClose: () => void }) {
  const createMutation = useCreateProduct();

  const [id, setId] = useState("");
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id || "classic");
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(65);
  const [oldPrice, setOldPrice] = useState<number | undefined>(undefined);
  const [imageUrl, setImageUrl] = useState("/assets/cat-classic.jpg");
  const [tag, setTag] = useState("");
  const [isPopular, setIsPopular] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !imageUrl.trim()) {
      toast.error("يرجى ملء جميع الحقول الإلزامية");
      return;
    }

    const slug =
      id.trim() ||
      name.trim().toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString().slice(-4);

    try {
      await createMutation.mutateAsync({
        id: slug,
        category_id: categoryId,
        name,
        short_description: shortDescription || name,
        description,
        price,
        old_price: oldPrice || null,
        image_url: imageUrl,
        tag: tag || null,
        prep_time: "",
        calories: "",
        spiciness_default: "بدون شطة",
        available_spiciness: ["بدون شطة"],
        is_popular: isPopular,
        is_available: isAvailable,
      });
      toast.success("تمت إضافة الوجبة بنجاح!");
      onClose();
    } catch (err: any) {
      toast.error("فشل إنشاء الوجبة", { description: err.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto overscroll-contain">
      <div className="w-full max-w-2xl my-auto sm:my-8 flex max-h-[92vh] sm:max-h-[88vh] flex-col rounded-2xl sm:rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Sticky Header */}
        <div className="flex items-center justify-between border-b border-border/60 bg-card px-4 py-3 sm:px-6 sm:py-4 shrink-0 z-10">
          <h2 className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2">
            <Plus className="size-4 text-primary" />
            <span>إضافة وجبة جديدة للمنيو</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form
          id="product-create-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs overscroll-contain"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1">اسم الوجبة *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: إندومكس تشيز سوبريم"
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">القسم *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary font-bold"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Smart Pricing & Discount Section */}
          <SmartPriceSection
            price={price}
            oldPrice={oldPrice}
            onPriceChange={setPrice}
            onOldPriceChange={setOldPrice}
            onBadgeSuggest={(badge) => {
              if (!tag) setTag(badge);
            }}
          />

          <div>
            <label className="block font-bold mb-1">رابط الصورة المباشر (Image URL) *</label>
            <input
              type="text"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="/assets/cat-classic.jpg أو https://..."
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">الوصف المختصر (يظهر في الكارت)</label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="وصف من سطر واحد يوضح المكونات الأساسية"
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">الوصف الكامل *</label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف تفصيلي للوجبة وطريقة إعدادها"
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary resize-none"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">الشارة الترويجية (Tag)</label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="الأكثر طلبًا / جديد"
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-6 pt-2 border-t border-border/40">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="size-4 rounded accent-primary"
              />
              <span className="font-bold">تمييز كـ الأكثر طلبًا ★</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="size-4 rounded accent-primary"
              />
              <span className="font-bold">متاح للطلب الآن في المنيو</span>
            </label>
          </div>
        </form>

        {/* Sticky Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border/60 bg-card px-4 py-3 sm:px-6 sm:py-4 shrink-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            form="product-create-form"
            disabled={createMutation.isPending}
            className="rounded-xl bg-heat px-6 py-2 text-xs font-bold text-primary-foreground shadow-heat disabled:opacity-50 transition-transform hover:scale-105"
          >
            {createMutation.isPending ? "جاري الحفظ..." : "حفظ الوجبة"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductEditModal({
  product,
  categories,
  onClose,
}: {
  product: Product;
  categories: any[];
  onClose: () => void;
}) {
  const updateMutation = useUpdateProduct();
  const createExtraMutation = useCreateProductExtra();
  const deleteExtraMutation = useDeleteProductExtra();

  const [name, setName] = useState(product.name);
  const [categoryId, setCategoryId] = useState<string>(product.category);
  const [price, setPrice] = useState(product.price);
  const [oldPrice, setOldPrice] = useState<number | undefined>(product.oldPrice || undefined);
  const [imageUrl, setImageUrl] = useState(product.img);
  const [tag, setTag] = useState(product.tag || "");
  const [shortDescription, setShortDescription] = useState(product.shortDesc);
  const [description, setDescription] = useState(product.desc);
  const [isPopular, setIsPopular] = useState(Boolean(product.isPopular));
  const [isAvailable, setIsAvailable] = useState((product as any).isAvailable !== false);

  // New Extra form state
  const [newExtraName, setNewExtraName] = useState("");
  const [newExtraPrice, setNewExtraPrice] = useState(15);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateMutation.mutateAsync({
        id: product.id,
        data: {
          name,
          category_id: categoryId,
          price,
          old_price: oldPrice || null,
          image_url: imageUrl,
          tag: tag || null,
          short_description: shortDescription,
          description,
          is_popular: isPopular,
          is_available: isAvailable,
        },
      });
      toast.success("تم تحديث الوجبة بنجاح");
      onClose();
    } catch (err: any) {
      toast.error("فشل تحديث الوجبة", { description: err.message });
    }
  };

  const handleAddExtra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExtraName.trim()) return;
    try {
      await createExtraMutation.mutateAsync({
        productId: product.id,
        name: newExtraName,
        price: newExtraPrice,
      });
      setNewExtraName("");
      toast.success("تمت إضافة الإضافة الجديدة");
    } catch (err: any) {
      toast.error("فشل إضافة الإضافة", { description: err.message });
    }
  };

  const handleDeleteExtra = async (extraId: string) => {
    try {
      await deleteExtraMutation.mutateAsync(extraId);
      toast.success("تم حذف الإضافة");
    } catch (err: any) {
      toast.error("فشل حذف الإضافة", { description: err.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto overscroll-contain">
      <div className="w-full max-w-2xl my-auto sm:my-8 flex max-h-[92vh] sm:max-h-[88vh] flex-col rounded-2xl sm:rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Sticky Header */}
        <div className="flex items-center justify-between border-b border-border/60 bg-card px-4 py-3 sm:px-6 sm:py-4 shrink-0">
          <h2 className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2">
            <Edit2 className="size-4 text-primary" />
            <span>تعديل وجبة: {product.name}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs overscroll-contain">
          <form id="product-edit-form" onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">اسم الوجبة *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">القسم *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary font-bold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Smart Pricing & Discount Section */}
            <SmartPriceSection
              price={price}
              oldPrice={oldPrice}
              onPriceChange={setPrice}
              onOldPriceChange={setOldPrice}
              onBadgeSuggest={(badge) => {
                if (!tag) setTag(badge);
              }}
            />

            <div>
              <label className="block font-bold mb-1">رابط الصورة (Image URL) *</label>
              <input
                type="text"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">الوصف المختصر</label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">الوصف الكامل *</label>
              <textarea
                rows={2}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary resize-none"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">الشارة الترويجية (Tag)</label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-6 pt-2 border-t border-border/40">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="size-4 rounded accent-primary"
                />
                <span className="font-bold">مميز كـ الأكثر طلبًا ★</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="size-4 rounded accent-primary"
                />
                <span className="font-bold">متاح للطلب</span>
              </label>
            </div>
          </form>

          {/* Product Extras Management */}
          <div className="border-t border-border/60 pt-4 space-y-3">
            <h3 className="text-xs font-extrabold text-foreground">إضافات وتوبينجز هذه الوجبة:</h3>

            <div className="space-y-1.5">
              {product.extras?.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">
                  لا توجد إضافات مسجلة لهذه الوجبة بعد.
                </p>
              ) : (
                product.extras?.map((extra) => (
                  <div
                    key={extra.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-1.5 text-xs"
                  >
                    <span className="font-bold">{extra.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-primary">+{extra.price} ج.م</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteExtra(extra.id)}
                        className="text-destructive hover:opacity-80 p-1"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add extra form */}
            <form onSubmit={handleAddExtra} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                required
                value={newExtraName}
                onChange={(e) => setNewExtraName(e.target.value)}
                placeholder="اسم الإضافة (مثال: دبل جبنة)"
                className="flex-1 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs outline-none focus:border-primary"
              />
              <input
                type="number"
                required
                min={0}
                value={newExtraPrice}
                onChange={(e) => setNewExtraPrice(Number(e.target.value))}
                className="w-20 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs outline-none focus:border-primary text-center"
              />
              <button
                type="submit"
                disabled={createExtraMutation.isPending}
                className="inline-flex items-center gap-1 rounded-xl bg-surface border border-primary px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Plus className="size-3.5" />
                <span>إضافة</span>
              </button>
            </form>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border/60 bg-card px-4 py-3 sm:px-6 sm:py-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            form="product-edit-form"
            disabled={updateMutation.isPending}
            className="rounded-xl bg-heat px-6 py-2 text-xs font-bold text-primary-foreground shadow-heat disabled:opacity-50 transition-transform hover:scale-105"
          >
            {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TAB 2: CATEGORIES MANAGER
// ============================================================================

function CategoriesManagerTab({ categories, loading }: { categories: any[]; loading: boolean }) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const [newCatId, setNewCatId] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [newCatOrder, setNewCatOrder] = useState(categories.length + 1);
  const [newCatImage, setNewCatImage] = useState("/assets/cat-classic.jpg");

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const slug = newCatId.trim() || newCatName.trim().toLowerCase().replace(/\s+/g, "-");
    try {
      await createCategoryMutation.mutateAsync({
        id: slug,
        name: newCatName,
        display_order: newCatOrder,
        image_url: newCatImage,
        is_active: true,
      });
      setNewCatId("");
      setNewCatName("");
      setIsCreating(false);
      toast.success("تم إنشاء القسم بنجاح");
    } catch (err: any) {
      toast.error("فشل إنشاء القسم", { description: err.message });
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      await updateCategoryMutation.mutateAsync({
        id: editingCategory.id,
        data: {
          name: editingCategory.name,
          display_order: editingCategory.display_order,
          image_url: editingCategory.image_url,
          is_active: editingCategory.is_active,
        },
      });
      setEditingCategory(null);
      toast.success("تم تحديث القسم بنجاح");
    } catch (err: any) {
      toast.error("فشل تحديث القسم", { description: err.message });
    }
  };

  const handleDeleteCategory = async (cat: any) => {
    if (!window.confirm(`هل أنت متأكد من حذف قسم "${cat.name}"؟`)) return;
    try {
      await deleteCategoryMutation.mutateAsync(cat.id);
      toast.success("تم حذف القسم بنجاح");
    } catch (err: any) {
      toast.error("فشل حذف القسم", { description: err.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-foreground">أقسام منيو المطعم</h2>
          <p className="text-[11px] text-muted-foreground">
            تتحكم هذه الأقسام في شريط التصفية والفلترة بالصفحة الرئيسية وصفحة المنيو.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-heat px-4 py-2 text-xs font-bold text-primary-foreground shadow-heat hover:scale-105 transition-transform"
        >
          <Plus className="size-4" />
          <span>إضافة قسم جديد</span>
        </button>
      </div>

      {/* Modal: Create Category */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto overscroll-contain">
          <div className="w-full max-w-md my-auto sm:my-8 flex max-h-[92vh] sm:max-h-[88vh] flex-col rounded-2xl sm:rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Sticky Header */}
            <div className="flex items-center justify-between border-b border-border/60 bg-card px-4 py-3 sm:px-6 sm:py-4 shrink-0">
              <h3 className="text-sm font-extrabold text-foreground">إضافة قسم جديد</h3>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 overscroll-contain">
              <form
                id="cat-create-form"
                onSubmit={handleCreateCategory}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block font-bold mb-1">اسم القسم *</label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="مثال: نودلز بالجبنة"
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">معرف القسم (ID / Slug)</label>
                  <input
                    type="text"
                    value={newCatId}
                    onChange={(e) => setNewCatId(e.target.value)}
                    placeholder="اتركه فارغاً للتوليد التلقائي"
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">ترتيب العرض</label>
                  <input
                    type="number"
                    value={newCatOrder}
                    onChange={(e) => setNewCatOrder(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">رابط صورة القسم</label>
                  <input
                    type="text"
                    value={newCatImage}
                    onChange={(e) => setNewCatImage(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
                  />
                </div>
              </form>
            </div>

            {/* Sticky Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-border/60 bg-card px-4 py-3 sm:px-6 sm:py-4 shrink-0">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                form="cat-create-form"
                disabled={createCategoryMutation.isPending}
                className="rounded-xl bg-heat px-5 py-2 text-xs font-bold text-primary-foreground shadow-heat disabled:opacity-50 transition-transform hover:scale-105"
              >
                {createCategoryMutation.isPending ? "جاري الإنشاء..." : "إنشاء القسم"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Category */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto overscroll-contain">
          <div className="w-full max-w-md my-auto sm:my-8 flex max-h-[92vh] sm:max-h-[88vh] flex-col rounded-2xl sm:rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Sticky Header */}
            <div className="flex items-center justify-between border-b border-border/60 bg-card px-4 py-3 sm:px-6 sm:py-4 shrink-0">
              <h3 className="text-sm font-extrabold text-foreground">
                تعديل قسم: {editingCategory.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 overscroll-contain">
              <form
                id="cat-edit-form"
                onSubmit={handleUpdateCategory}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block font-bold mb-1">اسم القسم *</label>
                  <input
                    type="text"
                    required
                    value={editingCategory.name}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, name: e.target.value })
                    }
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">ترتيب العرض</label>
                  <input
                    type="number"
                    value={editingCategory.display_order}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        display_order: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">رابط صورة القسم</label>
                  <input
                    type="text"
                    value={editingCategory.image_url || ""}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, image_url: e.target.value })
                    }
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="cat_active"
                    checked={editingCategory.is_active}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, is_active: e.target.checked })
                    }
                    className="size-4 rounded accent-primary"
                  />
                  <label htmlFor="cat_active" className="font-bold cursor-pointer">
                    مفعل ويظهر في شريط الأقسام
                  </label>
                </div>
              </form>
            </div>

            {/* Sticky Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-border/60 bg-card px-4 py-3 sm:px-6 sm:py-4 shrink-0">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                form="cat-edit-form"
                disabled={updateCategoryMutation.isPending}
                className="rounded-xl bg-heat px-5 py-2 text-xs font-bold text-primary-foreground shadow-heat disabled:opacity-50 transition-transform hover:scale-105"
              >
                {updateCategoryMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-muted-foreground">جاري تحميل الأقسام...</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-soft flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                {c.image_url ? (
                  <img
                    src={c.image_url}
                    alt={c.name}
                    className="size-12 rounded-xl object-cover ring-1 ring-border"
                  />
                ) : (
                  <div className="size-12 rounded-xl bg-surface grid place-items-center font-bold text-primary">
                    {c.name.slice(0, 2)}
                  </div>
                )}
                <div>
                  <h3 className="text-xs font-extrabold text-foreground">{c.name}</h3>
                  <span className="text-[10px] text-muted-foreground block">
                    الترتيب: {c.display_order} | ID: {c.id}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setEditingCategory(c)}
                  className="p-1.5 rounded-lg border border-border bg-surface text-foreground hover:border-primary transition-colors"
                >
                  <Edit2 className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(c)}
                  className="p-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TAB 3: OFFERS MANAGER
// ============================================================================

function OffersManagerTab({
  offers,
  products,
  loading,
}: {
  offers: any[];
  products: Product[];
  loading: boolean;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any | null>(null);

  const createOfferMutation = useCreateOffer();
  const updateOfferMutation = useUpdateOffer();
  const deleteOfferMutation = useDeleteOffer();

  // Create form state
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("العرض الأقوى");
  const [discountBadge, setDiscountBadge] = useState("وفر ٥٠ ج.م");
  const [description, setDescription] = useState("");
  const [itemsText, setItemsText] = useState("");
  const [price, setPrice] = useState(199);
  const [oldPrice, setOldPrice] = useState(250);
  const [imageUrl, setImageUrl] = useState("/assets/hero-noodles.jpg");
  const [associatedProductId, setAssociatedProductId] = useState(products[0]?.id || "");
  const [validUntil, setValidUntil] = useState("عرض ساري هذا الأسبوع");

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedTitle = title
      .trim()
      .toLowerCase()
      .replace(/[^\w\u0621-\u064A]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const slug = sanitizedTitle
      ? `${sanitizedTitle}-${Date.now().toString().slice(-4)}`
      : `offer-${Date.now()}`;
    const items = itemsText
      .split("\n")
      .map((i) => i.trim())
      .filter(Boolean);

    try {
      await createOfferMutation.mutateAsync({
        id: slug,
        title: title.trim(),
        tag: tag.trim() || null,
        discount_badge: discountBadge.trim() || null,
        description: description.trim(),
        items: items.length > 0 ? items : ["وجبة مخصصة"],
        price,
        old_price: oldPrice || null,
        image_url: imageUrl.trim(),
        associated_product_id: associatedProductId.trim() || null,
        valid_until: validUntil.trim() || "عرض ساري",
        is_active: true,
      });
      setIsCreating(false);
      setTitle("");
      setDescription("");
      toast.success("تم إنشاء العرض بنجاح");
    } catch (err: any) {
      toast.error("فشل إنشاء العرض", { description: err.message });
    }
  };

  const handleUpdateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer) return;
    const items =
      typeof editingOffer.itemsText === "string"
        ? editingOffer.itemsText
            .split("\n")
            .map((i: string) => i.trim())
            .filter(Boolean)
        : editingOffer.items;

    try {
      await updateOfferMutation.mutateAsync({
        id: editingOffer.id,
        data: {
          title: editingOffer.title,
          tag: editingOffer.tag,
          discount_badge: editingOffer.discount_badge,
          description: editingOffer.description,
          items,
          price: editingOffer.price,
          old_price: editingOffer.old_price,
          image_url: editingOffer.image_url,
          associated_product_id: editingOffer.associated_product_id || null,
          valid_until: editingOffer.valid_until,
          is_active: editingOffer.is_active,
        },
      });
      setEditingOffer(null);
      toast.success("تم تحديث العرض بنجاح");
    } catch (err: any) {
      toast.error("فشل تحديث العرض", { description: err.message });
    }
  };

  const handleDeleteOffer = async (offer: any) => {
    if (!window.confirm(`هل أنت متأكد من حذف العرض "${offer.title}"؟`)) return;
    try {
      await deleteOfferMutation.mutateAsync(offer.id);
      toast.success("تم حذف العرض بنجاح");
    } catch (err: any) {
      toast.error("فشل حذف العرض", { description: err.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-foreground">عروض وبكجات التوفير</h2>
          <p className="text-[11px] text-muted-foreground">
            تظهر هذه العروض في صفحة العروض والبوكسات وقسم العروض بالصفحة الرئيسية.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-heat px-4 py-2 text-xs font-bold text-primary-foreground shadow-heat hover:scale-105 transition-transform"
        >
          <Plus className="size-4" />
          <span>إضافة عرض جديد</span>
        </button>
      </div>

      {/* Modal: Create Offer */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto overscroll-contain">
          <div className="w-full max-w-xl my-auto sm:my-8 flex max-h-[92vh] sm:max-h-[88vh] flex-col rounded-2xl sm:rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border/60 bg-card px-4 py-3 sm:px-6 sm:py-4 shrink-0">
              <h3 className="text-sm font-extrabold text-foreground">إنشاء عرض / بكج جديد</h3>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 overscroll-contain">
              <form
                id="offer-create-form-inner"
                onSubmit={handleCreateOffer}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block font-bold mb-1">عنوان العرض *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: بوكس اللمة والعزومة الكبيرة"
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1">شارة التوفير (Badge)</label>
                    <input
                      type="text"
                      value={discountBadge}
                      onChange={(e) => setDiscountBadge(e.target.value)}
                      placeholder="وفر ٦٠ ج.م"
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">الوسم (Tag)</label>
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      placeholder="الأكثر مبيعاً"
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Smart Pricing & Discount Section */}
                <SmartPriceSection
                  price={price}
                  oldPrice={oldPrice}
                  onPriceChange={setPrice}
                  onOldPriceChange={(val) => setOldPrice(val || 0)}
                  onBadgeSuggest={(badge) => {
                    setDiscountBadge(badge);
                  }}
                />

                <div>
                  <label className="block font-bold mb-1">رابط صورة العرض *</label>
                  <input
                    type="text"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">وصف العرض *</label>
                  <textarea
                    rows={2}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary resize-none"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">محتويات البكج (كل عنصر في سطر)</label>
                  <textarea
                    rows={3}
                    value={itemsText}
                    onChange={(e) => setItemsText(e.target.value)}
                    placeholder="٤ أطباق إندومي من اختيارك&#10;٢ طبق موتزاريلا ستيكس&#10;لتر بيبسي بارد"
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1">الوجبة المرتبطة (للطلب السريع)</label>
                    <select
                      value={associatedProductId}
                      onChange={(e) => setAssociatedProductId(e.target.value)}
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary font-bold"
                    >
                      <option value="">بدون ربط</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold mb-1">صلاحية العرض</label>
                    <input
                      type="text"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Sticky Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-border/60 bg-card px-4 py-3 sm:px-6 sm:py-4 shrink-0">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                form="offer-create-form-inner"
                disabled={createOfferMutation.isPending}
                className="rounded-xl bg-heat px-5 py-2 text-xs font-bold text-primary-foreground shadow-heat disabled:opacity-50 transition-transform hover:scale-105"
              >
                {createOfferMutation.isPending ? "جاري الإنشاء..." : "إنشاء العرض"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Offer */}
      {editingOffer && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto overscroll-contain">
          <div className="w-full max-w-xl my-auto sm:my-8 flex max-h-[92vh] sm:max-h-[88vh] flex-col rounded-2xl sm:rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Sticky Header */}
            <div className="flex items-center justify-between border-b border-border/60 bg-card px-4 py-3 sm:px-6 sm:py-4 shrink-0">
              <h3 className="text-sm font-extrabold text-foreground">
                تعديل عرض: {editingOffer.title}
              </h3>
              <button
                type="button"
                onClick={() => setEditingOffer(null)}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 overscroll-contain">
              <form id="offer-edit-form" onSubmit={handleUpdateOffer} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold mb-1">عنوان العرض *</label>
                  <input
                    type="text"
                    required
                    value={editingOffer.title}
                    onChange={(e) => setEditingOffer({ ...editingOffer, title: e.target.value })}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1">شارة التوفير</label>
                    <input
                      type="text"
                      value={editingOffer.discount_badge || ""}
                      onChange={(e) =>
                        setEditingOffer({ ...editingOffer, discount_badge: e.target.value })
                      }
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">الوسم</label>
                    <input
                      type="text"
                      value={editingOffer.tag || ""}
                      onChange={(e) => setEditingOffer({ ...editingOffer, tag: e.target.value })}
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Smart Pricing & Discount Section */}
                <SmartPriceSection
                  price={editingOffer.price}
                  oldPrice={editingOffer.old_price}
                  onPriceChange={(val) => setEditingOffer((prev: any) => ({ ...prev, price: val }))}
                  onOldPriceChange={(val) =>
                    setEditingOffer((prev: any) => ({ ...prev, old_price: val || null }))
                  }
                  onBadgeSuggest={(badge) => {
                    setEditingOffer((prev: any) => ({ ...prev, discount_badge: badge }));
                  }}
                />

                <div>
                  <label className="block font-bold mb-1">رابط الصورة</label>
                  <input
                    type="text"
                    required
                    value={editingOffer.image_url}
                    onChange={(e) =>
                      setEditingOffer({ ...editingOffer, image_url: e.target.value })
                    }
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">الوصف</label>
                  <textarea
                    rows={2}
                    required
                    value={editingOffer.description}
                    onChange={(e) =>
                      setEditingOffer({ ...editingOffer, description: e.target.value })
                    }
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary resize-none"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">المحتويات (كل عنصر في سطر)</label>
                  <textarea
                    rows={3}
                    value={
                      editingOffer.itemsText !== undefined
                        ? editingOffer.itemsText
                        : Array.isArray(editingOffer.items)
                          ? editingOffer.items.join("\n")
                          : ""
                    }
                    onChange={(e) =>
                      setEditingOffer({ ...editingOffer, itemsText: e.target.value })
                    }
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary resize-none"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">الوجبة المرتبطة (للطلب السريع)</label>
                  <select
                    value={editingOffer.associated_product_id || ""}
                    onChange={(e) =>
                      setEditingOffer({
                        ...editingOffer,
                        associated_product_id: e.target.value || null,
                      })
                    }
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary font-bold"
                  >
                    <option value="">بدون ربط (عرض مستقل)</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="offer_active"
                    checked={editingOffer.is_active}
                    onChange={(e) =>
                      setEditingOffer({ ...editingOffer, is_active: e.target.checked })
                    }
                    className="size-4 rounded accent-primary"
                  />
                  <label htmlFor="offer_active" className="font-bold cursor-pointer">
                    العرض مفعل ويظهر في الموقع
                  </label>
                </div>
              </form>
            </div>

            {/* Sticky Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-border/60 bg-card px-4 py-3 sm:px-6 sm:py-4 shrink-0">
              <button
                type="button"
                onClick={() => setEditingOffer(null)}
                className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                form="offer-edit-form"
                disabled={updateOfferMutation.isPending}
                className="rounded-xl bg-heat px-5 py-2 text-xs font-bold text-primary-foreground shadow-heat disabled:opacity-50 transition-transform hover:scale-105"
              >
                {updateOfferMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offers Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-muted-foreground">جاري تحميل العروض...</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((o) => (
            <div
              key={o.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-soft space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={o.image_url}
                      alt={o.title}
                      className="size-16 rounded-xl object-cover ring-1 ring-border shrink-0"
                    />
                    <div>
                      <h3 className="text-xs font-extrabold text-foreground">{o.title}</h3>
                      <span className="text-[10px] text-chili font-bold block">
                        {o.discount_badge}
                      </span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xs font-extrabold text-primary">{o.price} ج.م</span>
                        {o.old_price && (
                          <span className="text-[10px] text-muted-foreground line-through">
                            {o.old_price} ج.م
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                      o.is_active
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : "bg-surface text-muted-foreground"
                    }`}
                  >
                    {o.is_active ? "مفعل" : "معطل"}
                  </span>
                </div>

                <p className="mt-2 text-[11px] text-muted-foreground line-clamp-2">
                  {o.description}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-border/40 pt-2.5">
                <span className="text-[10px] text-muted-foreground font-bold">{o.valid_until}</span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditingOffer(o)}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-[11px] font-bold hover:border-primary transition-colors"
                  >
                    <Edit2 className="size-3" />
                    <span>تعديل</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteOffer(o)}
                    className="p-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TAB 4: SETTINGS MANAGER
// ============================================================================

function SettingsManagerTab() {
  const { data: settings } = useRestaurantSettings();
  const updateSettingsMutation = useUpdateRestaurantSettings();

  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [deliveryFee, setDeliveryFee] = useState(20);

  useEffect(() => {
    if (settings) {
      setPhone(settings.phone);
      setWhatsapp(settings.whatsapp);
      setWorkingHours(settings.working_hours);
      setIsOpen(settings.is_open);
      setDeliveryFee(settings.delivery_fee);
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !whatsapp.trim()) {
      toast.error("يرجى إدخال أرقام الهاتف والواتساب");
      return;
    }

    try {
      await updateSettingsMutation.mutateAsync({
        phone,
        whatsapp,
        working_hours: workingHours,
        is_open: isOpen,
        delivery_fee: deliveryFee,
      });
      toast.success("تم تحديث إعدادات المطعم بنجاح وتطبيقها على الموقع!");
    } catch (err: any) {
      toast.error("فشل حفظ الإعدادات", { description: err.message });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Restaurant Settings Card */}
      <form
        onSubmit={handleSave}
        className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-soft space-y-6 text-xs"
      >
        <div className="border-b border-border/60 pb-3">
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <Settings className="size-4 text-primary" />
            <span>إعدادات التواصل والتشغيل الفعلية</span>
          </h2>
          <p className="mt-1 text-muted-foreground text-[11px]">
            أي تعديل هنا ينعكس فوراً على رابط الواتساب في السلة، صفحة تواصل معنا، الفوتر، والرسوم.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block font-bold mb-1.5 flex items-center gap-1.5">
              <MessageCircle className="size-3.5 text-emerald-500" />
              <span>رقم الواتساب لاستقبال الطلبات (صيغة دولية بدون +) *</span>
            </label>
            <input
              type="text"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="مثال: 201015770734"
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs outline-none focus:border-primary font-bold"
            />
          </div>

          <div>
            <label className="block font-bold mb-1.5 flex items-center gap-1.5">
              <Phone className="size-3.5 text-primary" />
              <span>رقم هاتف الخط الساخن والدليفري *</span>
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="مثال: 01015770734"
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs outline-none focus:border-primary font-bold"
            />
          </div>

          <div>
            <label className="block font-bold mb-1.5 flex items-center gap-1.5">
              <Clock className="size-3.5 text-muted-foreground" />
              <span>مواعيد العمل</span>
            </label>
            <input
              type="text"
              value={workingHours}
              onChange={(e) => setWorkingHours(e.target.value)}
              placeholder="يوميًا من ١١:٠٠ صباحًا حتى ٣:٠٠ فجرًا"
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-bold mb-1.5 flex items-center gap-1.5">
              <Truck className="size-3.5 text-primary" />
              <span>رسوم التوصيل الأساسية (ج.م) *</span>
            </label>
            <input
              type="number"
              required
              min={0}
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs outline-none focus:border-primary font-bold"
            />
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-border/40">
            <input
              type="checkbox"
              id="is_open_toggle"
              checked={isOpen}
              onChange={(e) => setIsOpen(e.target.checked)}
              className="size-4.5 rounded accent-primary"
            />
            <label htmlFor="is_open_toggle" className="font-bold cursor-pointer">
              المطعم مفتوح ويستقبل الطلبات حالياً
            </label>
          </div>
        </div>

        <div className="pt-3 border-t border-border/60 flex justify-end">
          <button
            type="submit"
            disabled={updateSettingsMutation.isPending}
            className="inline-flex items-center gap-2 rounded-2xl bg-heat px-8 py-3 text-xs font-bold text-primary-foreground shadow-heat hover:scale-105 transition-transform disabled:opacity-50"
          >
            {updateSettingsMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
        </div>
      </form>

      {/* Bot FAQ Manager Section */}
      <BotFaqManagerSection />
    </div>
  );
}

// ============================================================================
// BOT FAQ MANAGEMENT SECTION
// ============================================================================

function BotFaqManagerSection() {
  const { data: faqList = [], isLoading } = useAdminAllFaq();
  const updateFaqMutation = useUpdateFaq();
  const deleteFaqMutation = useDeleteFaq();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<DbBotFaq | null>(null);

  const handleToggleActive = async (faq: DbBotFaq) => {
    try {
      await updateFaqMutation.mutateAsync({
        id: faq.id,
        data: { is_active: !faq.is_active },
      });
      toast.success(faq.is_active ? "تم تعطيل السؤال" : "تم تفعيل السؤال");
    } catch (err: any) {
      toast.error("فشل تعديل الحالة", { description: err.message });
    }
  };

  const handleDelete = async (id: string, question: string) => {
    if (!confirm(`هل أنت متأكد من حذف سؤال "${question}"؟`)) return;
    try {
      await deleteFaqMutation.mutateAsync(id);
      toast.success("تم حذف السؤال بنجاح");
    } catch (err: any) {
      toast.error("فشل حذف السؤال", { description: err.message });
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-soft space-y-6 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <Bot className="size-4.5 text-primary" />
            <span>أسئلة وإجابات بوت المساعد الذكي (FAQ)</span>
          </h2>
          <p className="mt-1 text-muted-foreground text-[11px]">
            أضف أو عدل الأسئلة والإجابات والكلمات المفتاحية التي يفهمها بوت الصفحة الرئيسية للرد
            التلقائي على الزبائن.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-heat px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-heat hover:scale-105 transition-transform shrink-0"
        >
          <Plus className="size-4" />
          <span>إضافة سؤال جديد</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">جاري تحميل الأسئلة...</div>
      ) : faqList.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <HelpCircle className="size-10 text-muted-foreground/50 mx-auto" />
          <p className="font-bold text-foreground">لا توجد أسئلة مضافة للبوت بعد</p>
          <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
            يمكنك إضافة أسئلة شائعة وإجاباتها ليقوم المساعد الذكي في الصفحة الرئيسية بالرد عليها
            فورياً.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {faqList.map((faq) => (
            <div
              key={faq.id}
              className={`rounded-2xl border transition-all p-4 ${
                faq.is_active
                  ? "border-border bg-surface/60"
                  : "border-dashed border-border/60 bg-surface/20 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-foreground">{faq.question}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      ترتيب #{faq.display_order}
                    </span>
                    {!faq.is_active && (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
                        معطل
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {faq.answer}
                  </p>
                  {faq.keywords && faq.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        الكلمات المفتاحية:
                      </span>
                      {faq.keywords.map((k, i) => (
                        <span
                          key={i}
                          className="rounded-lg bg-card border border-border px-1.5 py-0.5 text-[10px] text-foreground/80 font-medium"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(faq)}
                    title={faq.is_active ? "تعطيل السؤال" : "تفعيل السؤال"}
                    className={`grid size-8 place-items-center rounded-xl border transition-colors ${
                      faq.is_active
                        ? "border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                        : "border-border text-muted-foreground hover:bg-surface"
                    }`}
                  >
                    {faq.is_active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingFaq(faq)}
                    title="تعديل"
                    className="grid size-8 place-items-center rounded-xl border border-border text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
                  >
                    <Edit2 className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(faq.id, faq.question)}
                    title="حذف"
                    className="grid size-8 place-items-center rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAddOpen && <AddFaqModal onClose={() => setIsAddOpen(false)} />}
      {editingFaq && <EditFaqModal faq={editingFaq} onClose={() => setEditingFaq(null)} />}
    </div>
  );
}

// ============================================================================
// ADD FAQ MODAL
// ============================================================================

function AddFaqModal({ onClose }: { onClose: () => void }) {
  const createFaqMutation = useCreateFaq();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [keywords, setKeywords] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      toast.error("يرجى ملء نص السؤال والإجابة");
      return;
    }

    const keywordList = keywords
      .split(/[،,]/)
      .map((k) => k.trim())
      .filter(Boolean);

    try {
      await createFaqMutation.mutateAsync({
        question,
        answer,
        keywords: keywordList,
        display_order: displayOrder,
        is_active: isActive,
      });
      toast.success("تمت إضافة السؤال بنجاح!");
      onClose();
    } catch (err: any) {
      toast.error("فشل إضافة السؤال", { description: err.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border/60 bg-card px-6 py-4">
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <Plus className="size-4 text-primary" />
            <span>إضافة سؤال جديد لبوت الصفحة الرئيسية</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold mb-1">نص السؤال أو الموضوع *</label>
            <input
              type="text"
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="مثال: هل متاح توصيل لأكتوبر؟ أو ما هي أنواع الصوصات؟"
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 outline-none focus:border-primary font-bold"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">الإجابة التلقائية للبوت *</label>
            <textarea
              rows={3}
              required
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="اكتب الإجابة المفصلة التي سيرد بها البوت..."
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary resize-none"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">
              الكلمات المفتاحية للتعرف على السؤال (مفصولة بفاصلة)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="مثال: توصيل، دليفري، وقت، مدة، سريع"
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">
              عندما يكتب الزائر أياً من هذه الكلمات في شات البوت، سيتم الرد بهذه الإجابة فوراً.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-bold mb-1">ترتيب العرض في الخيارات</label>
              <input
                type="number"
                min={0}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary font-bold"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="add_faq_active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="size-4.5 rounded accent-primary"
              />
              <label htmlFor="add_faq_active" className="font-bold cursor-pointer">
                تفعيل السؤال في البوت
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-border/60 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 font-bold text-muted-foreground hover:bg-surface"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={createFaqMutation.isPending}
              className="rounded-2xl bg-heat px-6 py-2.5 font-bold text-primary-foreground shadow-heat hover:scale-105 transition-transform disabled:opacity-50"
            >
              {createFaqMutation.isPending ? "جاري الإضافة..." : "إضافة السؤال"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// EDIT FAQ MODAL
// ============================================================================

function EditFaqModal({ faq, onClose }: { faq: DbBotFaq; onClose: () => void }) {
  const updateFaqMutation = useUpdateFaq();
  const [question, setQuestion] = useState(faq.question);
  const [answer, setAnswer] = useState(faq.answer);
  const [keywords, setKeywords] = useState((faq.keywords || []).join("، "));
  const [displayOrder, setDisplayOrder] = useState(faq.display_order);
  const [isActive, setIsActive] = useState(faq.is_active);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      toast.error("يرجى ملء نص السؤال والإجابة");
      return;
    }

    const keywordList = keywords
      .split(/[،,]/)
      .map((k) => k.trim())
      .filter(Boolean);

    try {
      await updateFaqMutation.mutateAsync({
        id: faq.id,
        data: {
          question,
          answer,
          keywords: keywordList,
          display_order: displayOrder,
          is_active: isActive,
        },
      });
      toast.success("تم تحديث السؤال بنجاح!");
      onClose();
    } catch (err: any) {
      toast.error("فشل تحديث السؤال", { description: err.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border/60 bg-card px-6 py-4">
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <Edit2 className="size-4 text-primary" />
            <span>تعديل سؤال البوت</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold mb-1">نص السؤال أو الموضوع *</label>
            <input
              type="text"
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 outline-none focus:border-primary font-bold"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">الإجابة التلقائية للبوت *</label>
            <textarea
              rows={3}
              required
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary resize-none"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">
              الكلمات المفتاحية للتعرف على السؤال (مفصولة بفاصلة)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="مثال: توصيل، دليفري، وقت"
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-bold mb-1">ترتيب العرض في الخيارات</label>
              <input
                type="number"
                min={0}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary font-bold"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="edit_faq_active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="size-4.5 rounded accent-primary"
              />
              <label htmlFor="edit_faq_active" className="font-bold cursor-pointer">
                تفعيل السؤال في البوت
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-border/60 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 font-bold text-muted-foreground hover:bg-surface"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={updateFaqMutation.isPending}
              className="rounded-2xl bg-heat px-6 py-2.5 font-bold text-primary-foreground shadow-heat hover:scale-105 transition-transform disabled:opacity-50"
            >
              {updateFaqMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
