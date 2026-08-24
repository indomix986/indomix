import { createFileRoute } from "@tanstack/react-router";
import { useState, lazy, Suspense } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useAuth } from "@/context/AuthContext";
import { useAdminAllProducts } from "@/hooks/admin/use-admin-products";
import { useAdminAllCategories } from "@/hooks/admin/use-admin-categories";
import { useAdminAllOffers } from "@/hooks/admin/use-admin-offers";
import { useAdminAllReviews } from "@/hooks/admin/use-admin-reviews";
import { AdminLoginCard } from "@/components/admin/AdminLoginCard";
import { AdminHeader, type AdminTab } from "@/components/admin/AdminHeader";

const ProductsManagerTab = lazy(() =>
  import("@/components/admin/tabs/ProductsTab").then((m) => ({ default: m.ProductsManagerTab })),
);
const CategoriesManagerTab = lazy(() =>
  import("@/components/admin/tabs/CategoriesTab").then((m) => ({ default: m.CategoriesManagerTab })),
);
const OffersManagerTab = lazy(() =>
  import("@/components/admin/tabs/OffersTab").then((m) => ({ default: m.OffersManagerTab })),
);
const ReviewsGalleryManagerTab = lazy(() =>
  import("@/components/admin/tabs/ReviewsGalleryTab").then((m) => ({ default: m.ReviewsGalleryManagerTab })),
);
const RestaurantSettingsTab = lazy(() =>
  import("@/components/admin/tabs/SettingsTab").then((m) => ({ default: m.RestaurantSettingsTab })),
);

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "لوحة إدارة مطعم إندومكس | نظام إدارة المحتوى" },
      {
        name: "description",
        content: "إدارة قائمة الطعام، الأقسام، العروض، وإعدادات مطعم إندومكس.",
      },
    ],
  }),
  component: AdminRouteWrapper,
});

function AdminRouteWrapper() {
  const { isAdmin, isLoading, signOutAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("products");

  const { data: products = [], isLoading: productsLoading } = useAdminAllProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useAdminAllCategories();
  const { data: offers = [], isLoading: offersLoading } = useAdminAllOffers();
  const { data: reviews = [], isLoading: reviewsLoading } = useAdminAllReviews();

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground" dir="rtl">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-xs font-bold text-muted-foreground">
            جاري التحقق من صلاحيات الدخول...
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground" dir="rtl">
        <Header />
        <main className="flex-1 w-full mx-auto max-w-md px-4 pb-20 pt-28">
          <AdminLoginCard />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground" dir="rtl">
      <Header />

      <main className="flex-1 w-full mx-auto max-w-6xl px-4 pb-20 pt-24">
        <AdminHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSignOut={signOutAdmin}
          productsCount={products.length}
          categoriesCount={categories.length}
          offersCount={offers.length}
          reviewsCount={reviews.length}
        />

        <div className="mt-6">
        <Suspense
            fallback={
              <div className="flex h-48 items-center justify-center">
                <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            }
          >
            {activeTab === "products" && (
              <ProductsManagerTab
                products={products}
                categories={categories}
                loading={productsLoading}
              />
            )}
            {activeTab === "categories" && (
              <CategoriesManagerTab
                categories={categories}
                loading={categoriesLoading}
              />
            )}
            {activeTab === "offers" && (
              <OffersManagerTab
                offers={offers}
                products={products}
                loading={offersLoading}
              />
            )}
            {activeTab === "reviews" && (
              <ReviewsGalleryManagerTab
                reviews={reviews}
                loading={reviewsLoading}
              />
            )}
            {activeTab === "settings" && <RestaurantSettingsTab />}
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
