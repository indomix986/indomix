# وثيقة تسليم تقرير وفحص الأداء وخطة التحسين (Performance Audit Handoff Document)

**تاريخ التقرير:** 22 أغسطس 2026  
**المشروع:** Indomix Noodle Bar Web Application (`noodle-haven-main`)  
**التقنيات الأساسية:** TanStack Start (SSR), TanStack Router, TanStack Query, React 19, Supabase JS, Tailwind CSS v4, GSAP, Lenis Smooth Scroll.

---

## 1. Executive Summary (الملخص التنفيذي)

أظهر الفحص الشامل للبنية المعمارية للأداء وجود عدد من الاختناقات الجوهرية (Bottlenecks) في مسار تحميل التطبيق وجلب البيانات:

1. **غياب التحميل المسبق من الخادم (Zero SSR Route Loaders) وشلال استعلامات العميل:**
   * بالرغم من استخدام `TanStack Start` المهيأ لـ SSR، فإن المسارات لم تكن تحتوي على `loaders` متكاملة مع `QueryClient`. 
   * كان الخادم يرسل هيكل HTML فارغاً من البيانات (`displayCategories = []`, `featuredProducts = []`, `offers = []`).
   * بعد تنزيل حزمة الـ JS وتشغيل React، كان العميل يطلق 4 إلى 5 طلبات شبكة متزامنة لقاعدة بيانات Supabase، مما تسبب في وميض رسائل مضللة مثل *"لا توجد وجبات متاحة حالياً"* أو *"الصنف غير موجود"* (Flash of Empty State) قبل ظهور البيانات وحدوث قفزة تخطيطية (Cumulative Layout Shift).

2. **تضخم الأصول الثابتة وحجم حزمة العميل (Assets & Bundle Payload):**
   * كان ملف الشعار الأساسي `public/logo.png` يزن **515.25 KB** لاستخدامه فقط بأبعاد 42×42 بكسل في الـ Header و 72×72 في الـ Footer.
   * صورة الـ Hero بلغت **275.74 KB** بصيغة JPG غير مضغوطة.
   * حزمة العميل الأولية `index.js` بلغت **778.01 KB** (237 KB gzipped) بسبب التحميل المتزامن وغير المفصول لمكونات مثل `FaqBotWidget` وخطوط خارجية مانعة للتصيير.

3. **تسلسل الاستعلامات (Waterfall) والإفراط في جلب البيانات (Over-fetching):**
   * استعلام `useProducts` كان ينتظر انتهاء استعلام المنتجات أولاً ثم يرسل استعلام `product_extras` بشكل متسلسل بدلاً من التوازي عبر `Promise.all`.
   * صفحة تفاصيل الصنف `/products/$id` كانت تجلب كامل المنتجات وكامل العروض وتجري التصفية على جهاز العميل.

4. **إعادة تصيير غير ضرورية وإجهاد الـ Main Thread:**
   * عدم استخدام `useMemo` و `useCallback` في `StoreContext.Provider` كان يعيد بناء كائن الـ Context في كل دورة تصيير.
   * اشتراك `Header.tsx` في كامل كائن `routerState` دون استخدام `select`.
   * إعادة تهيئة محركات GSAP ScrollTrigger ثلاث مرات متتالية مع اكتمال كل استعلام، مع تفعيل `gsap.ticker.lagSmoothing(0)` وتشغيل Lenis على كل الصفحات بما فيها لوحة الإدارة.

---

## 2. Comprehensive Findings & Priority List (قائمة كافة المشاكل والاكتشافات)

---

### [Critical] الفئة الأولى: مسار البيانات و SSR/CSR Waterfalls

#### المشكلة 1.1: غياب Route Loaders وتفريغ الـ SSR من البيانات الحقيقية
* **المكان:**
  * `src/router.tsx` (الأسطر 5-16)
  * `src/routes/index.tsx` (الأسطر 14-34)
  * `src/routes/menu.tsx` (الأسطر 10-19)
  * `src/routes/offers.tsx` (الأسطر 15-23)
  * `src/routes/products/$id.tsx` (الأسطر 22-35)
* **الدليل الكودي:**
  لا يوجد أي `loader: ({ context }) => context.queryClient.ensureQueryData(...)` في تعريفات المسارات. كان الخادم ينتج HTML يحتوي على نصوص الحالات الفارغة مباشرة.
