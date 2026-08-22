import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register once at module level — safe to call multiple times per GSAP docs
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

/**
 * Encapsulates the repeated GSAP scroll-animation pattern:
 * - Scopes animations to `ref` via gsap.context()
 * - Cleans up via ctx.revert() on unmount or deps change
 *
 * Usage:
 * ```ts
 * useGsapScroll(containerRef, () => {
 *   gsap.from(".my-element", { autoAlpha: 0, y: 30, ... });
 * }, [dependency]);
 * ```
 */
export function useGsapScroll(
  ref: React.RefObject<Element | null>,
  setup: (context: gsap.Context) => void,
  deps: React.DependencyList = [],
) {
  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context((self) => {
      setup(self);
    }, ref.current);
    return () => ctx.revert();
    // deps intentionally spread — caller controls when to re-run
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
