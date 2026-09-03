import { Plus, Trash2, Layers, CheckCircle2, Circle } from "lucide-react";
import type { ProductSize } from "@/types/product";

export interface ProductSizesSectionProps {
  hasMultipleSizes: boolean;
  onHasMultipleSizesChange: (val: boolean) => void;
  sizes: ProductSize[];
  onSizesChange: (sizes: ProductSize[]) => void;
}

export function ProductSizesSection({
  hasMultipleSizes,
  onHasMultipleSizesChange,
  sizes,
  onSizesChange,
}: ProductSizesSectionProps) {
  const handleToggle = (checked: boolean) => {
    onHasMultipleSizesChange(checked);
    if (checked && sizes.length === 0) {
      // Initialize with standard default sizes
      onSizesChange([
        {
          id: `size_${Date.now()}_1`,
          name: "حجم عادي",
          price: 65,
          oldPrice: null,
          isDefault: true,
        },
        {
          id: `size_${Date.now()}_2`,
          name: "حجم كبير",
          price: 85,
          oldPrice: null,
          isDefault: false,
        },
      ]);
    }
  };

  const handleAddSize = () => {
    const newId = `size_${Date.now()}`;
    const isFirst = sizes.length === 0;
    onSizesChange([
      ...sizes,
      {
        id: newId,
        name: "",
        price: 75,
        oldPrice: null,
        isDefault: isFirst,
      },
    ]);
  };

  const handleRemoveSize = (id: string) => {
    const remaining = sizes.filter((s) => s.id !== id);
    // If the deleted size was default, make the first remaining size default
    if (remaining.length > 0 && !remaining.some((s) => s.isDefault)) {
      remaining[0] = { ...remaining[0]!, isDefault: true };
    }
    onSizesChange(remaining);
  };

  const handleSizeChange = (id: string, updates: Partial<ProductSize>) => {
    onSizesChange(
      sizes.map((s) => {
        if (s.id === id) {
          return { ...s, ...updates };
        }
        return s;
      }),
    );
  };

  const handleSetDefault = (id: string) => {
    onSizesChange(
      sizes.map((s) => ({
        ...s,
        isDefault: s.id === id,
      })),
    );
  };

  return (
    <div className="rounded-2xl border border-border bg-surface/50 p-3 sm:p-4 space-y-3">
      {/* Toggle Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
            <Layers className="size-4" />
          </div>
          <div>
            <span className="block text-xs font-bold text-foreground">
              أحجام متعددة للوجبة (اختياري)
            </span>
            <span className="block text-[10px] text-muted-foreground">
              تفعيل خيارات مثل (عادي / وسط / كبير) بأسعار منفصلة
            </span>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={hasMultipleSizes}
            onChange={(e) => handleToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>

      {/* Sizes List Editor */}
      {hasMultipleSizes && (
        <div className="pt-2 border-t border-border/60 space-y-3 animate-in fade-in-50 duration-200">
          <div className="space-y-2.5">
            {sizes.map((size, index) => (
              <div
                key={size.id}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-xl border border-border bg-card shadow-xs"
              >
                {/* Default Radio Selector */}
                <button
                  type="button"
                  onClick={() => handleSetDefault(size.id)}
                  title={size.isDefault ? "هذا هو الحجم الافتراضي" : "اضغط لجعله الحجم الافتراضي"}
                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-bold transition-colors shrink-0 ${
                    size.isDefault
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground"
                  }`}
                >
                  {size.isDefault ? (
                    <CheckCircle2 className="size-3.5" />
                  ) : (
                    <Circle className="size-3.5" />
                  )}
                  <span>{size.isDefault ? "الافتراضي" : "تعيين كافتراضي"}</span>
                </button>

                {/* Size Name */}
                <div className="flex-1 min-w-[120px]">
                  <input
                    type="text"
                    required
                    value={size.name}
                    onChange={(e) => handleSizeChange(size.id, { name: e.target.value })}
                    placeholder={`اسم الحجم (مثال: ${index === 0 ? "عادي" : index === 1 ? "كبير" : "عائلي"})`}
                    className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                  />
                </div>

                {/* Size Price */}
                <div className="w-full sm:w-28 flex items-center gap-1">
                  <input
                    type="number"
                    required
                    min={1}
                    value={size.price || ""}
                    onChange={(e) =>
                      handleSizeChange(size.id, { price: Number(e.target.value) || 0 })
                    }
                    placeholder="السعر"
                    className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                  />
                  <span className="text-[10px] text-muted-foreground shrink-0 font-bold">ج.م</span>
                </div>

                {/* Size Old Price */}
                <div className="w-full sm:w-32 flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    value={size.oldPrice || ""}
                    onChange={(e) =>
                      handleSizeChange(size.id, {
                        oldPrice: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    placeholder="قبل الخصم"
                    className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                  />
                  <span className="text-[10px] text-muted-foreground shrink-0">اختياري</span>
                </div>

                {/* Delete Size Button */}
                <button
                  type="button"
                  disabled={sizes.length <= 1}
                  onClick={() => handleRemoveSize(size.id)}
                  title={sizes.length <= 1 ? "يجب أن يتوفر حجم واحد على الأقل" : "حذف هذا الحجم"}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground self-end sm:self-center"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Size Button */}
          <button
            type="button"
            onClick={handleAddSize}
            className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10 transition-colors w-full justify-center"
          >
            <Plus className="size-3.5" />
            <span>إضافة حجم إضافي</span>
          </button>
        </div>
      )}
    </div>
  );
}
