import { Link } from "@tanstack/react-router";
import { Plus, Clock } from "lucide-react";
import type { Offer } from "@/types/product";
import { useStore } from "@/context/StoreContext";
import { getOptimizedImageUrl, getImageSrcSet } from "@/lib/image-utils";

interface OfferCardProps {
  offer: Offer;
}

export function OfferCard({ offer }: OfferCardProps) {
  const { addToCart } = useStore();

  const targetId = (offer.associatedProductId && offer.associatedProductId.trim()) || offer.id;

  // ✅ Sprint 2 – Step 4.3: No more useProducts() per card — build product object from offer data directly
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Offers already carry all required fields; no need to look up the full catalog
    const product = {
      id: offer.associatedProductId || offer.id,
      name: offer.title,
      category: "boxes" as const,
      categoryName: "عروض وبكجات",
      desc: offer.desc,
      shortDesc: offer.desc,
      price: offer.price,
      oldPrice: offer.oldPrice,
      img: offer.img,
      tag: offer.tag || offer.discountBadge,
      rating: 5.0,
      reviewsCount: 1,
      extras: [],
    };
    addToCart(product);
  };

  return (
    <div className="group flex w-full flex-col overflow-hidden rounded-2xl border border-chili/40 bg-card shadow-soft ring-1 ring-chili/25 transition-all duration-300 hover:border-chili hover:ring-chili/50 hover:shadow-lg">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface">
        <Link
          to="/products/$id"
          params={{ id: targetId }}
          search={{ from: "offers" }}
          className="block size-full"
        >
          <img
            src={getOptimizedImageUrl(offer.img, 400)}
            srcSet={getImageSrcSet(offer.img, [200, 400, 600])}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            alt={offer.title}
            loading="lazy"
            decoding="async"
            width={400}
            height={300}
            className="aspect-[4/3] size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Discount Badge on top start */}
        <span className="absolute start-2 top-2 rounded-full bg-chili px-2 py-0.5 text-[10px] font-bold text-chili-foreground shadow-sm sm:px-2.5 sm:py-1">
          {offer.discountBadge}
        </span>

        {/* Tag on top end */}
        <span className="absolute end-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-bold text-primary shadow-xs">
          {offer.tag}
        </span>

        {/* Validity on bottom start */}
        <div className="absolute bottom-2 start-2 flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-bold text-foreground shadow-xs">
          <Clock className="size-3 text-chili" />
          <span>{offer.validUntil}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <Link to="/products/$id" params={{ id: targetId }} search={{ from: "offers" }}>
          <h3 className="line-clamp-1 text-sm font-extrabold text-foreground transition-colors group-hover:text-primary sm:text-base">
            {offer.title}
          </h3>
        </Link>

        <p className="mt-1 line-clamp-2 min-h-8 text-[11px] leading-relaxed text-muted-foreground sm:min-h-10 sm:text-xs">
          {offer.desc}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-1.5 pt-3 border-t border-border/40">
          <span className="flex items-baseline gap-1">
            <span className="text-base font-extrabold text-primary sm:text-lg">{offer.price}</span>
            <span className="text-[10px] text-muted-foreground sm:text-[11px]">ج.م</span>
            <span className="text-[10px] text-muted-foreground line-through sm:text-[11px]">
              {offer.oldPrice}
            </span>
          </span>

          <button
            type="button"
            onClick={handleAddToCart}
            className="inline-flex items-center gap-1 rounded-xl bg-heat px-2.5 py-1.5 text-[11px] font-bold text-primary-foreground shadow-heat transition-all hover:scale-105 sm:px-3 sm:text-xs"
          >
            <Plus className="size-3 sm:size-3.5" />
            <span>أضف</span>
          </button>
        </div>
      </div>
    </div>
  );
}
