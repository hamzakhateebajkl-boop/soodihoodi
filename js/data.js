/* =========================================================
   SoodiHoodi — catalogue data
   ---------------------------------------------------------
   This is the ONLY file you edit to change products, prices,
   or colourways. See README.md for how `sallaId` gets filled
   in once the Salla store exists.
   ========================================================= */

/* ---------------------------------------------------------
   SALLA CONNECTION
   Fill these in after the Salla store is created.
   `domain` is your store address, e.g. "soodihoodi.salla.sa"
   --------------------------------------------------------- */
const SALLA = {
  domain: "",            // e.g. "soodihoodi.salla.sa"  ← leave "" to run in demo mode
  currency: "SAR",
  freeShipping: 800,     // SAR — free shipping threshold
  instalments: 4,        // Tabby / Tamara split

  /* VAT registration in KSA is only mandatory above SAR 375,000 of annual
     taxable turnover (voluntary from SAR 187,500). A brand-new store is
     normally NOT registered — so this stays false until you actually are.
     Flipping it to true shows the "prices include 15% VAT" line. */
  vatRegistered: false,
  vatRate: 15,

  /* WhatsApp order fallback. International format, digits only (e.g. Omani
     number "96891234567" or Saudi "9665xxxxxxxx"). Used in two situations:
     1. BEFORE the Salla store exists → every checkout goes to WhatsApp.
     2. AFTER Salla is live → multi-item carts go to WhatsApp, because
        Salla Instant Purchase links carry exactly one product each.
     Leave "" to disable (checkout then stays in demo mode until Salla). */
  whatsapp: "96877083190"
};

/* ---------------------------------------------------------
   SHOPIFY CHECKOUT (headless)
   The site stays the storefront; Shopify runs cart + payment.
   Checkout builds a cart permalink:
     https://<domain>/cart/<variantId>:<qty>,...
   Keys are "<productId>-<editionId>-<sizeId>". Set domain ""
   to disable (falls back to WhatsApp).
   --------------------------------------------------------- */
const SHOPIFY = {
  /* DORMANT until the store has a live payment method (gateway or COD
     via a KSA fulfilment partner). Until then checkout goes to WhatsApp.
     To activate: set domain to "yk3hk2-pu.myshopify.com". */
  domain: "",
  variants: {
    "classic-zaeem-adult": "53971290620269", "classic-zaeem-kids": "53971290653037", "classic-zaeem-baby": "67757252477293",
    "classic-ameed-adult": "53971290685805", "classic-ameed-kids": "53971290718573", "classic-ameed-baby": "67757252510061",
    "classic-raqi-adult":  "53971290751341", "classic-raqi-kids":  "53971290784109", "classic-raqi-baby":  "67757252542829",
    "classic-faris-adult": "53971290816877", "classic-faris-kids": "53971290849645", "classic-faris-baby": "67757252575597",
    "classic-laith-adult": "53971290882413", "classic-laith-kids": "53971290915181", "classic-laith-baby": "67757252608365"
  }
};

/* ---------------------------------------------------------
   FIRST-VISIT OFFER

   `endpoint` takes a form-handler URL that accepts a POST — Formspree,
   Getform, Basin, or a Google Form. Two minutes to set up, and it is the
   only thing standing between this popup and a real mailing list.

   Until it is set, a submission falls back to opening WhatsApp with the
   name and email prefilled, exactly as checkout already does — so a lead
   is never silently lost. Set `endpoint` and the fallback stops.
   --------------------------------------------------------- */
/* ---------------------------------------------------------
   LAUNCH
   Orders open on 11.11 at midnight Saudi time. Until then the site is
   public for browsing, the family builder and the 15% sign-up, but
   checkout is locked and the cart is kept for the customer. Every element
   with class "pl" (pre-launch) is removed automatically after this moment.
   --------------------------------------------------------- */
const LAUNCH = { opensAt: "2026-11-11T00:00:00+03:00" };

