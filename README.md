# Misfire Customs — website handoff

Static website: 4 HTML pages, one CSS file, one JS file. No framework, no build step, no dependencies.
Hosted on Cloudflare Workers (static assets). Every push to `main` on GitHub deploys automatically.
All website files live in `public/`; `wrangler.jsonc` tells Cloudflare to serve that folder.
Page URLs have no `.html` ending (`/hinnakiri`, `/tehtud-tood`, `/kontakt`); Cloudflare maps them to the files.

Language: Estonian (`lang="et"`). Designed mobile-first; most visitors will be on phones.

---

## 1. Files

```
misfire/
├── wrangler.jsonc      Cloudflare config (serves public/)
└── public/
├── index.html          Avaleht (hero with before/after slider, services, process, recent work)
├── hinnakiri.html      Hinnakiri (hourly price table)
├── tehtud-tood.html    Tehtud tööd (before/after gallery with category filter)
├── kontakt.html        Kontakt (Instagram, phone, inquiry form, address)
├── css/styles.css      All styles, commented and numbered by section
├── js/main.js          Menu, slider, gallery filter, form. CONFIG block at the top
├── assets/
│   ├── favicon.svg     Placeholder "M" icon (replace with logo version)
│   └── img/            Put all photos here
├── 404.html          "Page not found" page
├── robots.txt
└── sitemap.xml
```

The header and footer are repeated in all 4 HTML files. If you change the menu, change it in all four
(or move them into includes if the host supports PHP / you use a static site generator).

