import { useState } from "react";
import { Edit2, X } from "lucide-react";
import { toast } from "sonner";
import type { ReviewGalleryItem } from "@/types/review";
import { useUpdateReview } from "@/hooks/admin/use-admin-reviews";
import { AdminImageUploader } from "@/components/admin/AdminImageUploader";

interface EditReviewModalProps {
  review: ReviewGalleryItem;
  onClose: () => void;
}

export function EditReviewModal({ review, onClose }: EditReviewModalProps) {
  const updateMutation = useUpdateReview();

  const [imageUrl, setImageUrl] = useState(review.image_url);
  const [displayOrder, setDisplayOrder] = useState<number>(review.display_order);
  const [isActive, setIsActive] = useState(review.is_active);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      toast.error("يرجى إدخال رابط الصورة أو رفع ملف صورة");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: review.id,
        data: {
          image_url: imageUrl.trim(),
          display_order: Number(displayOrder) || 0,
          is_active: isActive,
        },
      });
      toast.success("تم تحديث صورة التقييم بنجاح!");
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "فشل تحديث صورة التقييم";
      toast.error("فشل التحديث", { description: errorMsg });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto overscroll-contain">
      <div className="w-full max-w-lg my-auto sm:my-8 flex max-h-[92vh] sm:max-h-[88vh] flex-col rounded-2xl sm:rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Sticky Header */}
        <div className="flex items-center justify-between border-b border-border/60 bg-card px-4 py-3 sm:px-6 sm:py-4 shrink-0">
          <h2 className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2">
            <Edit2 className="size-4 text-primary" />
            <span>تعديل صورة التقييم</span>
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
          id="edit-review-form"
          onSubmit={handleUpdate}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs overscroll-contain"
        >
          <AdminImageUploader
            entityType="reviews"
            entityId={review.id}
            imageUrl={imageUrl}
            label="صورة التقييم *"
            onImageUploaded={(newUrl) => setImageUrl(newUrl)}
            onUrlChange={(newUrl) => setImageUrl(newUrl)}
            onUploadingChange={setIsUploading}
          />

          {/* Display Order & Active status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block font-bold mb-1">ترتيب الظهور (Display Order)</label>
              <input
                type="number"
                min={0}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary font-bold text-center"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                الرقم الأقل يظهر أولاً في السلايدر (0, 1, 2...).
              </p>
            </div>

            <div className="flex flex-col justify-center">
              <label className="flex items-center gap-2 cursor-pointer mt-3">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="size-4 rounded accent-primary"
                />
                <span className="font-bold">مفعلة وتظهر في الموقع</span>
              </label>
            </div>
          </div>
        </form>

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
            form="edit-review-form"
            disabled={updateMutation.isPending || isUploading}
            className="rounded-xl bg-heat px-6 py-2 text-xs font-bold text-primary-foreground shadow-heat disabled:opacity-50 transition-transform hover:scale-105"
          >
            {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
        </div>
      </div>
    </div>
  );
}
