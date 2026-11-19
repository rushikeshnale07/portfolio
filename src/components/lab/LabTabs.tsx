"use client";

import { AnimatePresence, LayoutGroup, m } from "framer-motion";
import { Boxes, Network } from "lucide-react";
import { useState } from "react";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { LazyMount } from "@/components/ui/LazyMount";

// Code-split: each demo's JS loads only when the Lab approaches the viewport.
const Placeholder = () => <div aria-hidden className="glass min-h-[860px] rounded-2xl" />;
const RagVisualizer = dynamic(() => import("./RagVisualizer").then((m) => m.RagVisualizer), { ssr: false, loading: Placeholder });
const InferenceTerminal = dynamic(() => import("./InferenceTerminal").then((m) => m.InferenceTerminal), {
  ssr: false,
  loading: Placeholder,
});

const TABS = [
  {
    id: "rag",
    label: "RAG pipeline",
    sub: "Constitutional-law QA",
    icon: Network,
    caption:
      "Pick a query, switch retrievers, and watch the pipeline run. Each query is a real failure mode I had to solve: exact article numbers, outdated legal wording, and alphanumeric suffixes.",
  },
  {
    id: "cv",
    label: "Inference terminal",
    sub: "YOLOv8 · NMS · plate OCR",
    icon: Boxes,
    caption:
      "A simulated gate camera emitting raw detector output. Confidence filtering and NMS run live in your browser. Drag the thresholds and watch duplicates, false positives and missed entries trade off.",
  },
] as const;

export function LabTabs() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("rag");
  const active = TABS.find((t) => t.id === tab)!;

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <LayoutGroup id="lab-tabs">
          <div role="tablist" aria-label="Lab demos" className="glass inline-flex w-full rounded-2xl p-1.5 md:w-auto">
            {TABS.map((t) => {
              const Icon = t.icon;
              const on = tab === t.id;
              return (
                <button
                  key={t.id}
                  role="tab"
                  id={`tab-${t.id}`}
                  aria-selected={on}
                  aria-controls={`panel-${t.id}`}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "relative flex flex-1 items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors md:flex-none md:px-5",
                    on ? "text-text" : "text-muted hover:text-text",
                  )}
                >
                  {on && (
                    <m.span
                      layoutId="lab-tab"
                      className="absolute inset-0 rounded-xl border border-cyan/30 bg-cyan/[0.07]"
                      transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    />
                  )}
                  <Icon className={cn("relative size-4 shrink-0", on && "text-cyan")} strokeWidth={1.75} />
                  <span className="relative">
                    <span className="block font-display text-sm font-medium">{t.label}</span>
                    <span className="block font-mono text-[10px] uppercase tracking-[0.08em] text-faint">{t.sub}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>
        <p className="max-w-md text-sm text-muted">{active.caption}</p>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={tab}
          role="tabpanel"
          id={`panel-${tab}`}
          aria-labelledby={`tab-${tab}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <LazyMount minHeight="860px">{tab === "rag" ? <RagVisualizer /> : <InferenceTerminal />}</LazyMount>
        </m.div>
      </AnimatePresence>
    </>
  );
}
