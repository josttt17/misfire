/* =========================================================
   Misfire Customs — main.js
   No dependencies. Works without a build step.
   ========================================================= */

/* ---------- CONFIG: edit these ---------- */
var CONFIG = {
  // Instagram username. Buttons and the form open a direct message to it.
  instagram: "misfire.studio",

  // Where the contact form posts. The Worker in src/worker.js emails it to the garage.
  // Leave empty ("") and the form copies the request and opens an Instagram message instead.
  formEndpoint: "/api/paring"
};

(function () {
  "use strict";

  var EN = document.documentElement.lang === "en";
  var T = EN ? {
    menuOpen: "Open menu", menuClose: "Close menu",
    errName: "Please enter your name.",
    errPhone: "Please enter a phone number so we can get back to you.",
    errMsg: "Please describe briefly what the car needs.",
    hello: "Hi! Request from the website:", lName: "Name: ", lPhone: "Phone: ", lEmail: "Email: ", lCar: "Car: ",
    sending: "Sending…", send: "Send request",
    ok: "<p><strong>Thank you, your request has been sent.</strong></p><p>We will get back to you soon.</p>",
    fail: "<p><strong>Sending failed.</strong> Please try again, text +372 5698 4655 or message us on Instagram.</p>",
    igBtn: "Message on Instagram",
    ready: "<p><strong>Your request is ready.</strong> Press the button: the text is copied and an Instagram chat with us opens. Paste the text into the message and send it.</p>",
    copyLabel: "Request text", copyBtn: "Copy and open Instagram"
  } : {
    menuOpen: "Ava menüü", menuClose: "Sulge menüü",
    errName: "Sisesta oma nimi.",
    errPhone: "Sisesta telefoninumber, et saaksime sinuga ühendust võtta.",
    errMsg: "Kirjelda lühidalt, mida autoga vaja teha on.",
    hello: "Tere! Päring kodulehelt:", lName: "Nimi: ", lPhone: "Telefon: ", lEmail: "E-post: ", lCar: "Auto: ",
    sending: "Saadan…", send: "Saada päring",
    ok: "<p><strong>Aitäh, päring on saadetud.</strong></p><p>Võtame sinuga peagi ühendust.</p>",
    fail: "<p><strong>Päringu saatmine ebaõnnestus.</strong> Proovi uuesti, kirjuta +372 5698 4655 või kirjuta meile Instagramis.</p>",
    igBtn: "Kirjuta Instagramis",
    ready: "<p><strong>Päring on valmis.</strong> Vajuta nuppu: päringu tekst kopeeritakse ja avaneb Instagrami vestlus meiega. Kleebi tekst sõnumisse ja saada.</p>",
    copyLabel: "Päringu tekst", copyBtn: "Kopeeri ja ava Instagram"
  };

  /* ---------- Mobile menu ---------- */
  var burger = document.querySelector(".burger");
  var menu = document.getElementById("mobile-menu");

  function setMenu(open) {
    if (!burger || !menu) return;
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? T.menuClose : T.menuOpen);
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
      name: T.errName,
      phone: T.errPhone,
      message: T.errMsg
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
      var lines = [T.hello, "", T.lName + data.name, T.lPhone + data.phone];
      if (data.email) lines.push(T.lEmail + data.email);
      if (data.car) lines.push(T.lCar + data.car);
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
        email: form.elements.email.value.trim(),
        car: form.elements.car.value.trim(),
        message: form.elements.message.value.trim(),
        website: form.elements.website.value,
        lang: EN ? "en" : "et"
      };

      if (CONFIG.formEndpoint) {
        var btn = form.querySelector("button[type=submit]");
        btn.disabled = true;
        btn.textContent = T.sending;
        fetch(CONFIG.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(data)
        }).then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          form.hidden = true;
          showStatus(T.ok);
        }).catch(function () {
          btn.disabled = false;
          btn.textContent = T.send;
          showStatus(
            T.fail +
            '<a class="btn btn-outline" target="_blank" rel="noopener" href="https://ig.me/m/' + CONFIG.instagram + '">' + T.igBtn + '</a>',
            true
          );
        });
        return;
      }

      // Instagram can't pre-fill a message, so copy the request for the customer to paste.
      var text = buildMessage(data);
      var url = "https://ig.me/m/" + CONFIG.instagram;
      showStatus(
        T.ready +
        '<textarea class="copy-box" readonly rows="5" aria-label="' + T.copyLabel + '"></textarea>' +
        '<a class="btn btn-accent" id="ig-send" target="_blank" rel="noopener" href="' + url + '">' + T.copyBtn + '</a>'
      );
      var box = status.querySelector(".copy-box");
      box.value = text;
      status.querySelector("#ig-send").addEventListener("click", function () {
        function fallback() { box.focus(); box.select(); try { document.execCommand("copy"); } catch (err) {} }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).catch(fallback);
        } else { fallback(); }
      });
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
  /* ---------- Tyre price table: rim size picker (phones) ---------- */
  var tyreTable = document.querySelector(".tyre-table");
  var picker = document.querySelector(".size-picker");
  if (tyreTable && picker) {
    document.documentElement.classList.add("tyre-js");
    picker.hidden = false;
    var showCol = function (col) {
      tyreTable.setAttribute("data-col", col);
      // hide jobs we don't do for this size (e.g. steel rims 19" and up)
      var shown = 0;
      tyreTable.querySelectorAll("tbody tr:not(.none-row)").forEach(function (tr) {
        var cell = tr.querySelectorAll("td")[col - 1];
        var na = !!cell && cell.classList.contains("na");
        tr.classList.toggle("size-na", na);
        if (!na) shown++;
      });
      var none = tyreTable.querySelector(".none-row");
      if (none) none.hidden = shown > 0;
      var extras = document.querySelector(".tyre-extras");
      if (extras) extras.hidden = shown === 0;
    };
    showCol(1);
    picker.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-col]");
      if (!btn) return;
      showCol(+btn.getAttribute("data-col"));
      picker.querySelectorAll("[data-col]").forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
    });
  }
})();
