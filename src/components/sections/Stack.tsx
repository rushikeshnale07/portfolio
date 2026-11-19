"use client";

import { AnimatePresence, m } from "framer-motion";
import { useMemo, useState } from "react";
import { languages, projects, stack } from "@/data/portfolio";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Fuzzy link between a skill and the projects that list it. */
function projectsFor(skill: string) {
  const k = norm(skill);
  return projects.filter((p) =>
    p.stack.some((s) => {
      const n = norm(s);
      return n === k || (k.length > 3 && (n.includes(k) || k.includes(n)));
    }),
  );
}

export function Stack() {
  const [hover, setHover] = useState<string | null>(null);
  const usage = useMemo(() => Object.fromEntries(stack.flatMap((g) => g.items).map((s) => [s, projectsFor(s)])), []);
  const linked = hover ? usage[hover] ?? [] : [];

  return (
    <Section
      id="stack"
      index={5}
      eyebrow="Stack"
      title={
        <>
          Tools I reach for, <span className="text-muted">and where I&apos;ve used them.</span>
        </>
      }
      intro="Hover or tab to any skill to see which projects used it."
      aside={
        <div className="glass w-full min-w-[280px] rounded-2xl p-4 lg:w-80" aria-live="polite">
          <div className="label mb-2 !text-[10px]">{hover ? `${hover} → used in` : "skill → project index"}</div>
          <div className="min-h-[4.5rem]">
            <AnimatePresence mode="popLayout" initial={false}>
              {hover ? (
                linked.length ? (
                  <m.ul
                    key={hover}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="space-y-1"
                  >
                    {linked.map((p) => (
                      <li key={p.slug} className="truncate font-mono text-[12px] text-text">
                        <span className="text-cyan">↳ </span>
                        {p.title}
                      </li>
                    ))}
                  </m.ul>
                ) : (
                  <m.p key={`${hover}-none`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-mono text-[12px] text-muted">
                    Coursework, research &amp; daily tooling
                  </m.p>
                )
              ) : (
                <m.p key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-mono text-[12px] text-faint">
                  awaiting query…
                </m.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      }
    >
      <div className="glass overflow-hidden rounded-3xl">
        {stack.map((group, gi) => (
          <Reveal key={group.group} delay={gi * 0.04} className={cn("grid gap-4 p-5 md:grid-cols-12 md:items-center md:p-6", gi > 0 && "border-t border-line")}>
            <div className="flex items-center gap-3 md:col-span-3">
              <span className="font-mono text-[11px] text-cyan">{String(gi + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-lg font-medium tracking-tight">{group.group}</h3>
            </div>
            <ul className="flex flex-wrap gap-2 md:col-span-9">
              {group.items.map((item) => {
                const n = usage[item]?.length ?? 0;
                const on = hover === item;
                return (
                  <li key={item}>
                    <button
                      type="button"
                      onPointerEnter={() => setHover(item)}
                      onPointerLeave={() => setHover(null)}
                      onFocus={() => setHover(item)}
                      onBlur={() => setHover(null)}
                      className={cn(
                        "group inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[14px] transition-all duration-300",
                        on ? "border-cyan/50 bg-cyan/[0.08] text-text" : "border-line bg-void/40 text-muted hover:text-text",
                        hover && !on && "opacity-50",
                      )}
                    >
                      {item}
                      {n > 0 && <span className={cn("font-mono text-[10px]", on ? "text-cyan" : "text-faint")}>×{n}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        ))}
        <div className="flex flex-wrap items-center gap-3 border-t border-line p-5 md:p-6">
          <span className="label">Spoken</span>
          {languages.map((l) => (
            <span key={l} className="font-mono text-[12px] text-muted">
              {l}
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}
