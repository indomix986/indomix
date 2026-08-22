import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  Heart,
  ShoppingBag,
  Flame,
  ChevronLeft,
  Check,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  Utensils,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductDetailSkeleton } from "@/components/site/Skeletons";
import type { ExtraOption } from "@/types/product";
import { useStore } from "@/context/StoreContext";
import {
  useSingleProduct,
  useOffers,
  singleProductQueryOptions,
  offersQueryOptions,
} from "@/hooks/use-catalog";

export const Route = createFileRoute("/products/$id")({
  validateSearch: (search: Record<string, unknown>): { from?: string } => {
    return {
      from: (search["from"] as string | undefined) || "menu",
    };
  },
  loader: async ({ params: { id }, context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(singleProductQueryOptions(id)),
      context.queryClient.ensureQueryData(offersQueryOptions()),
    ]);
  },
  head: () => ({
    meta: [
      { title: "تفاصيل الوجبة | إندومكس" },
      {
        name: "description",
        content: "خصص طبق الإندومي المفضل واختر الإضافات والصوصات المناسبة لك.",
      },
    ],
  }),
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { id } = useParams({ from: "/products/$id" });
  const { from } = Route.useSearch();
  const { addToCart, isFavorite, toggleFavorite } = useStore();

  // ✅ Sprint 1 – Step 3.2: Fetch only this specific product + its offers (no full catalog)
  const { data: allOffers = [], isLoading: isOffersLoading } = useOffers();

  // Check if the URL id belongs to an offer first (offers can have their own detail page)
  const matchedOffer = allOffers.find((o) => o.id === id || o.associatedProductId === id);

  // Determine the actual product ID to fetch
  const productId = matchedOffer?.associatedProductId || id;

  const { data: fetchedProduct, isLoading: isProductLoading } = useSingleProduct(productId);

  // Build the product object: prefer the fetched product, fall back to offer-derived product
  let product = fetchedProduct;

  if (!product && matchedOffer) {
    product = {
      id: matchedOffer.id,
      name: matchedOffer.title,
      category: "boxes",
      categoryName: "عروض وبكجات",
      desc: matchedOffer.desc,
      shortDesc: matchedOffer.desc,
      price: matchedOffer.price,
      oldPrice: matchedOffer.oldPrice,
      img: matchedOffer.img,
      tag: matchedOffer.tag || matchedOffer.discountBadge || "عرض خاص",
      rating: 5.0,
      reviewsCount: 48,
      prepTime: "١٠ دقائق",
      calories: "عرض وبكج خاص",
      spicinessDefault: "بدون شطة",
      availableSpiciness: ["بدون شطة", "بارد", "متوسط", "حار"],
      extras: [],
      isPopular: true,
    };
  }

  const isFromOffers = from === "offers" || product?.category === "boxes" || Boolean(matchedOffer);

  // Customization state
  const [selectedExtras, setSelectedExtras] = useState<ExtraOption[]>([]);
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);

  const isSkeleton = (isProductLoading || isOffersLoading) && !product;

  if (isSkeleton) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground" dir="rtl">
        <Header />
        <main className="flex-1 w-full mx-auto max-w-6xl px-4 pb-20 pt-24">
          <ProductDetailSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground" dir="rtl">
        <Header />
        <main className="flex-1 w-full mx-auto max-w-4xl px-4 py-32 text-center">
          <div className="grid size-16 place-items-center rounded-full bg-surface border border-border mx-auto">
            <Utensils className="size-8 text-muted-foreground" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold">الصنف غير موجود</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            يبدو أن هذا الصنف غير متاح حالياً أو تم تغيير رابطه.
          </p>
          <Link
            to={isFromOffers ? "/offers" : "/menu"}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-heat px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-heat"
          >
            <span>{isFromOffers ? "العودة إلى العروض" : "العودة إلى المنيو"}</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const favorite = isFavorite(product.id);

  const toggleExtra = (extra: ExtraOption) => {
    setSelectedExtras((prev) => {
      const exists = prev.some((e) => e.id === extra.id);
      if (exists) {
        return prev.filter((e) => e.id !== extra.id);
      } else {
        return [...prev, extra];
      }
    });
  };

  const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
  const unitPrice = product.price + extrasTotal;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(product, quantity, "", selectedExtras, notes);
  };

  // Note: Related products could be fetched separately in a future sprint.
  // For now we show a link to the menu rather than re-fetching the full catalog.
  const relatedProducts: import("@/types/product").Product[] = [];


  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground" dir="rtl">
      <Header />

      <main className="flex-1 w-full mx-auto max-w-6xl px-4 pb-20 pt-24">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">
            الرئيسية
          </Link>
          <ChevronLeft className="size-3.5" />
          {isFromOffers ? (
            <Link to="/offers" className="hover:text-primary transition-colors">
              العروض
            </Link>
          ) : (
            <Link to="/menu" className="hover:text-primary transition-colors">
              المنيو
            </Link>
          )}
          <ChevronLeft className="size-3.5" />
          <span className="text-foreground font-bold">{product.name}</span>
        </nav>

        {/* Product Details Main Section */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Product Image & Badges */}
          <div className="lg:col-span-6">
            <div className="sticky top-24 space-y-4">
              <div className="relative aspect-4/3 overflow-hidden rounded-3xl border border-border bg-surface shadow-soft">
                <img src={product.img} alt={product.name} className="size-full object-cover" />

                {product.tag && (
                  <span className="absolute start-4 top-4 rounded-full bg-chili px-3.5 py-1 text-xs font-bold text-chili-foreground shadow-md">
                    {product.tag}
                  </span>
                )}

                <button
                  type="button"
                  aria-label={favorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
                  onClick={() => toggleFavorite(product.id)}
                  className={`absolute end-4 top-4 grid size-10 place-items-center rounded-full backdrop-blur-md transition-all ${
                    favorite
                      ? "bg-chili text-chili-foreground shadow-md scale-110"
                      : "bg-background/80 text-foreground/80 hover:text-chili hover:bg-background"
                  }`}
                >
                  <Heart className={`size-5 ${favorite ? "fill-current" : ""}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Product Configurator & Buy Box */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {product.categoryName}
              </span>
              <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl text-foreground">
                {product.name}
              </h1>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{product.desc}</p>

              {matchedOffer?.items && matchedOffer.items.length > 0 && (
                <div className="mt-3 rounded-2xl border border-chili/30 bg-chili/5 p-3.5 shadow-soft">
                  <span className="block text-xs font-extrabold text-foreground mb-2 flex items-center gap-1.5">
                    <Flame className="size-3.5 text-chili" />
                    <span>محتويات هذا العرض / البكج:</span>
                  </span>
                  <ul className="space-y-1 text-xs text-foreground/90 font-semibold">
                    {matchedOffer.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-chili shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-primary">{unitPrice}</span>
                <span className="text-xs font-bold text-muted-foreground">جنيه مصري</span>
                {product.oldPrice && (
                  <span className="text-sm text-muted-foreground line-through ms-2">
                    {product.oldPrice} ج.م
                  </span>
                )}
              </div>
            </div>

            {/* Customization 2: Extras */}
            {product.extras.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                <label className="block text-xs font-extrabold text-foreground mb-3">
                  إضافات وتوبينجز حسب رغبتك (اختياري):
                </label>

                <div className="space-y-2">
                  {product.extras.map((extra: ExtraOption) => {
                    const isChecked = selectedExtras.some((e) => e.id === extra.id);
                    return (
                      <button
                        key={extra.id}
                        type="button"
                        onClick={() => toggleExtra(extra)}
                        className={`flex w-full items-center justify-between rounded-xl border p-3 text-xs transition-all ${
                          isChecked
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-surface text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`grid size-5 place-items-center rounded-md border ${
                              isChecked
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background"
                            }`}
                          >
                            {isChecked && <Check className="size-3.5 stroke-[3]" />}
                          </div>
                          <span className="font-bold text-foreground">{extra.name}</span>
                        </div>
                        <span className="font-extrabold text-primary">+{extra.price} ج.م</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Customization 3: Notes */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <label className="block text-xs font-extrabold text-foreground mb-2">
                ملاحظات خاصة للشيف:
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: بدون بصل مقرمش، صوص جانبي، تسوية خاصة..."
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs outline-none focus:border-primary resize-none placeholder:text-muted-foreground"
              />
            </div>

            {/* Quantity and Add to Cart Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <div className="flex items-center justify-between sm:justify-center gap-4 rounded-2xl border border-border bg-surface px-4 py-3">
                <button
                  type="button"
                  aria-label="تقليل الكمية"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="grid size-7 place-items-center rounded-lg text-foreground/80 hover:bg-background hover:text-primary"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-8 text-center text-sm font-extrabold">{quantity}</span>
                <button
                  type="button"
                  aria-label="زيادة الكمية"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="grid size-7 place-items-center rounded-lg text-foreground/80 hover:bg-background hover:text-primary"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-heat py-3.5 text-sm font-extrabold text-primary-foreground shadow-heat transition-transform hover:scale-[1.02]"
              >
                <ShoppingBag className="size-5" />
                <span>أضف إلى السلة ({totalPrice} ج.م)</span>
              </button>
            </div>

            {/* Delivery Guarantee */}
            <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface/50 p-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Truck className="size-4 text-primary" />
                <span>توصيل سريع ساخن خلال ٢٥ دقيقة</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-primary" />
                <span>ضمان الجودة والطزاجة ١٠٠٪</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <section className="mt-16 border-t border-border/60 pt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold text-chili">اكتشف المزيد</span>
              <h2 className="mt-1 text-xl font-extrabold sm:text-2xl">أصناف أخرى قد تعجبك</h2>
            </div>
            <Link to="/menu" className="text-xs font-bold text-primary hover:underline">
              عرض كل المنيو
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
