import { useState } from "react";
import { Sparkles } from "lucide-react";

export interface SmartPriceSectionProps {
  price: number;
  oldPrice?: number | null | undefined;
  onPriceChange: (val: number) => void;
  onOldPriceChange: (val: number | undefined) => void;
  onBadgeSuggest?: (badge: string) => void;
}

export function SmartPriceSection({
  price,
  oldPrice,
  onPriceChange,
  onOldPriceChange,
  onBadgeSuggest,
}: SmartPriceSectionProps) {
  const initialBase = oldPrice && oldPrice > 0 ? oldPrice : price > 0 ? price : 65;
  const [basePrice, setBasePrice] = useState<number | "">(initialBase);
  const [discountType, setDiscountType] = useState<"percentage" | "amount">("percentage");
  const [discountValue, setDiscountValue] = useState<number | "">(() => {
    if (oldPrice && oldPrice > price) {
      return Number((((oldPrice - price) / oldPrice) * 100).toFixed(1));
    }
    return "";
  });

  const updatePrices = (base: number | "", type: "percentage" | "amount", val: number | "") => {
    const numBase = typeof base === "number" ? base : 0;
    const numVal = typeof val === "number" ? val : 0;

    if (numBase <= 0) {
      onPriceChange(0);
      onOldPriceChange(undefined);
      return;
    }

    if (numVal <= 0) {
      onPriceChange(numBase);
      onOldPriceChange(undefined);
      return;
    }

    let exactFinal = 0;
    if (type === "percentage") {
      exactFinal = numBase * (1 - numVal / 100);
    } else {
      exactFinal = numBase - numVal;
    }

    if (exactFinal < 0) exactFinal = 0;
    const roundedFinal = Math.ceil(exactFinal);
    const savings = numBase - roundedFinal;

    onPriceChange(roundedFinal);
    onOldPriceChange(numBase);

    if (onBadgeSuggest && savings > 0) {
      onBadgeSuggest(`وفر ${savings} ج.م`);
    }
  };

  const handleBaseChange = (newBaseStr: string) => {
    const newBase = newBaseStr === "" ? "" : Number(newBaseStr);
    setBasePrice(newBase);
    updatePrices(newBase, discountType, discountValue);
  };

  const handleDiscountTypeChange = (newType: "percentage" | "amount") => {
    setDiscountType(newType);
    updatePrices(basePrice, newType, discountValue);
  };

  const handleDiscountValueChange = (newValStr: string) => {
    const newVal = newValStr === "" ? "" : Number(newValStr);
    setDiscountValue(newVal);
    updatePrices(basePrice, discountType, newVal);
  };

  const numBase = typeof basePrice === "number" ? basePrice : 0;
  const numVal = typeof discountValue === "number" ? discountValue : 0;
  const hasDiscount = numBase > 0 && numVal > 0 && price < numBase;

  const exactFinal =
    numBase > 0 && numVal > 0
      ? discountType === "percentage"
        ? numBase * (1 - numVal / 100)
        : numBase - numVal
      : price;

  const isRounded = hasDiscount && exactFinal !== price;
  const savings = numBase > 0 && price < numBase ? numBase - price : 0;
  const actualPercent = numBase > 0 && savings > 0 ? ((savings / numBase) * 100).toFixed(1) : 0;

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
          <Sparkles className="size-4 text-chili" />
          <span>السعر ونظام الخصم الذكي</span>
        </span>

        {hasDiscount && (
          <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
            توفير {savings} ج.م ({actualPercent}%)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 1. Base price input */}
        <div>
          <label className="block font-bold mb-1 text-xs text-foreground">
            السعر الأصلي الأساسي (ج.م) *
          </label>
          <input
            type="number"
            min={0}
            required
            value={basePrice}
            onChange={(e) => handleBaseChange(e.target.value)}
            placeholder="مثال: 100"
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs font-bold outline-none focus:border-primary"
          />
        </div>

        {/* 2. Discount inputs: type toggle + value */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block font-bold text-xs text-foreground">الخصم (اختياري)</label>
            <div className="inline-flex rounded-lg border border-border bg-surface p-0.5 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => handleDiscountTypeChange("percentage")}
                className={`rounded px-2 py-0.5 transition-colors ${
                  discountType === "percentage"
                    ? "bg-heat text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                نسبة (%)
              </button>
              <button
                type="button"
                onClick={() => handleDiscountTypeChange("amount")}
                className={`rounded px-2 py-0.5 transition-colors ${
                  discountType === "amount"
                    ? "bg-heat text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                مبلغ (ج.م)
              </button>
            </div>
          </div>

          <input
            type="number"
            min={0}
            max={discountType === "percentage" ? 100 : undefined}
            step={discountType === "percentage" ? 0.5 : 1}
            value={discountValue}
            onChange={(e) => handleDiscountValueChange(e.target.value)}
            placeholder={
              discountType === "percentage"
                ? "أدخل النسبة % (مثال: 15)"
                : "أدخل المبلغ بالجنيه (مثال: 20)"
            }
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs font-bold outline-none focus:border-primary text-primary"
          />
        </div>
      </div>

      {/* Quick percentage buttons when in percentage mode */}
      {discountType === "percentage" && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[10px] font-bold text-muted-foreground">نسب جاهزة:</span>
          {[0, 10, 15, 20, 25, 30, 50].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => {
                const val = pct === 0 ? "" : pct;
                setDiscountValue(val);
                updatePrices(basePrice, "percentage", val);
              }}
              className={`rounded-lg px-2 py-0.5 text-[10px] font-bold transition-all ${
                (pct === 0 && discountValue === "") || discountValue === pct
                  ? "bg-heat text-primary-foreground shadow-sm"
                  : "border border-border bg-surface text-foreground/80 hover:border-primary/40"
              }`}
            >
              {pct === 0 ? "بدون خصم" : `${pct}%`}
            </button>
          ))}
        </div>
      )}

      {/* 3. Output Final Price Result and Explicit Rounding Explanation */}
      <div className="rounded-xl border border-border bg-surface/80 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div>
          <span className="text-[10px] text-muted-foreground block font-bold">
            السعر النهائي المحسوب تلقائياً (سعر البيع):
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-extrabold text-primary">{price} ج.م</span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">{numBase} ج.م</span>
            )}
          </div>
        </div>

        {hasDiscount && (
          <div className="text-start sm:text-end text-[11px] font-bold text-emerald-600">
            وفر {savings} ج.م (نسبة فعلية {actualPercent}%)
          </div>
        )}
      </div>

      {/* Explicit rounding note */}
      {isRounded && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px] leading-relaxed text-amber-700 dark:text-amber-400 font-bold flex items-start gap-1.5">
          <span className="shrink-0 mt-0.5">⚠️</span>
          <span>
            تنبيه التقريب: السعر الأصلي <span className="underline">{numBase} ج.م</span>، والسعر بعد
            الخصم الدقيق كان <span className="underline">{Number(exactFinal.toFixed(2))} ج.م</span>،
            وتم تقريبه للأعلى تلقائياً إلى{" "}
            <span className="font-extrabold text-foreground">{price} ج.م</span> لتجنب الكسور.
          </span>
        </div>
      )}
    </div>
  );
}
