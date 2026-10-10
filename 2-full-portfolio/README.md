# Reethika Chitithoti — UX portfolio

The home page and three case studies (AI Interviewer, SDK Manager, Pet Health Scan Suite), rebuilt as a standalone
Next.js site from the Framer original at `reethikachitithoti.framer.website`. Everything is self-hosted: images,
fonts, the resume PDF and the social card. The production build makes no requests to Framer.

| Route | What it is |
|---|---|
| `/` | Home: hero, About, Work, Skills, Experience & Education, crossword, "Let's talk" footer |
| `/ai-interviewer`, `/sdk-manager`, `/pet-health-scan` | Case studies (layered scroll on desktop, swipe cards on phones) |
| `/ai-interviewer-poster` | AI Interviewer in the "Poster" theme, for comparison (not indexed) |
| `/sitemap.xml`, `/robots.txt`, `/opengraph-image`, `/icon.png`, `/apple-icon.png`, `/favicon.ico` | SEO and social |

## Run it locally

Needs Node 20.9 or newer.

```bash
npm install
npm run dev          # http://localhost:3000
```

## Test and check

```bash
npm test             # component and interaction tests (Vitest + Testing Library)
npm run lint
npm run typecheck
npm run build        # production build
npm run verify       # fails if the build references Framer or an image is missing
npm run check        # all of the above, in order (run this before every deploy)
```

What the tests cover: every image is present locally; nothing in `app/`, `components/` or `lib/` references
Framer; the crossword (typing, wrong letters in red, Backspace, clue selection, solving, Reveal); the home page
(sections, work-card links and anchors, lazy images, image-error fallback, menu open/Escape, resume download,
contact links); each case study (hero, section nav, Next / Back links, eager hero image, reduced-motion fallback);
the Pet Health before/after slider and full-screen viewer; client-side link routing; sitemap, robots and metadata.

## Deploy to Vercel

The Vercel project is `rees-portfolio-deploy` in the `rohit1703s-projects` team. The Vercel CLI is a dev dependency, and
`vercel.json` pins the framework, install and build commands.

```bash
npm install
npx vercel login         # once per computer; opens a browser to sign in
npm run deploy:link      # once: connects this folder to rees-portfolio-deploy
npm run deploy           # runs every check, then publishes to production and prints the URL
```

`npm run deploy:preview` publishes a private preview URL instead, without touching production. The deploy stops
before uploading if any test, lint, type or build check fails.

Or push this folder to a GitHub repo and connect it in the project's Settings → Git. Every push to `main` then
deploys automatically.

Set one environment variable in the Vercel project (Settings → Environment Variables), for Production:

```
NEXT_PUBLIC_SITE_URL = https://your-domain.com
```

It's used for canonical URLs, the sitemap and the social card. Without it they fall back to
`https://reethika-chitithoti.vercel.app`. Redeploy after setting it.

### Custom domain

1. In the Vercel project: Settings → Domains → add `your-domain.com` and `www.your-domain.com`
   (or run `npx vercel domains add your-domain.com`).
2. At the registrar where the domain is bought, add these DNS records:

   | Type | Name | Value |
   |---|---|---|
   | A | `@` | `76.76.21.21` |
   | CNAME | `www` | `cname.vercel-dns.com` |

   Vercel's Domains page shows the exact values it expects for your project; if they differ from the table, use theirs.
   Remove any old A/CNAME records for `@` and `www` (for example ones pointing at Framer).
3. Wait for the Domains page to show "Valid Configuration". Vercel issues the HTTPS certificate automatically,
   usually within minutes. Check with `curl -I https://your-domain.com` (expect `HTTP/2 200`).
4. Set `NEXT_PUBLIC_SITE_URL` (above) and redeploy.
5. If the domain was connected to Framer, disconnect it there so Framer stops claiming it.

## Updating content

All copy lives in the components, next to the layout it belongs to:

