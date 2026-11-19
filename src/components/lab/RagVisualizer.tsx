"use client";

import { AnimatePresence, LayoutGroup, m, useReducedMotion } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AGGREGATE, MODES, QUESTIONS, type Mode } from "@/data/rag-demo";
import { EASE } from "@/lib/motion";
import { useInViewport } from "@/lib/useInViewport";
import { cn } from "@/lib/utils";

type StageId = "query" | "bm25" | "dense" | "fuse" | "rerank" | "generate";
type Status = "idle" | "active" | "done" | "skipped";

const STAGES: { id: StageId; name: string; detail: string }[] = [
  { id: "query", name: "Query", detail: "normalise · parse article refs · embed" },
  { id: "bm25", name: "BM25", detail: "k1=1.2 · b=0.75 · top-20" },
  { id: "dense", name: "Dense", detail: "MiniLM-L6 · cosine · top-20" },
  { id: "fuse", name: "RRF fusion", detail: "k=60 · exact-article boost" },
  { id: "rerank", name: "Rerank", detail: "cross-encoder · top-5" },
  { id: "generate", name: "Generate", detail: "grounded · cite-or-abstain" },
];

const ACTIVE: Record<Mode, StageId[]> = {
  bm25: ["query", "bm25", "generate"],
  dense: ["query", "dense", "generate"],
  hybrid: ["query", "bm25", "dense", "fuse", "rerank", "generate"],
};

