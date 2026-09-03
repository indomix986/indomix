import { useState } from "react";
import { Edit2, Trash2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import type { Product, ProductSize } from "@/types/product";
import type { Json } from "@/types/database";
import {
  useUpdateProduct,
  useCreateProductExtra,
  useDeleteProductExtra,
} from "@/hooks/admin/use-admin-products";
import { SmartPriceSection } from "./SmartPriceSection";
import { ProductSizesSection } from "./ProductSizesSection";
import { ProductImageUploader } from "./ProductImageUploader";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductEditModalProps {
  product: Product;
  categories: CategoryOption[];
  onClose: () => void;
}

export function ProductEditModal({ product, categories, onClose }: ProductEditModalProps) {
  const updateMutation = useUpdateProduct();
  const createExtraMutation = useCreateProductExtra();
  const deleteExtraMutation = useDeleteProductExtra();

  const [name, setName] = useState(product.name);
  const [categoryId, setCategoryId] = useState<string>(product.category);
  const [price, setPrice] = useState(product.price);
  const [oldPrice, setOldPrice] = useState<number | undefined>(product.oldPrice || undefined);
  const [rating, setRating] = useState<number>(product.rating ?? 5.0);
  const [imageUrl, setImageUrl] = useState(product.img);
  const [tag, setTag] = useState(product.tag || "");
  const [shortDescription, setShortDescription] = useState(product.shortDesc);
  const [description, setDescription] = useState(product.desc);
  const [isPopular, setIsPopular] = useState(Boolean(product.isPopular));
  const [isAvailable, setIsAvailable] = useState(
    "isAvailable" in product ? Boolean(product.isAvailable) : true,
  );

  // Multiple sizes state
  const [hasMultipleSizes, setHasMultipleSizes] = useState<boolean>(
    Boolean(product.sizes && product.sizes.length > 0),
  );
  const [sizes, setSizes] = useState<ProductSize[]>(product.sizes || []);

  // New Extra form state
  const [newExtraName, setNewExtraName] = useState("");
  const [newExtraPrice, setNewExtraPrice] = useState(15);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasMultipleSizes) {
      if (sizes.length === 0) {
        toast.error("يرجى إضافة حجم واحد على الأقل أو إلغاء تفعيل خيار الأحجام المتعددة");
        return;
      }
      for (const s of sizes) {
        if (!s.name.trim()) {
          toast.error("يرجى كتابة اسم لكل حجم مضاف");
          return;
        }
        if (s.price <= 0) {
          toast.error("يرجى تحديد سعر صالح لكل حجم");
          return;
        }
      }
    }

    const defaultSize = sizes.find((s) => s.isDefault) || sizes[0];
    const finalPrice = hasMultipleSizes && defaultSize ? defaultSize.price : price;
    const finalOldPrice = hasMultipleSizes && defaultSize ? defaultSize.oldPrice : oldPrice || null;

    try {
      await updateMutation.mutateAsync({
        id: product.id,
        data: {
          name,
          category_id: categoryId,
          price: finalPrice,
          old_price: finalOldPrice || null,
          rating: Number(rating) || 5.0,
          image_url: imageUrl,
          tag: tag || null,
          short_description: shortDescription,
          description,
          is_popular: isPopular,
          is_available: isAvailable,
          sizes: (hasMultipleSizes ? sizes : []) as unknown as Json,
        },
      });
      toast.success("تم تحديث الوجبة بنجاح");
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "فشل تحديث الوجبة";
      toast.error("فشل تحديث الوجبة", { description: errorMsg });
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
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "فشل إضافة الإضافة";
      toast.error("فشل إضافة الإضافة", { description: errorMsg });
    }
  };

  const handleDeleteExtra = async (extraId: string) => {
    try {
      await deleteExtraMutation.mutateAsync(extraId);
      toast.success("تم حذف الإضافة");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "فشل حذف الإضافة";
      toast.error("فشل حذف الإضافة", { description: errorMsg });
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

            {/* Sizes Section */}
            <ProductSizesSection
              hasMultipleSizes={hasMultipleSizes}
              onHasMultipleSizesChange={setHasMultipleSizes}
              sizes={sizes}
              onSizesChange={setSizes}
            />

            {/* Smart Pricing & Discount Section (Shown only if not multiple sizes) */}
            {!hasMultipleSizes && (
              <SmartPriceSection
                price={price}
                oldPrice={oldPrice}
                onPriceChange={setPrice}
                onOldPriceChange={setOldPrice}
                onBadgeSuggest={(badge) => {
                  if (!tag) setTag(badge);
                }}
              />
            )}

            <ProductImageUploader
              productId={product.id}
              imageUrl={imageUrl}
              onImageUploaded={(newUrl) => {
                setImageUrl(newUrl);
              }}
              onUrlChange={(newUrl) => setImageUrl(newUrl)}
            />

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
