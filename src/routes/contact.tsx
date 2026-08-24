import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Phone, Clock, MessageCircle } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { toast } from "sonner";
import { useGsapScroll, gsap } from "@/hooks/use-gsap-scroll";
import { useRestaurantSettings } from "@/hooks/use-catalog";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل معنا | إندومكس" },
      {
        name: "description",
        content: "تواصل مع فريق إندومكس مباشرة عبر الواتساب أو الهاتف للاستفسارات والطلبات.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: settings } = useRestaurantSettings();

  useGsapScroll(containerRef, () => {
    gsap.from(".contact-card-anim", {
      autoAlpha: 0,
      y: 30,
      duration: 0.55,
      stagger: 0.1,
      force3D: true,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".contact-grid-container",
        start: "top 85%",
        once: true,
      },
    });
  });

  const whatsappNumber = settings?.whatsapp || "201015770734";
  const phoneNumber = settings?.phone || "01015770734";
  const workingHours = settings?.working_hours || "يوميًا من ١١:٠٠ صباحًا حتى ٣:٠٠ فجرًا";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      toast.error("يرجى ملء الاسم والرسالة");
      return;
    }

    const text = `*رسالة تواصل من موقع إندومكس INDOMIX*\n-------------------------\n👤 *الاسم:* ${name.trim()}\n📱 *الهاتف:* ${phone.trim() || "غير محدد"}\n💬 *الرسالة:*\n${message.trim()}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    toast.success("جاري فتح محادثة الواتساب لإرسال رسالتك...");
  };

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
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <MessageCircle className="size-3.5" />
            <span>خدمة العملاء والتواصل</span>
          </span>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl text-foreground">
            تواصل معنا مباشرة عبر <span className="text-heat">واتساب</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            اكتب رسالتك وسنقوم بتحويلك فوراً لمحادثة واتساب مباشرة مع خدمة عملاء إندومكس.
          </p>
        </div>

        <div className="contact-grid-container mt-12 grid gap-8 lg:grid-cols-12 max-w-5xl mx-auto">
          {/* Direct Contact Info */}
          <div className="contact-card-anim lg:col-span-5 space-y-4">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft space-y-5">
              <h2 className="text-base font-extrabold text-foreground border-b border-border/60 pb-3">
                طرق التواصل المباشر
              </h2>

              <div className="flex items-start gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-heat text-primary-foreground shrink-0">
                  <Phone className="size-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground">الخط الساخن والدليفري</h3>
                  <a
                    href={`tel:+2${phoneNumber}`}
                    className="text-sm font-extrabold text-foreground hover:text-primary transition-colors"
                  >
                    {phoneNumber}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-emerald-600 text-white shrink-0">
                  <MessageCircle className="size-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground">محادثة واتساب سريعة</h3>
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-extrabold text-emerald-500 hover:underline"
                  >
                    {phoneNumber}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-surface border border-border text-primary shrink-0">
                  <Clock className="size-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground">مواعيد العمل</h3>
                  <p className="text-xs font-bold text-foreground">{workingHours}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact / WhatsApp Form */}
          <div className="contact-card-anim lg:col-span-7">
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-soft">
              <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div>
                  <h2 className="text-base font-extrabold text-foreground">
                    أرسل رسالة عبر واتساب
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    سيتم تحويل رسالتك إلى محادثة واتساب فورية مع فريق المطعم.
                  </p>
                </div>
                <div className="grid size-9 place-items-center rounded-full bg-emerald-600/15 text-emerald-500 shrink-0">
                  <MessageCircle className="size-5" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    الاسم بالكامل *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="أدخل اسمك"
                    maxLength={100}
                    className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    رقم الموبايل
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    maxLength={15}
                    className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    نص الرسالة أو الاستفسار *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="اكتب استفسارك أو طلبك هنا..."
                    maxLength={200}
                    className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs outline-none focus:border-primary resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
                >
                  <MessageCircle className="size-4" />
                  <span>إرسال عبر واتساب ({phoneNumber})</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
