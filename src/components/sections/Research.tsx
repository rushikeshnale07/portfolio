import { ArrowUpRight, Award, FileText } from "lucide-react";
import { awards, publications } from "@/data/portfolio";
import { Spotlight } from "@/components/fx/Spotlight";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

const PIPELINES = [
  { name: "Text-only RAG", kind: "baseline" },
  { name: "OCR-augmented", kind: "text" },
  { name: "Vision-grounded BM25", kind: "lexical" },
  { name: "Vision-grounded TF-IDF", kind: "lexical" },
  { name: "Qwen2-VL / Qwen2.5 captioning", kind: "vlm" },
  { name: "Gemini captioning", kind: "vlm" },
];

export function Research() {
  return (
    <Section
      id="research"
      index={3}
      eyebrow="Research"
      title={
        <>
          Testing what RAG <span className="text-muted">can&apos;t see.</span>
        </>
      }
      intro="My current research looks at a blind spot: knowledge locked inside charts and figures. Text-only retrievers drop it silently, and published multimodal gains are rarely re-tested under controlled conditions."
    >
      <div className="grid gap-4 lg:grid-cols-12">
        <Reveal className="min-w-0 lg:col-span-7">
          <Spotlight className="glass h-full rounded-3xl p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="label !text-cyan">AI Research Intern · Dept. of CSE, IIT Roorkee</span>
              <span className="font-mono text-[11px] text-faint">Jun – Aug 2026</span>
            </div>
            <h3 className="mt-5 font-display text-2xl font-medium tracking-tight md:text-3xl">
              A synthetic benchmark for chart &amp; figure retrieval
            </h3>
            <p className="mt-3 max-w-xl text-[15px] text-muted">
              I built a benchmark that isolates chart-retrieval failures, then ran six retrieval/LLM pipelines through it
              to test published claims side by side.
            </p>

            {/* pipeline schematic */}
            <div className="mt-8 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2">
              <div className="row-span-6 grid h-full place-items-center rounded-xl border border-line bg-void/50 px-3 py-4">
                <svg viewBox="0 0 48 40" className="w-12" aria-hidden>
                  <rect x="1" y="1" width="46" height="38" rx="4" fill="none" stroke="rgba(255,255,255,0.2)" />
                  {[8, 16, 11, 24, 19, 30].map((hgt, i) => (
                    <rect key={i} x={6 + i * 6.5} y={34 - hgt} width="4" height={hgt} fill={i === 3 ? "#00F0FF" : "rgba(142,146,164,0.5)"} />
                  ))}
                </svg>
                <span className="mt-2 font-mono text-[9px] uppercase tracking-[0.1em] text-faint">chart doc</span>
              </div>
              {PIPELINES.map((pl, i) => (
                <div key={pl.name} className="contents">
                  <div className="flex min-w-0 items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2">
                    <span className="font-mono text-[10px] text-faint">P{i + 1}</span>
                    <span className="truncate text-[13px] text-text">{pl.name}</span>
                    <span
                      className={
                        "ml-auto hidden font-mono text-[9px] uppercase tracking-[0.1em] sm:inline " +
                        (pl.kind === "vlm" ? "text-violet-soft" : pl.kind === "baseline" ? "text-faint" : "text-muted")
                      }
                    >
                      {pl.kind}
                    </span>
                  </div>
                  {i === 0 && (
                    <div className="row-span-6 grid h-full place-items-center rounded-xl border border-cyan/30 bg-cyan/[0.05] px-3">
                      <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-cyan [writing-mode:vertical-rl]">
                        benchmark · eval
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-muted">
              <li>Qwen2-VL</li>
              <li>Qwen2.5</li>
              <li>Gemini</li>
              <li>BM25 / TF-IDF</li>
              <li>OCR</li>
            </ul>
          </Spotlight>
        </Reveal>

        <div className="flex min-w-0 flex-col gap-4 lg:col-span-5">
          {publications.map((pub) => (
            <Reveal key={pub.title} delay={0.08}>
              <Spotlight
                as="a"
                href={pub.href}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="Read"
                className="glass group block rounded-3xl p-6 md:p-8"
              >
                <div className="flex items-center justify-between">
                  <span className="label flex items-center gap-2">
                    <FileText className="size-3.5" /> Publication · {pub.venue} {pub.year}
                  </span>
                  <ArrowUpRight className="size-4 text-muted transition-all duration-500 group-hover:rotate-45 group-hover:text-cyan" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-medium tracking-tight">“{pub.title}”</h3>
                <p className="mt-3 text-[13px] text-muted">{pub.authors}</p>
              </Spotlight>
            </Reveal>
          ))}

          <Reveal delay={0.14} className="flex-1">
            <div className="glass h-full rounded-3xl p-6 md:p-8">
              <span className="label flex items-center gap-2">
                <Award className="size-3.5" /> Recognition
              </span>
              <ul className="mt-5 divide-y divide-line">
                {awards.map((a) => (
                  <li key={a.title} className="flex items-baseline justify-between gap-4 py-3">
                    <div>
                      <div className="text-[15px] text-text">{a.title}</div>
                      <div className="font-mono text-[11px] text-muted">{a.org}</div>
                    </div>
                    <span className="font-mono text-[11px] text-faint">{a.year}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
