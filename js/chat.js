/* =========================================================
   SoodiHoodi — chat assistant bubble
   ---------------------------------------------------------
   Talks to the Cloudflare Worker in /chat-worker/worker.js,
   which holds the Anthropic key and the store knowledge.
   Leave `endpoint` empty to hide the chat completely.
   ========================================================= */
(function () {
  var CHAT = {
    endpoint: "https://soodihoodi-chat.hamzakhateebajkl.workers.dev",
    whatsapp: "96877083190",
    storageKey: "sh_chat_v1",
    maxTurns: 12
  };
  if (!CHAT.endpoint || window.__shChat) return;
  window.__shChat = true;

  var T = {
    fab:      { ar: "اسألنا",                          en: "Ask us" },
    title:    { ar: "مساعد SoodiHoodi",                en: "SoodiHoodi assistant" },
    status:   { ar: "يرد فوراً · مقاسات، توصيل، استرجاع", en: "Instant replies · sizes, delivery, returns" },
    hello:    { ar: "هلا والله! أنا مساعد SoodiHoodi. اسألني عن المقاسات، الإصدارات، التوصيل أو الاسترجاع، وأنا حاضر.",
                en: "Hi! I'm the SoodiHoodi assistant. Ask me about sizes, editions, delivery or returns." },
    ph:       { ar: "اكتب سؤالك هنا…",                 en: "Type your question…" },
    send:     { ar: "إرسال",                           en: "Send" },
    close:    { ar: "إغلاق",                           en: "Close" },
    waTitle:  { ar: "كلّمنا على واتساب",                en: "Chat with us on WhatsApp" },
    waBtn:    { ar: "كمّل مع الفريق على واتساب",         en: "Continue with our team on WhatsApp" },
    waMsg:    { ar: "هلا SoodiHoodi، عندي سؤال: ",       en: "Hi SoodiHoodi, I have a question: " },
    note:     { ar: "مساعد ذكي وقد يخطئ أحياناً. للطلبات والمشاكل كلّمنا على واتساب.",
                en: "AI assistant, it can make mistakes. For orders and issues, message us on WhatsApp." },
    err:      { ar: "صار عندي خلل بسيط. جرّب مرة ثانية، أو كلّمنا على واتساب.",
                en: "Something went wrong on my side. Try again, or message us on WhatsApp." },
    busy:     { ar: "وصلت لحد الأسئلة مؤقتاً. كلّمنا على واتساب ونخدمك.",
                en: "You've reached the question limit for now. Message us on WhatsApp and we'll help." },
    chips: {
      ar: ["وش المقاس المناسب لي؟", "كم ياخذ التوصيل؟", "كيف أرجّع أو أبدّل؟", "وش خصم العائلة؟"],
      en: ["Which size fits me?", "How long is delivery?", "How do returns work?", "What's the family discount?"]
    }
  };
  var ICON = {
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12Z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>'
  };

  var root = document.documentElement;
  function lang() { return root.getAttribute("data-lang") === "en" ? "en" : "ar"; }
  function t(k) { return T[k][lang()]; }

  // stylesheet
  var css = document.createElement("link");
  css.rel = "stylesheet"; css.href = "/css/chat.css?v=1";
  document.head.appendChild(css);

  // DOM
  var box = document.createElement("div");
  box.className = "shc";
  box.innerHTML =
    '<button class="shc-fab" type="button" aria-haspopup="dialog" aria-expanded="false">' + ICON.chat +
      '<span class="lbl" data-k="fab"></span><span class="dot" aria-hidden="true"></span></button>' +
    '<section class="shc-panel" role="dialog" aria-modal="false" aria-labelledby="shcTitle">' +
      '<header class="shc-hd"><div class="shc-av">' + ICON.chat + '</div>' +
        '<div class="shc-ti"><b id="shcTitle" data-k="title"></b><span><i></i><em data-k="status" style="font-style:normal"></em></span></div>' +
        '<a class="shc-ib shc-wahd" target="_blank" rel="noopener">' + ICON.wa + '</a>' +
        '<button class="shc-ib shc-x" type="button">' + ICON.close + '</button></header>' +
      '<div class="shc-log" aria-live="polite"></div>' +
      '<div class="shc-chips"></div>' +
      '<form class="shc-f"><textarea class="shc-in" rows="1" maxlength="600"></textarea>' +
        '<button class="shc-send" type="submit">' + ICON.send + '</button></form>' +
      '<div class="shc-note" data-k="note"></div>' +
    '</section>';
  document.body.appendChild(box);

  var fab = box.querySelector(".shc-fab"), panel = box.querySelector(".shc-panel"),
      log = box.querySelector(".shc-log"), chips = box.querySelector(".shc-chips"),
      form = box.querySelector(".shc-f"), input = box.querySelector(".shc-in"),
      sendBtn = box.querySelector(".shc-send"), waHd = box.querySelector(".shc-wahd"),
      closeBtn = box.querySelector(".shc-x");

  var history = [];
  try { history = JSON.parse(sessionStorage.getItem(CHAT.storageKey) || "[]"); } catch (e) { history = []; }
  var busy = false;

  function save() { try { sessionStorage.setItem(CHAT.storageKey, JSON.stringify(history.slice(-30))); } catch (e) {} }
  function waLink(q) { return "https://wa.me/" + CHAT.whatsapp + "?text=" + encodeURIComponent(t("waMsg") + (q || "")); }
  function lastQuestion() { for (var i = history.length - 1; i >= 0; i--) if (history[i].role === "user") return history[i].content; return ""; }

  function esc(s) { return s.replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function linkify(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/(https?:\/\/[^\s)]+|(?:www\.)?soodihoodi\.com[^\s)،,]*)/g, function (u) {
        var href = /^https?:/.test(u) ? u : "https://" + u.replace(/^www\./, "");
        return '<a href="' + href + '">' + u + "</a>";
      })
      .replace(/(sales@soodihoodi\.com)/g, '<a href="mailto:$1">$1</a>');
  }

  function bubble(role, text, extra) {
    var d = document.createElement("div");
    d.className = "shc-m " + (role === "user" ? "me" : "bot") + (extra ? " " + extra : "");
    d.setAttribute("dir", "auto");
    d.innerHTML = linkify(text);
    log.appendChild(d);
    return d;
  }
  function waButton() {
    var a = document.createElement("a");
    a.className = "shc-wa"; a.target = "_blank"; a.rel = "noopener";
    a.href = waLink(lastQuestion());
    a.innerHTML = ICON.wa + "<span>" + esc(t("waBtn")) + "</span>";
    log.appendChild(a);
  }
  function scroll() { log.scrollTop = log.scrollHeight; }

  function render() {
    box.querySelectorAll("[data-k]").forEach(function (el) { el.textContent = t(el.getAttribute("data-k")); });
    input.placeholder = t("ph");
    sendBtn.setAttribute("aria-label", t("send"));
    closeBtn.setAttribute("aria-label", t("close"));
    waHd.setAttribute("aria-label", t("waTitle")); waHd.title = t("waTitle");
    waHd.href = waLink("");
    fab.setAttribute("aria-label", t("fab"));
    log.innerHTML = "";
    bubble("assistant", t("hello"));
    history.forEach(function (m) {
      bubble(m.role, m.content);
      if (m.handoff) waButton();
    });
    chips.innerHTML = "";
    if (!history.length) {
      T.chips[lang()].forEach(function (q) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "shc-chip"; b.textContent = q;
        b.addEventListener("click", function () { ask(q); });
        chips.appendChild(b);
      });
    }
    scroll();
  }

  function open(on) {
    box.classList.toggle("open", on);
    fab.setAttribute("aria-expanded", on ? "true" : "false");
    if (on) { render(); setTimeout(function () { input.focus(); }, 250); }
  }

  function ask(q) {
    q = (q || "").trim();
    if (!q || busy) return;
    busy = true; sendBtn.disabled = true; chips.innerHTML = "";
    history.push({ role: "user", content: q.slice(0, 600) }); save();
    bubble("user", q);
    input.value = ""; grow();
    var typing = document.createElement("div");
    typing.className = "shc-typing"; typing.innerHTML = "<i></i><i></i><i></i>";
    log.appendChild(typing); scroll();

    var payload = {
      lang: lang(),
      page: location.pathname,
      messages: history.slice(-CHAT.maxTurns).map(function (m) { return { role: m.role, content: m.content }; })
    };
    fetch(CHAT.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, status: r.status, d: d }; }); })
      .then(function (res) {
        typing.remove();
        if (!res.ok || !res.d.reply) {
          bubble("assistant", res.status === 429 ? t("busy") : t("err"), "err");
          waButton();
          history.pop(); save();
          return;
        }
        history.push({ role: "assistant", content: res.d.reply, handoff: !!res.d.handoff }); save();
        bubble("assistant", res.d.reply);
        if (res.d.handoff) waButton();
      })
      .catch(function () {
        typing.remove();
        bubble("assistant", t("err"), "err"); waButton();
        history.pop(); save();
      })
      .then(function () { busy = false; sendBtn.disabled = false; scroll(); });
  }

  function grow() { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 110) + "px"; }

  fab.addEventListener("click", function () { open(true); });
  closeBtn.addEventListener("click", function () { open(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && box.classList.contains("open")) open(false); });
  form.addEventListener("submit", function (e) { e.preventDefault(); ask(input.value); });
  input.addEventListener("input", grow);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); ask(input.value); }
  });

  // follow the site's language switch
  new MutationObserver(function () { render(); }).observe(root, { attributes: true, attributeFilter: ["data-lang"] });
  render();
})();
