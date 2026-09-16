/* =========================================================
   SoodiHoodi — storefront logic
   Edition theming · cart · AR/EN · scroll reveals
   ========================================================= */
(function () {
  "use strict";

  /* ---------------- state ---------------- */
  const LS = { cart: "sh_cart", ed: "sh_edition", lang: "sh_lang" };

  const state = {
    lang: localStorage.getItem(LS.lang) || "ar",
    edition: localStorage.getItem(LS.ed) || EDITIONS[0].id,
    cart: JSON.parse(localStorage.getItem(LS.cart) || "[]"),
    picked: {} // productId -> sizeKey
  };

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const t  = (k) => (T[k] ? T[k][state.lang] : k);
  const ed = (id) => EDITIONS.find((e) => e.id === id) || EDITIONS[0];
  const prod = (id) => PRODUCTS.find((p) => p.id === id);
  const money = (n) => `${Number(n).toLocaleString("en-US")} ${t("sar")}`;

  // Prices vary by size (adult vs kids), so every lookup needs both.
  const unitPrice = (pid, size) => prod(pid).prices[size];
  const wasPrice  = (pid, size) => (prod(pid).compareAt || {})[size];
  const save = () => {
    localStorage.setItem(LS.cart, JSON.stringify(state.cart));
    localStorage.setItem(LS.ed, state.edition);
    localStorage.setItem(LS.lang, state.lang);
  };

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
      hero.alt = `${state.lang === "ar" ? "سودي هودي" : "SoodiHoodi"} — ${e[state.lang]}`;
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

    $$(".sw").forEach((b) =>
      b.setAttribute("aria-checked", String(b.dataset.ed === e.id))
    );
    $$(".edc").forEach((c) =>
      c.setAttribute("aria-current", String(c.dataset.ed === e.id))
    );

    save();
    if (announce) toast(`${t("edSwitched")} ${e[state.lang]}`);
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
        <span class="sw__img"><img src="${e.img}" alt="" loading="lazy" width="120" height="120"></span>
        <i class="sw__bar" aria-hidden="true" style="background:${e.primary}">
          <b style="position:absolute;inset-block:0;inset-inline-end:0;width:38%;background:${e.secondary}"></b>
        </i>
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
          : `<span class="edc__sw" aria-hidden="true">
              <span style="background:${e.primary}"></span>
              <span style="background:${e.secondary}"></span>
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

      return `
      <article class="pc io" data-p="${p.id}">
        <span class="pc__tag">${state.lang === "ar" ? p.badgeAr : p.badgeEn}</span>
        <div class="pc__art">${shot(null)}</div>
        <h3 class="pc__t">${p[state.lang]}</h3>
        <p class="pc__d">${state.lang === "ar" ? p.descAr : p.descEn}</p>

        <div class="pc__price">${priceBlock(p.id, pick)}</div>

        <div class="pc__sizes" role="group" aria-label="${t("chooseSize")}">
          ${p.sizes
            .map(
              (s) => `<button class="szb" type="button" data-size="${s}"
                        aria-pressed="${pick === s}">${SIZES[s][state.lang]}</button>`
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
  function addToCart(pid, size) {
    const key = `${pid}|${size}|${state.edition}`;
    const line = state.cart.find((l) => l.key === key);
    if (line) line.qty += 1;
    else state.cart.push({ key, pid, size, ed: state.edition, qty: 1 });
    save();
    renderCart();
    bumpCount();
    toast(t("added"));
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

  // Family bundle: buy BUNDLE.minQty or more, take BUNDLE.pct off the order.
  const bundleOn = () => cartCount() >= BUNDLE.minQty;
  const bundleSaving = () =>
    bundleOn() ? Math.round((cartSubtotal() * BUNDLE.pct) / 100) : 0;
  const cartTotal = () => cartSubtotal() - bundleSaving();

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
      bEl.textContent = `${t("bundleOn")} — ${t("saved")} ${money(saving)}`;
      subRow.hidden = false;
      $("#cartSub").textContent = money(sub);
    } else {
      subRow.hidden = true;
      bEl.hidden = !state.cart.length;
      bEl.className = "cart__bundle";
      bEl.textContent = t("bundleNudge");
    }

    $("#cartTotal").textContent = money(total);
    $("#cartSplit").innerHTML = total
      ? `${t("splitPay")} <b>${money(Math.ceil(total / SALLA.instalments))}</b>`
      : "";
    $("#checkout").disabled = !state.cart.length;

    // free-shipping meter
    const left = Math.max(0, SALLA.freeShipping - total);
    const pct = Math.min(100, (total / SALLA.freeShipping) * 100);
    $("#cartFree").innerHTML = left
      ? `${t("freeLeft")} <b>${money(left)}</b> ${t("freeLeft2")}
         <span class="cart__bar"><i style="width:${pct}%"></i></span>`
      : `<b>${t("freeGot")}</b><span class="cart__bar"><i style="width:100%"></i></span>`;

    bumpCount();
  }

  /* ---- drawer ---- */
  function openCart(open) {
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
        window.location.href = `https://${SHOPIFY.domain}/cart/${parts.join(",")}`;
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
        return `• ${p.ar} — ${e.ar} — ${SIZES[l.size].ar} × ${l.qty} (${unitPrice(l.pid, l.size) * l.qty} ر.س)`;
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
      currency: SALLA.currency,
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

    save();
    renderSwatches();
    renderRail();
    renderShop();
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
    // Only claim VAT is included once the store is actually VAT-registered.
    const vat = $("#cartVat");
    if (vat) vat.hidden = !SALLA.vatRegistered;

    if (state.lang !== "ar") applyLang(state.lang);
    else {
      renderSwatches();
      renderRail();
      renderShop();
      renderCart();
      applyEdition(state.edition, false);
    }

    // static reveals
    observe($$(".sec-h, .why__c, .rev, .acc__i, .tbl-wrap, .fab__art, .fab__copy, .strip__in"));

    cineInit();
    tiltInit();
    swipeInit();
    addEventListener("load", () => setTimeout(heroTour, 1400), { once: true });

    // header shadow on scroll
    const hdr = $("#hdr");
    const onScroll = () => hdr.classList.toggle("stuck", window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // cart wiring
    $("#cartBtn").addEventListener("click", () => openCart(true));
    $("#cartClose").addEventListener("click", () => openCart(false));
    $("#scrim").addEventListener("click", () => openCart(false));
    $("#checkout").addEventListener("click", checkout);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") openCart(false);
    });

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