| To change | Edit |
|---|---|
| Home page text, skills, experience, education, talks | `components/home/HomePage.tsx` |
| Email, LinkedIn, Behance, resume link, badge text, footer credit | props in `app/page.tsx` |
| Crossword words and clues | `WORDS` at the top of `components/home/Crossword.tsx` |
| A case study's text | `components/case-study/AIInterviewer.tsx`, `SDKManager.tsx`, `PetHealth.tsx` (the `scenes` list) |
| Case-study colours, type sizes, scroll behaviour | `components/case-study/kit.tsx` (`THEMES`, `H2`, `Stage` …) |
| Page titles and descriptions for search/social | `lib/site.ts` |
| Resume | replace `public/Reethika_Chitithoti_Resume.pdf` (keep the name) |

### Images

Images live in `public/images` as WebP in up to three widths (800 / 1600 / 2400 px), listed in
`lib/image-manifest.json`. Pages refer to them by their original file name, e.g.
`asset("bEbCD30d6mkFM0a6Oqcd2PBUU.png", "alt text")`.

- **Replace an image:** save the new picture as `<same name>.png` (or .jpg) in any folder and run
  `node scripts/import-assets.mjs path/to/folder`. It regenerates the WebP sizes and the manifest.
- **Add an image:** give it a new name, import it the same way, then use `asset("new-name.png", "alt")` in the page.
- **Videos** (the placeholders marked AI-03, AI-04, AI-11, SDK-01, SDK-02, SDK-14): put the `.mp4` in
  `public/videos/` and pass its path to the page, e.g. `<CaseStudy v1Media="/videos/ai-v1.mp4" />` in
  `app/ai-interviewer/page.tsx`. Prop names are in each case-study component's `Props` type.

If an image is missing or fails to load, the site shows a labelled placeholder instead of a broken image.
`npm run fetch-assets` re-downloads the originals from the old Framer CDN (one-time migration helper; only
needed if `public/images` is lost while the Framer site still exists).

## How the Framer behaviour was rebuilt

The original pages were Framer code components written for this portfolio, so the structure, copy, timings and
easing were taken from that source and from the live DOM, not estimated. Framer's runtime pieces were replaced:

| Framer piece | Replacement |
|---|---|
| `framer-motion` | `motion` (the same library under its current name), `<MotionConfig reducedMotion="user">` in the layout |
| Framer router (`useRouter`) for internal links | `lib/useInternalLinks.ts`: one click handler that routes `/…` links with Next's router and remembers `#card` targets |
| Canvas vs preview detection (`RenderTarget`) | Removed: the site is always "live"; reduced motion still gets the stacked case-study layout |
| Property controls (editor panel) | Plain props with the same defaults, set in `app/*/page.tsx` |
| Google Fonts via `<link>` | Self-hosted WOFF2 in `public/fonts` (`@font-face` in `app/globals.css`, preloaded) |
| `framerusercontent.com` images and resume | `public/images/*.webp` (+ srcset) and `public/Reethika_Chitithoti_Resume.pdf` |

Scroll effects: the case studies' layered sections are a sticky stage redrawn with `requestAnimationFrame`
(eased toward the scroll position; 1:1 on touch). The home page's curved section edges, badge rotation, parallax
work images and footer "Let's talk" layers use Motion's `useScroll`/`useTransform`; entrance animations use
`whileInView`/`useInView` (IntersectionObserver).

## Accessibility and performance notes

- Semantic landmarks (`main`, `header`, `nav`, `footer`), a skip link, visible keyboard focus, labelled controls,
  keyboard-operable crossword, slider, menu (Escape closes) and image viewers.
- `prefers-reduced-motion`: Motion transforms jump to their end state, CSS transitions are near-instant, and case
  studies switch to a plain stacked page.
- Images are WebP with `srcset`, `width`/`height`, `loading="lazy"` (hero images eager), fonts preloaded with
  `font-display: swap`, all pages statically generated, long-lived cache headers on `/images` and `/fonts`, and a
  strict Content-Security-Policy that only allows this site's own origin.