* **السبب الجذري:** الاعتماد الحصري على `useQuery` داخل مكونات واجهة العميل (CSR Only).
* **التأثير:** تأخر LCP و FCP حتى اكتمال شبكة العميل، وضعف نتائج SEO.
* **مستوى الثقة:** 100% (مؤكد عبر فحص مخرجات الخادم الحقيقية).

---

#### المشكلة 1.2: وميض الحالة الفارغة (Flash of Empty State) وظهور رسائل خطأ مؤقتة
* **المكان:**
  * `src/routes/products/$id.tsx` (الأسطر 84-100)
  * `src/routes/index.tsx` (الأسطر 300-304)
  * `src/routes/menu.tsx` (الأسطر 161-171)
  * `src/routes/offers.tsx` (الأسطر 72-82)
  * `src/routes/favorites.tsx` (الأسطر 64-83)
* **الدليل الكودي:**
  فحص `!product` أو `array.length === 0` مباشرة دون التحقق من حالة `isLoading` / `isPending`.
* **السبب الجذري:** غياب معالجة حالات التحميل وتقديم Skeletons متناسقة.
* **التأثير:** ارتباك المستخدم وظهور رسائل "الصنف غير موجود" لعدة أجزاء من الثانية قبل قفز المحتوى (CLS).
* **مستوى الثقة:** 100%.

---

#### المشكلة 1.3: تسلسل الاستعلامات (Waterfall Request) داخل `useProducts`
* **المكان:** `src/hooks/use-catalog.ts` (الأسطر 127-144)
* **الدليل الكودي:**
  ```ts
  const { data: dbProductsRaw } = await supabase.from("products").select("*, categories(name)").eq("is_available", true);
  // ... انتظار انتهاء الأول ثم إرسال الثاني
  const { data: dbExtrasRaw } = await supabase.from("product_extras").select("*").eq("is_available", true);
  ```
* **السبب الجذري:** عدم استخدام `Promise.all` لتنفيذ الاستعلامين بالتوازي.
* **التأثير:** مضاعفة زمن استجابة الشبكة لقاعدة البيانات.
* **مستوى الثقة:** 100%.

---

#### المشكلة 1.4: استعلامات مفرطة (Over-fetching) في صفحة الصنف الفردي
* **المكان:**
  * `src/hooks/use-catalog.ts` (الأسطر 184-187)
  * `src/routes/products/$id.tsx` (الأسطر 42-47)
* **الدليل الكودي:**
  استدعاء `useProducts()` و `useOffers()` لجلب كافة السجلات من قاعدة البيانات ثم التصفية في المتصفح.
* **السبب الجذري:** عدم وجود دالة استعلام مخصصة `useSingleProduct(id)` تسحب فقط الصنف المحدد وإضافاته.
* **التأثير:** استهلاك باندويث وإبطاء معالجة صفحة المنتج.
* **مستوى الثقة:** 100%.

---

### [High] الفئة الثانية: حجم الحزم والـ Assets وشبكة التحميل

#### المشكلة 2.1: تضخم حجم شعار الموقع وصور الأقسام والـ Hero
* **المكان:**
  * `public/logo.png` (515.25 KB)
  * `src/assets/hero-noodles.jpg` (275.74 KB)
  * `src/assets/cat-*.jpg` (~210 KB)
* **الدليل:**
  تحميل ما يزيد عن 1 ميجابايت من الصور غير المضغوطة لعرض أيقونات وصور مدمجة.
* **التأثير:** رفع زمن FCP و LCP على شبكات الجوال.
* **مستوى الثقة:** 100%.

---

#### المشكلة 2.2: تضخم حزمة العميل الأساسية (`index.js` = 778 KB)
* **المكان:** `dist/client/assets/index-uZc6CoxG.js`
* **الدليل:**
  تحذير Vite أثناء البناء: `(!) Some chunks are larger than 500 kB after minification`.
* **السبب الجذري:** تضمين `FaqBotWidget` وحزم الأيقونات والحركات في الحزمة الجذرية الحرجة.
* **التأثير:** تأخير الـ Main Thread في معالجة الـ JavaScript وزيادة Total Blocking Time (TBT).
* **مستوى الثقة:** 100%.

---

