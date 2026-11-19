"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { ArrowUpRight, FileText, X } from "lucide-react";
import Link from "next/link";
import { useLenis } from "lenis/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { projects, type Project } from "@/data/portfolio";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Spotlight } from "@/components/fx/Spotlight";
import { GitHubIcon } from "@/components/ui/BrandIcons";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { Tag } from "@/components/ui/Tag";
import { DomainGlyph } from "./DomainGlyph";

const SIZE: Record<Project["size"], string> = {
  xl: "md:col-span-2 md:row-span-2",
  tall: "md:row-span-2",
  wide: "md:col-span-2",
  sm: "",
};

const SHOW_PLACEHOLDERS = process.env.NODE_ENV !== "production";

export function Work() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const open = projects.find((p) => p.slug === openSlug) ?? null;
  const lenis = useLenis();
  const lastFocus = useRef<HTMLElement | null>(null);

  const close = useCallback(() => setOpenSlug(null), []);

  useEffect(() => {
    if (open) {
      lenis?.stop();
      document.documentElement.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.documentElement.style.overflow = "";
      lastFocus.current?.focus();
    }
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open, lenis]);

  return (
    <Section
      id="work"
      index={2}
      eyebrow="Selected work"
      title={
        <>
          Systems shipped, <span className="text-muted">benchmarked and written up.</span>
        </>
      }
      intro="Retrieval, vision and evaluation, from client deployments to research. Open any card for the architecture, metrics and links."
    >
      <ul className="grid grid-flow-dense auto-rows-[minmax(230px,auto)] grid-cols-1 gap-4 md:grid-cols-4">
        {projects.map((p, i) => (
          <Reveal as="li" key={p.slug} className={SIZE[p.size]} delay={(i % 4) * 0.07}>
            <BentoCard
              project={p}
              onOpen={(el) => {
                lastFocus.current = el;
                setOpenSlug(p.slug);
              }}
            />
          </Reveal>
        ))}
      </ul>

      <AnimatePresence>{open && <ProjectModal project={open} onClose={close} />}</AnimatePresence>
    </Section>
  );
}