To preview locally, run `npx wrangler dev` in the repository root (links use `/`-paths, so opening the files directly won't navigate correctly).

---

## 2. Must do before launch

The domain (`https://www.misfire.ee`) is already set in canonical links, Open Graph tags, JSON-LD, `robots.txt` and `sitemap.xml`. The table lists what is left.

| # | What | Where |
|---|------|-------|
| 1 | Hosting | Cloudflare Pages (free). Point `misfire.ee` and `www.misfire.ee` at the Pages project; redirect `misfire.ee` to `www.misfire.ee` so the canonical address matches. |
| 2 | Logo | Replace `<span class="brand-word">Misfire</span>` in the header of all 4 pages with `<img class="brand-logo" src="assets/logo.svg" alt="Misfire Customs">`. SVG preferred; white version on transparent. Height is set to 40px in CSS. |
| 3 | Favicon | Replace `assets/favicon.svg` with an icon made from the logo. Also add `assets/apple-touch-icon.png` (180×180) and link it in `<head>`. |
| 4 | Photos | See section 3. Every grey/orange striped box is a placeholder. |
| 5 | Social share image | `assets/og-image.jpg`, 1200×630. Best before/after shot with the logo. |
| 6 | Opening hours | Currently `E–R 10:00–18:00` (placeholder, confirm with owner). In footer of all pages, `kontakt.html`, and `openingHours` in the JSON-LD in `index.html`. |
| 7 | Instagram | Set to `@misfire.studio`. Message buttons open `https://ig.me/m/misfire.studio`; username is also in `CONFIG.instagram` in `js/main.js`. |
| 8 | Contact form | Decide how it sends. See section 5. |

Phone (`+372 5698 4655`), Instagram (`@misfire.studio`) and address (`Iva 12, Tallinn`) are already correct.

---

## 3. Photos

All placeholders are `<div class="ph">…</div>`. Replace each one with an `<img>`. Commented example `<img>` tags are already in the hero.

| Spot | File name (suggested) | Size | Notes |
|------|----------------------|------|-------|
| Hero slider, before | `img/hero-enne.webp` | 1600×1200 (4:3) | Same car, same angle, same framing as the after shot, or the slider won't line up |
| Hero slider, after | `img/hero-parast.webp` | 1600×1200 (4:3) | |
| Home "Viimased tööd" (×4) | `img/too-1.webp` … | 1000×1000 (1:1) | One strong "after" shot each |
| Gallery pairs (×6 to start) | `img/galerii-toonimine-1-enne.webp`, `…-parast.webp` | 1000×1000 (1:1) each | Before and after side by side |
| Share image | `og-image.jpg` | 1200×630 | JPG for social platforms |

- Export as WebP, quality ~80, under ~250 KB each.
- Always set `width`, `height` and Estonian `alt` text, e.g. `alt="Esituled enne poleerimist"`.
- Add `loading="lazy"` to every image except the two hero images.

Replacing a placeholder:

```html
<!-- before -->
<div class="frame"><div class="ph">Foto: toonimine</div></div>

<!-- after -->
<div class="frame">
  <img src="assets/img/too-2.webp" alt="Toonitud tagaaknad" width="1000" height="1000" loading="lazy">
</div>
```

In the hero slider and gallery pairs, keep the `<span class="ba-tag">` labels ("Enne" / "Pärast"); only replace the `.ph` div. Images inside frames are already styled with `object-fit: cover`.

### Adding a gallery item

Copy one `<figure class="pair">` in `tehtud-tood.html`. `data-cat` must be one of the filter values:
`toonimine`, `keretood`, `puhastus`, `mehaanika`. New categories need a matching `<button class="chip" data-filter="…">`.

```html
<figure class="pair" data-cat="puhastus">
  <div class="pair-frames">
    <div><img src="assets/img/galerii-puhastus-2-enne.webp" alt="Salong enne puhastust" width="1000" height="1000" loading="lazy"><span class="ba-tag ba-tag-before">Enne</span></div>
    <div><img src="assets/img/galerii-puhastus-2-parast.webp" alt="Salong pärast puhastust" width="1000" height="1000" loading="lazy"><span class="ba-tag ba-tag-before">Pärast</span></div>
  </div>
  <figcaption><span class="title">Sisepuhastus</span><span class="cat">Puhastus</span></figcaption>
</figure>
```

---

## 4. Design system

All values are CSS custom properties at the top of `css/styles.css`.

| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#0A0A0A` | Page background |
| `--surface` | `#141414` | Form fields |
| `--line` | `#333333` | Dividers |
| `--outline` | `#CFCFCF` | Card and outline-button borders |
| `--text` | `#FFFFFF` | Main text |
| `--muted` | `#B3B3B3` | Secondary text (9.6:1 contrast) |
| `--accent` | `#F7931E` | Misfire orange: buttons, prices, active menu item |
| `--on-accent` | `#0A0A0A` | Text on orange (white on this orange fails contrast) |

- **Font:** Montserrat 500/600/700/800 + 900 italic (wordmark), from Google Fonts. Headings are uppercase 800.
- **Breakpoints:** base = phone, `700px` = tablet (desktop menu appears), `1024px` = desktop (2-column hero and contact).
- **Radius:** 10px buttons/inputs, 14px cards and images.
- **Tap targets:** everything interactive is at least 44px tall. Form inputs are 16px text so iPhones don't zoom in.

---

## 5. Contact form

Right now the form validates, then shows the request text and a button that copies it and opens an Instagram message to @misfire.studio (Instagram can't pre-fill messages, so the customer pastes it). It works with no server, but nothing is emailed.

To send it by email instead, set `formEndpoint` in the `CONFIG` block at the top of `js/main.js`. The form POSTs JSON: `{ name, phone, car, message }`. Options:

- **Formspree** or **Web3Forms**: free tier, create a form, paste its URL into `formEndpoint`. Nothing else to change.
- **Own PHP script** on the host: accept the JSON POST, send the mail, return HTTP 200.

The success and error messages are already written in Estonian in `main.js`.

GDPR: the form collects a name and phone number. Add a one-line privacy note under the submit button (who receives it, what it is used for) and a short privacy page if the owner wants to be thorough.

---

## 6. Map, fonts and privacy

- **Map:** the site links to Google Maps instead of embedding it. An embedded Google map sets cookies, which in the EU means adding a cookie consent banner. If the owner wants the embed anyway:
  `<iframe src="https://www.google.com/maps?q=Iva+12,+Tallinn&output=embed" width="100%" height="320" style="border:0;border-radius:14px" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Misfire Customs kaardil"></iframe>`
  together with a consent solution.
- **Fonts:** loading from Google Fonts sends visitor IPs to Google. To avoid that, self-host Montserrat (download woff2 files via google-webfonts-helper, put them in `assets/fonts/`, replace the Google `<link>` tags with `@font-face` rules). The Estonian characters õ ä ö ü š ž are needed, so include the `latin` and `latin-ext` subsets.

---

## 7. Content notes for the owner

- The price list only covers mechanical work. Keretööd and toonimine have no prices, so their cards on the home page link to "Küsi hinda" (contact) instead of the price list. Add prices to `hinnakiri.html` if wanted.
- Mobile action bar: phones show a fixed "Helista / Instagram" bar at the bottom of every page except Kontakt. To remove it, delete the `<div class="action-bar">` block and `class="has-action-bar"` on `<body>` in each page.

---

## 8. SEO and launch

Already in place: unique `<title>` and meta description per page, canonical URLs, Open Graph tags, `AutoRepair` structured data (JSON-LD) on the home page, `robots.txt`, `sitemap.xml`, semantic headings, Estonian language tag.

After launch:
1. Create or claim the **Google Business Profile** for Misfire Customs at Iva 12. For a local garage this brings more calls than the website itself. Link it to the site.
2. Submit `sitemap.xml` in Google Search Console.
3. Check the page in Google's Rich Results Test (for the JSON-LD).

### Test checklist
- [ ] iPhone Safari and Android Chrome: menu opens and closes, all links work, no sideways scrolling
- [ ] Before/after slider drags on touch and with keyboard arrows
- [ ] "Helista" opens the dialler, Instagram buttons open a message to @misfire.studio
- [ ] Form: empty submit shows errors; filled submit sends (or copies the text and opens Instagram)
- [ ] Gallery filters show and hide the right items
- [ ] Lighthouse: aim for 90+ on Performance, Accessibility, SEO (mobile)
