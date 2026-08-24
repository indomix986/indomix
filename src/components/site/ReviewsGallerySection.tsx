import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  ChevronRight,
  ChevronLeft,
  Maximize2,
  X,
  ShieldCheck,
  MessageCircleHeart,
} from "lucide-react";
import type { ReviewGalleryItem } from "@/types/review";
import { useReviewsGallery } from "@/hooks/use-reviews-gallery";
import { getOptimizedImageUrl, getThumbnailUrl } from "@/lib/image-utils";

export function ReviewsGallerySection() {
  const { data: reviews = [], isLoading } = useReviewsGallery();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: reviews.length > 3,
    direction: "rtl",
    align: "start",
    slidesToScroll: 1,
    skipSnaps: false,
    dragFree: false,
  });

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  // Lightbox Modal State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const current = emblaApi.selectedScrollSnap();
    setSelectedIndex(current);
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Step 1: Auto reInit when reviews data updates
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();
  }, [emblaApi, reviews, onSelect]);

  // Step 2 & 3: Protect index bounds driven by Embla snaps / reviews
  const totalSnaps = scrollSnaps.length > 0 ? scrollSnaps.length : reviews.length;
  const safeSelectedIndex = Math.min(selectedIndex, Math.max(0, totalSnaps - 1));

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (lightboxIndex === null || reviews.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxIndex(null);
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : reviews.length - 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setLightboxIndex((prev) => (prev !== null && prev < reviews.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, reviews.length]);

  if (!isLoading && reviews.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full border-t border-border/60 bg-background py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary mb-2 border border-primary/20">
              <MessageCircleHeart className="size-3.5" />
              <span>تجارب حقيقية موثقة</span>
            </div>
            <h2 className="text-2xl font-extrabold sm:text-3xl text-foreground">
              معرض آراء وتقييمات العملاء
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-xl">
              لقطات حقيقية من رسائل وتقييمات عشاق إندومكس على مدار الأسبوع. انقر على أي صورة لتكبيرها وقراءتها بوضوح.
            </p>
          </div>

          {/* Slider Navigation Arrows */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              aria-label="التقييم التالي"
              onClick={scrollPrev}
              disabled={prevBtnDisabled && !emblaApi?.internalEngine()?.options.loop}
              className="grid size-9 place-items-center rounded-xl border border-border bg-card text-foreground shadow-soft transition-all hover:bg-surface hover:border-primary/50 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="size-5" />
            </button>
            <button
              type="button"
              aria-label="التقييم السابق"
              onClick={scrollNext}
              disabled={nextBtnDisabled && !emblaApi?.internalEngine()?.options.loop}
              className="grid size-9 place-items-center rounded-xl border border-border bg-card text-foreground shadow-soft transition-all hover:bg-surface hover:border-primary/50 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="size-5" />
            </button>
          </div>
        </div>

        {/* Embla Carousel Viewport */}
        <div className="overflow-hidden rounded-3xl" ref={emblaRef}>
          <div className="flex -ms-3 sm:-ms-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="min-w-0 shrink-0 grow-0 basis-[70%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 ps-3 sm:ps-4"
                  >
                    <div className="aspect-[3/4] w-full rounded-2xl bg-card border border-border/60 animate-pulse" />
                  </div>
                ))
              : reviews.map((item, idx) => {
                  // Only first 2 slides are truly visible on initial paint (mobile: 1 card = 70vw)
                  const isFirstVisible = idx < 2;

                  return (
                    <div
                      key={item.id || idx}
                      className="min-w-0 shrink-0 grow-0 basis-[70%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 ps-3 sm:ps-4"
                    >
                      <div
                        onClick={() => setLightboxIndex(idx)}
                        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:border-primary/60 hover:shadow-lg hover:-translate-y-1"
                      >
                        {/* Aspect Ratio Container with Double-Layer Blur */}
                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface flex items-center justify-center">
                          {/* Background blurred ambiance — always lazy, thumbnail size */}
                          <img
                            src={getThumbnailUrl(item.image_url)}
                            alt=""
                            aria-hidden="true"
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 size-full object-cover blur-md scale-110 opacity-35 pointer-events-none"
                          />

                          {/* Foreground sharp image */}
                          <img
                            src={getOptimizedImageUrl(item.image_url, 300)}
                            srcSet={`${getOptimizedImageUrl(item.image_url, 300)} 300w, ${getOptimizedImageUrl(item.image_url, 480)} 480w, ${getOptimizedImageUrl(item.image_url, 640)} 640w`}
                            sizes="(max-width: 640px) 70vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            alt={`تقييم عميل #${idx + 1}`}
                            loading={isFirstVisible ? "eager" : "lazy"}
                            fetchPriority={isFirstVisible ? "low" : undefined}
                            decoding="async"
                            className="relative z-10 size-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                          />

                          {/* Overlay on hover with zoom hint */}
                          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 backdrop-blur-[2px]">
                            <div className="flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-extrabold text-foreground shadow-lg border border-border/80 scale-90 transition-transform duration-300 group-hover:scale-100">
                              <Maximize2 className="size-3.5 text-primary" />
                              <span>تكبير التقييم</span>
                            </div>
                          </div>

                          {/* Top Verified Badge */}
                          <div className="absolute top-2.5 start-2.5 z-20 flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-bold text-foreground backdrop-blur border border-border/40 shadow-xs">
                            <ShieldCheck className="size-3 text-emerald-500" />
                            <span>تقييم موثق</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>

        {/* Instagram-Style Dynamic Sliding Dots */}
        {totalSnaps > 1 && (
          <DynamicPaginationDots
            total={totalSnaps}
            selectedIndex={safeSelectedIndex}
            onDotClick={scrollTo}
          />
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && reviews[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close Button */}
          <button
            type="button"
            aria-label="إغلاق"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 end-4 z-50 grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors shadow-lg"
          >
            <X className="size-6" />
          </button>

          {/* Prev / Next Modal Buttons */}
          {reviews.length > 1 && (
            <>
              <button
                type="button"
                aria-label="التقييم التالي"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) =>
                    prev !== null && prev > 0 ? prev - 1 : reviews.length - 1
                  );
                }}
                className="absolute start-3 sm:start-6 top-1/2 -translate-y-1/2 z-50 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors shadow-lg"
              >
                <ChevronRight className="size-6" />
              </button>

              <button
                type="button"
                aria-label="التقييم السابق"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) =>
                    prev !== null && prev < reviews.length - 1 ? prev + 1 : 0
                  );
                }}
                className="absolute end-3 sm:end-6 top-1/2 -translate-y-1/2 z-50 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors shadow-lg"
              >
                <ChevronLeft className="size-6" />
              </button>
            </>
          )}

          {/* Lightbox Image Container */}
          <div
            className="relative max-h-[90vh] max-w-[92vw] sm:max-w-3xl overflow-hidden rounded-2xl bg-card/40 border border-white/10 shadow-2xl p-2 sm:p-4 flex flex-col items-center justify-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={reviews[lightboxIndex].image_url}
              alt={`صورة تقييم مكبرة #${lightboxIndex + 1}`}
              className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain shadow-md"
            />

            {/* Bottom Meta Bar */}
            <div className="mt-3 flex items-center justify-between gap-4 w-full px-2 text-xs text-white/80">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="size-4 text-emerald-400" />
                <span>تقييم موثق من عميل إندومكس</span>
              </div>

              <span className="font-extrabold text-white/90">
                {lightboxIndex + 1} من {reviews.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

interface DynamicPaginationDotsProps {
  total: number;
  selectedIndex: number;
  onDotClick: (index: number) => void;
}

function DynamicPaginationDots({
  total,
  selectedIndex,
  onDotClick,
}: DynamicPaginationDotsProps) {
  if (total <= 1) return null;

  const maxVisible = 5;
  const dotSize = 8; // px (size-2)
  const gap = 6; // px (gap-1.5)
  const step = dotSize + gap; // 14px

  // Calculate the sliding window offset (RTL: positive shift to reveal left items)
  const windowStart =
    total <= maxVisible ? 0 : Math.min(Math.max(0, selectedIndex - 2), total - maxVisible);

  const translateX = total <= maxVisible ? 0 : windowStart * step;
  const containerWidth =
    total <= maxVisible
      ? total * dotSize + (total - 1) * gap
      : maxVisible * dotSize + (maxVisible - 1) * gap;

  return (
    <div className="mt-6 flex items-center justify-center" dir="rtl">
      <div className="inline-flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
        <div
          className="overflow-hidden"
          style={{ width: `${containerWidth}px`, height: `${dotSize + 4}px` }}
        >
          <div
            dir="rtl"
            className="flex items-center gap-1.5 transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(${translateX}px)`,
              height: "100%",
            }}
          >
            {Array.from({ length: total }).map((_, idx) => {
              const isSelected = idx === selectedIndex;
              const isFirstInWindow = idx === windowStart && windowStart > 0;
              const isLastInWindow =
                idx === windowStart + maxVisible - 1 && windowStart < total - maxVisible;
              const isNeighbor = Math.abs(idx - selectedIndex) === 1;
              const isInsideWindow = idx >= windowStart && idx < windowStart + maxVisible;

              let scaleClass = "scale-0 opacity-0 pointer-events-none";
              let colorClass = "bg-white/40";

              if (isSelected) {
                scaleClass = "scale-100 opacity-100";
                colorClass = "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]";
              } else if (isFirstInWindow || isLastInWindow) {
                scaleClass = "scale-50 opacity-40 hover:opacity-75";
                colorClass = "bg-white/50";
              } else if (isNeighbor) {
                scaleClass = "scale-75 opacity-75 hover:opacity-100";
                colorClass = "bg-white/70";
              } else if (isInsideWindow) {
                scaleClass = "scale-75 opacity-60 hover:opacity-90";
                colorClass = "bg-white/60";
              }

              return (
                <button
                  key={idx}
                  type="button"
                  aria-label={`انتقال إلى التقييم رقم ${idx + 1}`}
                  onClick={() => onDotClick(idx)}
                  className={`size-2 shrink-0 rounded-full transition-all duration-300 ease-out cursor-pointer ${scaleClass} ${colorClass}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

