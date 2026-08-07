/**
 * Wizecatch — widget embarquable.
 *
 * Un seul fichier statique pour tous les clients. Ce qui les distingue est la
 * clé publique passée en attribut :
 *
 *   <script src="https://app.wizecatch.com/w.js" data-site="wz_xxx" async></script>
 *
 * Écrit en JS natif, sans build : le fichier est servi tel quel par le CDN.
 * Aucune dépendance, aucun cookie.
 */
(function () {
  "use strict";

  // --- Résolution de la balise et de la clé ---------------------------------
  // currentScript est null si le script est chargé en async depuis un module ;
  // on retombe alors sur une recherche par attribut.
  var script =
    document.currentScript || document.querySelector("script[data-site]");
  if (!script) return;

  var siteKey = script.getAttribute("data-site");
  if (!siteKey) return;

  // L'origine de l'API est déduite de l'URL du script : pas de configuration
  // supplémentaire côté client, et cela fonctionne sur tous les environnements.
  var apiOrigin;
  try {
    apiOrigin = new URL(script.src).origin;
  } catch {
    return;
  }

  // --- Identité de session --------------------------------------------------
  // sessionStorage plutôt qu'un cookie : effacé à la fermeture de l'onglet,
  // jamais envoyé automatiquement, et hors du champ de la directive ePrivacy
  // sur les cookies de suivi.
  var SESSION_KEY = "wz_s";
  var STARTED_KEY = "wz_t";
  var VIEWS_KEY = "wz_v";

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    // Repli pour les navigateurs anciens et les contextes non sécurisés.
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function store(key, value) {
    try {
      sessionStorage.setItem(key, value);
    } catch {
      /* mode privé : on continue sans persistance */
    }
  }

  function read(key) {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }

  var sessionId = read(SESSION_KEY);
  var isNewSession = !sessionId;

  if (isNewSession) {
    sessionId = uuid();
    store(SESSION_KEY, sessionId);
    store(STARTED_KEY, String(Date.now()));
    store(VIEWS_KEY, "1");
  } else {
    var views = parseInt(read(VIEWS_KEY) || "1", 10) + 1;
    store(VIEWS_KEY, String(views));
  }

  // --- Envoi ----------------------------------------------------------------

  function post(payload, useBeacon) {
    var url = apiOrigin + "/api/collect";
    var data = JSON.stringify(payload);

    // sendBeacon survit à la fermeture de l'onglet, contrairement à fetch.
    if (useBeacon && navigator.sendBeacon) {
      try {
        navigator.sendBeacon(url, new Blob([data], { type: "application/json" }));
        return;
      } catch {
        /* on retombe sur fetch */
      }
    }

    try {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data,
        keepalive: true,
        // Pas de cookies : la requête est volontairement anonyme.
        credentials: "omit",
      }).catch(function () {});
    } catch {
      /* échec silencieux : la collecte ne doit jamais casser le site hôte */
    }
  }

  // Début de visite — uniquement à la première page de la session.
  if (isNewSession) {
    post({
      k: siteKey,
      s: sessionId,
      e: "start",
      p: location.pathname || "/",
      r: document.referrer || "",
    });
  }

  // Fin de visite — durée et nombre de pages.
  var ended = false;
  function sendEnd() {
    if (ended) return;
    ended = true;

    var startedAt = parseInt(read(STARTED_KEY) || "0", 10);
    var duration = startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0;

    post(
      {
        k: siteKey,
        s: sessionId,
        e: "end",
        d: duration,
        v: parseInt(read(VIEWS_KEY) || "1", 10),
      },
      true,
    );
  }

  // pagehide est le signal fiable sur mobile ; visibilitychange couvre les
  // bascules d'onglet. On réarme après un retour pour ne pas perdre la fin
  // réelle de la visite.
  window.addEventListener("pagehide", sendEnd);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") sendEnd();
    else ended = false;
  });

  // --- Configuration et interface -------------------------------------------
  // En mode analytics_only le widget s'arrête ici : aucune requête de config,
  // aucun code d'interface, rien d'affiché au visiteur.

  var SUBMITTED_KEY = "wz_done_" + siteKey;

  function alreadySubmitted() {
    try {
      return localStorage.getItem(SUBMITTED_KEY) === "1";
    } catch {
      return false;
    }
  }

  function markSubmitted() {
    try {
      localStorage.setItem(SUBMITTED_KEY, "1");
    } catch {
      /* mode privé */
    }
  }

  fetch(apiOrigin + "/api/w/" + encodeURIComponent(siteKey), {
    credentials: "omit",
  })
    .then(function (response) {
      return response.ok ? response.json() : null;
    })
    .then(function (config) {
      if (!config || config.mode !== "reviews" || !config.template) return;

      // 1) Le mur d'avis, s'il y a un emplacement prévu dans la page.
      mountWalls(config);

      // 2) Le formulaire de collecte. Ne pas resolliciter quelqu'un qui a
      //    déjà donné son avis.
      if (alreadySubmitted()) return;

      var trigger = (config.widget && config.widget.trigger) || "load";

      if (trigger === "delay") {
        setTimeout(function () {
          mountForm(config);
        }, 5000);
      } else if (trigger === "scroll") {
        var fired = false;
        var onScroll = function () {
          if (fired) return;
          var scrolled =
            (window.scrollY + window.innerHeight) /
            Math.max(document.body.scrollHeight, 1);
          if (scrolled > 0.5) {
            fired = true;
            window.removeEventListener("scroll", onScroll);
            mountForm(config);
          }
        };
        window.addEventListener("scroll", onScroll, { passive: true });
      } else {
        mountForm(config);
      }
    })
    .catch(function () {});

  // ---------------------------------------------------------------------------
  // Formulaire d'avis
  //
  // Tout est rendu dans un Shadow DOM : les styles du site hôte ne peuvent pas
  // altérer le widget, et nos styles ne peuvent pas déborder sur le site.
  // ---------------------------------------------------------------------------

  var POSITIONS = {
    "bottom-right": "bottom:20px;right:20px;",
    "bottom-left": "bottom:20px;left:20px;",
    "top-right": "top:20px;right:20px;",
    "top-left": "top:20px;left:20px;",
  };

  var STYLES = [
    ":host{all:initial}",
    "*{box-sizing:border-box;font-family:system-ui,-apple-system,'Segoe UI',sans-serif}",
    ".card{position:fixed;z-index:2147483000;width:320px;max-width:calc(100vw - 40px);",
    "background:#fff;border-radius:16px;padding:20px;color:#18181b;",
    "box-shadow:0 10px 40px rgba(0,0,0,.16);border:1px solid #e4e4e7;",
    "animation:wz-in .35s cubic-bezier(.16,1,.3,1)}",
    ".card.inline{position:relative;inset:auto;width:100%;max-width:420px;margin:16px 0;animation:none}",
    "@keyframes wz-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}",
    ".title{font-size:15px;font-weight:600;margin:0 0 12px;padding-right:20px;line-height:1.4}",
    ".close{position:absolute;top:12px;right:12px;border:0;background:none;cursor:pointer;",
    "font-size:18px;line-height:1;color:#a1a1aa;padding:4px}",
    ".close:hover{color:#52525b}",
    ".stars{display:flex;gap:4px;margin-bottom:12px}",
    ".star{cursor:pointer;font-size:28px;line-height:1;color:#e4e4e7;background:none;border:0;padding:0;",
    "transition:transform .12s,color .12s}",
    ".star:hover{transform:scale(1.15)}",
    ".star.on{color:#7c3aed}",
    ".thumbs{display:flex;gap:10px;margin-bottom:12px}",
    ".thumb{flex:1;cursor:pointer;font-size:22px;padding:10px;border-radius:10px;",
    "border:1px solid #e4e4e7;background:#fff;transition:all .12s}",
    ".thumb:hover{background:#fafafa}",
    ".thumb.on-up{background:#f0fdf4;border-color:#86efac}",
    ".thumb.on-down{background:#fef2f2;border-color:#fca5a5}",
    ".nps{display:grid;grid-template-columns:repeat(11,1fr);gap:3px;margin-bottom:12px}",
    ".n{cursor:pointer;font-size:11px;padding:6px 0;border-radius:5px;border:1px solid #e4e4e7;",
    "background:#fff;transition:all .12s}",
    ".n:hover{background:#fafafa}",
    ".n.on{background:#7c3aed;border-color:#7c3aed;color:#fff}",
    "input,textarea{width:100%;padding:9px 11px;border:1px solid #d4d4d8;border-radius:9px;",
    "font-size:13px;margin-bottom:10px;resize:vertical;color:#18181b;background:#fff}",
    "input:focus,textarea:focus{outline:none;border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.12)}",
    ".hp{position:absolute;left:-9999px;opacity:0;height:0;width:0;margin:0;padding:0;border:0}",
    ".submit{width:100%;padding:10px;background:#7c3aed;color:#fff;border:0;border-radius:9px;",
    "font-size:14px;font-weight:500;cursor:pointer;transition:background .12s}",
    ".submit:hover{background:#6d28d9}",
    ".submit:disabled{opacity:.55;cursor:not-allowed}",
    ".err{color:#dc2626;font-size:12px;margin:0 0 8px}",
    ".brand{text-align:center;font-size:10px;color:#a1a1aa;margin:10px 0 0}",
    ".brand a{color:#a1a1aa;text-decoration:none}",
    ".done{text-align:center;padding:8px 0}",
    ".done .tick{font-size:30px}",
    ".done p{margin:8px 0 0;font-size:14px;font-weight:500}",
  ].join("");

  function mountForm(config) {
    var host = document.createElement("div");
    var position = (config.widget && config.widget.position) || "bottom-right";
    var inline = position === "inline";

    document.body.appendChild(host);
    var root = host.attachShadow ? host.attachShadow({ mode: "open" }) : null;
    if (!root) return; // navigateur sans Shadow DOM : on n'affiche rien

    var style = document.createElement("style");
    style.textContent = STYLES;
    root.appendChild(style);

    var card = document.createElement("div");
    card.className = "card" + (inline ? " inline" : "");
    if (!inline) card.setAttribute("style", POSITIONS[position] || POSITIONS["bottom-right"]);
    root.appendChild(card);

    var cfg = config.templateConfig || {};
    var title = cfg.title || "How was your experience?";
    var buttonLabel = cfg.buttonLabel || "Submit";
    var template = config.template;

    // État du formulaire
    var value = { rating: 0, thumbsUp: null, nps: null };

    function html(inner) {
      card.innerHTML =
        '<button class="close" aria-label="Close">&times;</button>' + inner;
      card.querySelector(".close").addEventListener("click", function () {
        host.remove();
      });
    }

    function fields() {
      if (template === "star_rating" || template === "star_comment") {
        var stars = "";
        for (var i = 1; i <= 5; i++) {
          stars += '<button class="star" data-v="' + i + '">&#9733;</button>';
        }
        return (
          '<div class="stars">' +
          stars +
          "</div>" +
          (template === "star_comment"
            ? '<textarea rows="3" placeholder="Tell us more (optional)"></textarea>'
            : "")
        );
      }
      if (template === "thumbs") {
        return (
          '<div class="thumbs">' +
          '<button class="thumb" data-v="up">&#128077;</button>' +
          '<button class="thumb" data-v="down">&#128078;</button>' +
          "</div>"
        );
      }
      if (template === "nps") {
        var cells = "";
        for (var n = 0; n <= 10; n++) {
          cells += '<button class="n" data-v="' + n + '">' + n + "</button>";
        }
        return (
          '<div class="nps">' +
          cells +
          "</div>" +
          '<textarea rows="2" placeholder="What\'s the reason for your score? (optional)"></textarea>'
        );
      }
      // testimonial
      return (
        '<input type="text" placeholder="Your name" />' +
        '<textarea rows="3" placeholder="Write your testimonial..."></textarea>'
      );
    }

    html(
      '<p class="title">' +
        escapeHtml(title) +
        "</p>" +
        fields() +
        '<p class="err" style="display:none"></p>' +
        '<input class="hp" tabindex="-1" autocomplete="off" aria-hidden="true" />' +
        '<button class="submit">' +
        escapeHtml(buttonLabel) +
        "</button>" +
        '<p class="brand">Powered by Wizecatch</p>',
    );

    // --- Interactions ---
    card.querySelectorAll(".star").forEach(function (el) {
      el.addEventListener("click", function () {
        value.rating = parseInt(el.dataset.v, 10);
        card.querySelectorAll(".star").forEach(function (s, idx) {
          s.classList.toggle("on", idx < value.rating);
        });
      });
    });

    card.querySelectorAll(".thumb").forEach(function (el) {
      el.addEventListener("click", function () {
        value.thumbsUp = el.dataset.v === "up";
        card.querySelectorAll(".thumb").forEach(function (t) {
          t.classList.remove("on-up", "on-down");
        });
        el.classList.add(value.thumbsUp ? "on-up" : "on-down");
      });
    });

    card.querySelectorAll(".n").forEach(function (el) {
      el.addEventListener("click", function () {
        value.nps = parseInt(el.dataset.v, 10);
        card.querySelectorAll(".n").forEach(function (n) {
          n.classList.toggle("on", n === el);
        });
      });
    });

    card.querySelector(".submit").addEventListener("click", function () {
      var button = card.querySelector(".submit");
      var errorEl = card.querySelector(".err");
      var textarea = card.querySelector("textarea");
      var nameInput = card.querySelector('input[type="text"]');

      var payload = {
        k: siteKey,
        url: location.href,
        hp: card.querySelector(".hp").value,
        comment: textarea ? textarea.value : null,
        name: nameInput ? nameInput.value : null,
      };

      if (template === "star_rating" || template === "star_comment") {
        payload.rating = value.rating;
      } else if (template === "thumbs") {
        payload.thumbsUp = value.thumbsUp;
      } else if (template === "nps") {
        payload.nps = value.nps;
      }

      button.disabled = true;
      errorEl.style.display = "none";

      fetch(apiOrigin + "/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "omit",
      })
        .then(function (response) {
          return response.json().then(function (data) {
            return { ok: response.ok, data: data };
          });
        })
        .then(function (result) {
          if (!result.ok) {
            errorEl.textContent = result.data.error || "Something went wrong.";
            errorEl.style.display = "block";
            button.disabled = false;
            return;
          }

          markSubmitted();
          card.innerHTML =
            '<div class="done"><div class="tick">&#127881;</div><p>Thank you!</p></div>';
          setTimeout(function () {
            host.remove();
          }, 2500);
        })
        .catch(function () {
          errorEl.textContent = "Network error. Please try again.";
          errorEl.style.display = "block";
          button.disabled = false;
        });
    });
  }

  // ---------------------------------------------------------------------------
  // Mur d'avis
  //
  // Le client place une balise vide là où il veut les avis :
  //     <div data-wizecatch-wall></div>
  // Le script la trouve et la remplit. Aucun réglage à faire de son côté :
  // déplacer la div suffit à déplacer le mur.
  //
  // Le format (list / grid / carousel) vient des réglages du dashboard.
  // ---------------------------------------------------------------------------

  var WALL_STYLES = [
    ":host{all:initial}",
    "*{box-sizing:border-box;font-family:system-ui,-apple-system,'Segoe UI',sans-serif}",
    ".wrap{color:#18181b}",
    ".list{display:flex;flex-direction:column;gap:12px}",
    ".grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}",
    ".carousel{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;",
    "padding-bottom:8px;scrollbar-width:none;-ms-overflow-style:none}",
    ".carousel::-webkit-scrollbar{display:none}",
    ".carousel .item{flex:0 0 300px;scroll-snap-align:start}",
    ".nav{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:10px}",
    ".arrow{width:28px;height:28px;border-radius:50%;border:1px solid #e4e4e7;background:#fff;",
    "cursor:pointer;font-size:14px;line-height:1;color:#52525b;display:flex;align-items:center;",
    "justify-content:center;transition:all .12s}",
    ".arrow:hover{background:#fafafa;border-color:#d4d4d8}",
    ".dots{display:flex;gap:5px}",
    ".dot{width:6px;height:6px;border-radius:50%;background:#d4d4d8;border:0;padding:0;cursor:pointer;",
    "transition:all .2s}",
    ".dot.on{background:#7c3aed;width:16px;border-radius:99px}",
    ".item{background:#fff;border:1px solid #e4e4e7;border-radius:14px;padding:16px}",
    ".head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}",
    ".who{display:flex;align-items:center;gap:9px;min-width:0}",
    ".av{width:32px;height:32px;border-radius:50%;background:#ede9fe;color:#6d28d9;",
    "display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;flex:0 0 auto}",
    ".nm{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".loc{font-size:11px;color:#a1a1aa}",
    ".stars{color:#7c3aed;font-size:13px;letter-spacing:1px;flex:0 0 auto}",
    ".stars .off{color:#e4e4e7}",
    ".badge{font-size:11px;font-weight:600;padding:3px 8px;border-radius:99px;flex:0 0 auto}",
    ".up{background:#f0fdf4;color:#15803d}",
    ".down{background:#fef2f2;color:#b91c1c}",
    ".nps{background:#f5f3ff;color:#6d28d9}",
    ".txt{font-size:13px;line-height:1.6;color:#3f3f46;margin:0}",
    ".foot{margin-top:12px;text-align:center;font-size:11px;color:#a1a1aa}",
    ".foot a{color:#a1a1aa;text-decoration:none}",
  ].join("");

  function initials(name) {
    return String(name || "?")
      .trim()
      .charAt(0)
      .toUpperCase();
  }

  function starsHtml(rating) {
    var out = "";
    for (var i = 1; i <= 5; i++) {
      out += i <= rating ? "&#9733;" : '<span class="off">&#9733;</span>';
    }
    return '<span class="stars">' + out + "</span>";
  }

  function reviewItem(review) {
    var badge = "";

    if (typeof review.rating === "number" && review.rating > 0) {
      badge = starsHtml(review.rating);
    } else if (typeof review.thumbsUp === "boolean") {
      badge =
        '<span class="badge ' +
        (review.thumbsUp ? "up" : "down") +
        '">' +
        (review.thumbsUp ? "&#128077;" : "&#128078;") +
        "</span>";
    } else if (typeof review.nps === "number") {
      badge = '<span class="badge nps">' + review.nps + "/10</span>";
    }

    var location = [review.city, review.country].filter(Boolean).join(", ");

    return (
      '<div class="item">' +
      '<div class="head">' +
      '<div class="who">' +
      '<div class="av">' +
      escapeHtml(initials(review.name)) +
      "</div>" +
      "<div>" +
      '<div class="nm">' +
      escapeHtml(review.name) +
      "</div>" +
      (location ? '<div class="loc">' + escapeHtml(location) + "</div>" : "") +
      "</div>" +
      "</div>" +
      badge +
      "</div>" +
      (review.comment ? '<p class="txt">' + escapeHtml(review.comment) + "</p>" : "") +
      "</div>"
    );
  }

  function mountWalls(config) {
    var slots = document.querySelectorAll("[data-wizecatch-wall]");
    if (!slots.length) return;

    var reviews = config.reviews || [];
    var format = (config.widget && config.widget.format) || "list";
    // "popup" concerne le formulaire flottant, pas le mur : on retombe sur
    // une liste, qui est le format inline le plus neutre.
    var layout = format === "popup" ? "list" : format;

    slots.forEach(function (slot) {
      // Aucun avis publié : on ne laisse pas un bloc vide ni un message
      // d'erreur sur le site du client — on ne rend simplement rien.
      if (!reviews.length) return;

      var root = slot.attachShadow ? slot.attachShadow({ mode: "open" }) : null;
      if (!root) return;

      var style = document.createElement("style");
      style.textContent = WALL_STYLES;
      root.appendChild(style);

      // Un attribut peut surcharger le format global, utile pour afficher
      // deux mises en page différentes sur la même page.
      var override = slot.getAttribute("data-wizecatch-wall");
      if (override === "list" || override === "grid" || override === "carousel") {
        layout = override;
      }

      var wrap = document.createElement("div");
      wrap.className = "wrap";
      wrap.innerHTML =
        '<div class="' +
        layout +
        '">' +
        reviews.map(reviewItem).join("") +
        "</div>" +
        (layout === "carousel" && reviews.length > 1
          ? '<div class="nav">' +
            '<button class="arrow" data-dir="-1" aria-label="Previous">&#8249;</button>' +
            '<div class="dots"></div>' +
            '<button class="arrow" data-dir="1" aria-label="Next">&#8250;</button>' +
            "</div>"
          : "") +
        '<p class="foot">Powered by Wizecatch</p>';

      root.appendChild(wrap);

      if (layout === "carousel" && reviews.length > 1) {
        setupCarousel(wrap, reviews.length);
      }
    });
  }

  /**
   * Carrousel : flèches, pastilles et défilement automatique.
   * L'auto-défilement s'arrête dès que le visiteur interagit — sinon il
   * reprendrait la main sur lui pendant qu'il lit un avis.
   */
  function setupCarousel(wrap, count) {
    var track = wrap.querySelector(".carousel");
    var dotsBox = wrap.querySelector(".dots");
    if (!track || !dotsBox) return;

    var index = 0;
    var auto = null;

    for (var i = 0; i < count; i++) {
      var dot = document.createElement("button");
      dot.className = "dot" + (i === 0 ? " on" : "");
      dot.setAttribute("aria-label", "Review " + (i + 1));
      dot.dataset.i = String(i);
      dotsBox.appendChild(dot);
    }

    function itemWidth() {
      var first = track.querySelector(".item");
      return first ? first.getBoundingClientRect().width + 12 : 312;
    }

    function goTo(next) {
      index = (next + count) % count;
      track.scrollTo({ left: index * itemWidth(), behavior: "smooth" });
      dotsBox.querySelectorAll(".dot").forEach(function (d, i) {
        d.classList.toggle("on", i === index);
      });
    }

    function stopAuto() {
      if (auto) {
        clearInterval(auto);
        auto = null;
      }
    }

    wrap.querySelectorAll(".arrow").forEach(function (button) {
      button.addEventListener("click", function () {
        stopAuto();
        goTo(index + parseInt(button.dataset.dir, 10));
      });
    });

    dotsBox.addEventListener("click", function (event) {
      var dot = event.target.closest(".dot");
      if (!dot) return;
      stopAuto();
      goTo(parseInt(dot.dataset.i, 10));
    });

    // Le défilement manuel doit aussi couper l'automatique.
    track.addEventListener("scroll", function () {
      var current = Math.round(track.scrollLeft / itemWidth());
      if (current !== index) {
        index = current;
        dotsBox.querySelectorAll(".dot").forEach(function (d, i) {
          d.classList.toggle("on", i === index);
        });
      }
    });
    track.addEventListener("pointerdown", stopAuto);
    wrap.addEventListener("mouseenter", stopAuto);

    auto = setInterval(function () {
      goTo(index + 1);
    }, 5000);
  }

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(String(text)));
    return div.innerHTML;
  }
})();