const OFFER = {
  enabled: true,
  pct: 15,
  delayMs: 8000,       // let them see the hero first
  code: "SOODI15",
  img: "img/offer-family.webp",  // the whole family, every edition, from the ad campaign     // Shopify discount: 15% off, one use per customer; shown right after sign-up
  /* Sign-ups go to the chat Worker, which forwards them to the team's
     Telegram and keeps them in Workers KV for later export. */
  endpoint: "https://soodihoodi-chat.hamzakhateebajkl.workers.dev/lead",
  storageKey: "sh_offer_v1"
};

/* The edition every first-time visitor lands on. Named rather than taken
   from EDITIONS[0], so reordering the list can never silently change the
   first impression. Returning visitors keep their own last choice. */
const DEFAULT_EDITION = "zaeem"; // زعيم الدفا

/* ---------------------------------------------------------
   EDITIONS
   Colour-inspired only. No club names, crests, or marks.
   --------------------------------------------------------- */
const EDITIONS = [
  {
    id: "zaeem",
    img: "img/zaeem.jpg",
    card: "img/ed/zaeem.webp", // 4:5 lookbook shot for the editions rail
    /* product-card shots: same three models, garment re-coloured per edition */
    shots: {
      adult: "img/shot-zaeem-adult.jpg",
      kids:  "img/shot-zaeem-kids.jpg",
      baby:  "img/shot-zaeem-baby.jpg"
    },
    /* ~6 KB square crops of the same shots, for the bundle builder's
       per-person picker — parents pick a design by seeing it, not by
       decoding a colour chip. */
    thumbs: {
      adult: "img/thumb/shot-zaeem-adult.webp",
      kids:  "img/thumb/shot-zaeem-kids.webp",
      baby:  "img/thumb/shot-zaeem-baby.webp"
    },
    fam: "img/fam-zaeem.jpg",
    cut: "img/cut/fam-zaeem.webp",
    scale: "img/scale-zaeem.jpg",
    life: "img/stadium-zaeem.jpg",
    sky: "#8FC9FF", // light backdrop wash behind the hero family // hero cutout — people only, transparent bg // family gallery shot — section hides for editions without one
    ink: "#0B4EA2",   // text-safe dark variant — NEVER use primary for text on white
    ar: "زعيم الدفا",
    en: "Za'eem Al-Dafa",
    tagAr: "أزرق ملكي وأبيض ناصع",
    tagEn: "Royal blue, clean white",
    primary: "#0B4EA2",
    secondary: "#FFFFFF",
    accent:  "#7FB6FF",
    glow:    "#1C6FD8"
  },
  {
    id: "ameed",
    fam: "img/fam-ameed.jpg",
    cut: "img/cut/fam-ameed.webp",
    scale: "img/scale-ameed.jpg",
    life: "img/stadium-ameed.jpg",
    sky: "#FFD98A", // light backdrop wash behind the hero family // hero cutout — people only, transparent bg
    fg: "#14161A",
    img: "img/ameed.jpg",
    card: "img/ed/ameed.webp", // 4:5 lookbook shot for the editions rail
    /* product-card shots: same three models, garment re-coloured per edition */
    shots: {
      adult: "img/shot-ameed-adult.jpg",
      kids:  "img/shot-ameed-kids.jpg",
      baby:  "img/shot-ameed-baby.jpg"
    },
    /* ~6 KB square crops of the same shots, for the bundle builder's
       per-person picker — parents pick a design by seeing it, not by
       decoding a colour chip. */
    thumbs: {
      adult: "img/thumb/shot-ameed-adult.webp",
      kids:  "img/thumb/shot-ameed-kids.webp",
      baby:  "img/thumb/shot-ameed-baby.webp"
    },
    ink: "#7A5C00",   // text-safe dark variant — NEVER use primary for text on white
    ar: "عميد المدرجات",
    en: "Ameed Al-Mudarrajat",
    tagAr: "أصفر ملكي على أسود",
    tagEn: "Royal yellow on black",
    primary: "#F2C020",
    secondary: "#0B0B0C",
    accent:  "#FFDE73",
    glow:    "#D9A400"
  },
  {
    id: "raqi",
    fam: "img/fam-raqi.jpg",
    cut: "img/cut/fam-raqi.webp",
    scale: "img/scale-raqi.jpg",
    life: "img/stadium-raqi.jpg",
    sky: "#9ADFB8", // light backdrop wash behind the hero family // hero cutout — people only, transparent bg
    img: "img/raqi.jpg",
    card: "img/ed/raqi.webp", // 4:5 lookbook shot for the editions rail
    /* product-card shots: same three models, garment re-coloured per edition */
    shots: {
      adult: "img/shot-raqi-adult.jpg",
      kids:  "img/shot-raqi-kids.jpg",
      baby:  "img/shot-raqi-baby.jpg"
    },
    /* ~6 KB square crops of the same shots, for the bundle builder's
       per-person picker — parents pick a design by seeing it, not by
       decoding a colour chip. */
    thumbs: {
      adult: "img/thumb/shot-raqi-adult.webp",
      kids:  "img/thumb/shot-raqi-kids.webp",
      baby:  "img/thumb/shot-raqi-baby.webp"
    },
    ink: "#046A38",   // text-safe dark variant — NEVER use primary for text on white
    ar: "راقي السهرة",
    en: "Raqi Al-Sahra",
    tagAr: "أخضر ملكي بخطوط بيضاء",
    tagEn: "Regal green, fine white lines",
    primary: "#046A38",
    secondary: "#FFFFFF",
    accent:  "#6FD9A4",
    glow:    "#089B54"
  },
  {
    id: "faris",
    fam: "img/fam-faris.jpg",
    cut: "img/cut/fam-faris.webp",
    scale: "img/scale-faris.jpg",
    life: "img/stadium-faris.jpg",
    sky: "#FFE08A", // light backdrop wash behind the hero family // hero cutout — people only, transparent bg
    fg: "#14161A",
    img: "img/faris.jpg",
    card: "img/ed/faris.webp", // 4:5 lookbook shot for the editions rail
    /* product-card shots: same three models, garment re-coloured per edition */
    shots: {
      adult: "img/shot-faris-adult.jpg",
      kids:  "img/shot-faris-kids.jpg",
      baby:  "img/shot-faris-baby.jpg"
    },
    /* ~6 KB square crops of the same shots, for the bundle builder's
       per-person picker — parents pick a design by seeing it, not by
       decoding a colour chip. */
    thumbs: {
      adult: "img/thumb/shot-faris-adult.webp",
      kids:  "img/thumb/shot-faris-kids.webp",
      baby:  "img/thumb/shot-faris-baby.webp"
    },
    ink: "#1C3F94",
    ar: "فارس الليل",
    en: "Faris Al-Layl",
    tagAr: "أصفر وأزرق ملكي",
    tagEn: "Yellow and royal blue",
    primary: "#FFD400",
    secondary: "#1C3F94",
    accent:  "#FFE873",
    glow:    "#C9A500"
  },
  {
    id: "laith",
    fam: "img/fam-laith.jpg",
    cut: "img/cut/fam-laith.webp",
    scale: "img/scale-laith.jpg",
    life: "img/stadium-laith.jpg",
    sky: "#E8DCC8", // light backdrop wash behind the hero family // hero cutout — people only, transparent bg
    fg: "#14161A",
    img: "img/laith.jpg",
    card: "img/ed/laith.webp", // 4:5 lookbook shot for the editions rail
    /* product-card shots: same three models, garment re-coloured per edition */
    shots: {
      adult: "img/shot-laith-adult.jpg",
      kids:  "img/shot-laith-kids.jpg",
      baby:  "img/shot-laith-baby.jpg"
    },
    /* ~6 KB square crops of the same shots, for the bundle builder's
       per-person picker — parents pick a design by seeing it, not by
       decoding a colour chip. */
    thumbs: {
      adult: "img/thumb/shot-laith-adult.webp",
      kids:  "img/thumb/shot-laith-kids.webp",
      baby:  "img/thumb/shot-laith-baby.webp"
    },
    ink: "#1A1A1A",
    ar: "ليث الشتا",
    en: "Laith Al-Shita",
    tagAr: "أبيض بخطوط سوداء",
    tagEn: "White with black lines",
    primary: "#ECECEC",
    secondary: "#101114",
    accent:  "#F5F5F5",
    glow:    "#6B6E76"
  }
,
  /* ---------------------------------------------------------
     COMING SOON — a single unnamed placeholder.

     Deliberately blank: plain white, no colourway, no club reference, no
     edition name. It says only "New / Soon", which promises more is coming
     without committing to which team or when.

     `comingSoon` dims it, blocks selection and fires the "we'll tell you
     when it drops" toast; swipe and the editions rail filter it out. Give
     it a real name, colours, shots/thumbs/card and drop the flag to ship it.
     --------------------------------------------------------- */
  {
    id: "soon",
    comingSoon: true,
    img: "img/soon.jpg",
    sky: "#F0F1F3",
    fg: "#14161A",
    ink: "#4A5058",
    ar: "جديد",
    en: "New",
    tagAr: "إصدار جديد قريباً",
    tagEn: "A new edition, soon",
    primary: "#B9BEC7",
    secondary: "#FFFFFF",
    accent:  "#DDE1E6",
    glow:    "#8A9099"
  }
];

