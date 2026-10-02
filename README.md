# eventpartner.ge

First working version of the multilingual eventpartner.ge website. It is a dependency-light static site with English, Russian and Georgian pages generated from separate content modules.

## Local setup

Node.js 20+ is recommended. There are no runtime dependencies.

```bash
npm run build
npm run check
```

Open `dist/index.html` directly or serve `dist/` with any local static server. If `serve` is available, run:

```bash
npm run dev
```

## Structure

- `src/content/` — EN, RU and KA content
- `src/assets/images/` — optimised responsive WebP event photography
- `src/styles.css` — full responsive visual system
- `src/script.js` — mobile navigation and demo-form behaviour
- `scripts/build.mjs` — static page generator
- `scripts/check.mjs` — local release checks
- `dist/` — generated site

## Next production stage

Before launch, connect the real lead-delivery service, deployment configuration, the production domain, analytics and Search Console. Canonical, hreflang, sitemap and structured-data foundations are already present so these integrations can be added without rebuilding the site architecture.
