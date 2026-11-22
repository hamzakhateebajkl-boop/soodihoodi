/* =========================================================
   SoodiHoodi — ad measurement (Meta, TikTok, Snapchat pixels)
   Nothing loads until the visitor taps "OK" on the consent bar.
   The choice is kept in localStorage ("sh_consent": "yes" | "no").
   Pixel IDs are public identifiers, not secrets.
   Purchases are tracked on Shopify's checkout (Facebook & Instagram
   channel, and the TikTok/Snap Shopify apps), not here.
   app.js calls window.SHT.track(name, data) for:
     ViewContent, AddToCart, InitiateCheckout, Lead
   data: { value, currency, ids: [...], qty }
   ========================================================= */
(function () {
  var PIX = {
    meta: "1452624470352088",
    tiktok: "DC187L3C77U4QHD87QN0",
    snap: "db9e9148-853e-4689-8a8d-1edf5c2cba8a"
  };
  var KEY = "sh_consent";
  var loaded = false;

  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function isEn() {
    var r = document.documentElement;
    return r.getAttribute("data-lang") === "en" || r.getAttribute("lang") === "en";
  }

  function load() {
    if (loaded) return;
    loaded = true;

    /* Meta pixel */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", PIX.meta);
    window.fbq("track", "PageView");

    /* TikTok pixel */
    !function (w, d, t) {
      w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || [];
      ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie", "holdConsent", "revokeConsent", "grantConsent"];
      ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; };
      for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.instance = function (t) { for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]); return e; };
      ttq.load = function (e, n) {
        var r = "https://analytics.tiktok.com/i18n/pixel/events.js";
        ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = r; ttq._t = ttq._t || {}; ttq._t[e] = +new Date; ttq._o = ttq._o || {}; ttq._o[e] = n || {};
        var o = d.createElement("script"); o.type = "text/javascript"; o.async = !0; o.src = r + "?sdkid=" + e + "&lib=" + t;
        var a = d.getElementsByTagName("script")[0]; a.parentNode.insertBefore(o, a);
      };
      ttq.load(PIX.tiktok); ttq.page();
    }(window, document, "ttq");

    /* Snap pixel */
    (function (e, t, n) {
      if (e.snaptr) return; var a = e.snaptr = function () { a.handleRequest ? a.handleRequest.apply(a, arguments) : a.queue.push(arguments); };
      a.queue = []; var s = "script", r = t.createElement(s); r.async = !0; r.src = n;
      var u = t.getElementsByTagName(s)[0]; u.parentNode.insertBefore(r, u);
    })(window, document, "https://sc-static.net/scevent.min.js");
    window.snaptr("init", PIX.snap, {});
    window.snaptr("track", "PAGE_VIEW");

    // The home page is the product page.
    if (location.pathname === "/" || location.pathname === "/index.html") track("ViewContent", {});
  }

  var MAP = {
    ViewContent:      { meta: "ViewContent",      tt: "ViewContent",      snap: "VIEW_CONTENT" },
    AddToCart:        { meta: "AddToCart",        tt: "AddToCart",        snap: "ADD_CART" },
    InitiateCheckout: { meta: "InitiateCheckout", tt: "InitiateCheckout", snap: "START_CHECKOUT" },
    Lead:             { meta: "Lead",             tt: "SubmitForm",       snap: "SIGN_UP" }
  };

  function track(name, d) {
    if (!loaded || !MAP[name]) return;
    d = d || {};
    var m = MAP[name], ids = d.ids || [];
    try {
      var meta = { content_type: "product" };
      if (ids.length) meta.content_ids = ids;
      if (d.value != null) { meta.value = d.value; meta.currency = d.currency; }
      if (d.qty) meta.num_items = d.qty;
      window.fbq("track", m.meta, meta);
    } catch (e) {}
    try {
      var tt = { content_type: "product" };
      if (ids.length) tt.contents = ids.map(function (id) { return { content_id: String(id) }; });
      if (d.value != null) { tt.value = d.value; tt.currency = d.currency; }
      window.ttq.track(m.tt, tt);
    } catch (e) {}
    try {
      var sn = {};
      if (ids.length) sn.item_ids = ids.map(String);
      if (d.value != null) { sn.price = d.value; sn.currency = d.currency; }
      if (d.qty) sn.number_items = d.qty;
      window.snaptr("track", m.snap, sn);
    } catch (e) {}
  }

  window.SHT = { track: track };

  function bar() {
    var en = isEn();
    var el = document.createElement("div");
    el.id = "shConsent";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", en ? "Cookies" : "ملفات تعريف الارتباط");
    el.dir = en ? "ltr" : "rtl";
    el.style.cssText = "position:fixed;left:12px;right:12px;bottom:12px;z-index:2147483000;max-width:560px;margin:0 auto;" +
      "background:#0B1220;color:#F7F8FA;border-radius:14px;padding:14px 16px;box-shadow:0 8px 28px rgba(0,0,0,.35);" +
      "font:14px/1.6 'Noto Kufi Arabic',Tahoma,Arial,sans-serif;display:flex;gap:12px;align-items:center;flex-wrap:wrap";
    var txt = en
      ? 'We use cookies to measure our ads on Instagram, TikTok and Snapchat. <a href="/privacy/" style="color:#F2B233">Privacy</a>'
      : 'نستخدم ملفات تعريف الارتباط لقياس أداء إعلاناتنا على انستقرام وتيك توك وسناب شات. <a href="/privacy/" style="color:#F2B233">الخصوصية</a>';
    el.innerHTML = '<p style="margin:0;flex:1 1 260px">' + txt + '</p>' +
      '<span style="display:flex;gap:8px">' +
      '<button type="button" data-c="no" style="font:inherit;font-weight:700;padding:8px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.4);background:transparent;color:#F7F8FA;cursor:pointer">' + (en ? "No thanks" : "لا شكراً") + '</button>' +
      '<button type="button" data-c="yes" style="font:inherit;font-weight:700;padding:8px 16px;border-radius:999px;border:0;background:#F2B233;color:#0B1220;cursor:pointer">' + (en ? "OK" : "موافق") + '</button>' +
      '</span>';
    el.addEventListener("click", function (ev) {
      var b = ev.target.closest && ev.target.closest("button[data-c]");
      if (!b) return;
      var v = b.getAttribute("data-c");
      set(v);
      el.remove();
      if (v === "yes") load();
    });
    document.body.appendChild(el);
  }

  function start() {
    var c = get();
    if (c === "yes") load();
    else if (c !== "no") bar();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