const idleState = (): Record<StageId, Status> => ({
  query: "idle",
  bm25: "idle",
  dense: "idle",
  fuse: "idle",
  rerank: "idle",
  generate: "idle",
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function RagVisualizer() {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInViewport(rootRef, "-15%");
  const [qIdx, setQIdx] = useState(0);
  const [mode, setMode] = useState<Mode>("hybrid");
  const [stages, setStages] = useState(idleState);
  const [showResults, setShowResults] = useState(false);
  const [chars, setChars] = useState(0);
  const [running, setRunning] = useState(false);
  const [hoverCite, setHoverCite] = useState<number | null>(null);
  const runToken = useRef(0);
  const hasAutoRun = useRef(false);

  const question = QUESTIONS[qIdx]!;
  const ranks = question.ranks[mode];
  const answer = question.answers[mode];
  const goldRank = ranks.findIndex((r) => r.id === question.gold);
  const metrics = AGGREGATE[mode];

  const e2e = useMemo(() => {
    const L = question.latency;
    if (mode === "bm25") return L.bm25 + L.generate;
    if (mode === "dense") return L.embed + L.dense + L.generate;
    return L.embed + Math.max(L.bm25, L.dense) + L.fuse + L.rerank + L.generate;
  }, [mode, question]);

  const run = useCallback(async () => {
    const token = ++runToken.current;
    const alive = () => token === runToken.current;
    const active = ACTIVE[mode];
    const base = idleState();
    (Object.keys(base) as StageId[]).forEach((s) => (base[s] = active.includes(s) ? "idle" : "skipped"));
    setStages(base);
    setShowResults(false);
    setChars(0);
    setHoverCite(null);
    setRunning(true);

    const set = (ids: StageId[], status: Status) =>
      setStages((prev) => {
        const next = { ...prev };
        ids.forEach((id) => (next[id] = status));
        return next;
      });

    if (reduced) {
      set(active, "done");
      setShowResults(true);
      setChars(answer.length);
      setRunning(false);
      return;
    }

    const L = question.latency;
    // Visual time is real latency stretched so each stage is perceivable.
    const vis = (ms: number) => Math.min(900, Math.max(380, ms * 4));
    const steps: StageId[][] = mode === "hybrid" ? [["query"], ["bm25", "dense"], ["fuse"], ["rerank"]] : [active.slice(0, 1), active.slice(1, 2)];

    for (const group of steps) {
      if (!alive()) return;
      set(group, "active");
      const ms = Math.max(...group.map((g) => (g === "query" ? L.embed : L[g as keyof typeof L])));
      await sleep(vis(ms));
      if (!alive()) return;
      set(group, "done");
    }
    setShowResults(true);
    await sleep(350);
    if (!alive()) return;
    set(["generate"], "active");

    // Stream the answer token-ish (3 chars/frame ≈ 180 chars/s)
    let n = 0;
    while (n < answer.length) {
      if (!alive()) return;
      n = Math.min(answer.length, n + 3);
      setChars(n);
      await sleep(16);
    }
    set(["generate"], "done");
    setRunning(false);
  }, [mode, question, answer, reduced]);

  // Auto-run once when scrolled into view, then on every question/mode change.
  useEffect(() => {
    if (!inView && !hasAutoRun.current) return;
    hasAutoRun.current = true;
    void run();
  }, [run, inView]);

  useEffect(() => () => void runToken.current++, []);

  return (
    <div ref={rootRef} className="grid gap-5 lg:grid-cols-12">
      {/* ── Controls + pipeline ─────────────────────── */}
      <div className="flex min-w-0 flex-col gap-5 lg:col-span-5">
        <fieldset className="glass rounded-2xl p-5">
          <legend className="sr-only">Choose a question</legend>
          <div className="label mb-3">01 · query</div>
          <div className="flex flex-col gap-2">
            {QUESTIONS.map((qq, i) => (
              <button
                key={qq.id}
                type="button"
                onClick={() => setQIdx(i)}
                aria-pressed={i === qIdx}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left text-sm transition-colors duration-300",
                  i === qIdx
                    ? "border-cyan/40 bg-cyan/[0.06] text-text"
                    : "border-line bg-transparent text-muted hover:border-line-strong hover:text-text",
                )}
              >
                <span className="mr-2 font-mono text-[11px] text-cyan">q{i + 1}</span>
                {qq.q}
              </button>
            ))}
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-muted">
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-violet-soft">why it matters </span>
            {question.lesson}
          </p>
        </fieldset>

        <div className="glass rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="label">02 · retriever</span>
            <button
              type="button"
              onClick={() => void run()}
              className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1 font-mono text-[11px] uppercase tracking-[0.08em] text-muted transition-colors hover:border-cyan/50 hover:text-cyan"
            >
              {running ? <RotateCcw className="size-3" /> : <Play className="size-3" />}
              {running ? "restart" : "run"}
            </button>
          </div>
          <LayoutGroup id="rag-mode">
            <div role="radiogroup" aria-label="Retrieval mode" className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-void/60 p-1">
              {MODES.map((md) => (
                <button
                  key={md.id}
                  type="button"
                  role="radio"
                  aria-checked={mode === md.id}
                  onClick={() => setMode(md.id)}
                  className={cn(
                    "relative rounded-lg px-3 py-2 font-mono text-[12px] uppercase tracking-[0.08em] transition-colors",
                    mode === md.id ? "text-void" : "text-muted hover:text-text",
                  )}
                >
                  {mode === md.id && (
                    <m.span
                      layoutId="mode-pill"
                      className="absolute inset-0 rounded-lg bg-cyan"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{md.label}</span>
                </button>
              ))}
            </div>
          </LayoutGroup>
          <p className="mt-3 font-mono text-[11px] text-muted">{MODES.find((md) => md.id === mode)?.blurb}</p>

          {/* Pipeline */}
          <ol className="mt-5 space-y-2" aria-label="Pipeline stages">
            {STAGES.filter((s) => s.id !== "dense").map((s) => {
              if (s.id === "bm25") {
                return (
                  <li key="retrievers" className="grid grid-cols-2 gap-2">
                    <StageRow stage={STAGES[1]!} status={stages.bm25} latency={question.latency.bm25} />
                    <StageRow stage={STAGES[2]!} status={stages.dense} latency={question.latency.dense} />
                  </li>
                );
              }
              const lat = s.id === "query" ? question.latency.embed : question.latency[s.id as Exclude<StageId, "query">];
              return (
                <li key={s.id}>
                  <StageRow stage={s} status={stages[s.id]} latency={lat} />
                </li>
              );
            })}
          </ol>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-3 font-mono text-[11px] text-muted">
            <span>end-to-end p50</span>
            <span className="text-text">{e2e} ms</span>
          </div>
        </div>
      </div>

      {/* ── Results ─────────────────────────────────── */}
      <div className="flex min-w-0 flex-col gap-5 lg:col-span-7">
        <div className="glass relative min-h-[380px] rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="label">03 · retrieved context · top-5</span>
            <span className={cn("font-mono text-[11px]", goldRank === 0 ? "text-cyan" : goldRank > 0 ? "text-text" : "text-[#ff8a8a]")}>
              {showResults ? (goldRank >= 0 ? `gold @ rank ${goldRank + 1}` : "gold not retrieved") : "…"}
            </span>
          </div>
          <LayoutGroup id="rag-results">
            <ol className="space-y-2">
              <AnimatePresence initial={false}>
                {showResults &&
                  ranks.map((r, i) => {
                    const c = question.chunks[r.id]!;
                    const isGold = r.id === question.gold;
                    const max = ranks[0]!.score;
                    const lit = hoverCite === i + 1;
                    return (
                      <m.li
                        key={`${question.id}-${r.id}`}
                        layout={!reduced}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: EASE, delay: reduced ? 0 : i * 0.06 }}
                        className={cn(
                          "relative overflow-hidden rounded-xl border p-3 transition-colors duration-300",
                          lit ? "border-cyan/60 bg-cyan/[0.07]" : isGold ? "border-cyan/25 bg-cyan/[0.03]" : "border-line bg-void/40",
                        )}
                      >
                        <div className="flex items-baseline justify-between gap-3">
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono text-[11px] text-faint">[{i + 1}]</span>
                            <span className="font-mono text-[12px] text-text">{c.ref}</span>
                            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">{c.part}</span>
                            {isGold && (
                              <span className="rounded border border-cyan/40 px-1 font-mono text-[9px] uppercase tracking-[0.1em] text-cyan">
                                gold
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[11px] tabular-nums text-muted">{r.score.toFixed(2)}</span>
                        </div>
                        <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-muted">{c.text}</p>
                        <span className="absolute inset-x-0 bottom-0 h-px bg-line" />
                        <m.span
                          className="absolute bottom-0 left-0 h-px w-full origin-left bg-gradient-to-r from-cyan to-violet"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: r.score / max }}
                          transition={{ duration: 0.8, ease: EASE, delay: 0.2 + i * 0.06 }}
                        />
                      </m.li>
                    );
                  })}
              </AnimatePresence>
            </ol>
          </LayoutGroup>
          {!showResults && (
            <div className="absolute inset-x-5 bottom-5 top-14 grid place-items-center rounded-xl border border-dashed border-line">
              <span className="font-mono text-[12px] text-faint">{running ? "retrieving…" : "press run"}</span>
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="label">04 · generated answer</span>
            <span className="font-mono text-[11px] text-muted">hover a citation ↔ context</span>
          </div>
          <p className="min-h-[5.5rem] text-[15px] leading-relaxed text-text" aria-live="polite" aria-busy={running}>
            <Answer text={answer.slice(0, chars)} onCite={setHoverCite} />
            {running && stages.generate === "active" && (
              <span className="ml-0.5 inline-block h-4 w-[7px] translate-y-0.5 animate-pulse bg-cyan" aria-hidden />
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label={`Eval-set metrics for ${mode}`}>
          {(
            [
              ["Recall@5", metrics.recall5],
              ["MRR", metrics.mrr],
              ["nDCG@5", metrics.ndcg5],
              ["Faithfulness", metrics.faithfulness],
            ] as const
          ).map(([label, v]) => (
            <div key={label} className="glass relative overflow-hidden rounded-xl p-4">
              <div className="label !text-[10px]">{label}</div>
              <AnimatePresence mode="popLayout" initial={false}>
                <m.div
                  key={`${mode}-${label}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="mt-2 font-mono text-2xl tabular-nums text-text"
                >
                  {v.toFixed(2)}
                </m.div>
              </AnimatePresence>
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-line" />
              <m.span
                className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-cyan"
                animate={{ scaleX: v }}
                transition={{ duration: 0.8, ease: EASE }}
              />
            </div>
          ))}
          <p className="col-span-full font-mono text-[10px] text-faint">Aggregate over the full eval set · not just this query.</p>
        </div>
      </div>
    </div>
  );
}

function StageRow({ stage, status, latency }: { stage: (typeof STAGES)[number]; status: Status; latency: number }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border px-3 py-2 transition-[opacity,border-color,background-color] duration-500",
        status === "skipped" && "border-line opacity-30",
        status === "idle" && "border-line",
        status === "active" && "border-cyan/50 bg-cyan/[0.06]",
        status === "done" && "border-line-strong bg-surface",
      )}
      aria-label={`${stage.name}: ${status}`}
    >
      {status === "active" && (
        <m.span
          aria-hidden
          className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-cyan/15 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "400%" }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
        />
      )}
      <div className="relative flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "size-1.5 rounded-full",
              status === "active" ? "animate-pulse-dot bg-cyan" : status === "done" ? "bg-cyan" : "bg-faint",
            )}
          />
          <span className="font-mono text-[12px] text-text">{stage.name}</span>
        </span>
        <span className="font-mono text-[10px] tabular-nums text-muted">
          {status === "skipped" ? "—" : status === "done" ? `${latency}ms` : ""}
        </span>
      </div>
      <div className="relative mt-0.5 truncate font-mono text-[10px] text-faint">{stage.detail}</div>
    </div>
  );
}

/** Renders "[n]" markers as interactive citation chips. */
function Answer({ text, onCite }: { text: string; onCite: (n: number | null) => void }) {
  const parts = text.split(/(\[\d\])/g);
  return (
    <>
      {parts.map((p, i) => {
        const m = p.match(/^\[(\d)\]$/);
        if (!m) {
          const warn = p.includes("✗") || p.includes("⚠");
          return (
            <Fragment key={i}>
              {warn ? <span className="text-[#ff9b9b]">{p}</span> : p}
            </Fragment>
          );
        }
        const n = Number(m[1]);
        return (
          <button
            key={i}
            type="button"
            onPointerEnter={() => onCite(n)}
            onPointerLeave={() => onCite(null)}
            onFocus={() => onCite(n)}
            onBlur={() => onCite(null)}
            className="mx-0.5 inline-flex -translate-y-px items-center rounded border border-cyan/40 bg-cyan/10 px-1 font-mono text-[10px] text-cyan transition-colors hover:bg-cyan/25"
            aria-label={`Citation ${n}`}
          >
            {n}
          </button>
        );
      })}
    </>
  );
}
