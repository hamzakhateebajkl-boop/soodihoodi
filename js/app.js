/* =========================================================
   SoodiHoodi — storefront logic
   Edition theming · cart · AR/EN · scroll reveals
   ========================================================= */
(function () {
  "use strict";

  /* ---------------- state ---------------- */
  const LS = { cart: "sh_cart", ed: "sh_edition", lang: "sh_lang", cur: "sh_cur" };

  const state = {
    lang: localStorage.getItem(LS.lang) || "ar",
    edition: localStorage.getItem(LS.ed) || DEFAULT_EDITION,
    cart: JSON.parse(localStorage.getItem(LS.cart) || "[]"),
    picked: {} // productId -> sizeKey
  };

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const t  = (k) => (T[k] ? T[k][state.lang] : k);
  // t() with {placeholder} substitution, e.g. tf("bundleOn", {pct: 15})
  const tf = (k, vars) =>
    Object.entries(vars).reduce(
      (str, [key, val]) => str.replace(new RegExp("\\{" + key + "\\}", "g"), val),
      t(k)
    );
  // Orders open at LAUNCH.opensAt; before that checkout is locked.
  // opensAt null = "Launching soon", no date yet: stays locked.
  const isOpen = () =>
    typeof LAUNCH === "undefined" ||
    (!!LAUNCH.opensAt && Date.now() >= Date.parse(LAUNCH.opensAt));
  const ed = (id) =>
    EDITIONS.find((e) => e.id === id) ||
    EDITIONS.find((e) => e.id === DEFAULT_EDITION) ||
    EDITIONS[0];
  if (!EDITIONS.some((e) => e.id === state.edition)) state.edition = DEFAULT_EDITION;
  const prod = (id) => PRODUCTS.find((p) => p.id === id);

  // A saved cart can outlive the catalogue — a returning shopper may hold a
  // product or edition we've since retired. Drop those lines instead of
  // letting every lookup below throw and take the whole page down.
  state.cart = state.cart.filter(
    (l) => prod(l.pid) && EDITIONS.some((e) => e.id === l.ed)
  );
  /* ---- currency ----
     Saved choice first, then the device time zone, then the browser
     language region (ar-SA, en-AE...), else the base currency (OMR). */
  const mkt = (cur) => MARKETS.list.find((m) => m.cur === cur);
  function detectCur() {
    try {
      const saved = localStorage.getItem(LS.cur);
      if (saved && mkt(saved)) return saved;
    } catch (e) {}
    let tz = "";
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
    const byTz = MARKETS.list.find((m) => m.tz.includes(tz));
    if (byTz) return byTz.cur;
    const langs = navigator.languages || [navigator.language || ""];
    for (const l of langs) {
      const cc = (String(l).split("-")[1] || "").toUpperCase();
      const byCc = MARKETS.list.find((m) => m.cc === cc);
      if (byCc) return byCc.cur;
    }
    return MARKETS.base;
  }
  state.cur = detectCur();
  const M = () => mkt(state.cur) || mkt(MARKETS.base);
  // Round to the currency's smallest unit (fils / baisa / halala).
  const rnd = (n) => { const f = 10 ** M().dp; return Math.round(n * f) / f; };
  const ceilUnit = (n) => { const f = 10 ** M().dp; return Math.ceil(Math.round(n * f * 1000) / 1000) / f; };
  /* OMR, KWD and BHD always show 3 decimals (40.900), the local norm.
     SAR, AED and QAR show whole numbers, and decimals only when there are some. */
  const money = (n) => {
    const m = M();
    const v = rnd(Number(n));
    const whole = Number.isInteger(v) && m.dp === 2;
    const str = v.toLocaleString("en-US", {
      useGrouping: false,
      minimumFractionDigits: whole ? 0 : m.dp,
      maximumFractionDigits: whole ? 0 : m.dp
    });
    return `${str} ${m[state.lang]}`;
  };

  // Prices vary by size (adult vs kids) and by currency.
  const unitPrice = (pid, size) => {
    const p = prod(pid).prices;
    return (p[state.cur] || p[MARKETS.base])[size];
  };
  const wasPrice  = (pid, size) => ((prod(pid).compareAt || {})[state.cur] || {})[size];
  const save = () => {
    localStorage.setItem(LS.cart, JSON.stringify(state.cart));
    localStorage.setItem(LS.ed, state.edition);
    localStorage.setItem(LS.lang, state.lang);
  };

  /* Safari refuses to let a <button> be a real flex or positioning container:
     it wraps button content in an anonymous box, so `flex:1` children collapse
     to zero width and absolutely-positioned children never resolve. Every
     two-tone swatch on this page lived inside a button and rendered blank on
     iOS. Painting the split as a gradient on a single element sidesteps the
     whole class of bug — no children to lose. */
  const twoTone = (e, pct) => {
    const p = pct == null ? 62 : pct;
    const to = state.lang === "ar" ? "left" : "right";
    return `linear-gradient(to ${to},${e.primary} 0 ${p}%,${e.secondary} ${p}% 100%)`;
  };

  // Small square crop of the model shot, for the bundle builder's picker.
  const cardThumb = (e, size) =>
    (e.thumbs && e.thumbs[size]) || (e.shots && e.shots[size]) || e.img;

  // Tighter, sharper crop of the same model shot (upper body), used for the
  // split pack photos and the family page rows.
  const sliceShot = (e, size) =>
    e.shots && e.shots[size] ? `img/slice/${e.id}-${size}.webp` : cardShot(e, size);

  // "قطعة وحدة / قطعتين / 3 قطع" — Arabic counts don't take one plural.
  const pieces = (n) =>
    state.lang === "ar"
      ? n === 1 ? "قطعة وحدة" : n === 2 ? "قطعتين" : `${n} قطع`
      : n === 1 ? "1 piece" : `${n} pieces`;

  // Product-card shot: a model wearing this edition in the picked size.
  // Falls back to the flat garment shot if an edition has no model photos yet.
  const cardShot = (e, size) => (e.shots && e.shots[size]) || e.img;

  // Swap a card's photo when the size or the edition changes, with the same
  // cross-fade the hero uses so the card doesn't flash white mid-swap.
  function setCardShot(card, pid) {
    const im = $("[data-pshot]", card);
    if (!im) return;
    const e = ed(state.edition);
    const src = cardShot(e, state.picked[pid]);
    im.alt = e[state.lang];
    if (im.getAttribute("src") === src) return;
    im.classList.add("swapping");
    const pre = new Image();
    pre.src = src;
    const swap = () => { im.src = src; im.classList.remove("swapping"); };
    pre.complete ? swap() : (pre.onload = swap, pre.onerror = swap);
  }

  // Product shot for a given edition. Passing null follows the current edition.
  const shot = (e, cls) => {
    const x = e || ed(state.edition);
    return (
      `<img class="shot${cls ? " " + cls : ""}"${e ? "" : " data-shot"} ` +
      `src="${x.img}" alt="${x[state.lang]}" loading="lazy">`
    );
  };

  /* =========================================================
     EDITION THEMING
     ========================================================= */
  function applyEdition(id, announce) {
    const e = ed(id);
    if (e.comingSoon) { toast(t("soonMsg")); return; }
    state.edition = e.id;

    const r = document.documentElement.style;
    r.setProperty("--ed", e.primary);
    r.setProperty("--ed2", e.secondary);
    r.setProperty("--ed-acc", e.accent);
    r.setProperty("--ed-glow", e.glow);
    r.setProperty("--ed-fg", e.fg || "#fff");
    r.setProperty("--ed-sky", e.sky || "transparent");
    // Text-safe dark variant. --ed is a fill colour and goes illegible the
    // moment it lands on the pale edition-tinted stage (yellow on yellow).
    r.setProperty("--ed-ink", e.ink || e.primary);
    document.documentElement.dataset.edition = e.id;

    const nameEl = $("#edName");
    if (nameEl) nameEl.textContent = e[state.lang];

    const hero = $("#heroShot");
    if (hero) {
      const shot = e.cut || e.img;
      if (hero.getAttribute("src") !== shot) {
        hero.classList.add("swapping");
        const pre = new Image();
        pre.src = shot;
        const swap = () => {
          hero.src = shot;
          hero.classList.remove("swapping");
        };
        pre.complete ? swap() : (pre.onload = swap, pre.onerror = swap);
      }
      // The brand name is always written in Latin, in both languages.
      hero.alt = `SoodiHoodi — ${e[state.lang]}`;
    }
    const crew = $("#crew"), crewImg = $("#crewImg");
    if (crew && crewImg) {
      if (e.fam) {
        crew.hidden = false;
        if (crewImg.getAttribute("src") !== e.fam) {
          crewImg.classList.add("swapping");
          const swap = () => {
            crewImg.src = e.fam;
            crewImg.alt = `${e[state.lang]}`;
            crewImg.onload = () => crewImg.classList.remove("swapping");
          };
          setTimeout(swap, 180);
        }
      } else {
        crew.hidden = true; // no family shot for this edition yet
      }
    }

    const scaleImg = $("#scaleImg");
    if (scaleImg && e.scale && scaleImg.getAttribute("src") !== e.scale) {
      scaleImg.classList.add("swapping");
      const sPre = new Image();
      sPre.src = e.scale;
      const sSwap = () => { scaleImg.src = e.scale; scaleImg.classList.remove("swapping"); };
      sPre.complete ? sSwap() : (sPre.onload = sSwap, sPre.onerror = sSwap);
    }

    const lifeImg = $("#lifeImg");
    if (lifeImg && e.life && lifeImg.getAttribute("src") !== e.life) {
      lifeImg.classList.add("swapping");
      const lPre = new Image();
      lPre.src = e.life;
      const lSwap = () => { lifeImg.src = e.life; lifeImg.classList.remove("swapping"); };
      lPre.complete ? lSwap() : (lPre.onload = lSwap, lPre.onerror = lSwap);
    }

    $$("[data-shot]").forEach((im) => {
      if (im.getAttribute("src") !== e.img) im.src = e.img;
      im.alt = e[state.lang];
    });

    // Product cards carry a model shot per size, so they swap separately.
    $$(".pc").forEach((card) => setCardShot(card, card.dataset.p));

    $$(".sw").forEach((b) =>
      b.setAttribute("aria-checked", String(b.dataset.ed === e.id))
    );
    $$(".edc").forEach((c) =>
      c.setAttribute("aria-current", String(c.dataset.ed === e.id))
    );
    syncTeamChip();

    save();
    if (announce) toast(`${t("edSwitched")} ${e[state.lang]}`);
  }

  /* =========================================================
     FAMILY BUNDLE BUILDER

     state.build is a flat list of people: [{size, ed}, ...]. Each person
     carries their own edition, which is the whole reason this is a builder
     and not a set of fixed pack SKUs — a household split between two clubs
     still has to be able to order together.
     ========================================================= */
  state.build = [];

  const buildSubtotal = () =>
    state.build.reduce((sum, r) => sum + unitPrice("classic", r.size), 0);
  const buildPct = () => (tierFor(state.build.length) || { pct: 0 }).pct;
  const buildSaving = () => rnd((buildSubtotal() * buildPct()) / 100);

  /* One photo per person, cut into slanted slices like a split shirt.
     Slices are placed in physical left-to-right space, so Arabic reverses
     the list to keep the first person on the right. */
  function splitArt(people) {
    const n = people.length;
    const k = 0.14;          // lean of each cut, as a share of the card width
    const L = 1 / n + k;     // each slice: one share plus the lean
    const g = "1.5px";       // half the dark gap between slices
    const list = state.lang === "ar" ? [...people].reverse() : people;
    return list
      .map((p, i) => {
        const left = (i / n - k / 2) * 100;
        const tl = i === 0 ? "0%" : `calc(${((k / L) * 100).toFixed(3)}% + ${g})`;
        const bl = i === 0 ? "0%" : g;
        const tr = i === n - 1 ? "100%" : `calc(100% - ${g})`;
        const br = i === n - 1 ? "100%" : `calc(${((1 / n / L) * 100).toFixed(3)}% - ${g})`;
        return `<i style="left:${left.toFixed(3)}%;width:${(L * 100).toFixed(3)}%;clip-path:polygon(${tl} 0,${tr} 0,${br} 100%,${bl} 100%)"><img src="${sliceShot(ed(p.ed), p.size)}" alt="" loading="lazy" width="440" height="589"></i>`;
      })
      .join("");
  }

  const arrow = `<svg class="pack__arr" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

  function renderPacks() {
    const el = $("#bldPacks");
    if (!el) return;
    const cards = PACKS.map((pk) => {
      const from = pk.slots.reduce((n, sz) => n + unitPrice("classic", sz), 0);
      const pct = (tierFor(pk.slots.length) || { pct: 0 }).pct;
      const mix = pk.mix || [];
      const people = pk.slots.map((sz, i) => ({
        size: sz,
        ed: EDITIONS.some((e) => e.id === mix[i]) ? mix[i] : state.edition
      }));

      // "كبار ×2 · ناشئين" reads better than repeating the age bands.
      const counts = pk.slots.reduce((m, sz) => ((m[sz] = (m[sz] || 0) + 1), m), {});
      const who = Object.keys(counts)
        .map((sz) => SIZES[sz][state.lang] + (counts[sz] > 1 ? ` ×${counts[sz]}` : ""))
        .join(" · ");

      return `<button class="pack" type="button" data-pack="${pk.id}">
          <span class="pack__art">${splitArt(people)}${pct
            ? `<span class="pack__save" dir="${state.lang === "ar" ? "rtl" : "ltr"}">${tf("packSave", { pct })}</span>`
            : ""}</span>
          <span class="pack__body">
            <span class="pack__l">
              <b class="pack__t">${pk[state.lang]}</b>
              <span class="pack__who">${who}</span>
            </span>
            <span class="pack__pr">
              <em dir="ltr">${money(from - rnd((from * pct) / 100))}</em>
              ${pct ? `<s dir="ltr">${money(from)}</s>` : ""}
            </span>
          </span>
          <span class="pack__go">${t("famPick")}${arrow}</span>
        </button>`;
    });

    cards.push(`<button class="pack pack--own" type="button" data-pack="own">
        <span class="pack__plus" aria-hidden="true">+</span>
        <span class="pack__body">
          <span class="pack__l">
            <b class="pack__t">${t("famOwn")}</b>
            <span class="pack__who">${t("famOwnS")}</span>
          </span>
        </span>
        <span class="pack__go">${t("famOwnGo")}${arrow}</span>
      </button>`);
    el.innerHTML = cards.join("");

    $$(".pack", el).forEach((b) =>
      b.addEventListener("click", () => {
        if (b.dataset.pack === "own") {
          state.build = [{ size: "adult", ed: state.edition }];
        } else {
          const pk = PACKS.find((x) => x.id === b.dataset.pack);
          if (!pk) return;
          // Load exactly what the card pictured, mixed teams and all.
          const mix = pk.mix || [];
          state.build = pk.slots.map((sz, i) => ({
            size: sz,
            ed: EDITIONS.some((e) => e.id === mix[i]) ? mix[i] : state.edition
          }));
        }
        openFam(true);
      })
    );
  }

  /* Front view of the blanket hoodie, drawn to scale per size. The amber
     line on the front is the garment length (shoulder to hem), so nobody
     reads "95" as the wearer's height. Pocket: closed top, open sides. */
  const HOODIE = `
    <svg class="hd" viewBox="0 0 200 250" aria-hidden="true">
      <path class="hd__body" d="M68 62C80 70 120 70 132 62L160 72C168 75 170 80 170 88V236C170 241 167 244 162 244H38C33 244 30 241 30 236V88C30 80 32 75 40 72Z"/>
      <path class="hd__hem" d="M30 229H170"/>
      <path class="hd__sleeve" d="M40 72C26 76 18 90 16 106L8 194L36 198L44 122Z"/>
      <path class="hd__sleeve" d="M160 72C174 76 182 90 184 106L192 194L164 198L156 122Z"/>
      <path class="hd__cuff" d="M8 194L36 198L35 210L7 206Z"/>
      <path class="hd__cuff" d="M192 194L164 198L165 210L193 206Z"/>
      <path class="hd__rib" d="M13 196L12 207M19 197L18 208M25 197L24 209M31 198L30 209M187 196L188 207M181 197L182 208M175 197L176 209M169 198L170 209"/>
      <path class="hd__hood" d="M68 62C62 34 80 8 100 8C120 8 138 34 132 62C120 68 80 68 68 62Z"/>
      <path class="hd__face" d="M80 62C78 40 88 26 100 26C112 26 122 40 120 62"/>
      <path class="hd__sherpa" d="M80 62C78 40 88 26 100 26C112 26 122 40 120 62"/>
      <path class="hd__cord" d="M93 64C92 74 94 84 92 93M107 64C108 74 106 84 108 93"/>
      <circle class="hd__tip" cx="92" cy="95" r="2.2"/><circle class="hd__tip" cx="108" cy="95" r="2.2"/>
      <path class="hd__pocket" d="M60 168H140L148 212H52Z"/>
      <path class="hd__stitch" d="M63 172H137"/>
      <path class="hd__open" d="M60 168L52 212M140 168L148 212"/>
      <g class="hd__dim">
        <path d="M100 66V242"/>
        <path d="M92 66H108M92 242H108"/>
        <path d="M96 73L100 66L104 73M96 235L100 242L104 235"/>
      </g>
    </svg>`;

  const ICONS = {
    age: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21h16M5 21v-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7"/><path d="M5 16c1.4 1 2.6 1 4 0s2.6-1 4 0 2.6 1 4 0 2-1 2-1"/><path d="M12 12V8"/><path d="M12 4.5c.9.9.9 2 0 2.6-.9-.6-.9-1.7 0-2.6Z"/></svg>',
    tall: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="4.5" r="2"/><path d="M9 8v6M6 10.5 9 8l3 2.5M7.5 21l1.5-7 1.5 7"/><path d="M18 3v18M16 5l2-2 2 2M16 19l2 2 2-2"/></svg>',
    reach: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="3.8" r="1.9"/><path d="M8.5 7.5h7l1 7.5h-9z"/><path d="M10 15v6.5M14 15v6.5"/><path d="M3 15h18" stroke-dasharray="2 2.2"/></svg>'
  };

  /* Sizes and prices, side by side, biggest first. Used twice: the hoodie
     cards in #sizes and the compact strip at the top of the family page. */
  const sizeOrder = () => Object.keys(SIZES).reverse();
  const L = (o, k) => o[k + (state.lang === "ar" ? "Ar" : "En")];
  function renderKits() {
    const box = $("#kits");
    const maxCm = Math.max(...Object.values(SIZES).map((z) => z.lengthCm));
    if (box) box.innerHTML = sizeOrder().map((sz) => {
      const z = SIZES[sz];
      const fact = (ic, label, val) => `<li><span class="kit__ic">${ICONS[ic]}</span><span><small>${label}</small><b>${val}</b></span></li>`;
      return `
      <article class="kit" style="--k:${(z.lengthCm / maxCm).toFixed(3)}">
        <figure class="kit__fig" role="img" aria-label="${t("kitLen")}: ${z.lengthCm} ${t("cm")}">
          <div class="kit__hd">${HOODIE}<span class="kit__len" dir="ltr"><b>${z.lengthCm}</b> ${t("cm")}</span></div>
          <figcaption class="kit__cap">${t("kitLen")}</figcaption>
        </figure>
        <div class="kit__info">
          <h3 class="kit__n">${z[state.lang]}</h3>
          <ul class="kit__facts">
            ${fact("age", t("age"), L(z, "age"))}
            ${fact("tall", t("fits"), L(z, "fit"))}
            ${fact("reach", t("reach"), L(z, "reach"))}
          </ul>
          <p class="kit__p" dir="ltr">${money(unitPrice("classic", sz))}</p>
        </div>
      </article>`;
    }).join("");
    const fs = $("#famSizes");
    if (fs) {
      fs.setAttribute("aria-label", t("famSizesT"));
      fs.innerHTML = sizeOrder().map((sz) => {
        const z = SIZES[sz];
        return `<div class="fsz__c"><b>${z[state.lang]}</b><span>${L(z, "age")}<br>${tf("hoodieCm", { cm: z.lengthCm })}</span><em dir="ltr">${money(unitPrice("classic", sz))}</em></div>`;
      }).join("");
    }
  }

  function renderBuild() {
    const rows = $("#bldRows");
    if (!rows) return;
    const n = state.build.length;

    const cnt = $("#famCount");
    if (cnt) cnt.textContent = n ? pieces(n) : "";

    if (!n) {
      rows.innerHTML = `<div class="bld__empty">${t("famEmpty")}</div>`;
    } else {
      rows.innerHTML = state.build
        .map((r, i) => {
          const sz = SIZES[r.size];
          const e = ed(r.ed);
          return `
        <div class="brow" data-i="${i}">
          <span class="brow__img"><img src="${sliceShot(e, r.size)}" alt="${e[state.lang]}" width="440" height="589"></span>
          <div class="brow__main">
            <div class="brow__top">
              <span class="brow__who">
                <b>${sz[state.lang]}</b>
                <span>${sz[state.lang === "ar" ? "ageAr" : "ageEn"]} · ${tf("hoodieCm", { cm: sz.lengthCm })}</span>
              </span>
              ${n > 1 ? `<button class="brow__x" type="button" aria-label="${tf("removeWho", { who: sz[state.lang] })}">
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>
                <span>${t("remove")}</span>
              </button>` : ""}
            </div>
            <span class="brow__ed">${e[state.lang]}</span>
            <span class="brow__p" dir="ltr">${money(unitPrice("classic", r.size))}</span>
          </div>
          <div class="brow__eds" role="group" aria-label="${t("chooseEd")}">
            ${EDITIONS.map(
              (x) => `<button class="bed" type="button" data-ed="${x.id}"
                        aria-pressed="${x.id === r.ed}" aria-label="${x[state.lang]}">
                        <img src="${cardThumb(x, r.size)}" alt="" loading="lazy" width="220" height="220">
                        <span>${x[state.lang]}</span>
                      </button>`
            ).join("")}
          </div>
        </div>`;
        })
        .join("");

      $$(".brow", rows).forEach((row) => {
        const i = Number(row.dataset.i);
        $(".brow__x", row)?.addEventListener("click", () => {
          state.build.splice(i, 1);
          renderBuild();
        });
        $$(".bed", row).forEach((b) =>
          b.addEventListener("click", () => {
            state.build[i].ed = b.dataset.ed;
            renderBuild();
          })
        );
      });
    }

    // add-a-person buttons
    const add = $("#bldAdd");
    add.innerHTML = Object.keys(SIZES)
      .reverse()
      .map(
        (sz) => `<button class="badd" type="button" data-size="${sz}">
            + ${SIZES[sz][state.lang]} <span>${SIZES[sz][state.lang === "ar" ? "ageAr" : "ageEn"]} · <b dir="ltr">${money(unitPrice("classic", sz))}</b></span>
          </button>`
      )
      .join("");
    $$(".badd", add).forEach((b) =>
      b.addEventListener("click", () => {
        state.build.push({ size: b.dataset.size, ed: state.edition });
        renderBuild();
        // show the person just added
        const last = $$(".brow", rows).pop();
        if (last) last.scrollIntoView({ behavior: "smooth", block: "nearest" });
      })
    );

    // one tap back to a single-team set
    const mw = $("#bldMatchWrap");
    const allSame = !n || state.build.every((r) => r.ed === state.build[0].ed);
    if (mw) {
      mw.innerHTML = allSame ? "" : `<button class="bmatch" type="button" id="bldMatch">${
        tf("bldMatch", { ed: ed(state.edition)[state.lang] })}</button>`;
      const match = $("#bldMatch");
      if (match) match.addEventListener("click", () => {
        state.build.forEach((r) => { r.ed = state.edition; });
        renderBuild();
      });
    }

    // sticky footer: total + one button
    const sum = $("#bldSum");
    const sub = buildSubtotal();
    const pct = buildPct();
    const saving = buildSaving();
    const nt = nextTier(n);
    const addLbl = state.lang === "ar" ? `أضف ${pieces(n)} للسلة` : `Add ${pieces(n)} to cart`;

    sum.innerHTML = `
      ${n && nt ? `<p class="bsum__next">${tf(
          nt.min - n > 1 ? "bundleAdd2" : "bundleAdd1", { pct: nt.pct }
        )}</p>` : ""}
      ${saving ? `<p class="fsum__save">${tf("bundleOn", { pct })} · ${t("saved")} <b dir="ltr">${money(saving)}</b></p>` : ""}
      <div class="fsum">
        <div class="fsum__l">
          <span>${t("total")}</span>
          <b dir="ltr">${money(sub - saving)}</b>
          ${saving ? `<s dir="ltr">${money(sub)}</s>` : ""}
        </div>
        <button class="btn btn--go" type="button" id="bldAddAll"${n ? "" : " disabled"}>${n ? addLbl : t("addToCart")}</button>
      </div>`;

    $("#bldAddAll").addEventListener("click", () => {
      const n = state.build.length;
      if (!n) return;
      state.build.forEach((r) => addToCart("classic", r.size, r.ed, true));
      state.build = [];
      toast(tf("bldAdded", { n }));
      leaveFam();
      openCart(true);
    });
  }

  /* ---- family page ----
     Behaves like its own page: full screen, a back button, and the phone's
     back gesture closes it because opening it pushes a #family entry. */
  let famPushed = false;
  function famUI(open) {
    const el = $("#famPage");
    if (!el) return;
    el.classList.toggle("open", open);
    el.setAttribute("aria-hidden", String(!open));
    if (open) {
      document.body.style.overflow = "hidden";
      $("#famBody").scrollTop = 0;
      setTimeout(() => $("#famBack")?.focus({ preventScroll: true }), 80);
    } else if (!$("#cart").classList.contains("open")) {
      document.body.style.overflow = "";
    }
  }
  function openFam(push) {
    openCart(false); openTeamSheet(false);
    renderBuild();
    famUI(true);
    if (push && location.hash !== "#family") {
      history.pushState({ fam: 1 }, "", "#family");
      famPushed = true;
    }
  }
  function leaveFam() {
    if (!$("#famPage")?.classList.contains("open")) return;
    if (famPushed && history.state && history.state.fam) {
      famPushed = false;
      history.back(); // popstate closes it
    } else {
      famUI(false);
      if (location.hash === "#family")
        history.replaceState(null, "", location.pathname + location.search);
    }
  }
  function famInit() {
    if (!$("#famPage")) return;
    $("#famBack").addEventListener("click", leaveFam);
    window.addEventListener("popstate", () => {
      if (location.hash === "#family") {
        if (!state.build.length) state.build = [{ size: "adult", ed: state.edition }];
        renderBuild(); famUI(true);
      } else {
        famPushed = false; famUI(false);
      }
    });
    // soodihoodi.com/#family opens straight into the family page (for ads)
    if (location.hash === "#family") {
      if (!state.build.length) state.build = [{ size: "adult", ed: state.edition }];
      openFam(false);
    }
  }

  /* =========================================================
     FIRST-VISIT OFFER
     ========================================================= */
  function openOffer(open) {
    const el = $("#offer");
    if (!el) return;
    el.classList.toggle("open", open);
    el.setAttribute("aria-hidden", String(!open));
    $("#scrim").hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      const e = ed(state.edition);
      const im = $("#offerImg");
      if (im) { im.src = OFFER.img || e.card || e.img; im.alt = ""; }
      setTimeout(() => $("#offerName")?.focus(), 380);
    }
  }

  function seenOffer() {
    try { return !!localStorage.getItem(OFFER.storageKey); } catch (e) { return true; }
  }
  function markOffer(v) {
    try { localStorage.setItem(OFFER.storageKey, v); } catch (e) {}
  }

  function offerInit() {
    const el = $("#offer");
    if (!el || typeof OFFER === "undefined" || !OFFER.enabled) return;

    $("#offerClose").addEventListener("click", () => { markOffer("dismissed"); openOffer(false); });
    $("#offerNo").addEventListener("click", () => { markOffer("dismissed"); openOffer(false); });

    $("#offerForm").addEventListener("submit", (ev) => {
      ev.preventDefault();
      const name = $("#offerName").value.trim();
      const mail = $("#offerMail").value.trim();
      const family = Number($("#offerFam") ? $("#offerFam").value : 0) || 0;
      const ok = name.length > 1 && /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(mail);
      $("#offerErr").hidden = ok;
      if (!ok) return;

      markOffer("joined");

      if (OFFER.endpoint) {
        // Fire-and-forget: a form handler's response is irrelevant to the
        // shopper, and blocking the UI on it only ever makes things worse.
        fetch(OFFER.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ name, email: mail, family, lang: state.lang, source: "site-offer", edition: state.edition })
        }).catch(() => {});
      } else if (SALLA.whatsapp) {
        // No endpoint configured yet — hand the lead to WhatsApp rather than
        // drop it on the floor. Same fallback checkout already uses.
        const msg = tf("offerWa", { pct: OFFER.pct, name, mail });
        window.open(`https://wa.me/${SALLA.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
      }

      if (OFFER.code) { showOfferCode(); return; }
      openOffer(false);
      toast(t("offerThanks"));
    });

    // A fixed first-order code is shown on the spot instead of emailed.
    function showOfferCode() {
      ["#offerForm", "#offerErr", "#offerNo", "#offerSub"].forEach((s) => { if ($(s)) $(s).hidden = true; });
      $("#offerCodeTxt").textContent = OFFER.code;
      $("#offerDone").hidden = false;
      setTimeout(() => $("#offerCode")?.focus(), 50);
    }
    $("#offerCode")?.addEventListener("click", () => {
      const done = () => toast(t("offerCopied"));
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(OFFER.code).then(done).catch(() => {});
    });
    $("#offerGo")?.addEventListener("click", () => openOffer(false));

    if (seenOffer()) return;
    setTimeout(() => {
      // Never interrupt someone mid-task: not while the cart, team sheet or
      // the gate is up, and not once they've already started shopping.
      if (document.documentElement.classList.contains("gated")) return;
      if ($("#cart").classList.contains("open")) return;
      if ($("#teamSheet").classList.contains("open")) return;
      if (state.cart.length) return;
      openOffer(true);
    }, OFFER.delayMs);
  }

  /* =========================================================
     PERSISTENT TEAM SWITCHER
     ========================================================= */
  function renderTeamSheet() {
    const grid = $("#teamGrid");
    if (!grid) return;
    grid.innerHTML = EDITIONS.map(
      (e) => `
      <button class="tcard" type="button" role="radio" data-ed="${e.id}"
              aria-checked="${e.id === state.edition}" aria-label="${e[state.lang]}">
        <span class="tcard__on" aria-hidden="true">✓</span>
        <span class="tcard__img"><img src="${e.img}" alt="" loading="lazy" width="120" height="120"></span>
        <i class="tcard__bar" aria-hidden="true" style="background:${twoTone(e, 50)}"></i>
        <span class="tcard__n">${e[state.lang]}</span>
      </button>`
    ).join("");

    $$(".tcard", grid).forEach((b) =>
      b.addEventListener("click", () => {
        applyEdition(b.dataset.ed, true);
        openTeamSheet(false);
      })
    );
  }

  function openTeamSheet(open) {
    const sheet = $("#teamSheet");
    if (!sheet) return;
    if (open) { openCart(false); openOffer(false); }
    sheet.classList.toggle("open", open);
    sheet.setAttribute("aria-hidden", String(!open));
    $("#teamBtn").setAttribute("aria-expanded", String(open));
    $("#scrim").hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
    if (open) $(".tcard[aria-checked='true']", sheet)?.focus();
  }

  // The chip is the running "a team is selected" signal, so it has to track
  // the edition wherever the switch happened — hero, swipe, sheet or rail.
  function syncTeamChip() {
    const e = ed(state.edition);
    const n = $("#teamChipName");
    if (n) n.textContent = e[state.lang];
    const btn = $("#teamBtn");
    if (btn) btn.setAttribute("aria-label", `${t("changeTeam")} — ${e[state.lang]}`);
    $$(".tcard").forEach((c) =>
      c.setAttribute("aria-checked", String(c.dataset.ed === state.edition))
    );
    const sn = $("#shopTeamName");
    if (sn) sn.textContent = e[state.lang];
    const si = $("#shopTeamImg");
    if (si && si.getAttribute("src") !== e.img) si.src = e.img;
  }

  /* =========================================================
     RENDER — swatches
     ========================================================= */
  function renderSwatches() {
    const bar = $(".swatchbar");
    if (!bar) return;
    bar.innerHTML = EDITIONS.map(
      (e) => `
      <button class="sw${e.comingSoon ? " sw--soon" : ""}" type="button" role="radio" data-ed="${e.id}"
              aria-checked="${e.id === state.edition}"
              title="${e[state.lang]}${e.comingSoon ? " — " + t("soonBadge") : ""}"
              aria-label="${e[state.lang]}${e.comingSoon ? " — " + t("soonBadge") : ""}">
        <span class="sw__img"><img src="${e.img}" alt="" loading="lazy" width="120" height="120"
          >${e.comingSoon ? `<span class="sw__soon">${t("soonBadge")}</span>` : ""}</span>
        <i class="sw__bar" aria-hidden="true" style="background:${twoTone(e)}"></i>
        <span class="sw__name">${e[state.lang]}</span>
      </button>`
    ).join("");

    $$(".sw", bar).forEach((b) =>
      b.addEventListener("click", () => applyEdition(b.dataset.ed, true))
    );
  }

  /* =========================================================
     RENDER — edition rail
     ========================================================= */
  function renderRail() {
    const rail = $("#edsRail");
    if (!rail) return;
    rail.innerHTML = EDITIONS.map(
      (e) => `
      <button class="edc io${e.comingSoon ? " edc--soon" : ""}" type="button" data-ed="${e.id}"
              aria-current="${e.id === state.edition}" style="color:${e.ink || e.primary}">
        ${e.comingSoon ? `<span class="edc__badge">${t("soonBadge")}</span>` : ""}
        ${e.comingSoon && e.img
          ? `<span class="edc__sw edc__sw--img" aria-hidden="true" style="background-image:url('${e.img}')"></span>`
          : `<span class="edc__sw">
              <img src="${e.card || e.img}" alt="${e[state.lang]}" loading="lazy" width="640" height="800">
              <i aria-hidden="true" style="background:${twoTone(e, 66)}"></i>
            </span>`}
        <span class="edc__t">${e[state.lang]}</span>
        <span class="edc__s">${state.lang === "ar" ? e.tagAr : e.tagEn}</span>
        <span class="edc__go">${e.comingSoon ? t("soonMsg") : t("pickEdition")}</span>
      </button>`
    ).join("");

    $$(".edc", rail).forEach((c) =>
      c.addEventListener("click", () => {
        if (ed(c.dataset.ed).comingSoon) { toast(t("soonMsg")); return; }
        applyEdition(c.dataset.ed, true);
        const shop = $("#shop");
        if (shop) shop.scrollIntoView({ behavior: "smooth", block: "start" });
      })
    );
    observe($$(".edc", rail));
  }

  /* =========================================================
     RENDER — shop grid
     ========================================================= */
  function priceBlock(pid, size) {
    const now = unitPrice(pid, size);
    const was = wasPrice(pid, size);
    const off = was ? Math.round(((was - now) / was) * 100) : 0;
    return (
      `<span class="pc__now">${money(now)}</span>` +
      (was ? `<s class="pc__was">${money(was)}</s>` : "") +
      (off ? `<span class="pc__save" dir="ltr">−${off}%</span>` : "")
    );
  }

  function renderShop() {
    const grid = $("#shopGrid");
    if (!grid) return;

    grid.innerHTML = PRODUCTS.map((p) => {
      const pick = state.picked[p.id] || p.sizes[0];
      state.picked[p.id] = pick;

      const badge = state.lang === "ar" ? p.badgeAr : p.badgeEn;
      const e = ed(state.edition);

      return `
      <article class="pc io" data-p="${p.id}">
        ${badge ? `<span class="pc__tag">${badge}</span>` : ""}
        <div class="pc__art"><img class="shot" data-pshot
          src="${cardShot(e, pick)}" alt="${e[state.lang]}" loading="lazy"></div>
        <h3 class="pc__t">${p[state.lang]}</h3>
        <p class="pc__d">${state.lang === "ar" ? p.descAr : p.descEn}</p>

        <div class="pc__price">${priceBlock(p.id, pick)}</div>

        <div class="pc__sizes" role="group" aria-label="${t("chooseSize")}">
          ${p.sizes
            .map(
              (s) => `<button class="szb" type="button" data-size="${s}"
                        aria-pressed="${pick === s}"
                        aria-label="${SIZES[s][state.lang]} — ${SIZES[s][state.lang === "ar" ? "ageAr" : "ageEn"]}">
                        <b>${SIZES[s][state.lang === "ar" ? "ageAr" : "ageEn"]}</b>
                        <i>${SIZES[s][state.lang]}</i>
                      </button>`
            )
            .join("")}
        </div>


        <button class="btn btn--go btn--full pc__cta" type="button">${t("addToCart")}</button>
      </article>`;
    }).join("");

    $$(".pc", grid).forEach((card) => {
      const pid = card.dataset.p;

      $$(".szb", card).forEach((b) =>
        b.addEventListener("click", () => {
          const size = b.dataset.size;
          state.picked[pid] = size;
          $$(".szb", card).forEach((x) =>
            x.setAttribute("aria-pressed", String(x === b))
          );
          $(".pc__price", card).innerHTML = priceBlock(pid, size);
          setCardShot(card, pid);
        })
      );

      $(".pc__cta", card).addEventListener("click", () => {
        const size = state.picked[pid];
        if (!size) return toast(t("chooseSize"));
        addToCart(pid, size);
      });
    });

    observe($$(".pc", grid));
  }

  /* =========================================================
     CART
     ========================================================= */
  // edId is optional: the product card passes nothing and follows the browsed
  // edition, while the bundle builder passes one edition per person.
  function addToCart(pid, size, edId, quiet) {
    const e = edId || state.edition;
    const key = `${pid}|${size}|${e}`;
    const line = state.cart.find((l) => l.key === key);
    if (line) line.qty += 1;
    else state.cart.push({ key, pid, size, ed: e, qty: 1 });
    save();
    renderCart();
    bumpCount();
    if (!quiet) toast(t("added"));
  }

  function setQty(key, delta) {
    const line = state.cart.find((l) => l.key === key);
    if (!line) return;
    line.qty += delta;
    if (line.qty < 1) return removeLine(key);
    save();
    renderCart();
    bumpCount();
  }

  function removeLine(key) {
    state.cart = state.cart.filter((l) => l.key !== key);
    save();
    renderCart();
    bumpCount();
    toast(t("removed"));
  }

  const cartSubtotal = () =>
    state.cart.reduce((sum, l) => sum + unitPrice(l.pid, l.size) * l.qty, 0);
  const cartCount = () => state.cart.reduce((n, l) => n + l.qty, 0);

  // Family bundle: tiered by headcount, highest matching tier wins.
  const tierFor = (n) => BUNDLE.tiers.find((t) => n >= t.min) || null;
  const nextTier = (n) =>
    [...BUNDLE.tiers].reverse().find((t) => t.min > n) || null;

  const bundlePct = () => (tierFor(cartCount()) || { pct: 0 }).pct;
  const bundleOn = () => bundlePct() > 0;
  const bundleSaving = () =>
    rnd((cartSubtotal() * bundlePct()) / 100);
  const cartTotal = () => rnd(cartSubtotal() - bundleSaving());

  function bumpCount() {
    const el = $("#cartCount");
    if (!el) return;
    el.textContent = cartCount();
    el.classList.remove("pop");
    void el.offsetWidth;
    el.classList.add("pop");
  }

  function renderCart() {
    const body = $("#cartBody");
    if (!body) return;

    if (!state.cart.length) {
      body.innerHTML = `<div class="cart__empty">
          <span aria-hidden="true">◎</span>
          <b>${t("emptyCart")}</b><br>${t("emptyHint")}
        </div>`;
    } else {
      body.innerHTML = state.cart
        .map((l) => {
          const p = prod(l.pid);
          const e = ed(l.ed);
          return `
        <div class="ci" data-k="${l.key}">
          <div class="ci__art">${shot(e)}</div>
          <div>
            <div class="ci__t">${p[state.lang]}</div>
            <div class="ci__m">${e[state.lang]} · ${SIZES[l.size][state.lang]}</div>
            <div class="ci__qty">
              <button type="button" data-d="-1" aria-label="−">−</button>
              <span>${l.qty}</span>
              <button type="button" data-d="1" aria-label="+">+</button>
            </div>
          </div>
          <div>
            <div class="ci__p">${money(unitPrice(l.pid, l.size) * l.qty)}</div>
            <button class="ci__x" type="button">${t("remove")}</button>
          </div>
        </div>`;
        })
        .join("");

      $$(".ci", body).forEach((row) => {
        const k = row.dataset.k;
        $$(".ci__qty button", row).forEach((b) =>
          b.addEventListener("click", () => setQty(k, Number(b.dataset.d)))
        );
        $(".ci__x", row).addEventListener("click", () => removeLine(k));
      });
    }

    const sub = cartSubtotal();
    const saving = bundleSaving();
    const total = cartTotal();

    // bundle row: either "you saved X" or a nudge to add one more
    const bEl = $("#cartBundle");
    const subRow = $("#cartSubRow");
    if (saving) {
      bEl.hidden = false;
      bEl.className = "cart__bundle cart__bundle--on";
      bEl.textContent =
        `${tf("bundleOn", { pct: bundlePct() })} — ${t("saved")} ${money(saving)}`;
      subRow.hidden = false;
      $("#cartSub").textContent = money(sub);
    } else {
      subRow.hidden = true;
      bEl.hidden = !state.cart.length;
      bEl.className = "cart__bundle";
      const nt = nextTier(cartCount());
      bEl.textContent = nt
        ? tf(nt.min - cartCount() > 1 ? "bundleAdd2" : "bundleAdd1", { pct: nt.pct })
        : "";
    }

    $("#cartTotal").textContent = money(total);
    $("#cartSplit").innerHTML = total
      ? `${t("splitPay")} <b>${money(ceilUnit(total / SALLA.instalments))}</b>`
      : "";
    const go = $("#checkout");
    const lbl = isOpen() ? T.checkoutBtn : T.opensSoon;
    go.dataset.ar = lbl.ar; go.dataset.en = lbl.en;
    go.textContent = lbl[state.lang];
    go.disabled = !state.cart.length || !isOpen();

    // free-shipping meter
    const left = Math.max(0, SALLA.freeShipping - total);
    const pct = Math.min(100, (total / SALLA.freeShipping) * 100);
    $("#cartFree").innerHTML = left
      ? `${t("freeLeft")} <b>${money(left)}</b> ${t("freeLeft2")}
         <span class="cart__bar"><i style="width:${pct}%"></i></span>`
      : `<b>${t("freeGot")}</b><span class="cart__bar"><i style="width:100%"></i></span>`;

    bumpCount();
    renderObar();
  }

  /* ---- sticky order bar (mobile) ----
     Empty cart: "Start your order" → the order box.
     Items in cart: the running total → opens the cart. */
  function renderObar() {
    const go = $("#obarGo");
    if (!go) return;
    const n = cartCount();
    const best = Math.max(...BUNDLE.tiers.map((x) => x.pct));
    if (n) {
      $("#obarT").textContent = money(cartTotal());
      $("#obarT").dir = "ltr";
      $("#obarS").textContent = tf("obarIn", { n });
      $("#obarC").textContent = t("obarCart");
    } else {
      $("#obarT").textContent = t("obarGo");
      $("#obarT").dir = "";
      $("#obarS").textContent = tf("obarSub", { pct: best });
      $("#obarC").textContent = t("obarBtn");
    }
  }

  function obarInit() {
    const bar = $("#obar");
    const go = $("#obarGo");
    if (!bar || !go) return;
    const cta = $(".hero__cta");
    const zones = ["#bundle", "#shop"].map((id) => $(id)).filter(Boolean);

    go.addEventListener("click", () => {
      if (cartCount()) { openCart(true); return; }
      const box = $("#shop");
      if (box) box.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const past = cta ? cta.getBoundingClientRect().bottom < 0 : window.scrollY > vh;
      const inZone = zones.some((z) => {
        const r = z.getBoundingClientRect();
        return r.top < vh * 0.8 && r.bottom > vh * 0.2;
      });
      const on = past && !inZone;
      if (bar.classList.contains("on") === on) return;
      bar.classList.toggle("on", on);
      bar.setAttribute("aria-hidden", String(!on));
      go.tabIndex = on ? 0 : -1;
      document.body.classList.toggle("obar-on", on);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    // a reload restores the old scroll position after init, without a scroll event
    window.addEventListener("load", onScroll);
    update();
  }

  /* ---- drawer ---- */
  function openCart(open) {
    if (open) {
      const sheet = $("#teamSheet");
      if (sheet && sheet.classList.contains("open")) openTeamSheet(false);
      if ($("#offer") && $("#offer").classList.contains("open")) openOffer(false);
    }
    $("#cart").classList.toggle("open", open);
    $("#cart").setAttribute("aria-hidden", String(!open));
    $("#cartBtn").setAttribute("aria-expanded", String(open));
    $("#scrim").hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  }

  /* =========================================================
     CHECKOUT
     Demo mode until SALLA.domain + product sallaIds are filled.
     See README.md → "Wiring this storefront to Salla".
     ========================================================= */
  function checkout() {
    if (!state.cart.length) return;
    if (!isOpen()) { toast(t("opensSoon")); return; }

    // Tier 0 — Shopify hosted checkout via cart permalink: the whole
    // basket goes straight into payment. Only the checkout page is
    // Shopify's; the storefront stays this site.
    if (typeof SHOPIFY !== "undefined" && SHOPIFY.domain) {
      const parts = [];
      let allMapped = true;
      for (const l of state.cart) {
        const vid = SHOPIFY.variants[`${l.pid}-${l.ed}-${l.size}`];
        if (!vid) { allMapped = false; break; }
        parts.push(`${vid}:${l.qty}`);
      }
      if (allMapped && parts.length) {
        // ?locale keeps Shopify's checkout in the language the customer is browsing in.
        window.location.href = `https://${SHOPIFY.domain}/cart/${parts.join(",")}?locale=${state.lang === "en" ? "en" : "ar"}`;
        return;
      }
    }

    // Tier 1 — Salla Instant Purchase: single-line carts only, store live.
    if (SALLA.domain && state.cart.length === 1) {
      const line = state.cart[0];
      const p = prod(line.pid);
      if (p.instantUrl) { window.location.href = p.instantUrl; return; }
    }

    // Tier 2 — WhatsApp order: works before Salla exists, and is the
    // multi-item path after (instant links carry one product each).
    if (SALLA.whatsapp) {
      const lines = state.cart.map((l) => {
        const p = prod(l.pid);
        const e = ed(l.ed);
        return `• ${p.ar} — ${e.ar} — ${SIZES[l.size].ar} × ${l.qty} (${money(unitPrice(l.pid, l.size) * l.qty)})`;
      });
      const saving = bundleSaving();
      const msg = [
        t("waIntro"), "", ...lines, "",
        `${t("waTotal")}: ${money(cartTotal())}` +
          (saving ? ` (${t("waBundle")})` : "")
      ].join("\n");
      window.open(
        `https://wa.me/${SALLA.whatsapp}?text=${encodeURIComponent(msg)}`,
        "_blank", "noopener"
      );
      toast(t("waSent"));
      return;
    }

    // Tier 3 — demo mode: nothing configured yet.
    const order = {
      currency: state.cur,
      total: cartTotal(),
      items: state.cart.map((l) => ({
        sallaId: prod(l.pid).sallaId,
        sku: `${l.pid}-${l.ed}-${l.size}`,
        name: prod(l.pid).ar,
        edition: ed(l.ed).ar,
        size: SIZES[l.size].ar,
        qty: l.qty,
        unitPrice: unitPrice(l.pid, l.size)
      }))
    };
    console.group("SoodiHoodi — checkout payload (demo mode)");
    console.log(order);
    console.groupEnd();
    toast(t("demoNote"));
  }

  /* =========================================================
     CURRENCY PICKER
     Every <select data-cur> on the page (cart, footer) stays in sync.
     ========================================================= */
  function renderCurPickers() {
    $$("select[data-cur]").forEach((sel) => {
      sel.setAttribute("aria-label", t("curLabel"));
      sel.innerHTML = MARKETS.list
        .map((m) => `<option value="${m.cur}"${m.cur === state.cur ? " selected" : ""}>${
          state.lang === "ar" ? `${m.nameAr} · ${m.ar}` : `${m.nameEn} · ${m.en}`}</option>`)
        .join("");
    });
  }
  // keep = the visitor picked it themselves, so remember it.
  function setCur(cur, keep = true) {
    if (keep) { try { localStorage.setItem(LS.cur, cur); } catch (e) {} }
    if (!mkt(cur) || cur === state.cur) return;
    state.cur = cur;
    renderCurPickers();
    renderShop();
    renderPacks();
    renderBuild();
    renderKits();
    renderCart();
  }

  /* =========================================================
     LANGUAGE
     ========================================================= */
  function applyLang(lang) {
    state.lang = lang;
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === "ar" ? "rtl" : "ltr";
    html.dataset.lang = lang;

    $$("[data-ar]").forEach((el) => {
      const v = el.dataset[lang];
      if (v != null) el.textContent = v;
    });
    // Placeholders, screen-reader labels and alt text follow the language too.
    const sfx = lang === "ar" ? "Ar" : "En";
    $$("[data-ph-ar]").forEach((el) => { const v = el.dataset["ph" + sfx]; if (v) el.placeholder = v; });
    $$("[data-al-ar]").forEach((el) => { const v = el.dataset["al" + sfx]; if (v) el.setAttribute("aria-label", v); });
    $$("[data-alt-ar]").forEach((el) => { const v = el.dataset["alt" + sfx]; if (v) el.alt = v; });

    save();
    renderCurPickers();
    renderSwatches();
    renderTeamSheet();
    renderRail();
    renderShop();
    renderPacks();
    renderBuild();
    renderKits();
    renderCart();
    applyEdition(state.edition, false);
  }

  /* =========================================================
     UTILITIES
     ========================================================= */
  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px" }
  );

  function observe(els) {
    els.forEach((el, i) => {
      el.classList.add("io");
      el.style.transitionDelay = `${Math.min(i, 6) * 70}ms`;
      io.observe(el);
    });
  }
  // Neon section numbers flicker on like stadium signage when they come into view.
  // They are visible from the start; the flicker only plays on top.
  document.querySelectorAll(".sec-h__num").forEach((el) => io.observe(el));

  /* =========================================================
     HERO TILT — pointer-driven pseudo-3D on the product shot
     ========================================================= */
  function tiltInit() {
    const stage = $(".stage");
    const img = $("#heroShot");
    if (!stage || !img) return;
    // fine pointers only: on touch this would fight page scrolling
    if (!matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    stage.addEventListener("pointermove", (ev) => {
      const r = stage.getBoundingClientRect();
      const x = (ev.clientX - r.left) / r.width;
      const y = (ev.clientY - r.top) / r.height;
      stage.classList.add("tilting");
      stage.classList.remove("untilting");
      img.style.transform =
        `rotateX(${(0.5 - y) * 14}deg) rotateY(${(x - 0.5) * 18}deg) scale(1.03)`;
      stage.style.setProperty("--mx", `${x * 100}%`);
      stage.style.setProperty("--my", `${y * 100}%`);
    });
    stage.addEventListener("pointerleave", () => {
      stage.classList.remove("tilting");
      stage.classList.add("untilting");
      img.style.transform = "";
      // hand the float animation back once the reset transition ends
      setTimeout(() => { stage.classList.remove("untilting"); }, 550);
    });
  }

  /* =========================================================
     SCROLL CINEMATIC — zoom into the TV, goal, zoom back out
     ========================================================= */
  function cineInit() {
    const sec = $("#cine");
    if (!sec || sec.hidden) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sec.classList.add("cine--static");
      return;
    }
    const vid = $(".cine__vid", sec),
          goal = $(".cine__goal span", sec), goalWrap = $(".cine__goal", sec),
          flash = $(".cine__flash", sec),
          end = $(".cine__end", sec), hint = $(".cine__hint", sec);
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const win = (p, a, b) => clamp((p - a) / (b - a), 0, 1);

    let dur = 8; // fallback until metadata arrives
    vid.addEventListener("loadedmetadata", () => { dur = vid.duration || dur; });
    vid.pause();

    // Scrubbing needs a fully-seekable source. Fetching the clip into a blob
    // guarantees that regardless of the server's Range-request support, and
    // makes seeks instant since the whole file is in memory (~3 MB).
    fetch(vid.getAttribute("src"))
      .then((r) => r.blob())
      .then((b) => {
        const at = vid.currentTime;
        vid.src = URL.createObjectURL(b);
        vid.load();
        vid.addEventListener("loadedmetadata", () => {
          dur = vid.duration || dur;
          vid.currentTime = at;
          frame();
        }, { once: true });
      })
      .catch(() => {}); // fall back to the original src

    function frame() {
      const total = sec.offsetHeight - innerHeight;
      const p = clamp(-sec.getBoundingClientRect().top / total, 0, 1);

      // Scroll position drives the film. The last 8% holds the final frame
      // so the CTA can breathe over a settled image.
      const t = Math.min(p / 0.92, 1) * dur;
      if (vid.readyState >= 1 && Math.abs(vid.currentTime - t) > 0.02) {
        vid.currentTime = t;
      }

      // the goal call — timed to the eruption in the clip
      flash.style.opacity = win(p, 0.42, 0.46) * (1 - win(p, 0.5, 0.58));
      goalWrap.style.opacity = win(p, 0.44, 0.5) - win(p, 0.72, 0.8);
      goal.style.transform = `scale(${0.5 + win(p, 0.44, 0.54) * 0.55}) rotate(-3deg)`;

      end.style.opacity = win(p, 0.86, 0.96);
      end.style.pointerEvents = p > 0.88 ? "auto" : "none";
      hint.style.opacity = p < 0.06 ? 1 : 0;
    }
    let tick = false;
    addEventListener("scroll", () => {
      if (!tick) { tick = true; requestAnimationFrame(() => { frame(); tick = false; }); }
    }, { passive: true });
    addEventListener("resize", frame);
    frame();
  }

  /* =========================================================
     HERO TOUR — cycle every edition once on load so visitors
     discover the five team colours without touching anything.
     Stops the moment the user interacts.
     ========================================================= */
  function heroTour() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ids = EDITIONS.filter((e) => !e.comingSoon).map((e) => e.id);
    if (ids.length < 2) return;

    // warm the cache so swaps never flash
    ids.forEach((id) => { const e = ed(id); const i = new Image(); i.src = e.cut || e.img; });

    let i = ids.indexOf(state.edition);
    if (i < 0) i = 0;
    let steps = 0;
    const timer = setInterval(() => {
      if (document.hidden) return;
      i = (i + 1) % ids.length;
      steps++;
      applyEdition(ids[i], false);
      if (steps >= ids.length) stop(); // one full lap, back where we started
    }, 2600);
    const stop = () => clearInterval(timer);
    ["pointerdown", "keydown", "wheel", "touchstart"].forEach((ev) =>
      addEventListener(ev, stop, { once: true, passive: true })
    );
  }


  /* =========================================================
     HERO SWIPE — swipe the family photo left/right to change team
     ========================================================= */
  function swipeInit() {
    const stage = $(".bigstage");
    if (!stage) return;
    const ids = () => EDITIONS.filter((e) => !e.comingSoon).map((e) => e.id);
    const step = (dir) => {
      const list = ids();
      let i = list.indexOf(state.edition);
      if (i < 0) i = 0;
      i = (i + dir + list.length) % list.length;
      applyEdition(list[i], true);
    };
    let x0 = null, y0 = null;
    stage.addEventListener("pointerdown", (ev) => { x0 = ev.clientX; y0 = ev.clientY; }, { passive: true });
    stage.addEventListener("pointerup", (ev) => {
      if (x0 == null) return;
      const dx = ev.clientX - x0, dy = ev.clientY - y0;
      x0 = null;
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      step(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  /* =========================================================
     BOOT
     ========================================================= */
  function init() {
    if (isOpen()) $$(".pl").forEach((el) => el.remove());
    // Only claim VAT is included once the store is actually VAT-registered.
    const vat = $("#cartVat");
    if (vat) vat.hidden = !SALLA.vatRegistered;

    if (state.lang !== "ar") applyLang(state.lang);
    else {
      renderCurPickers();
      renderSwatches();
      renderTeamSheet();
      renderRail();
      renderShop();
      renderPacks();
      renderBuild();
      renderKits();
      renderCart();
      applyEdition(state.edition, false);
    }

    // static reveals
    observe($$(".sec-h, .why__c, .rev, .acc__i, .tbl-wrap, .fab__art, .fab__copy, .strip__in"));

    offerInit();
    obarInit();
    famInit();
    $("#shopTeam")?.addEventListener("click", () => openTeamSheet(true));
    cineInit();
    tiltInit();
    swipeInit();
    /* The hero used to auto-cycle all five editions on load. It existed to
       make the picker discoverable — a job the header chip and its one-time
       pulse now do without hijacking the first impression, which has to stay
       on the default edition. heroTour() is left below, unused, if you ever
       want it back. */

    // header shadow on scroll — and, once per session, a nudge on the team
    // chip the first time the hero picker scrolls away, which is the exact
    // moment the switcher stops being visible on the page itself.
    const hdr = $("#hdr");
    const bar = $(".swatchbar");
    const chip = $("#teamBtn");
    let hinted = true;
    try { hinted = !!sessionStorage.getItem("sh_chip_hint"); } catch (e) {}

    const onScroll = () => {
      hdr.classList.toggle("stuck", window.scrollY > 12);
      if (hinted || !bar || !chip) return;
      if (bar.getBoundingClientRect().bottom > 0) return;
      hinted = true;
      try { sessionStorage.setItem("sh_chip_hint", "1"); } catch (e) {}
      chip.classList.add("hint");
      setTimeout(() => chip.classList.remove("hint"), 5200);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    hdr.classList.toggle("stuck", window.scrollY > 12);

    // cart wiring
    $("#cartBtn").addEventListener("click", () => openCart(true));
    $("#cartClose").addEventListener("click", () => openCart(false));
    $("#teamBtn").addEventListener("click", () =>
      openTeamSheet(!$("#teamSheet").classList.contains("open"))
    );
    $("#teamClose").addEventListener("click", () => openTeamSheet(false));
    $("#scrim").addEventListener("click", () => {
      openCart(false); openTeamSheet(false);
      if ($("#offer").classList.contains("open")) { markOffer("dismissed"); openOffer(false); }
    });
    $("#checkout").addEventListener("click", checkout);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if ($("#cart").classList.contains("open") || $("#teamSheet").classList.contains("open")) {
          openCart(false); openTeamSheet(false); return;
        }
        leaveFam();
        if ($("#offer").classList.contains("open")) { markOffer("dismissed"); openOffer(false); }
      }
    });

    // currency picker
    $$("select[data-cur]").forEach((sel) =>
      sel.addEventListener("change", () => setCur(sel.value))
    );

    /* Country from the visitor's IP (Cloudflare, via our chat worker).
       The time-zone guess above shows instantly; this corrects it a moment
       later. A GCC country gets its own currency, anywhere else gets OMR.
       Skipped when the visitor has picked a currency themselves. */
    let picked = null;
    try { picked = localStorage.getItem(LS.cur); } catch (e) {}
    if (!picked && MARKETS.geo && window.fetch) {
      const ctl = window.AbortController ? new AbortController() : null;
      if (ctl) setTimeout(() => ctl.abort(), 2500);
      fetch(MARKETS.geo, ctl ? { signal: ctl.signal } : {})
        .then((r) => r.json())
        .then((d) => {
          const cc = String((d && d.country) || "").toUpperCase();
          if (!/^[A-Z]{2}$/.test(cc)) return;
          const m = MARKETS.list.find((x) => x.cc === cc);
          setCur(m ? m.cur : MARKETS.base, false);
        })
        .catch(() => {});
    }

    // language toggle
    $("#langBtn").addEventListener("click", () =>
      applyLang(state.lang === "ar" ? "en" : "ar")
    );

    // smooth anchors that respect the sticky header
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length < 2) return;
        const target = $(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