function BentoCard({ project: p, onOpen }: { project: Project; onOpen: (el: HTMLElement) => void }) {
  const big = p.size === "xl";
  const roomy = p.size !== "sm";

  return (
    <m.div layoutId={`card-${p.slug}`} className="h-full rounded-2xl">
      <Spotlight className="glass group h-full rounded-2xl">
        <button
          type="button"
          onClick={(e) => onOpen(e.currentTarget)}
          data-cursor="Open"
          className="flex h-full w-full flex-col p-6 text-left md:p-7"
          aria-haspopup="dialog"
          aria-label={`Open details: ${p.title}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Tag active>{p.domain}</Tag>
              {p.org && <span className="font-mono text-[11px] text-faint">{p.org}</span>}
            </div>
            <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-muted transition-all duration-500 group-hover:rotate-45 group-hover:border-cyan/50 group-hover:text-cyan">
              <ArrowUpRight className="size-4" />
            </span>
          </div>

          {(big || p.size === "tall") && (
            <div className="relative my-6 grid flex-1 place-items-center">
              <DomainGlyph domain={p.domain} large />
            </div>
          )}

          <div className={cn("mt-auto", !big && "pt-8")}>
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">{p.kicker}</p>
            <m.h3
              layoutId={`title-${p.slug}`}
              className={cn("mt-2 font-display font-medium tracking-tight text-balance", big ? "text-3xl md:text-4xl" : "text-xl")}
            >
              {p.title}
            </m.h3>
            {roomy && <p className="mt-3 line-clamp-3 max-w-xl text-[14px] text-muted">{p.summary}</p>}

            <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
              <dl className="flex flex-wrap gap-x-6 gap-y-2">
                {p.metrics.slice(0, big ? 3 : 2).map((m) => (
                  <div key={m.label}>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-faint">{m.label}</dt>
                    <dd className={cn("relative font-mono tabular-nums text-text", big ? "text-2xl" : "text-lg")}>
                      {m.value}
                      {SHOW_PLACEHOLDERS && m.placeholder && (
                        <span title="Placeholder metric (dev only)" className="absolute -right-2 top-1 size-1.5 rounded-full bg-amber-400" />
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
              {roomy && (
                <ul className="flex flex-wrap gap-1.5">
                  {p.stack.slice(0, big ? 6 : 4).map((s) => (
                    <li key={s}>
                      <Tag>{s}</Tag>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </button>
      </Spotlight>
    </m.div>
  );
}

function ProjectModal({ project: p, onClose }: { project: Project; onClose: () => void }) {
  const reduced = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panelRef.current) {
        // simple focus trap
        const f = panelRef.current.querySelectorAll<HTMLElement>("a[href], button");
        const first = f[0];
        const last = f[f.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-3 md:p-8">
      <m.button
        type="button"
        aria-label="Close project details"
        tabIndex={-1}
        className="absolute inset-0 bg-void/80 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        onClick={onClose}
      />
      <m.div
        ref={panelRef}
        layoutId={reduced ? undefined : `card-${p.slug}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`modal-${p.slug}`}
        className="relative max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-line-strong bg-obsidian shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)]"
        transition={{ duration: 0.6, ease: EASE }}
        initial={reduced ? { opacity: 0 } : undefined}
        animate={reduced ? { opacity: 1 } : undefined}
        exit={reduced ? { opacity: 0 } : undefined}
      >
        <div data-lenis-prevent className="max-h-[88vh] overflow-y-auto overscroll-contain">
          <div className="relative border-b border-line p-6 md:p-10">
            <div aria-hidden className="dot-grid absolute inset-0 opacity-60" />
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(124,58,237,0.25),transparent_55%)]" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Tag active>{p.domain}</Tag>
                <span className="font-mono text-[11px] text-muted">
                  {p.org ? `${p.org} · ` : ""}
                  {p.period}
                </span>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="grid size-10 shrink-0 place-items-center rounded-full border border-line-strong bg-surface text-text transition-colors hover:border-cyan/50 hover:text-cyan"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <m.h3
              id={`modal-${p.slug}`}
              layoutId={reduced ? undefined : `title-${p.slug}`}
              className="relative mt-8 font-display text-3xl font-medium tracking-tight text-balance md:text-5xl"
            >
              {p.title}
            </m.h3>
            <m.p
              className="relative mt-4 max-w-2xl text-muted md:text-lg"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.25 }}
            >
              {p.summary}
            </m.p>
          </div>

          <m.div
            className="grid gap-10 p-6 md:grid-cols-5 md:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="md:col-span-3">
              <h4 className="label mb-3">Problem</h4>
              <p className="text-[15px] leading-relaxed text-text">{p.problem}</p>
              <h4 className="label mb-3 mt-8">What I built</h4>
              <ul className="space-y-3">
                {p.highlights.map((h) => (
                  <li key={h} className="flex gap-3 text-[15px] leading-relaxed text-muted">
                    <span className="mt-2.5 size-1 shrink-0 rotate-45 bg-cyan" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-2">
              <h4 className="label mb-3">Metrics</h4>
              <dl className="grid grid-cols-2 gap-2">
                {p.metrics.map((m) => (
                  <div key={m.label} className="rounded-xl border border-line bg-surface p-3">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-faint">{m.label}</dt>
                    <dd className="mt-1 font-mono text-xl tabular-nums">{m.value}</dd>
                  </div>
                ))}
              </dl>
              <h4 className="label mb-3 mt-8">Stack</h4>
              <ul className="flex flex-wrap gap-1.5">
                {p.stack.map((s) => (
                  <li key={s}>
                    <Tag>{s}</Tag>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-2">
                <Link
                  href={`/work/${p.slug}`}
                  className="inline-flex items-center gap-2 rounded-full bg-cyan px-4 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-void"
                >
                  Case study <ArrowUpRight className="size-3.5" />
                </Link>
                {p.links.github && (
                  <a
                    href={p.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-text hover:border-cyan/50 hover:text-cyan"
                  >
                    <GitHubIcon className="size-3.5" /> Code
                  </a>
                )}
                {p.links.paper && (
                  <a
                    href={p.links.paper}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-text hover:border-cyan/50 hover:text-cyan"
                  >
                    <FileText className="size-3.5" /> Paper
                  </a>
                )}
              </div>
            </div>
          </m.div>
        </div>
      </m.div>
    </div>
  );
}
