/* SoodiHoodi — language toggle for the about / policy pages.
   Shares the "sh_lang" choice with the main store, so a shopper who
   browses in English stays in English when they open a policy. */
(function () {
  var KEY = "sh_lang";
  var root = document.documentElement;
  function apply(lang) {
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang);
    root.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    var t = document.querySelector("[data-title-" + lang + "]");
    if (t) document.title = t.getAttribute("data-title-" + lang);
  }
  var btn = document.getElementById("langBtn");
  if (btn) btn.addEventListener("click", function () {
    var next = root.getAttribute("data-lang") === "ar" ? "en" : "ar";
    try { localStorage.setItem(KEY, next); } catch (e) {}
    apply(next);
  });
  apply(root.getAttribute("data-lang") || "ar");
  /* /about/#contact lands on the contact box of whichever language is showing */
  if (location.hash === "#contact") {
    addEventListener("load", function () {
      var boxes = document.querySelectorAll(".contact");
      for (var i = 0; i < boxes.length; i++) {
        if (boxes[i].offsetParent !== null) { boxes[i].scrollIntoView({ block: "center" }); break; }
      }
    });
  }
})();
