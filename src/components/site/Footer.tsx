import { Phone } from "lucide-react";
import { useRestaurantSettings } from "@/hooks/use-catalog";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.85a8.18 8.18 0 0 0 4.78 1.52V6.9a4.85 4.85 0 0 1-1.01-.21z" />
    </svg>
  );
}

export function Footer() {
  const { data: settings } = useRestaurantSettings();
  const phone = settings?.phone || "01015770734";

  return (
    <footer id="contact" className="mt-auto border-t border-border bg-surface/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 text-center">
        <img
          src="/logo.webp"
          alt="شعار إندومكس"
          loading="lazy"
          width={72}
          height={72}
          className="size-18 rounded-full ring-1 ring-primary/40 object-cover"
        />
        <p className="max-w-sm text-sm text-muted-foreground">
          إندومكس — براند متخصص في الإندومي ووصفاته. من مطبخنا لباب بيتك.
        </p>
        <div className="flex items-center gap-3">
          <a
            href={`tel:+2${phone}`}
            className="inline-flex items-center gap-2 rounded-full bg-chili-grad px-4 py-2 text-sm font-bold text-chili-foreground shadow-sm transition-transform hover:scale-105"
          >
            <Phone className="size-4" />
            <span>اتصل واطلب</span>
          </a>
          <a
            href="https://tiktok.com/@indomix2024"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-bold text-foreground/85 transition-colors hover:text-primary"
          >
            <TikTokIcon className="size-4" />
            <span>تيك توك</span>
          </a>
        </div>
        <p className="text-xs text-muted-foreground">© ٢٠٢٦ INDOMIX. كل الحقوق محفوظة.</p>

        <div className="pt-2 border-t border-border/40">
          <a
            href={`https://wa.me/201028551063?text=${encodeURIComponent(
              "مرحباً KODO، رأيت موقع إندومكس وأرغب في الاستفسار عن تصميم وتطوير موقع إلكتروني احترافي مشابه."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            dir="ltr"
            aria-label="تواصل مع KODO لطلب تصميم موقع مشابه"
            className="group inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-background/50 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition-all duration-300 hover:border-primary/40 hover:bg-surface hover:shadow-soft hover:scale-105"
          >
            <span className="text-[11px]">Built by</span>
            <span className="font-extrabold tracking-wider bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 bg-clip-text text-transparent animate-kodo-gradient drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
              KODO
            </span>
            <span className="text-[10px] text-primary/70 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
              ↗
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