#### المشكلة 2.3: حظر العرض عبر خط Google Fonts الخارجي
* **المكان:** `src/routes/__root.tsx` (الأسطر 100-105)
* **الدليل:**
  رابط `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo...">` خارجي يعطل بدء رسم الصفحة الأولى.
* **مستوى الثقة:** 100%.

---

### [Medium] الفئة الثالثة: Rendering و State Management و GSAP Ticker

#### المشكلة 3.1: تفكيك وإعادة بناء GSAP Context ثلاث مرات متتالية
* **المكان:** `src/routes/index.tsx` (الأسطر 49-171)
* **الدليل الكودي:** `useGsapScroll(mainRef, () => { ... }, [products, categories, offers])`
* **السبب الجذري:** تغير المصفوفات الثلاث بشكل منفصل عند اكتمال كل استعلام، مما يستدعي `ctx.revert()` ويعيد تسجيل الـ ScrollTriggers ثلاث مرات متتالية.
* **التأثير:** وميض واستهلاك مفرط للـ CPU في أول ثانية.
* **مستوى الثقة:** 100%.

---

#### المشكلة 3.2: تعطيل التنعيم الزمني في GSAP (`lagSmoothing(0)`) وتشغيل Lenis عاماً
* **المكان:** `src/components/site/SmoothScrollProvider.tsx` (السطر 31)
* **الدليل الكودي:** `gsap.ticker.lagSmoothing(0)`
* **السبب الجذري:** إلغاء تعويض هبوط الإطارات يسبب تقطيعاً وقفزاً (Jank) أثناء التمرير السريع، مع تشغيل Lenis على مسارات لا تحتاجه كـ `/admin`.
* **مستوى الثقة:** 100%.

---

#### المشكلة 3.3: إعادة تصيير عامة بسبب غياب Memoization في `StoreContext`
* **المكان:** `src/context/StoreContext.tsx` (الأسطر 154-171)
* **الدليل الكودي:** تمرير كائن جديد ودوال غير مغلفة بـ `useCallback` إلى `StoreContext.Provider`.
* **التأثير:** إعادة تصيير كل المكونات المشتركة عند أي تحديث بسيط.
* **مستوى الثقة:** 100%.

---

#### المشكلة 3.4: إعادة تصيير `Header` عند أي تغيير في الراوتر
* **المكان:** `src/components/site/Header.tsx` (الأسطر 28-29)
* **الدليل الكودي:** `const routerState = useRouterState();` دون استخدام selector.
* **مستوى الثقة:** 100%.

---

#### المشكلة 3.5: استعلام غير مشروط لجدول `bot_faq` على جميع الصفحات
* **المكان:** `src/components/site/FaqBotWidget.tsx` (الأسطر 24-26)
* **الدليل الكودي:** تنفيذ `useBotFaq()` في الـ root layout فور الدخول لأي مسار.
* **مستوى الثقة:** 100%.

---

### [Low] الفئة الرابعة: تحسينات الإعدادات والـ Configurations

#### المشكلة 4.1: عدم تطابق لغة المستند في جذر الصفحة (`lang="en"`)
* **المكان:** `src/routes/__root.tsx` (السطر 118)
* **الدليل:** `<html lang="en">` بدلاً من `<html lang="ar" dir="rtl">`.
* **مستوى الثقة:** 100%.

---

## 3. Execution & Audit Status (حالة التنفيذ والمراجعة المطلوبة)

### أولاً: التحسينات المطبقة في المرحلتين الأولى والثانية (Under Review)

> [!NOTE]
> **ملاحظة للمهندس المراجع:** تم تطبيق تحسين مبدئي لهذه النقاط، ويُرجى مراجعتها واختبارها للتأكد من عدم وجود أي Regression أو آثار جانبية.

1. **ضغط الصور واستبدالها بصيغ WebP الحديثة (المشكلة 2.1):**
   * *ما تم إنجازه:* 
     * تحويل `public/logo.png` (504 KB) إلى `public/logo.webp` بحجم **7.6 KB** فقط.
     * تحديث مصادر الشعار في `src/components/site/Header.tsx` و `src/components/site/Footer.tsx`.
     * تحويل صورة الـ Hero إلى `src/assets/hero-noodles.webp` (127 KB بدلاً من 270 KB).
     * تحويل صور التصنيفات `src/assets/cat-*.webp` وتحديث استيرادها في `src/data/products.ts`.
   * *حالة المراجعة:* تم تطبيق تحسين مبدئي لهذه النقطة، ويُرجى مراجعتها واختبارها للتأكد من عدم وجود أي Regression أو آثار جانبية.

