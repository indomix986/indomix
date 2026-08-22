import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Sparkles } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductCardSkeleton } from "@/components/site/Skeletons";
import { useStore } from "@/context/StoreContext";
import { useProducts } from "@/hooks/use-catalog";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "المفضلة | إندومكس" },
      { name: "description", content: "قائمة وجباتك وأصنافك المفضلة من إندومكس." },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { favorites, addToCart } = useStore();
  const { data: allProducts = [], isLoading: isProductsLoading } = useProducts();

  const favoriteProducts = allProducts.filter((p) => favorites.includes(p.id));

  const handleAddAllToCart = () => {
    favoriteProducts.forEach((product) => {
      addToCart(product);
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground" dir="rtl">
      <Header />

      <main className="flex-1 w-full mx-auto max-w-6xl px-4 pb-20 pt-24">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-chili">
              <Heart className="size-4 fill-chili" />
              <span>قائمة الرغبات</span>
            </div>
            <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">الأصناف المفضلة</h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              لديك {favoriteProducts.length} {favoriteProducts.length === 1 ? "صنف" : "أصناف"} في
              قائمتك المفضلة
            </p>
          </div>

          {favoriteProducts.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddAllToCart}
                className="inline-flex items-center gap-2 rounded-xl bg-heat px-4 py-2 text-xs font-bold text-primary-foreground shadow-heat transition-transform hover:scale-105"
              >
                <ShoppingBag className="size-4" />
                <span>إضافة الكل إلى السلة</span>
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {isProductsLoading ? (
          <div className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
            {Array.from({ length: Math.max(favorites.length, 4) }).map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))}
          </div>
        ) : favoriteProducts.length === 0 ? (
          <div className="my-16 flex flex-col items-center justify-center text-center">
            <div className="grid size-20 place-items-center rounded-full bg-surface border border-border shadow-soft">
              <Heart className="size-9 text-muted-foreground stroke-1" />
            </div>
            <h2 className="mt-5 text-lg font-extrabold text-foreground sm:text-xl">
              قائمة المفضلة فارغة حالياً
            </h2>
            <p className="mt-2 max-w-sm text-xs sm:text-sm text-muted-foreground">
              اضغط على رمز القلب في أي وجبة لحفظها هنا والطلب منها بسهولة في أي وقت.
            </p>
            <Link
              to="/menu"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-heat px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-heat transition-transform hover:scale-105"
            >
              <Sparkles className="size-4" />
              <span>استكشف قائمة الطعام</span>
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
            {favoriteProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
