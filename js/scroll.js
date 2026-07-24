/* ============================================================
   Talleres Mateo 2.0 — Consentimiento de cookies (RGPD / LSSI-CE / AEPD)
   Banner de entrada + panel de configuración granular.
   Uso:  <script src="cookie-consent.js"></script>
   Reabrir panel:  window.openCookieSettings()
   Leer consentimiento:  window.getCookieConsent()  -> {necessary, analytics, marketing, ts} | null
   Evento al guardar:  window.addEventListener('tm-cookie-consent', e => e.detail)
   ============================================================ */
(function () {
  "use strict";

  var STORAGE_KEY = "tmateo_cookie_consent_v1";
  var POLICY_URL = "Legal.html#cookies";

  /* ---------- helpers ---------- */
  function read() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); }
    catch (e) { return null; }
  }
  function save(consent) {
    consent.ts = new Date().toISOString();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(consent)); } catch (e) {}
    window.dispatchEvent(new CustomEvent("tm-cookie-consent", { detail: consent }));
  }
  window.getCookieConsent = read;

  /* ---------- styles ---------- */
  var css = `
  .tm-cc, .tm-cc * { box-sizing:border-box; }
  .tm-cc { font-family:'Barlow',system-ui,sans-serif; }

  /* Banner */
  .tm-cc-banner {
    position:fixed; left:1rem; right:1rem; bottom:1rem; z-index:99999;
    max-width:560px; margin:0 auto;
    background:#15171c; color:#fff;
    border:1px solid #2a2d36; border-top:3px solid #f24300;
    border-radius:10px; box-shadow:0 24px 60px #000000a6, 0 4px 14px #00000080;
    padding:1.5rem 1.5rem 1.35rem;
    transform:translateY(160%); opacity:0;
    transition:transform .5s cubic-bezier(.22,.61,.36,1), opacity .4s;
  }
  .tm-cc-banner.tm-show { transform:translateY(0); opacity:1; }
  @media (min-width:680px){ .tm-cc-banner { left:1.5rem; right:auto; bottom:1.5rem; margin:0; } }

  .tm-cc-head { display:flex; align-items:center; gap:.6rem; margin-bottom:.7rem; }
  .tm-cc-ico { width:30px; height:30px; flex-shrink:0; }
  .tm-cc-title {
    font-family:'Bebas Neue','Barlow Condensed',sans-serif; font-size:1.5rem;
    letter-spacing:1.5px; line-height:1; color:#fff;
  }
  .tm-cc-text { color:#c4c7cf; font-size:.92rem; line-height:1.6; margin-bottom:1.1rem; }
  .tm-cc-text a { color:#ff7a45; text-decoration:underline; text-underline-offset:2px; }

  .tm-cc-actions { display:flex; flex-wrap:wrap; gap:.6rem; }
  .tm-cc-btn {
    flex:1 1 auto; min-width:120px; cursor:pointer;
    font-family:'Barlow Condensed',sans-serif; font-weight:700;
    font-size:13.5px; letter-spacing:2px; text-transform:uppercase;
    padding:.8rem 1.1rem; border-radius:4px; border:2px solid transparent;
    transition:all .2s; text-align:center; line-height:1;
  }
  .tm-cc-btn-accept { background:#f24300; border-color:#f24300; color:#fff; box-shadow:0 6px 18px #f2430052; }
  .tm-cc-btn-accept:hover { background:#c73800; border-color:#c73800; transform:translateY(-1px); }
  .tm-cc-btn-reject { background:transparent; border-color:#4a4e58; color:#fff; }
  .tm-cc-btn-reject:hover { border-color:#fff; }
  .tm-cc-btn-config { background:transparent; border-color:transparent; color:#9aa0ab; min-width:0; flex:0 0 auto; text-decoration:underline; text-underline-offset:3px; letter-spacing:1.5px; }
  .tm-cc-btn-config:hover { color:#fff; }

  /* Modal */
  .tm-cc-overlay {
    position:fixed; inset:0; z-index:100000; display:none;
    align-items:center; justify-content:center; padding:1.25rem;
    background:#000000bf; backdrop-filter:blur(4px);
  }
  .tm-cc-overlay.tm-show { display:flex; }
  .tm-cc-modal {
    width:100%; max-width:560px; max-height:88vh; overflow-y:auto;
    background:#15171c; color:#fff; border:1px solid #2a2d36;
    border-top:4px solid #f24300; border-radius:12px;
    box-shadow:0 30px 80px #000000d9;
    transform:translateY(14px) scale(.98); opacity:0;
    transition:transform .35s cubic-bezier(.22,.61,.36,1), opacity .3s;
  }
  .tm-cc-overlay.tm-show .tm-cc-modal { transform:none; opacity:1; }
  .tm-cc-modal-head { padding:1.6rem 1.6rem 1.1rem; border-bottom:1px solid #23262e; position:relative; }
  .tm-cc-modal-title { font-family:'Bebas Neue','Barlow Condensed',sans-serif; font-size:2rem; letter-spacing:1.5px; line-height:1; }
  .tm-cc-modal-sub { color:#9aa0ab; font-size:.88rem; line-height:1.55; margin-top:.5rem; }
  .tm-cc-modal-sub a { color:#ff7a45; text-decoration:underline; }
  .tm-cc-close { position:absolute; top:1.1rem; right:1.2rem; width:34px; height:34px; border:none; background:#23262e; color:#fff; border-radius:50%; cursor:pointer; font-size:1.1rem; line-height:1; transition:background .2s; }
  .tm-cc-close:hover { background:#f24300; }

  .tm-cc-cats { padding:.6rem 1.6rem 0; }
  .tm-cc-cat { padding:1.15rem 0; border-bottom:1px solid #23262e; display:flex; gap:1rem; align-items:flex-start; justify-content:space-between; }
  .tm-cc-cat-info { flex:1; min-width:0; }
  .tm-cc-cat-name { font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:1.05rem; letter-spacing:.8px; text-transform:uppercase; color:#fff; margin-bottom:.3rem; }
  .tm-cc-cat-desc { color:#9aa0ab; font-size:.86rem; line-height:1.55; }

  /* Toggle */
  .tm-cc-switch { position:relative; flex-shrink:0; width:46px; height:26px; }
  .tm-cc-switch input { opacity:0; width:0; height:0; position:absolute; }
  .tm-cc-slider { position:absolute; inset:0; cursor:pointer; background:#3a3d46; border-radius:26px; transition:background .25s; }
  .tm-cc-slider:before { content:""; position:absolute; height:18px; width:18px; left:4px; top:4px; background:#fff; border-radius:50%; transition:transform .25s; }
  .tm-cc-switch input:checked + .tm-cc-slider { background:#f24300; }
  .tm-cc-switch input:checked + .tm-cc-slider:before { transform:translateX(20px); }
  .tm-cc-switch input:disabled + .tm-cc-slider { background:#2f5d34; cursor:not-allowed; opacity:.9; }
  .tm-cc-switch input:disabled + .tm-cc-slider:before { background:#d6e8d8; }

  .tm-cc-modal-foot { display:flex; flex-wrap:wrap; gap:.6rem; padding:1.3rem 1.6rem 1.6rem; }
  .tm-cc-modal-foot .tm-cc-btn { flex:1 1 auto; }

  @media (max-width:520px){
    .tm-cc-actions { flex-direction:column; }
    .tm-cc-btn-config { order:3; }
  }
  `;

  /* ---------- markup ---------- */
  var cookieIcon = '<svg class="tm-cc-ico" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.2" fill="#f24300"/><circle cx="9" cy="9" r="1.3" fill="#15171c"/><circle cx="14.5" cy="8" r="1" fill="#15171c"/><circle cx="15.5" cy="13.5" r="1.4" fill="#15171c"/><circle cx="9.5" cy="15" r="1.1" fill="#15171c"/><circle cx="12.5" cy="11.5" r="0.8" fill="#15171c"/></svg>';

  function buildBanner() {
    var b = document.createElement("div");
    b.className = "tm-cc tm-cc-banner";
    b.setAttribute("role", "dialog");
    b.setAttribute("aria-live", "polite");
    b.setAttribute("aria-label", "Aviso de cookies");
    b.innerHTML =
      '<div class="tm-cc-head">' + cookieIcon +
        '<span class="tm-cc-title">Tu privacidad</span>' +
      '</div>' +
      '<p class="tm-cc-text">Utilizamos cookies propias y de terceros para el funcionamiento de la web y, con tu permiso, para analizar la navegación y mejorar nuestros servicios. Puedes aceptarlas, rechazarlas o configurarlas. Más info en la <a href="' + POLICY_URL + '">Política de cookies</a>.</p>' +
      '<div class="tm-cc-actions">' +
        '<button class="tm-cc-btn tm-cc-btn-reject" data-cc="reject">Rechazar</button>' +
        '<button class="tm-cc-btn tm-cc-btn-accept" data-cc="accept">Aceptar todas</button>' +
        '<button class="tm-cc-btn tm-cc-btn-config" data-cc="config">Configurar</button>' +
      '</div>';
    return b;
  }

  function buildModal() {
    var o = document.createElement("div");
    o.className = "tm-cc tm-cc-overlay";
    o.setAttribute("role", "dialog");
    o.setAttribute("aria-modal", "true");
    o.setAttribute("aria-label", "Configuración de cookies");
    o.innerHTML =
      '<div class="tm-cc-modal">' +
        '<div class="tm-cc-modal-head">' +
          '<button class="tm-cc-close" data-cc="close" aria-label="Cerrar">✕</button>' +
          '<div class="tm-cc-modal-title">Configuración de cookies</div>' +
          '<p class="tm-cc-modal-sub">Gestiona tus preferencias. Las cookies técnicas son imprescindibles y están siempre activas. Consulta la <a href="' + POLICY_URL + '">Política de cookies</a>.</p>' +
        '</div>' +
        '<div class="tm-cc-cats">' +
          cat("Técnicas / Necesarias", "Imprescindibles para el funcionamiento básico del sitio (navegación, seguridad y tus preferencias de cookies). No requieren consentimiento.", "necessary", true, true) +
          cat("Analíticas", "Nos permiten medir y analizar de forma anónima cómo se usa la web para mejorarla (p. ej. estadísticas de visitas).", "analytics", false, false) +
          cat("Marketing / Personalización", "Se utilizan para mostrar contenido y publicidad relevantes. Actualmente no se utilizan en esta web.", "marketing", false, false) +
        '</div>' +
        '<div class="tm-cc-modal-foot">' +
          '<button class="tm-cc-btn tm-cc-btn-reject" data-cc="reject">Rechazar todas</button>' +
          '<button class="tm-cc-btn tm-cc-btn-reject" data-cc="save">Guardar selección</button>' +
          '<button class="tm-cc-btn tm-cc-btn-accept" data-cc="accept">Aceptar todas</button>' +
        '</div>' +
      '</div>';
    return o;
  }

  function cat(name, desc, key, checked, disabled) {
    return '<div class="tm-cc-cat">' +
      '<div class="tm-cc-cat-info">' +
        '<div class="tm-cc-cat-name">' + name + '</div>' +
        '<div class="tm-cc-cat-desc">' + desc + '</div>' +
      '</div>' +
      '<label class="tm-cc-switch">' +
        '<input type="checkbox" data-cat="' + key + '"' + (checked ? ' checked' : '') + (disabled ? ' disabled' : '') + '>' +
        '<span class="tm-cc-slider"></span>' +
      '</label>' +
    '</div>';
  }

  /* ---------- behaviour ---------- */
  function init() {
    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    var banner = buildBanner();
    var modal = buildModal();
    document.body.appendChild(banner);
    document.body.appendChild(modal);

    function hideBanner() { banner.classList.remove("tm-show"); }
    function showBanner() { requestAnimationFrame(function () { banner.classList.add("tm-show"); }); }
    function openModal() {
      // sync toggles with stored consent
      var c = read();
      modal.querySelectorAll("input[data-cat]").forEach(function (inp) {
        var k = inp.getAttribute("data-cat");
        if (k === "necessary") { inp.checked = true; return; }
        inp.checked = c ? !!c[k] : false;
      });
      modal.classList.add("tm-show");
    }
    function closeModal() { modal.classList.remove("tm-show"); }

    window.openCookieSettings = function () { hideBanner(); openModal(); };

    function acceptAll() {
      save({ necessary: true, analytics: true, marketing: true });
      hideBanner(); closeModal();
    }
    function rejectAll() {
      save({ necessary: true, analytics: false, marketing: false });
      hideBanner(); closeModal();
    }
    function saveSelection() {
      var c = { necessary: true, analytics: false, marketing: false };
      modal.querySelectorAll("input[data-cat]").forEach(function (inp) {
        c[inp.getAttribute("data-cat")] = inp.checked;
      });
      c.necessary = true;
      save(c); hideBanner(); closeModal();
    }

    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-cc]");
      if (!t) {
        if (e.target === modal) closeModal(); // click outside card
        return;
      }
      var act = t.getAttribute("data-cc");
      if (act === "accept") acceptAll();
      else if (act === "reject") rejectAll();
      else if (act === "save") saveSelection();
      else if (act === "config") { hideBanner(); openModal(); }
      else if (act === "close") closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("tm-show")) closeModal();
    });

    // Footer / anywhere link with data-open-cookie-settings reopens the panel
    document.querySelectorAll("[data-cookie-settings]").forEach(function (el) {
      el.addEventListener("click", function (e) { e.preventDefault(); window.openCookieSettings(); });
    });

    if (!read()) { setTimeout(showBanner, 700); }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