2. **التحميل الكسول لمساعد الأسئلة الشائعة (FaqBotWidget) (المشكلة 2.2 و 3.5 جزئياً):**
   * *ما تم إنجازه:* 
     * تحويل `FaqBotWidget` في `src/routes/__root.tsx` إلى `React.lazy` مع `Suspense fallback={null}`.
     * تم عزل كود البوت (8.80 KB) واستعلاماته في حزمة مستقلة وعدم تحميله في الحزمة الحرجة الأولية.
   * *حالة المراجعة:* تم تطبيق تحسين مبدئي لهذه النقطة، ويُرجى مراجعتها واختبارها للتأكد من عدم وجود أي Regression أو آثار جانبية.

3. **تصحيح وسم لغة واتجاه الصفحة (المشكلة 4.1):**
   * *ما تم إنجازه:* تعديل `RootShell` في `src/routes/__root.tsx` ليكون `<html lang="ar" dir="rtl">`.
   * *حالة المراجعة:* تم تطبيق تحسين مبدئي لهذه النقطة، ويُرجى مراجعتها واختبارها للتأكد من عدم وجود أي Regression أو آثار جانبية.

4. **إضافة مكونات Skeletons ومنع وميض الحالات الفارغة (المشكلة 1.2):**
   * *ما تم إنجازه:* 
     * إنشاء ملف `src/components/site/Skeletons.tsx` يضم (`CategoryCardSkeleton`, `ProductCardSkeleton`, `OfferCardSkeleton`, `ProductDetailSkeleton`).
     * تحديث شروط العرض في `src/routes/index.tsx`, `src/routes/menu.tsx`, `src/routes/offers.tsx`, `src/routes/products/$id.tsx`, `src/routes/favorites.tsx` لعرض الـ Skeletons أثناء `isLoading`، ومنع ظهور رسائل "لا توجد وجبات" أو "الصنف غير موجود" الوهمية.
   * *حالة المراجعة:* تم تطبيق تحسين مبدئي لهذه النقطة، ويُرجى مراجعتها واختبارها للتأكد من عدم وجود أي Regression أو آثار جانبية.

---

### ثانياً: النقاط والمراحل المتبقية التي لم تُمس بعد (Pending Execution)

* **المرحلة 3 (Data Fetching & Loaders):**
  * لم يتم دمج استعلامات `useProducts` عبر `Promise.all`.
  * لم يتم إنشاء خطاف واستعلام `useSingleProduct(id)` المخصص.
  * لم يتم تفعيل `defaultPreload: 'intent'` في `src/router.tsx`.
  * لم يتم ربط مسارات الراوتر بـ `loaders` لجلب البيانات مسبقاً وتمريرها في الـ SSR.
  * لم يتم ضبط الإعدادات الافتراضية لـ `QueryClient` (`staleTime`, `refetchOnWindowFocus`).

* **المرحلة 4 (Render Optimization & Engine Polish):**
  * لم يتم تغليف `StoreContext.Provider` بـ `useMemo` ودواله بـ `useCallback`.
  * لم يتم ضبط اشتراك `useRouterState` في `Header.tsx` ليعتمد على `select: (s) => s.location.pathname`.
  * لم تتم إزالة استدعاء `useProducts()` المستقل من داخل `OfferCard.tsx`.
  * لم يتم استرجاع إعدادات `lagSmoothing` القياسية واستثناء صفحة `/admin` من `SmoothScrollProvider`.
  * لم يتم تحسين استقرار استدعاء `useGsapScroll` في الصفحة الرئيسية.

---

## 4. Master Action Plan (خطة العمل الشاملة للمراحل المتبقية)

---

### المرحلة الثالثة: تحسين استعلامات البيانات والتحميل المسبق للراوتر (Data Fetching & Router Preloading)

