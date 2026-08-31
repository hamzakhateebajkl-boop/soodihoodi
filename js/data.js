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
   EDITIONS
   Colour-inspired only. No club names, crests, or marks.
   --------------------------------------------------------- */
const EDITIONS = [
  {
    id: "najd",
    img: "img/najd.jpg",
    fam: "img/fam-najd.jpg", // family gallery shot — section hides for editions without one
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
    fg: "#14161A",
    img: "img/hijaz.jpg",
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
    img: "img/watan.jpg",
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
    fg: "#14161A",
    img: "img/nassr.jpg",
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
    fg: "#14161A",
    img: "img/shabab.jpg",
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
const SIZES = {
  kids:  { ar: "أطفال",   en: "Kids"  },
  adult: { ar: "كبار",    en: "Adult" }
};

/* ---------------------------------------------------------
   FAMILY BUNDLE
   The whole point is getting one household to buy two or three.
   Change `pct` to whatever your margin actually supports.
   --------------------------------------------------------- */
const BUNDLE = { minQty: 2, pct: 15 };

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
    sizes: ["adult", "kids"],
    prices:    { adult: 299, kids: 199 },
    compareAt: { adult: 359, kids: 239 },
    badgeAr: "الأكثر مبيعاً",
    badgeEn: "Best seller"
  },
  {
    id: "terrace",
    sallaId: null,
    instantUrl: null,
    ar: "إصدار المدرجات",
    en: "The Terrace Edition",
    descAr: "شيربا أثقل ٤٥٠ جم، أكمام أطول، وجيب داخلي مبطّن للجوال.",
    descEn: "Heavier 450 gsm sherpa, longer sleeves, lined inner phone pocket.",
    sizes: ["adult", "kids"],
    prices:    { adult: 379, kids: 249 },
    compareAt: { adult: 449, kids: 299 },
    badgeAr: "إصدار محدود",
    badgeEn: "Limited"
  }
];

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
  splitPay:    { ar: "أو ٤ دفعات بـ",         en: "or 4 payments of" },
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
  bundleNudge: {
    ar: "أضف قطعة ثانية ووفّر ١٥٪ على الطلب",
    en: "Add a second one and save 15% on the order"
  },
  bundleOn:    { ar: "خصم العائلة ١٥٪ مفعّل ✓", en: "Family discount 15% applied ✓" },
  saved:       { ar: "وفّرت",                    en: "You saved" },
  subtotal:    { ar: "قبل الخصم",                en: "Before discount" },
  waIntro:     { ar: "السلام عليكم، أبغى أطلب من سودي هودي:",
                 en: "Hi! I'd like to order from SoodiHoodi:" },
  waTotal:     { ar: "الإجمالي",                 en: "Total" },
  waBundle:    { ar: "بعد خصم العائلة ١٥٪",      en: "after 15% family discount" },
  waSent:      { ar: "فتحنا لك واتساب لإكمال الطلب 🟢", en: "Opening WhatsApp to complete your order 🟢" },
  demoNote:    {
    ar: "وضع تجريبي: لم يتم ربط متجر سلة بعد. راجع ملف README.md لخطوات الربط.",
    en: "Demo mode: no Salla store connected yet. See README.md for the wiring steps."
  }
};
