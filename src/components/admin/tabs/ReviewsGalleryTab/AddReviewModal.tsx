import { useState, useRef } from "react";
import { Plus, X, Image as ImageIcon, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateReview, uploadReviewImageFile } from "@/hooks/admin/use-admin-reviews";

interface AddReviewModalProps {
  nextOrder: number;
  onClose: () => void;
}

export function AddReviewModal({ nextOrder, onClose }: AddReviewModalProps) {
  const createMutation = useCreateReview();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(nextOrder);
  const [isActive, setIsActive] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)");
      return;
    }

    try {
      setIsUploading(true);
      const uploadedUrl = await uploadReviewImageFile(file);
      setImageUrl(uploadedUrl);
      toast.success("تم رفع الصورة بنجاح!");
    } catch (err: unknown) {
      // If direct Supabase storage upload fails, convert to data URL as client preview or notify
      const reader = new FileReader();
      reader.onload = (uploadEvt) => {
        const result = uploadEvt.target?.result as string;
        if (result) {
          setImageUrl(result);
          toast.info("تم تحميل الصورة محلياً، يفضل استخدام رابط مباشر للإنتاج.");
        }
      };
      reader.readAsDataURL(file);
      const msg = err instanceof Error ? err.message : "تعذر الرفع إلى Supabase Storage";
      console.warn("Storage upload failed:", msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      toast.error("يرجى إدخال رابط الصورة أو رفع ملف صورة");
      return;
    }

    try {
      await createMutation.mutateAsync({
        image_url: imageUrl.trim(),
        display_order: Number(displayOrder) || 0,
        is_active: isActive,
      });
      toast.success("تمت إضافة صورة التقييم بنجاح!");
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "فشل إضافة صورة التقييم";
      toast.error("فشل الإضافة", { description: errorMsg });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto overscroll-contain">
      <div className="w-full max-w-lg my-auto sm:my-8 flex max-h-[92vh] sm:max-h-[88vh] flex-col rounded-2xl sm:rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Sticky Header */}
        <div className="flex items-center justify-between border-b border-border/60 bg-card px-4 py-3 sm:px-6 sm:py-4 shrink-0">
          <h2 className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2">
            <Plus className="size-4 text-primary" />
            <span>إضافة صورة تقييم جديدة</span>
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
          id="add-review-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs overscroll-contain"
        >
          {/* Image URL & Upload Options */}
          <div>
            <label className="block font-bold mb-1">رابط صورة التقييم (Image URL) *</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... أو /assets/review-1.jpg"
                className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 font-bold text-foreground hover:border-primary transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                ) : (
                  <Upload className="size-3.5 text-primary" />
                )}
                <span>{isUploading ? "جاري الرفع..." : "رفع ملف"}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              يمكنك لصق رابط مباشر للصورة أو رفع لقطة شاشة لتقييم العميل من جهازك.
            </p>
          </div>

          {/* Live Image Preview */}
          {imageUrl.trim() && (
            <div>
              <span className="block font-bold mb-1.5">معاينة ظهور الصورة في المعرض:</span>
              <div className="relative aspect-[3/4] max-h-56 mx-auto w-44 overflow-hidden rounded-2xl border border-border bg-surface/80 shadow-md flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt="Backdrop blur preview"
                  className="absolute inset-0 size-full object-cover blur-md scale-110 opacity-30 pointer-events-none"
                />
                <img
                  src={imageUrl}
                  alt="Review preview"
                  className="relative z-10 size-full object-contain p-2"
                />
              </div>
            </div>
          )}

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
                <span className="font-bold">تفعيل الظهور في الموقع فوراً</span>
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
            form="add-review-form"
            disabled={createMutation.isPending || isUploading}
            className="rounded-xl bg-heat px-6 py-2 text-xs font-bold text-primary-foreground shadow-heat disabled:opacity-50 transition-transform hover:scale-105"
          >
            {createMutation.isPending ? "جاري الإضافة..." : "حفظ الصورة"}
          </button>
        </div>
      </div>
    </div>
  );
}
