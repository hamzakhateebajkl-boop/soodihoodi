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
  freeShipping: 300,     // SAR — free shipping threshold
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
    "classic-najd-adult": "53971290620269",  "classic-najd-kids": "53971290653037",
    "classic-hijaz-adult": "53971290685805", "classic-hijaz-kids": "53971290718573",
    "classic-watan-adult": "53971290751341", "classic-watan-kids": "53971290784109",
    "classic-nassr-adult": "53971290816877", "classic-nassr-kids": "53971290849645",
    "classic-shabab-adult": "53971290882413","classic-shabab-kids": "53971290915181",
    /* TODO: the five "classic-<edition>-baby" variants don't exist in Shopify
       yet — create them there and paste the ids here before going live.
       Until then checkout falls back to WhatsApp for any baby line. */
    "terrace-najd-adult": "53971294650733",  "terrace-najd-kids": "53971294683501",
    "terrace-hijaz-adult": "53971294716269", "terrace-hijaz-kids": "53971294749037",
    "terrace-watan-adult": "53971294781805", "terrace-watan-kids": "53971294814573",
    "terrace-nassr-adult": "53971294847341", "terrace-nassr-kids": "53971294880109",
    "terrace-shabab-adult": "53971294912877","terrace-shabab-kids": "53971294945645"
  }
};

/* ---------------------------------------------------------
   EDITIONS
   Colour-inspired only. No club names, crests, or marks.
   --------------------------------------------------------- */
