import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/types/database";
import { useCreateCategory, useUpdateCategory } from "@/hooks/admin/use-admin-categories";

type DbCategory = Database["public"]["Tables"]["categories"]["Row"];

interface CategoryModalProps {
  category?: DbCategory | null;
  onClose: () => void;
  categoriesCount?: number;
}

export function CategoryModal({
  category,
  onClose,
  categoriesCount = 0,
}: CategoryModalProps) {
  const isEditing = Boolean(category);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const [id, setId] = useState(category?.id || "");
  const [name, setName] = useState(category?.name || "");
  const [badgeText, setBadgeText] = useState(category?.badge_text || "أصناف متنوعة");
  const [displayOrder, setDisplayOrder] = useState(category?.display_order ?? categoriesCount + 1);
  const [imageUrl, setImageUrl] = useState(category?.image_url || "/assets/cat-classic.jpg");
  const [isActive, setIsActive] = useState(category?.is_active ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEditing && category) {
      try {
        await updateMutation.mutateAsync({
          id: category.id,
          data: {
            name,
            display_order: displayOrder,
            image_url: imageUrl,
            badge_text: badgeText.trim() || "أصناف متنوعة",
            is_active: isActive,
          },
        });
        toast.success("تم تحديث القسم بنجاح");
        onClose();
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "فشل تحديث القسم";
        toast.error("فشل تحديث القسم", { description: errorMsg });
      }
    } else {
      const slug = id.trim() || name.trim().toLowerCase().replace(/\s+/g, "-");
      try {
        await createMutation.mutateAsync({
          id: slug,
          name,
          display_order: displayOrder,
          image_url: imageUrl,
          badge_text: badgeText.trim() || "أصناف متنوعة",
          is_active: isActive,
        });
        toast.success("تم إنشاء القسم بنجاح");
        onClose();
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "فشل إنشاء القسم";
        toast.error("فشل إنشاء القسم", { description: errorMsg });
      }
    }
  };

  const isPending = isEditing ? updateMutation.isPending : createMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto overscroll-contain">
      <div className="w-full max-w-md my-auto sm:my-8 flex max-h-[92vh] sm:max-h-[88vh] flex-col rounded-2xl sm:rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Sticky Header */}
        <div className="flex items-center justify-between border-b border-border/60 bg-card px-4 py-3 sm:px-6 sm:py-4 shrink-0">
          <h3 className="text-sm font-extrabold text-foreground">
            {isEditing ? `تعديل قسم: ${category?.name}` : "إضافة قسم جديد"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 overscroll-contain">
          <form id="category-form" onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold mb-1">اسم القسم *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: نودلز بالجبنة"
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">
                نص الشارة / الوصف الفرعي (يظهر أعلى كارت القسم بالرئيسية)
              </label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="مثال: أصناف متنوعة أو غرقان جبنة"
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
              />
            </div>
            {!isEditing && (
              <div>
                <label className="block font-bold mb-1">معرف القسم (ID / Slug)</label>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="اتركه فارغاً للتوليد التلقائي"
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
                />
              </div>
            )}
            <div>
              <label className="block font-bold mb-1">ترتيب العرض</label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">رابط صورة القسم</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="cat_active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
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
            onClick={onClose}
            className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            form="category-form"
            disabled={isPending}
            className="rounded-xl bg-heat px-5 py-2 text-xs font-bold text-primary-foreground shadow-heat disabled:opacity-50 transition-transform hover:scale-105"
          >
            {isPending
              ? "جاري الحفظ..."
              : isEditing
                ? "حفظ التعديلات"
                : "إنشاء القسم"}
          </button>
        </div>
      </div>
    </div>
  );
}
