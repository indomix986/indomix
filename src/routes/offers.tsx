import { createFileRoute } from "@tanstack/react-router";
import { useRef, useEffect } from "react";
import { Flame } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { OfferCard } from "@/components/site/OfferCard";
import { OfferCardSkeleton } from "@/components/site/Skeletons";
import { useOffers, offersQueryOptions } from "@/hooks/use-catalog";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const Route = createFileRoute("/offers")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(offersQueryOptions());
  },
  head: () => ({
    meta: [
      { title: "عروض وبكجات التوفير | إندومكس" },
      {
        name: "description",
        content: "استمتع بأقوى عروض وبوكسات إندومكس ووفر على وجباتك المفضلة.",
      },
    ],
  }),
  component: OffersPage,
});

function OffersPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: offers = [], isLoading: isOffersLoading } = useOffers();

  // ✅ Hydration-safe loading state: only show skeleton if loading AND cache is empty
  const isOffersSkeleton = isOffersLoading && offers.length === 0;

  useEffect(() => {
    if (!containerRef.current || isOffersSkeleton) return;

    const ctx = gsap.context(() => {
      gsap.from(".offers-page-item", {
        autoAlpha: 0,
        y: 35,
        scale: 0.95,
        duration: 0.55,
        stagger: 0.08,
        force3D: true,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".offers-grid-container",
          start: "top 85%",
          once: true,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [offers, isOffersSkeleton]);

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
          <span className="inline-flex items-center gap-1.5 rounded-full bg-chili/15 px-3 py-1 text-xs font-bold text-chili">
            <Flame className="size-3.5" />
            <span>عروض التوفير الحصرية</span>
          </span>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl text-foreground">
            أقوى <span className="text-heat">العروض والبوكسات</span> من إندومكس
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            وفر مع بكجات اللمة والكومبو المصممة خصيصاً لتمنحك أقصى قيمة ولذة في كل وجبة.
          </p>
        </div>

        {/* Offers Cards Grid */}
        {isOffersSkeleton ? (
          <div className="mt-10 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <OfferCardSkeleton key={idx} />
            ))}
          </div>
        ) : offers.length === 0 ? (
          <div className="my-16 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-surface border border-border mx-auto">
              <Flame className="size-8 text-muted-foreground stroke-1" />
            </div>
            <h3 className="mt-4 text-base font-extrabold">لا توجد عروض نشطة حالياً</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              تابعنا باستمرار للاستفادة من أحدث العروض والخصومات القادمة.
            </p>
          </div>
        ) : (
          <div className="offers-grid-container mt-10 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
            {offers.map((offer) => (
              <div key={offer.id} className="offers-page-item">
                <OfferCard offer={offer} />
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