const EDITIONS = [
  {
    id: "najd",
    img: "img/najd.jpg",
    /* product-card shots: same three models, garment re-coloured per edition */
    shots: {
      adult: "img/shot-najd-adult.jpg",
      kids:  "img/shot-najd-kids.jpg",
      baby:  "img/shot-najd-baby.jpg"
    },
    fam: "img/fam-najd.jpg",
    cut: "img/cut/fam-najd.webp",
    scale: "img/scale-najd.jpg",
    life: "img/stadium-najd.jpg",
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
    id: "hijaz",
    fam: "img/fam-hijaz.jpg",
    cut: "img/cut/fam-hijaz.webp",
    scale: "img/scale-hijaz.jpg",
    life: "img/stadium-hijaz.jpg",
    sky: "#FFD98A", // light backdrop wash behind the hero family // hero cutout — people only, transparent bg
    fg: "#14161A",
    img: "img/hijaz.jpg",
    /* product-card shots: same three models, garment re-coloured per edition */
    shots: {
      adult: "img/shot-hijaz-adult.jpg",
      kids:  "img/shot-hijaz-kids.jpg",
      baby:  "img/shot-hijaz-baby.jpg"
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
    id: "watan",
    fam: "img/fam-watan.jpg",
    cut: "img/cut/fam-watan.webp",
    scale: "img/scale-watan.jpg",
    life: "img/stadium-watan.jpg",
    sky: "#9ADFB8", // light backdrop wash behind the hero family // hero cutout — people only, transparent bg
    img: "img/watan.jpg",
    /* product-card shots: same three models, garment re-coloured per edition */
    shots: {
      adult: "img/shot-watan-adult.jpg",
      kids:  "img/shot-watan-kids.jpg",
      baby:  "img/shot-watan-baby.jpg"
    },
    ink: "#046A38",   // text-safe dark variant — NEVER use primary for text on white
    ar: "راقي الدفا",
    en: "Raqi Al-Dafa",
    tagAr: "أخضر ملكي بخطوط بيضاء",
    tagEn: "Regal green, fine white lines",
    primary: "#046A38",
    secondary: "#FFFFFF",
    accent:  "#6FD9A4",
    glow:    "#089B54"
  },
  {
    id: "nassr",
    fam: "img/fam-nassr.jpg",
    cut: "img/cut/fam-nassr.webp",
    scale: "img/scale-nassr.jpg",
    life: "img/stadium-nassr.jpg",
    sky: "#FFE08A", // light backdrop wash behind the hero family // hero cutout — people only, transparent bg
    fg: "#14161A",
    img: "img/nassr.jpg",
    /* product-card shots: same three models, garment re-coloured per edition */
    shots: {
      adult: "img/shot-nassr-adult.jpg",
      kids:  "img/shot-nassr-kids.jpg",
      baby:  "img/shot-nassr-baby.jpg"
    },
    ink: "#1C3F94",
    ar: "فارس الدفا",
    en: "Faris Al-Dafa",
    tagAr: "أصفر وأزرق ملكي",
    tagEn: "Yellow and royal blue",
    primary: "#FFD400",
    secondary: "#1C3F94",
    accent:  "#FFE873",
    glow:    "#C9A500"
  },
  {
    id: "shabab",
    fam: "img/fam-shabab.jpg",
    cut: "img/cut/fam-shabab.webp",
    scale: "img/scale-shabab.jpg",
    life: "img/stadium-shabab.jpg",
    sky: "#E8DCC8", // light backdrop wash behind the hero family // hero cutout — people only, transparent bg
    fg: "#14161A",
    img: "img/shabab.jpg",
    /* product-card shots: same three models, garment re-coloured per edition */
    shots: {
      adult: "img/shot-shabab-adult.jpg",
      kids:  "img/shot-shabab-kids.jpg",
      baby:  "img/shot-shabab-baby.jpg"
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
];
/* Editions sahara + layl removed 2026-08-31: no physical product yet.
   Re-add here with real photography when they exist. */

/* ---------------------------------------------------------
   SIZES
   --------------------------------------------------------- */
/* Parents shop by age, not by our category names, so the age band is the
   headline on every size control and the category name is the subtitle.

   The bands are set by the garment length, not by guesswork: a hem reaches
   the knee at roughly 55% of the wearer's height. Baby is 58 cm long, so it
   stops covering the knee past ~110 cm (age 5). Kids is 80 cm, so it stops
   past ~150 cm (age 12) — a 14-year-old belongs in the adult size, which
   already covers 150–200 cm. */
const SIZES = {
  baby:  { ar: "بيبي",  en: "Baby",  ageAr: "2–5 سنوات",   ageEn: "Ages 2–5"  },
  kids:  { ar: "أطفال", en: "Kids",  ageAr: "6–12 سنة",    ageEn: "Ages 6–12" },
  adult: { ar: "كبار",  en: "Adult", ageAr: "13 سنة فأكثر", ageEn: "Ages 13+"  }
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
const PACKS = [
  { id: "trio-kid",   ar: "عائلة + طفل",    en: "Family + kid",     slots: ["adult", "adult", "kids"] },
  { id: "trio-baby",  ar: "عائلة + بيبي",   en: "Family + baby",    slots: ["adult", "adult", "baby"] },
  { id: "quad-kids",  ar: "عائلة + طفلين",  en: "Family + 2 kids",  slots: ["adult", "adult", "kids", "kids"] },
  { id: "quad-mixed", ar: "عائلة + طفل وبيبي", en: "Family + kid & baby", slots: ["adult", "adult", "kids", "baby"] },
  { id: "siblings",   ar: "طقم الإخوان",    en: "Siblings kit",     slots: ["kids", "baby"] }
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
  bldEmpty:    { ar: "ابدأ بطقم جاهز فوق، أو أضف أول واحد من الأزرار تحت.",
                 en: "Start from a ready pack above, or add your first person below." },
  bldAddAll:   { ar: "أضف {n} قطع إلى السلة",    en: "Add all {n} to cart" },
  bldAdded:    { ar: "تمّت إضافة {n} قطع",       en: "Added {n} items" },
  subtotal:    { ar: "قبل الخصم",                en: "Before discount" },
  waIntro:     { ar: "السلام عليكم، أبغى أطلب من سودي هودي:",
                 en: "Hi! I'd like to order from SoodiHoodi:" },
  waTotal:     { ar: "الإجمالي",                 en: "Total" },
  waBundle:    { ar: "بعد خصم العائلة 15٪",      en: "after 15% family discount" },
  waSent:      { ar: "فتحنا لك واتساب لإكمال الطلب 🟢", en: "Opening WhatsApp to complete your order 🟢" },
  demoNote:    {
    ar: "وضع تجريبي: لم يتم ربط متجر سلة بعد. راجع ملف README.md لخطوات الربط.",
    en: "Demo mode: no Salla store connected yet. See README.md for the wiring steps."
  }
};
