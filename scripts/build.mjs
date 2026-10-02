import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import en from "../src/content/en.mjs";
import ru from "../src/content/ru.mjs";
import ka from "../src/content/ka.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const languages = [en, ru, ka];
const domain = "https://eventpartner.ge";
const [styles, script] = await Promise.all([
  readFile(path.join(root, "src/styles.css")),
  readFile(path.join(root, "src/script.js"))
]);
const version = createHash("sha256").update(styles).update(script).digest("hex").slice(0, 10);

const esc = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const picture = ({ name, alt, className = "", eager = false }) => `
  <picture class="media ${className}">
    <source media="(max-width: 720px)" srcset="/assets/images/${name}-720.webp">
    <img src="/assets/images/${name}.webp" alt="${esc(alt)}" width="1280" height="960" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
  </picture>`;

const eyebrow = (text) => `<p class="eyebrow"><span aria-hidden="true"></span>${esc(text)}</p>`;
const languageLinks = (active, className = "language-switcher") => `
  <nav class="${className}" aria-label="Language">
    ${languages.map((item) => `<a href="${item.path}" lang="${item.lang}" hreflang="${item.lang}" ${item.lang === active ? 'aria-current="page"' : ""}>${item.lang.toUpperCase()}</a>`).join("")}
  </nav>`;

