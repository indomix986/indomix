import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/types/database";
import type { Product } from "@/types/product";
import { useCreateOffer, useUpdateOffer } from "@/hooks/admin/use-admin-offers";
import { SmartPriceSection } from "../ProductsTab/SmartPriceSection";

type DbOffer = Database["public"]["Tables"]["offers"]["Row"];

interface OfferModalProps {
  offer?: DbOffer | null;
  products: Product[];
  onClose: () => void;
}

export function OfferModal({
  offer,
  products,
  onClose,
}: OfferModalProps) {
  const isEditing = Boolean(offer);
  const createMutation = useCreateOffer();
  const updateMutation = useUpdateOffer();

  const [title, setTitle] = useState(offer?.title || "");
  const [tag, setTag] = useState(offer?.tag || "العرض الأقوى");
  const [discountBadge, setDiscountBadge] = useState(offer?.discount_badge || "وفر ٥٠ ج.م");
  const [description, setDescription] = useState(offer?.description || "");
  const [itemsText, setItemsText] = useState(
    offer ? (offer.items || []).join("\n") : ""
  );
  const [price, setPrice] = useState(offer ? Number(offer.price) : 199);
  const [oldPrice, setOldPrice] = useState<number | undefined>(
    offer?.old_price ? Number(offer.old_price) : 250
  );
  const [imageUrl, setImageUrl] = useState(offer?.image_url || "/assets/hero-noodles.jpg");
  const [associatedProductId, setAssociatedProductId] = useState(
    offer?.associated_product_id || products[0]?.id || ""
  );
  const [validUntil, setValidUntil] = useState(offer?.valid_until || "عرض ساري هذا الأسبوع");
  const [isActive, setIsActive] = useState(offer?.is_active ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !imageUrl.trim()) {
      toast.error("يرجى ملء جميع الحقول الإلزامية");
      return;
    }

    const items = itemsText
      .split("\n")
      .map((i) => i.trim())
      .filter(Boolean);

    if (isEditing && offer) {
      try {
        await updateMutation.mutateAsync({
          id: offer.id,
          data: {
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
            is_active: isActive,
          },
        });
        toast.success("تم تحديث العرض بنجاح");
        onClose();
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "فشل تحديث العرض";
        toast.error("فشل تحديث العرض", { description: errorMsg });
      }
    } else {
      const sanitizedTitle = title
        .trim()
        .toLowerCase()
        .replace(/[^\w\u0621-\u064A]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const slug = sanitizedTitle
        ? `${sanitizedTitle}-${Date.now().toString().slice(-4)}`
        : `offer-${Date.now()}`;

      try {
        await createMutation.mutateAsync({
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
          is_active: isActive,
        });
        toast.success("تم إنشاء العرض بنجاح");
        onClose();
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "فشل إنشاء العرض";
        toast.error("فشل إنشاء العرض", { description: errorMsg });
      }
    }
  };

  const isPending = isEditing ? updateMutation.isPending : createMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto overscroll-contain">
      <div className="w-full max-w-xl my-auto sm:my-8 flex max-h-[92vh] sm:max-h-[88vh] flex-col rounded-2xl sm:rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border/60 bg-card px-4 py-3 sm:px-6 sm:py-4 shrink-0">
          <h3 className="text-sm font-extrabold text-foreground">
            {isEditing ? `تعديل عرض: ${offer?.title}` : "إنشاء عرض / بكج جديد"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 overscroll-contain">
          <form id="offer-modal-form" onSubmit={handleSubmit} className="space-y-3 text-xs">
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
                  <option value="">بدون ربط (عرض مستقل)</option>
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

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="offer_active_cb"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="size-4 rounded accent-primary"
              />
              <label htmlFor="offer_active_cb" className="font-bold cursor-pointer">
                العرض مفعل ويظهر في الموقع
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
            form="offer-modal-form"
            disabled={isPending}
            className="rounded-xl bg-heat px-5 py-2 text-xs font-bold text-primary-foreground shadow-heat disabled:opacity-50 transition-transform hover:scale-105"
          >
            {isPending
              ? "جاري الحفظ..."
              : isEditing
                ? "حفظ التعديلات"
                : "إنشاء العرض"}
          </button>
        </div>
      </div>
    </div>
  );
}
