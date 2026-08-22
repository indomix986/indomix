import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, ShieldCheck, Clock, Award, Sparkles, Heart, Users, MapPin } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "من نحن | إندومكس" },
      {
        name: "description",
        content: "قصة إندومكس ومعايير الجودة في ابتكار أطباق الإندومي الفاخرة.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground" dir="rtl">
      <Header />

      <main className="flex-1 w-full mx-auto max-w-6xl px-4 pb-20 pt-24">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <Flame className="size-3.5" />
            <span>قصة البراند</span>
          </span>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-5xl text-foreground leading-tight">
            نحن نحول <span className="text-heat">الإندومي</span> العادي إلى تجربة طعام استثنائية
          </h1>
          <p className="mt-4 text-xs sm:text-base leading-relaxed text-muted-foreground">
            بدأت إندومكس من شغف بسيط: لماذا نأكل الإندومي بالطريقة التقليدية بينما يمكننا تحويله إلى
            وجبة مطاعم فاخرة بصوصات محضرة يومياً وإضافات طازجة ومقرمشة؟
          </p>
        </section>

        {/* Stats Grid */}
        <section className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { num: "+٥٠ ألف", label: "طبق تم تقديمه" },
            { num: "٧ دقايق", label: "متوسط وقت التحضير" },
            { num: "٤.٩ ★", label: "تقييم العملاء" },
            { num: "١٠٠٪", label: "مكونات طازجة يومياً" },
          ].map((s, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-border bg-card p-5 text-center shadow-soft"
            >
              <span className="text-2xl sm:text-3xl font-extrabold text-primary">{s.num}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </section>

        {/* Values / Pillars */}
        <section className="mt-16">
          <h2 className="text-xl font-extrabold sm:text-2xl text-center mb-8">
            معايير جودة إندومكس
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
              <div className="grid size-12 place-items-center rounded-2xl bg-heat text-primary-foreground">
                <Clock className="size-6" />
              </div>
              <h3 className="mt-4 text-base font-extrabold">تحضير فوري لحظة الطلب</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                لا نطبخ مسبقاً ولا نسخن طعاماً مجمداً. كل طبق يبدأ سلقه وتجهيز صوصاته وتوبينجاته
                لحظة وصول إشعار طلبك مباشرة.
              </p>
            </div>

            <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
              <div className="grid size-12 place-items-center rounded-2xl bg-chili-grad text-chili-foreground">
                <Flame className="size-6" />
              </div>
              <h3 className="mt-4 text-base font-extrabold">صوصات سرية خاصة بنا</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                خلطات الصوصات (الأصلي، الشيدر، التوم يوم، الباربكيو، الداينامايت) مطورة في مطبخنا
                بوصفات حصرية لن تجدها في أي مكان آخر.
              </p>
            </div>

            <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
              <div className="grid size-12 place-items-center rounded-2xl bg-primary/20 text-primary">
                <ShieldCheck className="size-6" />
              </div>
              <h3 className="mt-4 text-base font-extrabold">أعلى معايير النظافة</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                نستخدم خامات معتمدة وتغليف عالي الجودة يحافظ على حرارة الطبق وقرمشة المكونات حتى
                وصوله لباب منزلك.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-3xl border border-primary/40 bg-surface/80 p-8 text-center shadow-soft">
          <h2 className="text-xl sm:text-2xl font-extrabold">جاهز لتجربة الطعم الحقيقي؟</h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            تصفح قائمتنا الآن واختر وصفتك المفضلة مع التوبينج المفضل لديك.
          </p>
          <Link
            to="/menu"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-heat px-8 py-3 text-sm font-bold text-primary-foreground shadow-heat transition-transform hover:scale-105"
          >
            <Sparkles className="size-4" />
            <span>طلب أونلاين الآن</span>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
