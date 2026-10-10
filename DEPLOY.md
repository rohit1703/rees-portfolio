# Deploying rees-portfolio

Two folders, both aimed at the same Vercel project (`rees-portfolio-deploy` in the `rohit1703s-projects` team, live at
https://reethika-chitithoti.vercel.app):

| Folder | What goes live |
|---|---|
| `1-holding-page` | Only "Ree's Portfolio / A little space for Ree's work, ideas, and everything still to come. / More to come." Every URL shows this page. |
| `2-full-portfolio` | The full site: home page, three case studies, resume. |

Whichever you deploy last is what the site shows. Deploying the full portfolio later replaces the holding page.

## Before the first deploy (once per computer)

Install Node.js 20 or newer from nodejs.org, then sign in to Vercel:

```bash
npx vercel login
```

## Now: put the holding page live

```bash
cd 1-holding-page
npm run deploy:link     # connects the folder to rees-portfolio-deploy (asks nothing)
npm run deploy          # publishes; prints the live URL
```

## Later: launch the full portfolio

```bash
cd 2-full-portfolio
npm install
npm run deploy:link
npm run deploy          # runs tests, lint, type and build checks first; stops if any fail
```

Want to look at it privately first? `npm run deploy:preview` gives a preview URL without changing the live site.

## Adding a domain (optional, any time)

1. Vercel → rees-portfolio-deploy → Settings → Domains → add `yourdomain.com` and `www.yourdomain.com`.
2. At the registrar, add: `A` record `@` → `76.76.21.21`, and `CNAME` record `www` → `cname.vercel-dns.com`
   (use the values Vercel shows if they differ).
3. When Vercel shows "Valid Configuration", HTTPS is set up automatically.
4. For the full portfolio, also set `NEXT_PUBLIC_SITE_URL=https://yourdomain.com` in Settings → Environment
   Variables (Production), then run `npm run deploy` again.

## If something goes wrong

- **"Project not found" on deploy:link**: check you're signed in to the account that owns the
  `rohit1703s-projects` team (`npx vercel whoami`).
- **A check fails during `npm run deploy`**: nothing was uploaded; the message names the failing check.
- **Roll back**: Vercel → rees-portfolio-deploy → Deployments → pick an earlier one → "Promote to Production".
