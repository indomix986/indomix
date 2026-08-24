# إندومكس 🍜

براند متخصص في الإندومي ووصفاته المبتكرة، مع هوية بصرية مستوحاة من اللوجو الخاص بالمشروع.  
يشمل المشروع واجهة عملاء كاملة (قائمة، سلة، مفضلة، عروض) ولوحة تحكم للأدمن.

---

## Stack التقني

| الطبقة | التقنية |
|--------|---------|
| Frontend | **React 19** + **TanStack Router / Start** (SSR) |
| Styling | **Tailwind CSS v4** |
| Database & Auth | **Supabase** (PostgreSQL + Row Level Security) |
| Animations | **GSAP** + **Lenis** (smooth scroll) |
| Build Tool | **Vite 8** |
| Language | **TypeScript** |
| Package Manager | **bun** |

---

## متطلبات التشغيل

- **Node.js** ≥ 18 — يُنصح بالتثبيت عبر [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **bun** — [تثبيت bun](https://bun.sh/docs/installation)
- حساب **Supabase** مفعّل مع المشروع

---

## إعداد المشروع محلياً

### 1. استنساخ المستودع

```sh
git clone <repository-url>
cd noodle-haven-main
```

### 2. تثبيت الاعتماديات

```sh
bun install
```

### 3. إعداد متغيرات البيئة

```sh
cp .env.example .env
```

ثم افتح `.env` وعبّئ القيم الحقيقية (انظر قسم [متغيرات البيئة](#متغيرات-البيئة) أدناه).

### 4. إعداد قاعدة البيانات

شغّل ملفات الـ migrations على مشروع Supabase الخاص بك:

```sh
# من لوحة تحكم Supabase → SQL Editor، شغّل الملفات بالترتيب:
supabase/migrations/20260822000000_cleanup_and_single_admin_schema.sql
supabase/migrations/20260822000001_category_badge_text.sql
supabase/migrations/20260822_bot_faq.sql
supabase/migrations/20260823000000_reviews_gallery.sql
supabase/migrations/20260823000001_fix_rls_with_check.sql
```

أو شغّل `supabase/schema.sql` لإنشاء كل الجداول مرة واحدة، ثم `supabase/seed.sql` لبيانات أولية.

### 5. تشغيل بيئة التطوير

```sh
bun run dev
```

افتح المتصفح على `http://localhost:3000`

---

## أوامر مفيدة

| الأمر | الوظيفة |
|-------|---------|
| `bun run dev` | تشغيل بيئة التطوير (SSR) |
| `bun run build` | بناء نسخة الإنتاج |
| `bun run preview` | معاينة بناء الإنتاج محلياً |
| `bun run lint` | فحص الكود بـ ESLint |
| `bun run format` | تنسيق الكود بـ Prettier |

---

## متغيرات البيئة

انسخ `.env.example` إلى `.env` واستبدل القيم:

```sh
cp .env.example .env
```

| المتغير | الوصف | المصدر |
|---------|-------|--------|
| `VITE_SUPABASE_URL` | رابط مشروع Supabase | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | المفتاح العام (anon key) | Supabase Dashboard → Settings → API |

> **ملاحظة:** الـ `anon key` مصمم للاستخدام في المتصفح وآمن للنشر — الحماية تتم عبر Row Level Security في Supabase.

---

## هيكل المشروع

```
src/
├── assets/           # صور ثابتة (jpg + webp)
├── components/
│   ├── admin/        # مكونات لوحة التحكم (tabs, modals)
│   ├── site/         # مكونات الواجهة العامة (Header, Footer, Cards...)
│   └── ui/           # مكونات UI أساسية (shadcn/ui)
├── constants/        # ثوابت المطعم (أرقام، مفاتيح localStorage)
├── context/          # React Contexts (Auth, Store/Cart)
├── hooks/            # Data hooks (TanStack Query)
├── lib/              # Supabase client، utilities، error handling
├── routes/           # صفحات الموقع (TanStack Router file-based)
├── types/            # TypeScript interfaces
├── server.ts         # نقطة دخول SSR server
└── start.ts          # نقطة دخول client
```

---

## لوحة التحكم (Admin)

- الرابط: `/admin`
- تسجيل الدخول عبر **Supabase Auth** (email + password)
- يجب إنشاء المستخدم الأدمن مسبقاً من لوحة Supabase → Authentication → Users
- تشمل اللوحة: إدارة المنتجات، التصنيفات، العروض، المراجعات، FAQ Bot، إعدادات المطعم

---

## النشر (Deployment)

المشروع جاهز للنشر على **Vercel** (الإعدادات موجودة في `vercel.json`):

1. اربط المستودع بـ Vercel
2. أضف متغيرات البيئة في Vercel Dashboard → Settings → Environment Variables
3. Vercel سيبني ويرفع تلقائياً عند كل push على `main`

للنشر على **Cloudflare Workers**، عيّن:
```sh
NITRO_PRESET=cloudflare
```

---

## الترخيص

هذا المشروع مملوك للعميل. جميع الحقوق محفوظة.
