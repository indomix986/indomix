import { useState } from "react";
import { Plus, Eye, EyeOff, Edit2, Trash2, Image as ImageIcon, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import type { ReviewGalleryItem } from "@/types/review";
import { useUpdateReview, useDeleteReview } from "@/hooks/admin/use-admin-reviews";
import { AddReviewModal } from "./AddReviewModal";
import { EditReviewModal } from "./EditReviewModal";

interface ReviewsGalleryManagerTabProps {
  reviews: ReviewGalleryItem[];
  loading: boolean;
}

export function ReviewsGalleryManagerTab({ reviews, loading }: ReviewsGalleryManagerTabProps) {
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [isCreating, setIsCreating] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewGalleryItem | null>(null);

  const updateMutation = useUpdateReview();
  const deleteMutation = useDeleteReview();

  const filtered = reviews.filter((r) => {
    if (filterActive === "active") return r.is_active;
    if (filterActive === "inactive") return !r.is_active;
    return true;
  });

  const handleToggleActive = async (review: ReviewGalleryItem) => {
    const nextStatus = !review.is_active;
    try {
      await updateMutation.mutateAsync({
        id: review.id,
        data: { is_active: nextStatus },
      });
      toast.success(nextStatus ? "تم تفعيل ظهور التقييم في المعرض" : "تم إخفاء التقييم من المعرض");
    } catch {
      toast.error("فشل تغيير حالة التقييم");
    }
  };

  const handleQuickReorder = async (review: ReviewGalleryItem, delta: number) => {
    const nextOrder = Math.max(0, review.display_order + delta);
    try {
      await updateMutation.mutateAsync({
        id: review.id,
        data: { display_order: nextOrder },
      });
      toast.success(`تم تعديل الترتيب إلى ${nextOrder}`);
    } catch {
      toast.error("فشل تعديل الترتيب");
    }
  };

  const handleDelete = async (review: ReviewGalleryItem) => {
    if (!window.confirm("هل أنت متأكد من حذف صورة التقييم هذه نهائياً؟")) return;
    try {
      await deleteMutation.mutateAsync(review.id);
      toast.success("تم حذف صورة التقييم بنجاح");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "فشل حذف صورة التقييم";
      toast.error("فشل الحذف", { description: errorMsg });
    }
  };

  const maxOrder = reviews.length > 0 ? Math.max(...reviews.map((r) => r.display_order)) : 0;

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1 text-xs">
            <button
              type="button"
              onClick={() => setFilterActive("all")}
              className={`rounded-lg px-3 py-1.5 font-bold transition-colors ${
                filterActive === "all"
                  ? "bg-heat text-primary-foreground shadow-heat"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              الكل ({reviews.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterActive("active")}
              className={`rounded-lg px-3 py-1.5 font-bold transition-colors ${
                filterActive === "active"
                  ? "bg-heat text-primary-foreground shadow-heat"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              المفعلة ({reviews.filter((r) => r.is_active).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterActive("inactive")}
              className={`rounded-lg px-3 py-1.5 font-bold transition-colors ${
                filterActive === "inactive"
                  ? "bg-heat text-primary-foreground shadow-heat"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              المخفية ({reviews.filter((r) => !r.is_active).length})
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-heat px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-heat hover:scale-105 transition-transform"
        >
          <Plus className="size-4" />
          <span>إضافة صورة تقييم جديدة</span>
        </button>
      </div>

      {/* Modals */}
      {isCreating && (
        <AddReviewModal
          nextOrder={maxOrder + 1}
          onClose={() => setIsCreating(false)}
        />
      )}

      {editingReview && (
        <EditReviewModal
          review={editingReview}
          onClose={() => setEditingReview(null)}
        />
      )}

      {/* Reviews Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-muted-foreground">
          جاري تحميل صور تقييمات العملاء...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-border bg-card/50 p-8">
          <div className="grid size-12 place-items-center rounded-2xl bg-surface border border-border mx-auto text-muted-foreground">
            <ImageIcon className="size-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground">لا توجد صور تقييمات مسجلة حالياً</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            قم بإضافة لقطات شاشة لتقييمات ومحادثات العملاء لتظهر في سلايدر الصفحة الرئيسية لزيادة المصداقية والمبيعات.
          </p>
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-heat px-4 py-2 text-xs font-bold text-primary-foreground shadow-heat hover:scale-105 transition-transform"
          >
            <Plus className="size-4" />
            <span>إضافة أول تقييم</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`group flex flex-col rounded-2xl border bg-card p-2.5 shadow-soft transition-all ${
                item.is_active
                  ? "border-border hover:border-primary/50"
                  : "border-border/40 opacity-70 bg-surface/50"
              }`}
            >
              {/* Image Card with blurred backdrop */}
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-surface border border-border/60 flex items-center justify-center">
                <img
                  src={item.image_url}
                  alt="Review backdrop"
                  className="absolute inset-0 size-full object-cover blur-sm scale-110 opacity-30 pointer-events-none"
                />
                <img
                  src={item.image_url}
                  alt="Review item"
                  loading="lazy"
                  className="relative z-10 size-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
                />

                {/* Status Badge */}
                <span
                  className={`absolute top-2 end-2 z-20 rounded-full px-2 py-0.5 text-[9px] font-bold shadow-sm ${
                    item.is_active
                      ? "bg-emerald-500/90 text-white"
                      : "bg-destructive/90 text-white"
                  }`}
                >
                  {item.is_active ? "مفعل" : "مخفي"}
                </span>

                {/* Order Badge */}
                <span className="absolute bottom-2 start-2 z-20 rounded-lg bg-background/80 px-2 py-0.5 text-[10px] font-extrabold text-foreground backdrop-blur border border-border/40">
                  ترتيب: #{item.display_order}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-1 pt-2.5 mt-auto border-t border-border/40">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title={item.is_active ? "إخفاء من الموقع" : "إظهار في الموقع"}
                    onClick={() => handleToggleActive(item)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      item.is_active
                        ? "border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                        : "border-border text-muted-foreground hover:bg-surface"
                    }`}
                  >
                    {item.is_active ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                  </button>

                  <div className="flex items-center rounded-lg border border-border bg-surface">
                    <button
                      type="button"
                      title="تقديم الترتيب"
                      onClick={() => handleQuickReorder(item, -1)}
                      className="px-1.5 py-1 text-[10px] font-extrabold text-muted-foreground hover:text-foreground transition-colors"
                    >
                      -
                    </button>
                    <span className="px-1 text-[10px] font-bold text-foreground">
                      {item.display_order}
                    </span>
                    <button
                      type="button"
                      title="تأخير الترتيب"
                      onClick={() => handleQuickReorder(item, 1)}
                      className="px-1.5 py-1 text-[10px] font-extrabold text-muted-foreground hover:text-foreground transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="تعديل"
                    onClick={() => setEditingReview(item)}
                    className="p-1.5 rounded-lg border border-border bg-surface text-foreground hover:border-primary transition-colors"
                  >
                    <Edit2 className="size-3.5" />
                  </button>

                  <button
                    type="button"
                    title="حذف"
                    onClick={() => handleDelete(item)}
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
