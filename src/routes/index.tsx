import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  ChevronLeft,
  Flame,
  Clock,
  Star,
  Truck,
  Tag,
  Percent,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";
import { useRef, useState } from "react";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/site/ProductCard";
import { OfferCard } from "@/components/site/OfferCard";
import {
  CategoryCardSkeleton,
  ProductCardSkeleton,
  OfferCardSkeleton,
} from "@/components/site/Skeletons";
import {
  useCategories,
  useProducts,
  useOffers,
  categoriesQueryOptions,
  productsQueryOptions,
  offersQueryOptions,
} from "@/hooks/use-catalog";
import heroNoodles from "@/assets/hero-noodles.webp";
import { useStore } from "@/context/StoreContext";
import { useGsapScroll, gsap } from "@/hooks/use-gsap-scroll";

export const Route = createFileRoute("/")({
  // ✅ Sprint 3 – Step 5.2: SSR Loader — prefetch all homepage data on the server
  // The client useQuery calls below will find data already in cache → zero waterfall on first paint
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(categoriesQueryOptions()),
      context.queryClient.ensureQueryData(productsQueryOptions()),
      context.queryClient.ensureQueryData(offersQueryOptions()),
    ]);
  },
  head: () => ({
    meta: [
      { title: "إندومكس | مطعم الإندومي ووصفاته المميزة" },
      {
        name: "description",
        content:
          "إندومكس متخصص في الإندومي بكل وصفاته: كلاسيك، بالجبنة، سي فود، وبالفراخ الكريسبي. اطلب أونلاين والتوصيل خلال ٢٥ دقيقة.",
      },
      { property: "og:title", content: "إندومكس | مطعم الإندومي ووصفاته المميزة" },
      {
        property: "og:description",
        content: "وصفات إندومي مبتكرة، تحضير سريع، وطعم غني. اطلب الآن من إندومكس.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { addToCart } = useStore();
  const mainRef = useRef<HTMLDivElement>(null);

  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();
  const { data: products = [], isLoading: isProductsLoading } = useProducts();
  const { data: offers = [], isLoading: isOffersLoading } = useOffers();

  // ✅ Hydration-safe loading states: only show skeleton if loading AND cache is empty
  const isCategoriesSkeleton = isCategoriesLoading && categories.length === 0;
  const isProductsSkeleton = isProductsLoading && products.length === 0;
  const isOffersSkeleton = isOffersLoading && offers.length === 0;

  const displayCategories = categories.filter((c) => c.id !== "all");
  const popularProducts = products.filter((p) => p.isPopular);
  const featuredProducts = popularProducts.length > 0 ? popularProducts : products.slice(0, 4);

  // ✅ Run GSAP only once after all sections have data
  const isAllLoaded = !isCategoriesSkeleton && !isProductsSkeleton && !isOffersSkeleton;

  useGsapScroll(mainRef, () => {
    // Hero image parallax (GPU accelerated)
    gsap.to(".hero-img", {
      yPercent: 15,
      scale: 1.04,
      force3D: true,
      ease: "none",
      scrollTrigger: {
        trigger: "#home",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    // Categories section animation
    if (displayCategories.length > 0) {
      gsap.from(".categories-header", {
        autoAlpha: 0,
        y: 20,
        duration: 0.5,
        force3D: true,
        scrollTrigger: {
          trigger: "#categories",
          start: "top 85%",
          once: true,
        },
      });

      gsap.from(".category-card", {
        autoAlpha: 0,
        y: 20,
        duration: 0.45,
        stagger: 0.05,
        force3D: true,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#categories",
          start: "top 80%",
          once: true,
        },
      });
    }

    // Popular dishes animation
    gsap.from(".popular-header", {
      autoAlpha: 0,
      y: 20,
      duration: 0.5,
      force3D: true,
      scrollTrigger: {
        trigger: "#popular",
        start: "top 85%",
        once: true,
      },
    });

    if (featuredProducts.length > 0) {
      gsap.from(".popular-card-item", {
        autoAlpha: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.06,
        force3D: true,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#popular",
          start: "top 80%",
          once: true,
        },
      });
    }

    // Offers section animation
    if (offers.length > 0) {
      gsap.from(".offers-header", {
        autoAlpha: 0,
        y: 20,
        duration: 0.5,
        force3D: true,
        scrollTrigger: {
          trigger: "#offers",
          start: "top 85%",
          once: true,
        },
      });

      gsap.from(".offer-card-item", {
        autoAlpha: 0,
        y: 20,
        duration: 0.45,
        stagger: 0.06,
        force3D: true,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#offers",
          start: "top 80%",
          once: true,
        },
      });
    }

    // Feature stats animation
    gsap.from(".feature-stat-item", {
      autoAlpha: 0,
      y: 20,
      duration: 0.45,
      stagger: 0.06,
      force3D: true,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".feature-stats-container",
        start: "top 90%",
        once: true,
      },
    });
  }, [isAllLoaded]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate({ to: "/menu" });
    }
  };

  return (
    <div
      ref={mainRef}
      className="flex min-h-screen flex-col bg-background text-foreground"
      dir="rtl"
    >
      <Header />

      {/* Hero */}
      <section id="home" className="relative isolate overflow-hidden pt-16">
        <img
          src={heroNoodles}
          alt="طبق إندومي ساخن ببيضة وفراخ كريسبي"
          width={1600}
          height={1200}
          className="hero-img absolute inset-0 -z-20 size-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-veil" />

        <div className="mx-auto max-w-6xl px-4 pb-12 pt-14 sm:pt-24">
          <span className="hero-badge inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/60 px-3 py-1 text-xs font-bold text-primary backdrop-blur">
            <Flame className="size-3.5 text-chili" />
            <span>نودلز بمزاجك، على نار هادية</span>
          </span>

          <h1 className="hero-title mt-5 max-w-xl text-4xl font-extrabold leading-[1.15] sm:text-6xl">
            <span className="text-heat">إندومي</span> بطعم
            <br />
            مش هتلاقيه في حتة تانية
          </h1>

          <p className="hero-desc mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            كل وصفة في إندومكس بتتعمل لحظة الطلب — صوصات بنجهزها بنفسنا، إضافات طازة، وتحضير في أقل
            من ٧ دقايق.
          </p>

          <form
            onSubmit={handleSearchSubmit}
            className="hero-form mt-7 flex max-w-md items-center gap-2 rounded-2xl border border-border bg-surface/85 p-1.5 shadow-soft backdrop-blur"
          >
            <Search className="ms-2 size-4 shrink-0 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن وصفتك المفضلة..."
              aria-label="ابحث عن وصفة"
              className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="rounded-xl bg-chili-grad px-5 py-2 text-sm font-bold text-chili-foreground transition-transform hover:scale-[1.03]"
            >
              بحث
            </button>
          </form>

          <div className="hero-actions mt-5 flex flex-wrap items-center gap-3">
            <Link
              to="/offers"
              className="inline-flex items-center gap-1 rounded-full bg-heat px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-heat transition-transform hover:scale-[1.03]"
            >
              <span>اكتشف عروض اليوم</span>
              <ChevronLeft className="size-4" />
            </Link>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Truck className="size-4 text-primary" />
              <span>توصيل خلال ٢٥ دقيقة</span>
            </span>
          </div>
        </div>
      </section>

      {/* Categories */}
      {(!isCategoriesSkeleton || displayCategories.length > 0) && (
        <section id="categories" className="mx-auto max-w-6xl px-4 py-14">
          <div className="categories-header flex items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-chili">الأصناف</span>
              <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">تسوق حسب الصنف</h2>
            </div>
            <Link to="/menu" className="text-sm font-bold text-primary hover:underline">
              عرض الكل
            </Link>
          </div>

          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {isCategoriesSkeleton
              ? Array.from({ length: 6 }).map((_, idx) => (
                  <li key={idx} className="w-full">
                    <CategoryCardSkeleton />
                  </li>
                ))
              : displayCategories.map((c) => (
                  <li key={c.id || c.name} className="category-card w-full">
                    <Link
                      to="/menu"
                      className="group flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-soft transition-colors hover:border-primary/50"
                    >
                      <div className="relative aspect-square w-full overflow-hidden bg-surface">
                        <img
                          src={c.img}
                          alt={c.name}
                          loading="lazy"
                          decoding="async"
                          width={400}
                          height={400}
                          className="aspect-square size-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <span className="absolute end-2 top-2 rounded-full bg-background/75 px-2 py-0.5 text-[10px] font-bold text-primary backdrop-blur">
                          {c.count}
                        </span>
                      </div>
                      <p className="flex h-10 w-full items-center justify-center px-3 py-2.5 text-center text-sm font-bold truncate">
                        {c.name}
                      </p>
                    </Link>
                  </li>
                ))}
          </ul>
        </section>
      )}

      {/* Popular */}
      <section id="popular" className="bg-surface/40 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="popular-header flex items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-chili">القائمة المميزة</span>
              <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">الأكثر طلبًا في إندومكس</h2>
            </div>
            <Link to="/menu" className="text-sm font-bold text-primary hover:underline">
              عرض كل القائمة
            </Link>
          </div>

          {isProductsSkeleton ? (
            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <ProductCardSkeleton key={idx} />
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
              <p className="text-sm">لا توجد وجبات متاحة حالياً. تفضل بزيارة المنيو قريباً!</p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
              {featuredProducts.map((p) => (
                <div key={p.id} className="popular-card-item">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Offers & Deals */}
      <section id="offers" className="mx-auto max-w-6xl px-4 py-14">
        {(!isOffersSkeleton || offers.length > 0) && (
          <>
            <div className="offers-header flex items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-chili">التوفير</span>
                <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">عروض وبكجات حصرية</h2>
              </div>
              <Link to="/offers" className="text-sm font-bold text-primary hover:underline">
                كل العروض
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
              {isOffersSkeleton
                ? Array.from({ length: 4 }).map((_, idx) => <OfferCardSkeleton key={idx} />)
                : offers.map((offer) => (
                    <div key={offer.id} className="offer-card-item">
                      <OfferCard offer={offer} />
                    </div>
                  ))}
            </div>
          </>
        )}

        {/* Feature stats */}
        <div
          className={`feature-stats-container grid gap-3 sm:grid-cols-3 ${offers.length > 0 ? "mt-8" : ""}`}
        >
          {[
            { icon: Clock, t: "٧ دقايق تحضير", s: "طازة لحظة الطلب" },
            { icon: Star, t: "٤.٩ تقييم", s: "من أكثر من 200 عميل" },
            { icon: Truck, t: "توصيل سريع", s: "لكل مناطق المدينة" },
          ].map((f) => (
            <div
              key={f.t}
              className="feature-stat-item flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-heat text-primary-foreground">
                <f.icon className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-extrabold">{f.t}</span>
                <span className="block text-xs text-muted-foreground">{f.s}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Shared Footer */}
      <Footer />
    </div>
  );
}