const render = (c) => {
  const canonical = `${domain}${c.path}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${domain}/#organization`, name: "eventpartner.ge", url: domain, parentOrganization: { "@type": "Organization", name: "SWAGGY.agency", url: "https://swaggy.agency" }, address: { "@type": "PostalAddress", addressLocality: "Tbilisi", addressCountry: "GE" } },
      { "@type": "WebSite", "@id": `${domain}/#website`, url: domain, name: "eventpartner.ge", publisher: { "@id": `${domain}/#organization` }, inLanguage: ["en", "ru", "ka"] },
      { "@type": "Service", "@id": `${canonical}#service`, name: c.hero.title, description: c.meta.description, areaServed: { "@type": "Country", name: "Georgia" }, provider: { "@id": `${domain}/#organization` } }
    ]
  };

  return `<!doctype html>
<html lang="${c.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(c.meta.title)}</title>
  <meta name="description" content="${esc(c.meta.description)}">
  <meta name="theme-color" content="#17243c">
  <link rel="canonical" href="${canonical}">
  ${languages.map((item) => `<link rel="alternate" hreflang="${item.lang}" href="${domain}${item.path}">`).join("\n  ")}
  <link rel="alternate" hreflang="x-default" href="${domain}/">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/styles.css?v=${version}">
  <script type="application/ld+json">${JSON.stringify(structuredData)}</script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header" data-header>
    <a class="brand brand--endorsed" href="${c.path}" aria-label="eventpartner.ge home"><span class="brand__wordmark"><span>eventpartner</span><b>.ge</b></span><small class="brand__endorsement">Powered by SWAGGY</small></a>
    <nav class="desktop-nav" aria-label="Primary">
      <a href="#what-we-do">${esc(c.nav.work)}</a>
      <a href="#georgia">${esc(c.nav.georgia)}</a>
      <a href="#services">${esc(c.nav.services)}</a>
      <a href="#process">${esc(c.nav.process)}</a>
      <a href="#contact">${esc(c.nav.contact)}</a>
    </nav>
    <div class="header-actions">
      ${languageLinks(c.lang)}
      <a class="button button--compact" href="#contact">${esc(c.nav.cta)}</a>
      <button class="menu-button" type="button" data-menu-button aria-expanded="false" aria-controls="mobile-menu">
        <span>${esc(c.nav.menu)}</span><i aria-hidden="true"></i>
      </button>
    </div>
    <div class="mobile-menu" id="mobile-menu" data-mobile-menu hidden>
      <nav aria-label="Mobile">
        <a href="#what-we-do">${esc(c.nav.work)}</a>
        <a href="#georgia">${esc(c.nav.georgia)}</a>
        <a href="#services">${esc(c.nav.services)}</a>
        <a href="#process">${esc(c.nav.process)}</a>
        <a href="#contact">${esc(c.nav.contact)}</a>
      </nav>
      ${languageLinks(c.lang, "language-switcher language-switcher--mobile")}
    </div>
  </header>

  <main id="main">
    <section class="hero">
      ${picture({ name: "hero-event-space", alt: c.hero.alt, className: "hero__image", eager: true })}
      <div class="hero__shade" aria-hidden="true"></div>
      <div class="hero__content shell">
        ${eyebrow(c.hero.eyebrow)}
        <h1>${esc(c.hero.title)}</h1>
        <p class="hero__body">${esc(c.hero.body)}</p>
        <div class="hero__actions">
          <a class="button button--light" href="#contact">${esc(c.hero.primary)}</a>
        </div>
        <ul class="hero__proof">${c.hero.proof.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
      </div>
      <p class="image-caption hero__caption">${esc(c.hero.caption)}</p>
    </section>

    <section class="section proof-section" id="what-we-do">
      <div class="shell">
        <div class="section-heading section-heading--split">
          <div>${eyebrow(c.proof.eyebrow)}<h2>${esc(c.proof.title)}</h2></div>
          <p>${esc(c.proof.body)}</p>
        </div>
        <ol class="flow-strip">${c.proof.flow.map((item, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span>${esc(item)}</li>`).join("")}</ol>
        <div class="proof-grid proof-grid--compact">
          <figure class="proof-grid__large">
            ${picture({ name: "venue-exterior", alt: c.proof.images.venueAlt })}
            <figcaption>${esc(c.proof.images.venueCaption)}</figcaption>
          </figure>
          <figure class="proof-grid__small">
            ${picture({ name: "production-equipment", alt: c.proof.images.productionAlt })}
            <figcaption>${esc(c.proof.images.productionCaption)}</figcaption>
          </figure>
          <p class="proof-grid__note">Great experience<br><span>backed by</span><br>great organisation.</p>
        </div>
        <div class="format-grid format-grid--compact">${c.formats.items.slice(0, 4).map(([title, body], index) => `
          <article class="format-card"><span>${String(index + 1).padStart(2, "0")}</span><h3>${esc(title)}</h3><p>${esc(body)}</p></article>`).join("")}
        </div>
      </div>
    </section>

    <section class="section georgia-section" id="georgia">
      <div class="shell">
        <div class="section-heading section-heading--split">
          <div>${eyebrow(c.experience.eyebrow)}<h2>${esc(c.experience.title)}</h2></div>
          <p>${esc(c.experience.body)}</p>
        </div>
        <div class="georgia-grid">
          <article class="georgia-card">
            <div class="georgia-card__copy">
              ${eyebrow(c.venues.eyebrow)}
              <h3>${esc(c.venues.title)}</h3>
              <p>${esc(c.venues.body)}</p>
              <ul class="tag-list">${c.venues.tags.slice(0, 6).map((tag) => `<li>${esc(tag)}</li>`).join("")}</ul>
            </div>
            <figure>${picture({ name: "venue-branded-seating", alt: c.venues.alt })}</figure>
          </article>
          <article class="georgia-card georgia-card--wine">
            <figure>${picture({ name: "custom-wine-gifts", alt: c.wine.alt })}</figure>
            <div class="georgia-card__copy">
              ${eyebrow(c.wine.eyebrow)}
              <h3>${esc(c.wine.title)}</h3>
              <p>${esc(c.wine.body)}</p>
              <ul class="inline-list">${c.wine.items.slice(0, 4).map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="section production-section" id="services">
      <div class="shell">
        <div class="section-heading section-heading--split">
          <div>${eyebrow(c.team.eyebrow)}<h2>${esc(c.team.title)}</h2></div>
          <p>${esc(c.team.body)}</p>
        </div>
        <div class="production-grid">
          <article class="production-card">
            <figure>${picture({ name: "production-podcast", alt: c.team.alt })}</figure>
            <div class="production-card__copy">
              <h3>${esc(c.team.caption)}</h3>
              <ul class="role-list">${c.team.roles.slice(0, 6).map((role) => `<li>${esc(role)}</li>`).join("")}</ul>
            </div>
          </article>
          <article class="production-card production-card--merch">
            <figure>${picture({ name: "branded-lounge", alt: c.merch.images.loungeAlt })}</figure>
            <div class="production-card__copy">
              <h3>${esc(c.merch.title)}</h3>
              <p>${esc(c.merch.body)}</p>
              <ul class="inline-list">${c.merch.items.slice(0, 5).map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
            </div>
          </article>
        </div>
        <div class="scope-rail">
          <strong>${esc(c.scope.title)}</strong>
          <ul>${c.scope.items.slice(0, 8).map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
        </div>
      </div>
    </section>

    <section class="section process-section" id="process">
      <div class="shell">
        <div class="section-heading section-heading--split">
          <div>${eyebrow(c.process.eyebrow)}<h2>${esc(c.process.title)}</h2></div>
          <p>${esc(c.local.title)}</p>
        </div>
        <div class="local-grid local-grid--compact">${c.local.items.map(([title, body], index) => `
          <article><span>${String(index + 1).padStart(2, "0")}</span><h3>${esc(title)}</h3><p>${esc(body)}</p></article>`).join("")}</div>
        <ol class="process-list process-list--compact">${c.process.items.map(([number, title, body]) => `
          <li><span>${esc(number)}</span><h3>${esc(title)}</h3><p>${esc(body)}</p></li>`).join("")}</ol>
      </div>
    </section>

    <section class="contact-section" id="contact">
      <div class="shell contact-layout">
        <div class="contact-copy">${eyebrow(c.contact.eyebrow)}<h2>${esc(c.contact.title)}</h2><p>${esc(c.contact.body)}</p></div>
        <form class="lead-form" data-lead-form data-success="${esc(c.contact.success)}" action="#contact" method="post">
          <div class="field-row">
            <label><span>${esc(c.contact.fields.name)}</span><input name="name" type="text" placeholder="${esc(c.contact.placeholders.name)}" autocomplete="name" required></label>
            <label><span>${esc(c.contact.fields.email)}</span><input name="email" type="email" placeholder="${esc(c.contact.placeholders.email)}" autocomplete="email" required></label>
          </div>
          <div class="field-row field-row--three">
            <label><span>${esc(c.contact.fields.company)}</span><input name="company" type="text" placeholder="${esc(c.contact.placeholders.company)}" autocomplete="organization"></label>
            <label><span>${esc(c.contact.fields.date)}</span><input name="date" type="text" placeholder="${esc(c.contact.placeholders.date)}"></label>
            <label><span>${esc(c.contact.fields.guests)}</span><input name="guests" type="text" inputmode="numeric" placeholder="${esc(c.contact.placeholders.guests)}"></label>
          </div>
          <label><span>${esc(c.contact.fields.message)}</span><textarea name="message" rows="4" placeholder="${esc(c.contact.placeholders.message)}" required></textarea></label>
          <div class="form-footer"><button class="button button--light" type="submit">${esc(c.contact.submit)}</button><small>${esc(c.contact.note)}</small></div>
          <p class="form-success" data-form-success tabindex="-1" hidden></p>
        </form>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="shell footer-top">
      <a class="brand brand--footer brand--endorsed" href="${c.path}"><span class="brand__wordmark"><span>eventpartner</span><b>.ge</b></span><small class="brand__endorsement">Powered by SWAGGY</small></a>
      <p>${esc(c.footer.line)}</p>
      <a href="#contact">${esc(c.nav.cta)}</a>
    </div>
    <div class="shell footer-bottom"><span>${esc(c.footer.location)}</span><span>© ${new Date().getFullYear()} eventpartner.ge · ${esc(c.footer.rights)}</span><a class="footer-swaggy" href="https://swaggy.agency" target="_blank" rel="noopener">Powered by SWAGGY</a>${languageLinks(c.lang, "language-switcher language-switcher--footer")}</div>
  </footer>
  <script src="/assets/script.js?v=${version}" defer></script>
</body>
</html>`;
};

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, "assets"), { recursive: true });
await cp(path.join(root, "src/assets"), path.join(dist, "assets"), { recursive: true });
await writeFile(path.join(dist, "assets/styles.css"), styles);
await writeFile(path.join(dist, "assets/script.js"), script);
await cp(path.join(root, "src/favicon.svg"), path.join(dist, "favicon.svg"));

for (const content of languages) {
  const target = content.path === "/" ? dist : path.join(dist, content.lang);
  await mkdir(target, { recursive: true });
  await writeFile(path.join(target, "index.html"), render(content));
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${languages.map((item) => `  <url><loc>${domain}${item.path}</loc></url>`).join("\n")}
</urlset>\n`;
await writeFile(path.join(dist, "sitemap.xml"), sitemap);
await writeFile(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${domain}/sitemap.xml\n`);
await writeFile(path.join(dist, "404.html"), render(en).replace("<title>", "<title>Page not found · "));

console.log(`Built ${languages.length} localized pages in ${dist}`);