/* ---------------------------------------------------------
   SIZES
   --------------------------------------------------------- */
/* Parents shop by age, not by our category names, so the age band is the
   headline on every size control and the category name is the subtitle.

   Sizes follow the factory's own garments (October 2026), not our earlier
   spec: lengths 64, 84 and 95 cm. The fit bands come from the factory's
   size chart, which shows real wearers: 64 cm on a 96 cm three-year-old
   falls to the ankle; 84 cm on a 150 cm fifteen-year-old lands at the knee;
   95 cm on a 175 cm adult lands just above it. A hem reaches the knee at
   roughly 55% of the wearer's height, so each size covers the knee up to
   about 120 / 155 / 175 cm.

   The ids stay baby / kids / adult because the Shopify variant mapping and
   the photo file names use them; only the labels changed:
     baby  -> Kids     (64 cm)
     kids  -> Juniors  (84 cm)
     adult -> Adults   (95 cm)
   Widths are still to come from the factory's spec sheet. */
const SIZES = {
  baby:  { ar: "أطفال",  en: "Kids",    ageAr: "2–6 سنوات",    ageEn: "Ages 2–6",  lengthCm: 64 },
  kids:  { ar: "ناشئين", en: "Juniors", ageAr: "7–14 سنة",     ageEn: "Ages 7–14", lengthCm: 84 },
  adult: { ar: "كبار",   en: "Adults",  ageAr: "15 سنة فأكثر", ageEn: "Ages 15+",  lengthCm: 95 }
};

