import { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useCreateProduct } from "@/hooks/admin/use-admin-products";
import { SmartPriceSection } from "./SmartPriceSection";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductFormModalProps {
  categories: CategoryOption[];
  onClose: () => void;
}

export function ProductFormModal({ categories, onClose }: ProductFormModalProps) {
  const createMutation = useCreateProduct();

  const [id, setId] = useState("");
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id || "classic");
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(65);
  const [oldPrice, setOldPrice] = useState<number | undefined>(undefined);
  const [rating, setRating] = useState<number>(5.0);
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
        rating: Number(rating) || 5.0,
        image_url: imageUrl,
        tag: tag || null,
        is_popular: isPopular,
        is_available: isAvailable,
      });
      toast.success("تمت إضافة الوجبة بنجاح!");
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "فشل إنشاء الوجبة";
      toast.error("فشل إنشاء الوجبة", { description: errorMsg });
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            <div>
              <label className="block font-bold mb-1">التقييم (من 1.0 إلى 5.0) ⭐</label>
              <input
                type="number"
                min="1.0"
                max="5.0"
                step="0.1"
                required
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 outline-none focus:border-primary font-bold"
              />
            </div>
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