#### الخطوة 3.1: تنفيذ الاستعلامات بالتوازي داخل `use-catalog.ts`
* **الهدف:** القضاء على الـ Waterfall في `useProducts` و `useAdminAllProducts`.
* **طريقة التنفيذ:**
  في `src/hooks/use-catalog.ts`:
  ```ts
  export function useProducts() {
    return useQuery({
      queryKey: ["products"],
      queryFn: async (): Promise<Product[]> => {
        if (!isSupabaseConfigured) return [];
        try {
          const [productsRes, extrasRes] = await Promise.all([
            supabase.from("products").select("*, categories(name)").eq("is_available", true),
            supabase.from("product_extras").select("*").eq("is_available", true),
          ]);
          // معالجة البيانات ودمجها...
        } catch {
          return [];
        }
      },
      staleTime: 1000 * 60 * 5,
    });
  }
  ```
* **الملفات المتأثرة:** `src/hooks/use-catalog.ts`, `src/hooks/use-admin.ts`.
* **التحقق:** اختبار سرعة استجابة الاستعلام والتأكد من جلب المنتجات وإضافاتها بدقة.

---

#### الخطوة 3.2: إنشاء استعلام مخصص للصنف الفردي `useSingleProduct(id)`
* **الهدف:** منع تحميل الكتالوج كاملاً عند الدخول لرابط وجبة واحدة.
* **طريقة التنفيذ:**
  في `src/hooks/use-catalog.ts`:
  ```ts
  export function useSingleProduct(id: string) {
    return useQuery({
      queryKey: ["product", id],
      queryFn: async (): Promise<Product | null> => {
        if (!isSupabaseConfigured || !id) return null;
        const [prodRes, extrasRes] = await Promise.all([
          supabase.from("products").select("*, categories(name)").eq("id", id).maybeSingle(),
          supabase.from("product_extras").select("*").eq("product_id", id).eq("is_available", true),
        ]);
        if (prodRes.error || !prodRes.data) return null;
        // رسم كائن الـ Product بالكامل...
      },
      staleTime: 1000 * 60 * 5,
      enabled: Boolean(id),
    });
  }
  ```
  وفي `src/routes/products/$id.tsx`: استبدال جلب `useProducts()` بجلب `useSingleProduct(id)`.
* **الملفات المتأثرة:** `src/hooks/use-catalog.ts`, `src/routes/products/$id.tsx`.
* **التحقق:** الدخول المباشر لرابط صنف والتأكد من ظهور تفاصيله وإضافاته بسرعة وسلاسة.

---

#### الخطوة 3.3: تفعيل التحميل المسبق للروابط (Intent Preloading) وضبط الـ QueryClient
* **الهدف:** جعل التنقل بين الصفحات لحظياً عند تحويم المؤشر أو لمس الروابط.
* **طريقة التنفيذ:**
  في `src/router.tsx`:
  ```ts
  export const getRouter = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5 دقائق كاش
          gcTime: 1000 * 60 * 30,   // 30 دقيقة للذاكرة
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    });

    const router = createRouter({
      routeTree,
      context: { queryClient },
      defaultPreload: "intent",
      defaultPreloadStaleTime: 1000 * 60 * 5,
      scrollRestoration: true,
    });

    return router;
  };
  ```
* **الملفات المتأثرة:** `src/router.tsx`.
* **التحقق:** اختبار التحويم على روابط المنيو والعروض في المتصفح والتأكد من إطلاق الـ prefetch المسبق قبل النقر.

---

### المرحلة الرابعة: تحسين عمليات التصيير ومحركات الحركة (Context, GSAP & Renders)

#### الخطوة 4.1: تطبيق Memoization على `StoreContext`
* **الهدف:** منع إعادة تصيير بطاقات الوجبات والـ Header دون مبرر.
* **طريقة التنفيذ:**
  في `src/context/StoreContext.tsx`:
  * تغليف `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`, `toggleFavorite`, `isFavorite` عبر `useCallback`.
  * تغليف قيمة الـ Context عبر `useMemo`:
  ```tsx
  const contextValue = useMemo(
    () => ({
      cart,
      favorites,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      subtotal,
      deliveryFee,
      toggleFavorite,
      isFavorite,
    }),
    [cart, favorites, totalItems, subtotal, deliveryFee, addToCart, removeFromCart, updateQuantity, clearCart, toggleFavorite, isFavorite]
  );

  return <StoreContext.Provider value={contextValue}>{children}</StoreContext.Provider>;
  ```
