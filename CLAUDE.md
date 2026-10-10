# rees-portfolio

Ree's (Reethika Chitithoti's) UX portfolio. `1-holding-page/` is the static "More to come" page;
`2-full-portfolio/` is the Next.js site that is live. Both deploy to the `rees-portfolio-deploy` Vercel project
(`rohit1703s-projects`), which builds `2-full-portfolio` from `main` on every push. See `DEPLOY.md`.

## Pull requests

- Title format: `[Area] Summary`, e.g. `[SEO] Resolve site origin from Vercel`, `[Icons] Use the duck as the
  site icon`, `[Home] Match the hero to the Framer original`. Area is the part of the site or repo touched
  (Home, Case studies, SEO, Icons, Deploy, Repo, …); Summary is one imperative sentence.
- Before opening a PR, run `npm run check` in `2-full-portfolio` (typecheck, lint, tests, build, verify).
