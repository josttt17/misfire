// Misfire Customs — website Worker.
// Serves the static site from public/ and handles one API route:
//   POST /api/paring  → emails the contact-form request to the garage.
// The recipient address is a Cloudflare secret (MAIL_TO), not stored in this public repo.

const FROM = { email: "veebileht@misfire.ee", name: "Misfire veebileht" };
const LIMITS = { name: 100, phone: 40, email: 120, car: 120, message: 3000 };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function clean(value, max) {
  return String(value ?? "").replace(/\r/g, "").trim().slice(0, max);
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

async function handleInquiry(request, env) {
  if (request.method !== "POST") return json({ ok: false, error: "method" }, 405);
  if (!env.MAIL_TO) return json({ ok: false, error: "not_configured" }, 503);

  let data;
  try { data = await request.json(); } catch { return json({ ok: false, error: "bad_json" }, 400); }

  // Honeypot: real visitors never see or fill this field; bots often do.
  if (clean(data.website, 200)) return json({ ok: true });

  const name = clean(data.name, LIMITS.name);
  const phone = clean(data.phone, LIMITS.phone);
  const email = clean(data.email, LIMITS.email);
  const car = clean(data.car, LIMITS.car);
  const message = clean(data.message, LIMITS.message);

  if (!name || phone.replace(/\D/g, "").length < 7 || !message) {
    return json({ ok: false, error: "validation" }, 400);
  }
  const replyTo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined;

  const rows = [["Nimi", name], ["Telefon", phone], ["E-post", email || "—"], ["Auto", car || "—"]];
  const text =
    "Uus päring kodulehelt www.misfire.ee\n\n" +
    rows.map(([k, v]) => `${k}: ${v}`).join("\n") +
    `\n\nSõnum:\n${message}\n`;
  const html =
    `<p>Uus päring kodulehelt <a href="https://www.misfire.ee">www.misfire.ee</a></p>` +
    `<table cellpadding="4" style="border-collapse:collapse">` +
    rows.map(([k, v]) => `<tr><td><b>${k}</b></td><td>${escapeHtml(v)}</td></tr>`).join("") +
    `</table><p><b>Sõnum:</b><br>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`;

  try {
    await env.EMAIL.send({
      from: FROM,
      to: env.MAIL_TO,
      subject: `Uus päring: ${name}${car ? " – " + car : ""}`,
      text,
      html,
      ...(replyTo ? { replyTo } : {}),
    });
  } catch (e) {
    console.error("send failed", e && e.code, e && e.message);
    return json({ ok: false, error: "send_failed" }, 502);
  }
  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/paring") return handleInquiry(request, env);
    return env.ASSETS.fetch(request);
  },
};
