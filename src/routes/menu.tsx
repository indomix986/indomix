import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useRef } from "react";
import { Search, SlidersHorizontal, UtensilsCrossed } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductCardSkeleton } from "@/components/site/Skeletons";
import { useGsapScroll, gsap } from "@/hooks/use-gsap-scroll";
import {
  useCategories,
  useProducts,
  categoriesQueryOptions,
  productsQueryOptions,
} from "@/hooks/use-catalog";

export const Route = createFileRoute("/menu")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(categoriesQueryOptions()),
      context.queryClient.ensureQueryData(productsQueryOptions()),
    ]);
  },
  head: () => ({
    meta: [
      { title: "قائمة الطعام (المنيو) | إندومكس" },
      {
        name: "description",
        content: "تصفح قائمة طعام إندومكس الكاملة واطلب وجباتك المفضلة أونلاين.",
      },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "rating">(
    "default",
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();
  const { data: products = [], isLoading: isProductsLoading } = useProducts();

  // ✅ Hydration-safe loading states: only show skeleton if loading AND cache is empty
  const isCategoriesSkeleton = isCategoriesLoading && categories.length === 0;
  const isProductsSkeleton = isProductsLoading && products.length === 0;

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
        const matchesSearch =
          searchQuery.trim() === "" ||
          product.name.includes(searchQuery.trim()) ||
          product.desc.includes(searchQuery.trim()) ||
          product.categoryName.includes(searchQuery.trim());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "rating") return b.rating - a.rating;
        return 0;
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  useGsapScroll(containerRef, () => {
    gsap.from(".menu-product-item", {
      autoAlpha: 0,
      y: 25,
      scale: 0.96,
      duration: 0.45,
      stagger: 0.04,
      force3D: true,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".menu-grid-container",
        start: "top 85%",
        once: true,
      },
    });
  }, [filteredProducts]);

  return (
    <div
      ref={containerRef}
      className="flex min-h-screen flex-col bg-background text-foreground"
      dir="rtl"
    >
      <Header />

      <main className="flex-1 w-full mx-auto max-w-6xl px-4 pb-20 pt-24">
        {/* Page Hero */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <UtensilsCrossed className="size-3.5" />
            <span>قائمة طعام إندومكس</span>
          </span>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl text-foreground">
            كل وصفات <span className="text-heat">الإندومي</span> في مكان واحد
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            اختر من بين أطباقنا الكلاسيكية، بالجبنة، الفراخ المقرمشة، السي فود التايلاندي، أو
            السناكس الشهية.
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن وجبة أو نكهة مفضلة..."
              className="w-full rounded-2xl border border-border bg-card py-2.5 ps-10 pe-4 text-xs sm:text-sm outline-none focus:border-primary placeholder:text-muted-foreground shadow-soft"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-card px-3 py-2 text-xs w-full sm:w-auto shadow-soft">
              <SlidersHorizontal className="size-3.5 text-muted-foreground shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-foreground outline-none cursor-pointer w-full"
              >
                <option value="default" className="bg-surface text-foreground">
                  الترتيب: الافتراضي
                </option>
                <option value="price-asc" className="bg-surface text-foreground">
                  السعر: من الأقل للأعلى
                </option>
                <option value="price-desc" className="bg-surface text-foreground">
                  السعر: من الأعلى للأقل
                </option>
                <option value="rating" className="bg-surface text-foreground">
                  الأعلى تقييماً
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {isCategoriesSkeleton
            ? Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="h-8 w-20 shrink-0 rounded-2xl bg-surface animate-pulse" />
              ))
            : categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-heat text-primary-foreground shadow-heat scale-105"
                        : "border border-border bg-card text-foreground/80 hover:border-primary/40"
                    }`}
                  >
                    <span>{cat.name}</span>
                  </button>
                );
              })}
        </div>

        {/* Results Info */}
        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {isProductsSkeleton
              ? "جاري تحميل قائمة الطعام..."
              : `عرض ${filteredProducts.length} من أصل ${products.length} وجبة`}
          </span>
          {searchQuery && !isProductsSkeleton && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-primary font-bold hover:underline"
            >
              مسح البحث
            </button>
          )}
        </div>

        {/* Products Grid */}
        {isProductsSkeleton ? (
          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="my-16 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-surface border border-border mx-auto">
              <Search className="size-8 text-muted-foreground stroke-1" />
            </div>
            <h3 className="mt-4 text-base font-extrabold">لا توجد نتائج مطابقة للبحث</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              جرب البحث بكلمات أخرى أو اختر صنفاً مختلفاً من القائمة أعلاه.
            </p>
          </div>
        ) : (
          <div className="menu-grid-container mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="menu-product-item">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
