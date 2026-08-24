import { Menu, Heart, ShoppingBag, X, Shield, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { label: "الرئيسية", href: "/" },
  { label: "المنيو", href: "/menu" },
  { label: "العروض", href: "/offers" },
  { label: "من نحن", href: "/about" },
  { label: "تواصل معنا", href: "/contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { totalItems, favorites } = useStore();
  const { isAdmin, signOutAdmin } = useAuth();
  // ✅ Sprint 2 – Step 4.2: Select only pathname — Header no longer re-renders on every router event
  const currentPath = useRouterState({
    select: (state) => state.location.pathname,
  });

  useEffect(() => {
    setMounted(true);
    let rafId: number;
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    rafId = requestAnimationFrame(() => {
      if (window.scrollY > 15) {
        setScrolled(true);
      }
    });
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "border-b border-border/40 bg-background/75 backdrop-blur-md shadow-sm"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Left side actions (Cart, Favorites, Menu Toggle + Admin shortcut if logged in) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            aria-label="القائمة"
            onClick={() => setOpen((v) => !v)}
            className="rounded-xl p-2 text-foreground/80 transition-colors hover:bg-surface hover:text-primary md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>

          {/* Cart button */}
          <Link
            to="/cart"
            aria-label="سلة الطلبات"
            className={`relative rounded-xl p-2 transition-all ${
              currentPath === "/cart"
                ? "bg-primary/15 text-primary"
                : "text-foreground/80 hover:bg-surface hover:text-primary"
            }`}
          >
            <ShoppingBag className="size-5" />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-0.5 start-0 grid min-w-4 h-4 px-1 place-items-center rounded-full bg-chili text-[10px] font-bold text-chili-foreground shadow-sm animate-in zoom-in-50">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Favorites button */}
          <Link
            to="/favorites"
            aria-label="المفضلة"
            className={`relative rounded-xl p-2 transition-all ${
              currentPath === "/favorites"
                ? "bg-chili/15 text-chili"
                : "text-foreground/80 hover:bg-surface hover:text-primary"
            }`}
          >
            <Heart
              className={`size-5 ${mounted && favorites.length > 0 ? "text-chili fill-chili/30" : ""}`}
            />
            {mounted && favorites.length > 0 && (
              <span className="absolute -top-0.5 start-0 grid min-w-4 h-4 px-1 place-items-center rounded-full bg-surface border border-chili text-[10px] font-bold text-chili">
                {favorites.length}
              </span>
            )}
          </Link>

          {/* Admin shortcut badge visible only when Admin session is active */}
          {isAdmin && (
            <Link
              to="/admin"
              aria-label="لوحة إدارة المطعم"
              className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all ${
                currentPath.startsWith("/admin")
                  ? "bg-chili text-chili-foreground shadow-sm"
                  : "border border-chili/30 bg-chili/10 text-chili hover:bg-chili/20"
              }`}
            >
              <Shield className="size-3.5" />
              <span className="hidden sm:inline">لوحة الإدارة</span>
            </Link>
          )}
        </div>

        {/* Center navigation for Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => {
            const isActive = currentPath === l.href;
            return (
              <Link
                key={l.href}
                to={l.href}
                className={`rounded-xl px-3.5 py-1.5 text-sm font-bold transition-colors ${
                  isActive
                    ? "bg-surface text-primary"
                    : "text-foreground/80 hover:bg-surface/50 hover:text-primary"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <span className="text-end leading-none">
            <span className="block text-lg font-extrabold tracking-tight">
              <span className="text-primary">INDO</span>
              <span className="text-chili">MIX</span>
            </span>
            <span className="block text-[9px] tracking-[0.35em] text-muted-foreground">
              NOODLE BAR
            </span>
          </span>
          <img
            src="/logo.webp"
            alt="شعار إندومكس"
            width={42}
            height={42}
            className="size-10.5 rounded-full ring-1 ring-primary/40 object-cover"
          />
        </Link>
      </div>

      {/* Mobile Drawer Navigation */}
      {open && (
        <nav className="border-t border-border/60 bg-surface/95 px-4 py-4 backdrop-blur-xl md:hidden animate-in slide-in-from-top-2 duration-200">
          <ul className="grid gap-1 text-sm font-bold">
            {navLinks.map((l) => {
              const isActive = currentPath === l.href;
              return (
                <li key={l.href}>
                  <Link
                    to={l.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-colors ${
                      isActive
                        ? "bg-background text-primary"
                        : "text-foreground/85 hover:bg-background hover:text-primary"
                    }`}
                  >
                    <span>{l.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 pt-3 border-t border-border/40 grid grid-cols-2 gap-2">
            <Link
              to="/cart"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-heat py-2 text-xs font-bold text-primary-foreground"
            >
              <ShoppingBag className="size-4" />
              <span>السلة ({totalItems})</span>
            </Link>
            <Link
              to="/favorites"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-2 text-xs font-bold text-foreground"
            >
              <Heart className="size-4 text-chili" />
              <span>المفضلة ({favorites.length})</span>
            </Link>
          </div>

          {isAdmin && (
            <div className="mt-3 pt-3 border-t border-border/40 space-y-2">
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-chili/15 border border-chili/30 py-2.5 text-xs font-bold text-chili"
              >
                <Shield className="size-4" />
                <span>لوحة إدارة المطعم</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  signOutAdmin();
                  setOpen(false);
                }}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-destructive/20 bg-destructive/5 py-2 text-xs font-bold text-destructive"
              >
                <LogOut className="size-3.5" />
                <span>تسجيل خروج المدير</span>
              </button>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
