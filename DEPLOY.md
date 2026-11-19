# Deploying to Vercel

This takes about 10 minutes. You need a GitHub account and Node 20.9 or newer (`node -v`).

## 1. Run it locally once

```bash
cd rushi-portfolio
npm install
npm run build && npm start      # http://localhost:3000, the production build
```

Click through every section. Then search the codebase for `⚠ REPLACE` and swap in your real metrics and links.

## 2. Push to GitHub

Create an **empty** repo at https://github.com/new, e.g. `rushikeshnale07/portfolio`. Leave out the README, .gitignore and license so the first push doesn't conflict. Then:

```bash
git init
git add .
git commit -m "Portfolio v1"
git branch -M main
git remote add origin https://github.com/rushikeshnale07/portfolio.git
git push -u origin main
```

The GitHub Actions workflow in `.github/workflows/ci.yml` runs the type check and production build on every push.

## 3. Import into Vercel

1. Go to https://vercel.com/new and sign in with GitHub.
2. **Import** the `portfolio` repo. Vercel detects Next.js, so leave the build settings at their defaults.
3. Under **Environment Variables**, add:
   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://<your-project>.vercel.app` (change it if you add a custom domain later) |
4. Click **Deploy**. About a minute later the site is live at `https://<your-project>.vercel.app`.

Every later `git push` to `main` deploys to production automatically. Pull requests get their own preview URLs.

> Rename the project under **Settings → General** to get a cleaner URL such as `rushikeshnale.vercel.app`. Then update `NEXT_PUBLIC_SITE_URL` and redeploy.

## 4. Custom domain (optional)

Under **Settings → Domains**, add the domain (e.g. `rushikeshnale.dev`) and create the DNS record Vercel shows you. HTTPS is set up automatically. Then update `NEXT_PUBLIC_SITE_URL` and redeploy, so canonical links, the sitemap and the link-preview image use the new domain.

## 5. Check it

- **Lighthouse:** open https://pagespeed.web.dev and test your live URL on both mobile and desktop.
- **Link previews:** paste your URL into https://www.opengraph.xyz, or into a LinkedIn post draft, and check that the preview card shows up.
- **Google:** in https://search.google.com/search-console, add the site and submit `https://<your-url>/sitemap.xml`.
- **Headers:** run `curl -I https://<your-url>` and check that `x-frame-options`, `content-security-policy` and `referrer-policy` are present.

## Updating content later

Edit `src/data/portfolio.ts` (or `src/data/rag-demo.ts`), then commit and push. Vercel redeploys in about a minute.

To change the photo, replace `public/media/rushi.jpg` (960×1200). To change the résumé, replace `public/resume.pdf`, and remove your phone number and registration number from it first.
