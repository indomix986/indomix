import { useState } from "react";
import { Search, Plus, Eye, EyeOff, Edit2, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types/product";
import { useUpdateProduct, useDeleteProduct } from "@/hooks/admin/use-admin-products";
import { ProductFormModal } from "./ProductFormModal";
import { ProductEditModal } from "./ProductEditModal";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductsManagerTabProps {
  products: Product[];
  categories: CategoryOption[];
  loading: boolean;
}

export function ProductsManagerTab({
  products,
  categories,
  loading,
}: ProductsManagerTabProps) {
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
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "فشل حذف المنتج";
      toast.error("فشل حذف المنتج", { description: errorMsg });
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
                    <span className="rounded-md bg-surface border border-border px-2 py-0.5 text-[10px] font-bold text-foreground/80 flex items-center gap-1">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      <span>{Number(p.rating || 5.0).toFixed(1)}</span>
                    </span>
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
