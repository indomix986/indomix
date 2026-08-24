import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/types/database";
import type { Product } from "@/types/product";
import { useDeleteOffer } from "@/hooks/admin/use-admin-offers";
import { OfferModal } from "./OfferModal";

type DbOffer = Database["public"]["Tables"]["offers"]["Row"];

interface OffersManagerTabProps {
  offers: DbOffer[];
  products: Product[];
  loading: boolean;
}

export function OffersManagerTab({
  offers,
  products,
  loading,
}: OffersManagerTabProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingOffer, setEditingOffer] = useState<DbOffer | null>(null);

  const deleteOfferMutation = useDeleteOffer();

  const handleDeleteOffer = async (offer: DbOffer) => {
    if (!window.confirm(`هل أنت متأكد من حذف العرض "${offer.title}"؟`)) return;
    try {
      await deleteOfferMutation.mutateAsync(offer.id);
      toast.success("تم حذف العرض بنجاح");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "فشل حذف العرض";
      toast.error("فشل حذف العرض", { description: errorMsg });
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
        <OfferModal
          products={products}
          onClose={() => setIsCreating(false)}
        />
      )}

      {/* Modal: Edit Offer */}
      {editingOffer && (
        <OfferModal
          offer={editingOffer}
          products={products}
          onClose={() => setEditingOffer(null)}
        />
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