/* ---------------------------------------------------------
   FAMILY BUNDLE
   The whole point is getting one household to buy two or three.

   Tiered, not flat: every extra person visibly raises the discount, which
   is the only reason a "family bundle" persuades anyone. Highest matching
   tier wins. Change the percentages to whatever your margin supports —
   at 20% off a 4-person set still clears roughly 50% gross.
   --------------------------------------------------------- */
const BUNDLE = {
  tiers: [
    { min: 4, pct: 20 },
    { min: 3, pct: 15 },
    { min: 2, pct: 10 }
  ]
};

/* ---------------------------------------------------------
   PACKS — one-tap starting points for the bundle builder.

   These are NOT fixed SKUs. Two adults plus one kid, with five editions to
   choose from per person, would be 125 variants — and the whole point is
   that a household supporting two different clubs can still buy together.
   So a pack just pre-fills the builder with a row per person; the shopper
   then picks the edition for each row independently.
   --------------------------------------------------------- */
/* `mix` is the edition shown — and loaded — for each slot. They are
   deliberately DIFFERENT teams: the pack card is the one place on the page
   that has to teach, at a glance and without copy, that a household split
   between clubs can still order together. The builder then lets any row
   change, and "match all" collapses the set to one team in a tap. */
const PACKS = [
  { id: "trio-kid",   ar: "عائلة + ناشئ",      en: "Family + junior",
    slots: ["adult", "adult", "kids"],
    mix:   ["zaeem", "ameed", "raqi"] },
  { id: "trio-baby",  ar: "عائلة + طفل",       en: "Family + kid",
    slots: ["adult", "adult", "baby"],
    mix:   ["raqi", "faris", "zaeem"] },
  { id: "quad-kids",  ar: "عائلة + 2 ناشئين",  en: "Family + 2 juniors",
    slots: ["adult", "adult", "kids", "kids"],
    mix:   ["zaeem", "laith", "ameed", "faris"] },
  { id: "quad-mixed", ar: "عائلة + ناشئ وطفل", en: "Family + junior & kid",
    slots: ["adult", "adult", "kids", "baby"],
    mix:   ["ameed", "zaeem", "raqi", "laith"] },
  { id: "siblings",   ar: "طقم الإخوان",       en: "Siblings kit",
    slots: ["kids", "baby"],
    mix:   ["faris", "raqi"] }
];

