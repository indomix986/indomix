/**
 * Utility functions for responsive image loading and CDN transforms (Cloudinary, Supabase, ImgBB, etc.)
 */

export function getOptimizedImageUrl(url: string | undefined | null, width = 400): string {
  if (!url) return "";

  // Cloudinary URL transformation
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    const parts = url.split("/upload/");
    const part0 = parts[0];
    const part1 = parts[1];
    if (part0 && part1) {
      // Skip if already has transformation params
      if (!part1.startsWith("w_") && !part1.startsWith("c_") && !part1.startsWith("f_")) {
        // Use q_auto:eco for smaller widths to save bytes aggressively
        const quality = width <= 400 ? "q_auto:eco" : "q_auto";
        return `${part0}/upload/w_${width},c_limit,${quality},f_auto/${part1}`;
      }
      // Replace existing w_ value to respect requested width
      if (part1.startsWith("w_")) {
        return `${part0}/upload/${part1.replace(/^w_\d+/, `w_${width}`)}`;
      }
    }
  }

  // Supabase Storage transformation
  if (url.includes(".supabase.co/storage/v1/object/public/")) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}width=${width}&quality=80&format=origin`;
  }

  return url;
}

/**
 * Small decorative/background-blur images — aggressively compressed, never srcSet.
 * Returns a w_200,q_auto:eco,f_auto Cloudinary URL, or the original for non-Cloudinary.
 */
export function getThumbnailUrl(url: string | undefined | null): string {
  return getOptimizedImageUrl(url, 150);
}

export function getImageSrcSet(
  url: string | undefined | null,
  widths = [320, 480, 640, 800, 1200],
): string | undefined {
  if (
    !url ||
    (!url.includes("res.cloudinary.com") &&
      !url.includes(".supabase.co/storage/v1/object/public/"))
  ) {
    return undefined;
  }

  return widths.map((w) => `${getOptimizedImageUrl(url, w)} ${w}w`).join(", ");
}
