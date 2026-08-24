-- ==============================================================================
-- INDOMIX RESTAURANT SUPABASE DATABASE SEED DATA
-- SINGLE-ADMIN CLEAN SEED (NO COUPONS / NO REVIEWS / NO ORDERS / NO FAVORITES)
-- ==============================================================================

-- 1. SEED RESTAURANT SETTINGS (Genuinely used settings only)
INSERT INTO public.restaurant_settings (key, value)
VALUES
  ('general', '{"restaurant_name": "إندومكس", "phone": "01015770734", "whatsapp": "201015770734", "is_open": true, "working_hours": "يوميًا من ١١:٠٠ صباحًا حتى ٣:٠٠ فجرًا"}'::jsonb),
  ('delivery', '{"base_fee": 20}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. SEED CATEGORIES
INSERT INTO public.categories (id, name, display_order, image_url, badge_text, is_active)
VALUES
  ('classic', 'إندومي كلاسيك', 1, '/assets/cat-classic.jpg', 'الأكثر طلبًا', true),
  ('cheese', 'إندومي بالجبنة', 2, '/assets/cat-cheese.jpg', 'غرقان جبنة', true),
  ('chicken', 'إندومي بالفراخ', 3, '/assets/cat-chicken.jpg', 'فراخ كريسبي', true),
  ('seafood', 'إندومي سي فود', 4, '/assets/cat-seafood.jpg', 'توم يوم حار', true),
  ('snacks', 'سناكس ومقبلات', 5, '/assets/cat-snacks.jpg', 'مقرمشات جانبية', true),
  ('boxes', 'بوكس العزومة', 6, '/assets/hero-noodles.jpg', 'عروض التوفير', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  image_url = EXCLUDED.image_url,
  badge_text = EXCLUDED.badge_text,
  is_active = EXCLUDED.is_active;

-- 3. SEED PRODUCTS
INSERT INTO public.products (
  id, category_id, name, description, short_description, price, old_price,
  image_url, tag, rating, reviews_count, prep_time, calories,
  spiciness_default, available_spiciness, is_popular, is_available
)
VALUES
  (
    'indomix-classic',
    'classic',
    'إندومكس الأصلي',
    'نودلز إندومي مقلية بالصوص السري الخاص، تعلوها بيضة عين كرسبي وبصل مقلي مقرمش مع خضار سوتيه خفيف.',
    'إندومي مقلي بصوص البراند + بيضة عين وكريسبي أونيون',
    65.00,
    80.00,
    '/assets/cat-classic.jpg',
    'الأكثر طلبًا',
    4.9,
    342,
    '٧ دقائق',
    '480 سعرة',
    'بدون شطة',
    ARRAY['بدون شطة', 'بارد', 'متوسط', 'حار', 'ناري (+5 ج.م)'],
    true,
    true
  ),
  (
    'cheese-melt',
    'cheese',
    'تشيز ميلت إكستريم',
    'غرقانة بصوص الجبنة الشيدر والموتزاريلا الكريمية مع لمسة طماطم سبايسي خفيفة وذرة حلوة مميزة.',
    'طبقتين موتزاريلا سايحة مع صوص الجبن الحار',
    85.00,
    NULL,
    '/assets/cat-cheese.jpg',
    'جديد',
    4.8,
    215,
    '٨ دقائق',
    '620 سعرة',
    'بدون شطة',
    ARRAY['بدون شطة', 'بارد', 'متوسط', 'حار'],
    true,
    true
  ),
  (
    'crispy-mix',
    'chicken',
    'كريسبي تشيكن مكس',
    'قطع صدور دجاج مقرمشة بتتبيلة خاصة فوق نودلز غنية بصوص الباربكيو المدخن والسمسم المحمص.',
    'قطع فراخ مقرمشة فوق إندومي بصوص الباربكيو',
    95.00,
    110.00,
    '/assets/cat-chicken.jpg',
    'وفر ١٥',
    4.9,
    480,
    '١٠ دقائق',
    '690 سعرة',
    'بدون شطة',
    ARRAY['بدون شطة', 'بارد', 'متوسط', 'حار', 'ناري'],
    true,
    true
  ),
  (
    'seafood-spicy',
    'seafood',
    'سي فود توم يوم سبايسي',
    'جمبري طازة مع حلقات كاليماري في مرقة التوم يوم التايلاندية المنعشة بشطة الشيلي وعصير الليمون والكزبرة.',
    'جمبري وكاليماري مع شطة الشيلي والليمون',
    125.00,
    NULL,
    '/assets/cat-seafood.jpg',
    'حار جدًا',
    4.7,
    189,
    '٩ دقائق',
    '510 سعرة',
    'بدون شطة',
    ARRAY['بدون شطة', 'بارد', 'متوسط', 'حار', 'حار جدًا', 'شطة بركانية'],
    true,
    true
  ),
  (
    'dynamite-chicken-bowl',
    'chicken',
    'داينامايت تشيكن بول',
    'نودلز إندومي متبلة وممزوجة بصوص الداينامايت الحار والغني، مع بايتس فراخ كرانشي وبصل أخضر وسمسم.',
    'بايتس فراخ مع صوص الداينامايت الناري',
    90.00,
    105.00,
    '/assets/cat-chicken.jpg',
    'الأعلى تقييمًا',
    5.0,
    310,
    '٧ دقائق',
    '580 سعرة',
    'بدون شطة',
    ARRAY['بدون شطة', 'بارد', 'متوسط', 'حار', 'ناري'],
    false,
    true
  ),
  (
    'cheesy-shrimp-pasta',
    'seafood',
    'تشيزي سي فود ديلايت',
    'ميكس فاخر يجمع بين جمبري البحر وصوص الجبنة الكريمي الأبيض مع الأعشاب الإيطالية والثوم الشهي.',
    'جمبري طازج مع وايت صوص وجبن سايح',
    135.00,
    150.00,
    '/assets/cat-seafood.jpg',
    'فاخر',
    4.9,
    154,
    '١٠ دقائق',
    '640 سعرة',
    'بدون شطة',
    ARRAY['بدون شطة', 'بارد', 'متوسط', 'حار'],
    false,
    true
  ),
  (
    'mozzarella-sticks-snack',
    'snacks',
    'موتزاريلا ستيكس كرانشي',
    'أصابع جبنة موتزاريلا ذهبية ومقرمشة تقدم مع صوص المارينارا الخاص وصوص الشيلي اللذيذ.',
    '٤ أصابع جبنة موتزاريلا مع صوص تغميس',
    50.00,
    60.00,
    '/assets/cat-snacks.jpg',
    'مقبلات',
    4.8,
    230,
    '٥ دقائق',
    '390 سعرة',
    'بدون شطة',
    ARRAY['بدون شطة', 'سبايسي خفيف'],
    false,
    true
  ),
  (
    'hero-family-box',
    'boxes',
    'بوكس اللمة والعزومة',
    '٤ أطباق إندومي من اختيارك + ٢ سناكس مقرمش + ٤ صوصات تغميس مميزة + لتر بيبسي بارد.',
    '٤ أطباق متنوعة + ٢ سناكس + مشروب عائلي',
    299.00,
    360.00,
    '/assets/hero-noodles.jpg',
    'وفر ٦٠ ج.م',
    5.0,
    420,
    '١٥ دقيقة',
    'عائلي',
    'بدون شطة',
    ARRAY['بدون شطة', 'بارد', 'متوسط', 'حار', 'تشكيلة مخصصة'],
    false,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  price = EXCLUDED.price,
  old_price = EXCLUDED.old_price,
  image_url = EXCLUDED.image_url,
  tag = EXCLUDED.tag,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  prep_time = EXCLUDED.prep_time,
  calories = EXCLUDED.calories,
  spiciness_default = EXCLUDED.spiciness_default,
  available_spiciness = EXCLUDED.available_spiciness,
  is_popular = EXCLUDED.is_popular,
  is_available = EXCLUDED.is_available;

-- 4. SEED PRODUCT EXTRAS
INSERT INTO public.product_extras (product_id, name, price, is_available)
VALUES
  ('indomix-classic', 'بيضة مقلية إضافية', 12.00, true),
  ('indomix-classic', 'جبنة موتزاريلا سايحة', 20.00, true),
  ('indomix-classic', 'بصل مقرمش إضافي', 8.00, true),
  ('indomix-classic', 'دبل صوص أصلي', 10.00, true),
  ('cheese-melt', 'كوب صوص جبنة جانبي', 25.00, true),
  ('cheese-melt', 'هالبينو مقطع', 10.00, true),
  ('cheese-melt', 'بيكون بقري مدخن', 25.00, true),
  ('crispy-mix', 'دبل قطع فراخ كريسبي', 35.00, true),
  ('crispy-mix', 'صوص باربكيو مدخن إضافي', 10.00, true),
  ('crispy-mix', 'صوص رانش بيتي', 12.00, true),
  ('seafood-spicy', '٣ حبات جمبري زيادة', 40.00, true),
  ('seafood-spicy', 'كاليماري مقرمش جانبي', 35.00, true),
  ('seafood-spicy', 'صوص شيلي ليمون إضافي', 10.00, true),
  ('dynamite-chicken-bowl', 'صوص داينامايت إضافي', 12.00, true),
  ('dynamite-chicken-bowl', 'بطاطس ويدجز مقرمشة', 25.00, true),
  ('cheesy-shrimp-pasta', 'رشة جبنة بارميزان', 18.00, true),
  ('cheesy-shrimp-pasta', 'خبز بالثوم والزبدة (قطعتين)', 20.00, true),
  ('mozzarella-sticks-snack', 'صوص مارينارا إضافي', 8.00, true),
  ('mozzarella-sticks-snack', 'صوص سويت شيلي', 8.00, true),
  ('hero-family-box', 'إضافة طبق خامس بنصف السعر', 45.00, true),
  ('hero-family-box', 'حلقات بصل كريسبي', 25.00, true);

-- 5. SEED OFFERS
INSERT INTO public.offers (
  id, title, tag, discount_badge, description, items, price, old_price,
  image_url, associated_product_id, valid_until, is_active
)
VALUES
  (
    'family-gathering-deal',
    'بوكس اللمة والعزومة الكبيرة',
    'العرض الأقوى',
    'وفر ٦٠ ج.م',
    '٤ أطباق إندومي متنوعة حسب اختيارك + ٢ طبق موتزاريلا ستيكس + لتر بيبسي + ٤ صوصات مجانية.',
    ARRAY['٤ أطباق إندومي من اختيارك', '٢ طبق مقبلات موتزاريلا ستيكس', 'لتر بيبسي مثلج', '٤ علب صوص خاصة'],
    299.00,
    360.00,
    '/assets/hero-noodles.jpg',
    'hero-family-box',
    'عرض ساري هذا الأسبوع',
    true
  ),
  (
    'duo-crispy-deal',
    'عرض الدبل كريسبي تشيكن',
    'توفير الشباب',
    'وفر ٤٥ ج.م',
    '٢ طبق كريسبي تشيكن مكس كبير + صوص باربكيو مدخن إضافي + صوص رانش بيتي مجاناً.',
    ARRAY['٢ طبق كريسبي تشيكن مكس', 'صوص باربكيو مدخن إضافي', 'صوص رانش بيتي مجاني'],
    165.00,
    210.00,
    '/assets/cat-chicken.jpg',
    'crispy-mix',
    'عرض محدود',
    true
  ),
  (
    'cheese-lovers-pack',
    'عرض عشاق الجبنة (تشيز لافرز)',
    'الأكثر مبيعاً',
    'وفر ٣٥ ج.م',
    'طبق تشيز ميلت إكستريم غرقان جبنة + موتزاريلا ستيكس مقرمشة + كوب صوص جبنة شيدر إضافي.',
    ARRAY['طبق تشيز ميلت إكستريم', 'طبق موتزاريلا ستيكس مقرمشة', 'كوب صوص شيدر جانبي مجاناً'],
    125.00,
    160.00,
    '/assets/cat-cheese.jpg',
    'cheese-melt',
    'عرض ساري اليوم',
    true
  ),
  (
    'original-combo-deal',
    'كومبو إندومكس الأصلي المزدوج',
    'عرض الغداء السريع',
    'وفر ٣٠ ج.م',
    '٢ طبق إندومكس الأصلي ببيض العين والبصل المقرمش + ٢ كانز مشروب غازي مثلج.',
    ARRAY['٢ طبق إندومكس الأصلي بالبيض المقرمش', '٢ كانز بيبسي مثلج', 'دبل صوص أصلي مجاناً'],
    130.00,
    160.00,
    '/assets/cat-classic.jpg',
    'indomix-classic',
    'يومياً من ١٢ إلى ٦ مساءً',
    true
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  tag = EXCLUDED.tag,
  discount_badge = EXCLUDED.discount_badge,
  description = EXCLUDED.description,
  items = EXCLUDED.items,
  price = EXCLUDED.price,
  old_price = EXCLUDED.old_price,
  image_url = EXCLUDED.image_url,
  associated_product_id = EXCLUDED.associated_product_id,
  valid_until = EXCLUDED.valid_until,
  is_active = EXCLUDED.is_active;
