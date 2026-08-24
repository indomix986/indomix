import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/types/database";
import { useDeleteCategory } from "@/hooks/admin/use-admin-categories";
import { CategoryModal } from "./CategoryModal";

type DbCategory = Database["public"]["Tables"]["categories"]["Row"];

interface CategoriesManagerTabProps {
  categories: DbCategory[];
  loading: boolean;
}

export function CategoriesManagerTab({ categories, loading }: CategoriesManagerTabProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DbCategory | null>(null);

  const deleteCategoryMutation = useDeleteCategory();

  const handleDeleteCategory = async (cat: DbCategory) => {
    if (!window.confirm(`هل أنت متأكد من حذف قسم "${cat.name}"؟`)) return;
    try {
      await deleteCategoryMutation.mutateAsync(cat.id);
      toast.success("تم حذف القسم بنجاح");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "فشل حذف القسم";
      toast.error("فشل حذف القسم", { description: errorMsg });
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
        <CategoryModal
          onClose={() => setIsCreating(false)}
          categoriesCount={categories.length}
        />
      )}

      {/* Modal: Edit Category */}
      {editingCategory && (
        <CategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
        />
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
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="inline-block rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                      {c.badge_text || "أصناف متنوعة"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      الترتيب: {c.display_order} | ID: {c.id}
                    </span>
                  </div>
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
