# rushi-portfolio

The personal site of Rushikesh Nale, built with Next.js 16 (App Router), TypeScript (strict), Tailwind CSS v4, Framer Motion and Lenis.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Where things live

| What | Where |
|---|---|
| All content (bio, projects, timeline, links) | `src/data/portfolio.ts` |
| Design tokens (colors, type scale, utilities) | `src/app/globals.css` |
| Motion tokens (easing, springs) | `src/lib/motion.ts` |
| Hero latent-space field | `src/components/hero/LatentField.tsx` |
| Field data (2D-projected chunk embeddings) | `src/data/embeddings.json` ← `scripts/bake_embeddings.py` |
| RAG demo (questions, ranks, answers, eval metrics) | `src/data/rag-demo.ts` |
| Lab demos | `src/components/lab/` |
| Sections (Work, Research, Timeline, Stack, Contact, Footer) | `src/components/sections/` |
| Case-study pages | `src/app/work/[slug]/page.tsx` (generated from `projects`) |
| Command palette (⌘K / Ctrl+K) | `src/components/layout/CommandPalette.tsx` |

## How the Lab demos work

- **RAG pipeline:** the passages are real Constitution text. The ranks, scores, latencies and aggregate metrics in `rag-demo.ts` are placeholders; replace them with numbers from your own retriever and eval runs.
- **Inference terminal:** the parking-lot scene and the raw detector output are simulated, but confidence filtering, class-wise NMS and the TP/FP/duplicate counts are computed in the browser on every frame.
- **Contact form:** it checks the fields, then opens the visitor's mail client with the message already filled in. There's no backend to host and no third-party service.

Placeholder metrics show a small amber dot in `npm run dev` only. Production builds never show the dot.

## Before going live: replace placeholders

Search the codebase for `⚠ REPLACE`. Each match is a placeholder, mostly links and metrics.

1. **Photo:** `public/media/rushi.jpg` is already processed (4:5 crop, background matched to the site). To swap it, replace the file at 960×1200.
2. **Résumé:** add a public `public/resume.pdf` with your phone number and registration number removed.
3. **Repos:** project `links.github` point to your profile; change them to the individual repo URLs.
4. **Metrics:** change each `placeholder: true` metric to your real numbers.
5. **Hero field:** feed it your real corpus:
   ```bash
   pip install sentence-transformers umap-learn numpy
   python scripts/bake_embeddings.py --chunks path/to/chunks.jsonl
   ```

## Deploy

See **[DEPLOY.md](./DEPLOY.md)** for the steps: GitHub, then Vercel, then a custom domain, then checks.

## Performance notes

- The hero's first paint doesn't wait for JavaScript. The headline and bio animate with plain CSS, so the largest text shows up right away.
- The hero canvas starts only once the browser is idle. Phones draw half the points at about 30 fps.
- Each Lab demo's code loads only when you scroll near it.
- Framer Motion loads its animation features in a separate file after the page appears (`LazyMotion` in `src/components/layout/MotionProvider.tsx`).
- Sections are server components where possible. Only the interactive parts send JavaScript to the browser.
- The scroll fade-ins use one shared IntersectionObserver and plain CSS, not Framer Motion.
- Off-screen sections use `content-visibility: auto`. The custom cursor and the ⌘K palette load after the page is idle, and the cursor is never loaded on touch devices.
- Only animate `transform` and `opacity`. Run `npm run audit:lh` while `npm start` is running to check scores locally.