/* ---------------------------------------------------------
   PRODUCTS

   `sallaId`     → numeric product id from the Salla dashboard.
   `instantUrl`  → Salla "Instant Purchase" link (رابط الشراء المباشر).
                   Dashboard → Products → ⋯ → Instant Purchase.
                   Requires a paid plan + guest checkout enabled.
                   This is the only public way to send a shopper from an
                   external site straight into Salla's checkout.

   Leave both null to stay in demo mode.
   --------------------------------------------------------- */
const PRODUCTS = [
  {
    id: "classic",
    sallaId: null,
    instantUrl: null,
    ar: "الهودي البطانية الكلاسيكي",
    en: "The Classic Blanket Hoodie",
    descAr: "طبقتين، مقاس واسع، وجيب كنغر كبير. نقطة البداية الصح.",
    descEn: "Two layers, oversized cut, big kangaroo pocket. The right place to start.",
    sizes: ["adult", "kids", "baby"],
    /* Nothing below 200 SAR. Unit cost is ~100–120, but the ladder between
       sizes deliberately does NOT track fabric cost — a matching family set
       is the product, and a 149 price tag makes the whole line read cheap. */
    prices:    { adult: 299, kids: 259, baby: 229 },
    compareAt: { adult: 359, kids: 309, baby: 279 },
    badgeAr: "الأكثر مبيعاً",
    badgeEn: "Best seller"
  }
];
/* "terrace" (إصدار المدرجات / The Terrace Edition — 450 gsm, longer
   sleeves, lined phone pocket) removed 2026-09-16: no physical product
   yet. Re-add here when it actually exists. */

/* ---------------------------------------------------------
   UI STRINGS used by JS-rendered markup
   --------------------------------------------------------- */
