import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-lab relative flex min-h-[100svh] flex-col justify-center">
      <div aria-hidden className="dot-grid absolute inset-0 -z-10" />
      <p className="label mb-6">retriever.search(path) → 0 results</p>
      <h1 className="font-display text-display font-medium">
        404<span className="text-cyan">.</span>
      </h1>
      <p className="mt-6 max-w-md text-muted">
        Document not retrieved. Top score: <span className="font-mono text-text">0.00</span>. The page you queried
        isn&apos;t in this index.
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex w-fit items-center gap-2 rounded-full border border-line-strong bg-surface px-5 py-3 font-mono text-[12px] uppercase tracking-[0.08em] hover:border-cyan/50 hover:text-cyan"
      >
        ← Re-run query from home
      </Link>
    </section>
  );
}
