import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, FileText } from "lucide-react";
import { profile, projects } from "@/data/portfolio";
import { GitHubIcon } from "@/components/ui/BrandIcons";
import { Reveal } from "@/components/ui/Reveal";
import { Tag } from "@/components/ui/Tag";
import { DomainGlyph } from "@/components/sections/DomainGlyph";
import { Footer } from "@/components/sections/Footer";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.summary,
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: { title: `${p.title} — ${profile.name}`, description: p.summary, type: "article" },
  };
}

export default async function CaseStudy({ params }: Params) {
  const { slug } = await params;
  const idx = projects.findIndex((x) => x.slug === slug);
  const p = projects[idx];
  if (!p) notFound();
  const next = projects[(idx + 1) % projects.length]!;

  return (
    <>
      <article className="relative pb-24 pt-[calc(var(--nav-h)+3rem)]">
        <div aria-hidden className="dot-grid absolute inset-x-0 top-0 -z-10 h-[70vh]" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[80vh] bg-[radial-gradient(ellipse_45%_55%_at_90%_0%,rgba(124,58,237,0.16),transparent_70%)]" />
        <div className="container-lab">
          <Reveal>
            <Link href="/#work" className="label inline-flex items-center gap-2 transition-colors hover:!text-cyan">
              <ArrowLeft className="size-3.5" /> All work
            </Link>
          </Reveal>

          <header className="mt-10 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Reveal delay={0.05}>
                <div className="flex flex-wrap items-center gap-2">
                  <Tag active>{p.domain}</Tag>
                  <span className="font-mono text-[12px] text-muted">
                    {p.org ? `${p.org} · ` : ""}
                    {p.period}
                  </span>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 className="mt-6 font-display text-[clamp(2.5rem,6vw,5rem)] font-medium leading-[0.98] tracking-[-0.035em] text-balance">
                  {p.title}
                </h1>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="mt-6 max-w-2xl text-lg text-muted">{p.summary}</p>
              </Reveal>
            </div>
            <Reveal delay={0.2} className="lg:col-span-4">
              <dl className="grid grid-cols-2 gap-2">
                {p.metrics.map((m) => (
                  <div key={m.label} className="glass rounded-xl p-4">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-faint">{m.label}</dt>
                    <dd className="mt-1 font-mono text-2xl tabular-nums">{m.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </header>

          {(p.domain === "RAG" || p.domain === "CV") && (
            <Reveal className="glass mt-16 grid h-64 place-items-center rounded-3xl p-8 md:h-80">
              <DomainGlyph domain={p.domain} large />
            </Reveal>
          )}

          <div className="mt-16 grid gap-12 lg:grid-cols-12">
            <div className="space-y-12 lg:col-span-8">
              <Reveal as="section">
                <h2 className="label mb-4">The problem</h2>
                <p className="text-xl leading-relaxed text-text">{p.problem}</p>
              </Reveal>
              <Reveal as="section">
                <h2 className="label mb-4">What I built</h2>
                <ol className="space-y-4">
                  {p.highlights.map((h, i) => (
                    <li key={h} className="flex gap-5 border-t border-line pt-4">
                      <span className="font-mono text-[12px] text-cyan">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-[17px] leading-relaxed text-muted">{h}</span>
                    </li>
                  ))}
                </ol>
              </Reveal>
            </div>
            <aside className="lg:col-span-4">
              <Reveal className="glass sticky top-24 rounded-2xl p-6">
                <h2 className="label mb-3">Stack</h2>
                <ul className="flex flex-wrap gap-1.5">
                  {p.stack.map((s) => (
                    <li key={s}>
                      <Tag>{s}</Tag>
                    </li>
                  ))}
                </ul>
                {(p.links.github || p.links.paper || p.links.demo) && (
                  <>
                    <h2 className="label mb-3 mt-8">Links</h2>
                    <div className="flex flex-col gap-2">
                      {p.links.github && (
                        <a href={p.links.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-text hover:text-cyan">
                          <GitHubIcon className="size-4" /> Source code ↗
                        </a>
                      )}
                      {p.links.paper && (
                        <a href={p.links.paper} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-text hover:text-cyan">
                          <FileText className="size-4" /> Paper ↗
                        </a>
                      )}
                      {p.links.demo && (
                        <a href={p.links.demo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-text hover:text-cyan">
                          <ArrowRight className="size-4" /> Live demo ↗
                        </a>
                      )}
                    </div>
                  </>
                )}
              </Reveal>
            </aside>
          </div>

          <Reveal className="mt-24">
            <Link
              href={`/work/${next.slug}`}
              className="glass group flex items-center justify-between gap-6 rounded-3xl p-8 transition-colors hover:border-cyan/30 md:p-12"
            >
              <div>
                <div className="label mb-3">Next project</div>
                <div className="font-display text-2xl font-medium tracking-tight md:text-4xl">{next.title}</div>
              </div>
              <ArrowRight className="size-8 shrink-0 text-muted transition-all duration-500 group-hover:translate-x-2 group-hover:text-cyan" />
            </Link>
          </Reveal>
        </div>
      </article>
      <Footer />
    </>
  );
}