const T = {
  addToCart:   { ar: "أضف إلى السلة",        en: "Add to cart" },
  opensSoon:   { ar: "الطلب يفتح 11.11",     en: "Orders open 11.11" },
  checkoutBtn: { ar: "إتمام الطلب",          en: "Checkout" },
  chooseSize:  { ar: "اختر المقاس",           en: "Choose a size" },
  added:       { ar: "تمّت الإضافة إلى السلة", en: "Added to your cart" },
  removed:     { ar: "تم الحذف",              en: "Removed" },
  emptyCart:   { ar: "سلّتك فاضية",           en: "Your cart is empty" },
  emptyHint:   { ar: "اختر إصدارك وابدأ",     en: "Pick an edition to start" },
  remove:      { ar: "حذف",                   en: "Remove" },
  splitPay:    { ar: "أو 4 دفعات بـ",         en: "or 4 payments of" },
  freeLeft:    { ar: "باقي لك",               en: "You're" },
  freeLeft2:   { ar: "للشحن المجاني",         en: "away from free shipping" },
  freeGot:     { ar: "مبروك — شحنك مجاني ✓",  en: "Nice — you've got free shipping ✓" },
  pickEdition: { ar: "اختر هذا الإصدار",      en: "Choose this edition" },
  sar:         { ar: "ر.س",                   en: "SAR" },
  from:        { ar: "يبدأ من",                en: "From" },
  edSwitched:  { ar: "تم اختيار",             en: "Switched to" },
  soonBadge:   { ar: "قريباً",                 en: "Soon" },
  soonMsg:     { ar: "هذا الإصدار قريباً — تابعنا وبنعلمك أول ما ينزل",
                 en: "This edition is coming soon — follow us and we'll tell you the moment it drops" },
  /* {pct} is filled from the live BUNDLE tier, so the copy can never drift
     out of sync with the actual discount the cart is applying. */
  bundleAdd1:  { ar: "أضف قطعة وحدة ووفّر {pct}٪ على الطلب",
                 en: "Add 1 more and save {pct}% on your order" },
  bundleAdd2:  { ar: "أضف قطعتين ووفّر {pct}٪ على الطلب",
                 en: "Add 2 and save {pct}% on your order" },
  bundleOn:    { ar: "خصم العائلة {pct}٪ مفعّل ✓", en: "Family discount {pct}% applied ✓" },
  saved:       { ar: "وفّرت",                    en: "You saved" },
  total:       { ar: "المجموع",                  en: "Total" },
  chooseEd:    { ar: "اختر الإصدار",             en: "Choose an edition" },
  changeTeam:  { ar: "غيّر فريقك",               en: "Change your team" },
  offerThanks: { ar: "تمام! بنرسل لك الكود على الإيميل.",
                 en: "Done — we'll email you the code." },
  offerCopied: { ar: "تم نسخ الكود ✓",          en: "Code copied ✓" },
  offerWa:     { ar: "خصم {pct}% — الاسم: {name} — الإيميل: {mail}",
                 en: "{pct}% off — Name: {name} — Email: {mail}" },
  bldEmpty:    { ar: "ابدأ بطقم جاهز فوق، أو أضف أول واحد من الأزرار تحت.",
                 en: "Start from a ready pack above, or add your first person below." },
  bldAddAll:   { ar: "أضف {n} قطع إلى السلة",    en: "Add all {n} to cart" },
  bldMatch:    { ar: "خلّهم كلهم {ed}",          en: "Match all to {ed}" },
  bldMixed:    { ar: "كل واحد وفريقه",           en: "Everyone picks their own" },
  packSave:    { ar: "وفّر {pct}٪",              en: "Save {pct}%" },
  bldAdded:    { ar: "تمّت إضافة {n} قطع",       en: "Added {n} items" },
  subtotal:    { ar: "قبل الخصم",                en: "Before discount" },
  waIntro:     { ar: "السلام عليكم، أبغى أطلب من SoodiHoodi:",
                 en: "Hi! I'd like to order from SoodiHoodi:" },
  waTotal:     { ar: "الإجمالي",                 en: "Total" },
  waBundle:    { ar: "بعد خصم العائلة 15٪",      en: "after 15% family discount" },
  waSent:      { ar: "فتحنا لك واتساب لإكمال الطلب 🟢", en: "Opening WhatsApp to complete your order 🟢" },
  demoNote:    {
    ar: "وضع تجريبي: لم يتم ربط متجر سلة بعد. راجع ملف README.md لخطوات الربط.",
    en: "Demo mode: no Salla store connected yet. See README.md for the wiring steps."
  }
};
