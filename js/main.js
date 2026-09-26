/* =========================================================
   Misfire Customs — main.js
   No dependencies. Works without a build step.
   ========================================================= */

/* ---------- CONFIG: edit these ---------- */
var CONFIG = {
  // WhatsApp number in international format, digits only.
  whatsapp: "37256984655",

  // Where the contact form posts. Leave empty ("") and the form
  // hands the request over to WhatsApp instead of sending it.
  // Example: "https://formspree.io/f/xxxxxxx"
  formEndpoint: ""
};

(function () {
  "use strict";

  /* ---------- Mobile menu ---------- */
  var burger = document.querySelector(".burger");
  var menu = document.getElementById("mobile-menu");

  function setMenu(open) {
    if (!burger || !menu) return;
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Sulge menüü" : "Ava menüü");
    menu.classList.toggle("is-open", open);
    menu.inert = !open;
  }

  if (burger && menu) {
    setMenu(false);
    burger.addEventListener("click", function () {
      setMenu(burger.getAttribute("aria-expanded") !== "true");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        burger.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (burger.getAttribute("aria-expanded") === "true" &&
          !e.target.closest(".site-header")) setMenu(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 700) setMenu(false);
    });
  }

  /* ---------- Before / after slider ---------- */
  document.querySelectorAll(".ba").forEach(function (el) {
    var range = el.querySelector(".ba-range");
    if (!range) return;
    function update() { el.style.setProperty("--pos", range.value + "%"); }
    range.addEventListener("input", update);
    update();
  });

  /* ---------- Gallery filter ---------- */
  var chips = document.querySelectorAll(".chip[data-filter]");
  var items = document.querySelectorAll(".pair[data-cat]");
  var emptyNote = document.querySelector(".empty-note");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var f = chip.getAttribute("data-filter");
      var shown = 0;
      chips.forEach(function (c) { c.setAttribute("aria-pressed", c === chip ? "true" : "false"); });
      items.forEach(function (it) {
        var match = f === "all" || it.getAttribute("data-cat") === f;
        it.hidden = !match;
        if (match) shown++;
      });
      if (emptyNote) emptyNote.hidden = shown > 0;
    });
  });

  /* ---------- Contact form ---------- */
  var form = document.getElementById("inquiry-form");
  if (form) {
    var status = document.getElementById("form-status");
    var messages = {
      name: "Sisesta oma nimi.",
      phone: "Sisesta telefoninumber, et saaksime sulle tagasi helistada.",
      message: "Kirjelda lühidalt, mida autoga vaja teha on."
    };

    function fieldOf(input) { return input.closest(".field"); }
    function clearError(input) {
      var f = fieldOf(input);
      f.removeAttribute("data-invalid");
      var e = f.querySelector(".err");
      if (e) e.remove();
      input.removeAttribute("aria-invalid");
    }
    function showError(input, text) {
      var f = fieldOf(input);
      f.setAttribute("data-invalid", "");
      input.setAttribute("aria-invalid", "true");
      var e = document.createElement("p");
      e.className = "err";
      e.id = input.id + "-err";
      e.textContent = text;
      f.appendChild(e);
      input.setAttribute("aria-describedby", e.id);
    }

    form.querySelectorAll("input, textarea").forEach(function (el) {
      el.addEventListener("input", function () { clearError(el); });
    });

    function buildMessage(data) {
      var lines = ["Tere! Päring kodulehelt:", "", "Nimi: " + data.name, "Telefon: " + data.phone];
      if (data.car) lines.push("Auto: " + data.car);
      lines.push("", data.message);
      return lines.join("\n");
    }

    function showStatus(html, isError) {
      status.innerHTML = html;
      status.classList.toggle("is-error", !!isError);
      status.hidden = false;
      status.focus();
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      ["name", "phone", "message"].forEach(function (key) {
        var input = form.elements[key];
        clearError(input);
        var v = input.value.trim();
        var bad = !v || (key === "phone" && v.replace(/\D/g, "").length < 7);
        if (bad) {
          showError(input, messages[key]);
          if (!firstBad) firstBad = input;
        }
      });
      if (firstBad) { firstBad.focus(); return; }

      var data = {
        name: form.elements.name.value.trim(),
        phone: form.elements.phone.value.trim(),
        car: form.elements.car.value.trim(),
        message: form.elements.message.value.trim()
      };

      if (CONFIG.formEndpoint) {
        var btn = form.querySelector("button[type=submit]");
        btn.disabled = true;
        btn.textContent = "Saadan…";
        fetch(CONFIG.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(data)
        }).then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          form.hidden = true;
          showStatus("<p><strong>Aitäh, päring on saadetud.</strong></p><p>Võtame sinuga ühendust telefoni teel.</p>");
        }).catch(function () {
          btn.disabled = false;
          btn.textContent = "Saada päring";
          showStatus("<p><strong>Päringu saatmine ebaõnnestus.</strong></p><p>Proovi uuesti või kirjuta meile otse WhatsAppis.</p>", true);
        });
        return;
      }

      var url = "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(buildMessage(data));
      showStatus(
        "<p><strong>Päring on valmis.</strong> Vajuta nuppu, et see meile WhatsAppis saata.</p>" +
        '<a class="btn btn-accent" target="_blank" rel="noopener" href="' + url + '">Saada WhatsAppis</a>'
      );
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