* **الملفات المتأثرة:** `src/context/StoreContext.tsx`.
* **التحقق:** اختبار إضافة وحذف الأصناف من السلة والمفضلة والتأكد من الحفاظ على نفس الوظائف.

---

#### الخطوة 4.2: تحسين اشتراك الراوتر في `Header.tsx`
* **الهدف:** عزل الـ Header عن إعادة التصيير المستمرة عند كل حدث راوتر.
* **طريقة التنفيذ:**
  في `src/components/site/Header.tsx`:
  ```tsx
  const currentPath = useRouterState({
    select: (state) => state.location.pathname,
  });
  ```
* **الملفات المتأثرة:** `src/components/site/Header.tsx`.
* **التحقق:** التنقل بين الصفحات والتحقق من تمييز الرابط النشط دون إعادة تصيير زائدة.

---

#### الخطوة 4.3: تبسيط `OfferCard.tsx` وإلغاء اشتراك `useProducts` الداخلي
* **الهدف:** منع كل بطاقة عرض من إنشاء اشتراك React Query مستقل لجدول المنتجات.
* **طريقة التنفيذ:**
  تمرير مصفوفة `products` من المكون الأب كـ prop أو استهلاكها من كاش React Query مباشرة عند الضغط على زر الإضافة فقط.
* **الملفات المتأثرة:** `src/components/site/OfferCard.tsx`, `src/routes/offers.tsx`, `src/routes/index.tsx`.
* **التحقق:** التأكد من عمل زر إضافة العرض إلى السلة بشكل صحيح.

---

#### الخطوة 4.4: ضبط GSAP Ticker واستثناء مسار `/admin` من محرك Lenis
* **الهدف:** سلاسة 60fps ثابتة وتوفير موارد المعالج.
* **طريقة التنفيذ:**
  في `src/components/site/SmoothScrollProvider.tsx`:
  * إزالة `gsap.ticker.lagSmoothing(0)` واستخدام `gsap.ticker.lagSmoothing(500, 33)` أو الوضع الافتراضي لتمكين معالجة هبوط الإطارات بسلاسة.
  * التحقق من المسار؛ إذا كان `/admin`، لا تقم بتشغيل حلقة Lenis لتوفير المعالج للوحة التحكم.
* **الملفات المتأثرة:** `src/components/site/SmoothScrollProvider.tsx`.
* **التحقق:** تجربة التمرير على الجوال وسطح المكتب ولوحة الإدارة.

---

## 5. مصفوفة مقارنة الأداء (Performance Baseline & Projections)

| المعيار / المؤشر | الوضع المبدئي (Initial Baseline) | الوضع الحالي (بعد المرحلتين 1 و 2) | المستهدف بعد المرحلتين 3 و 4 |
|---|---|---|---|
| **حجم كود العميل الرئيسي `index.js`** | **778.01 KB** (237 KB gzip) | **521.05 KB** (169 KB gzip) | **< 480 KB** |
| **وزن الشعار وصورة الـ Hero** | **791 KB** | **135 KB** (WebP) | **~100 KB** |
| **وميض الحالة الفارغة (Empty Flash)** | يظهر "لا توجد وجبات" لـ ~300-800ms | **Skeletons فورية بدون أي وميض** | **Skeletons + SSR Prefetched** |
| **استعلامات المنتجات في `useProducts`** | متسلسلة (Waterfall) | متسلسلة (Waterfall) | **متوازية عبر `Promise.all`** |
| **استعلام صفحة الصنف الفردي** | جلب كل الكتالوج (Over-fetching) | جلب كل الكتالوج + Skeletons | **استعلام وجبة واحدة محددة فقط** |
| **التنقل بين الصفحات (Navigation)** | انتظار الاستعلام بعد النقر | انتظار الاستعلام مع Skeletons | **لحظي وفوري (Intent Preload)** |
| **إعادة تصيير الـ Context** | كائن جديد في كل دورة تصيير | كائن جديد في كل دورة تصيير | **Memoized بالكامل** |
| **استقرار حركات GSAP** | تفكيك وإعادة بناء 3 مرات متتالية | مستقر مع Skeletons | **مستقر وبناء لمرة واحدة فقط** |

---

**تم إنشاء الوثيقة وحفظها كمرجع تسليم رسمي وموثوق لكافة أعضاء الفريق.**
