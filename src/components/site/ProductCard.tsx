import { Link } from "@tanstack/react-router";
import { Heart, Plus, Star } from "lucide-react";
import type { Product } from "@/types/product";
import { useStore } from "@/context/StoreContext";
import { getOptimizedImageUrl, getImageSrcSet } from "@/lib/image-utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { isFavorite, toggleFavorite, addToCart } = useStore();
  const favorite = isFavorite(product.id);

  return (
    <div className="group flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface">
        <Link
          to="/products/$id"
          params={{ id: product.id }}
          search={{ from: "menu" }}
          className="block size-full"
        >
          <img
            src={getOptimizedImageUrl(product.img, 400)}
            srcSet={getImageSrcSet(product.img, [200, 400, 600])}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            alt={product.name}
            loading="lazy"
            decoding="async"
            width={400}
            height={300}
            className="aspect-[4/3] size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {product.tag && (
          <span className="absolute start-2 top-2 rounded-full bg-chili px-2 py-0.5 text-[10px] font-bold text-chili-foreground shadow-sm sm:px-2.5 sm:py-1">
            {product.tag}
          </span>
        )}

        <button
          type="button"
          aria-label={favorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(product.id, product.name);
          }}
          className={`absolute end-2 top-2 grid size-8 place-items-center rounded-full transition-all ${
            favorite
              ? "bg-chili text-chili-foreground shadow-md scale-110"
              : "bg-background/90 text-foreground/80 hover:bg-background hover:text-chili shadow-xs"
          }`}
        >
          <Heart className={`size-4 ${favorite ? "fill-current" : ""}`} />
        </button>

        <div className="absolute bottom-2 start-2 flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-bold text-foreground shadow-xs">
          <Star className="size-3 fill-primary text-primary" />
          <span>{product.rating != null ? Number(product.rating).toFixed(1) : "5.0"}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <Link to="/products/$id" params={{ id: product.id }} search={{ from: "menu" }}>
          <h3 className="text-sm font-extrabold text-foreground transition-colors group-hover:text-primary sm:text-base">
            {product.name}
          </h3>
        </Link>

        <p className="mt-1 line-clamp-2 min-h-8 text-[11px] leading-relaxed text-muted-foreground sm:min-h-10 sm:text-xs">
          {product.shortDesc}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-1.5 pt-3 border-t border-border/40">
          <span className="flex items-baseline gap-1">
            <span className="text-base font-extrabold text-primary sm:text-lg">
              {product.price}
            </span>
            <span className="text-[10px] text-muted-foreground sm:text-[11px]">ج.م</span>
            {product.oldPrice && (
              <span className="text-[10px] text-muted-foreground line-through sm:text-[11px]">
                {product.oldPrice}
              </span>
            )}
          </span>

          <button
            type="button"
            onClick={() => addToCart(product)}
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
