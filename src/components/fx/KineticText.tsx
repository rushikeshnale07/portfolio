import { createElement, Fragment, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  /** Words (case-insensitive, punctuation ignored) to render with the gradient accent */
  accent?: readonly string[];
  className?: string;
  delay?: number;
  stagger?: number;
};

const clean = (w: string) => w.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();

/**
 * Staggered word-mask reveal, pure CSS (server component).
 * Runs from first paint without waiting for hydration, which keeps LCP fast.
 * Each word rises out of an overflow-hidden line box; screen readers get the
 * sentence once via aria-label. Reduced motion → the global rule in
 * globals.css collapses the animation to its end state.
 */
export function KineticText({ text, as = "h1", accent = [], className, delay = 0, stagger = 0.045 }: Props) {
  const accentSet = new Set(accent.map(clean));
  const words = text.split(" ");

  return createElement(
    as,
    { className: cn(className), "aria-label": text },
    words.map((word, i) => (
      <Fragment key={`${word}-${i}`}>
        <span aria-hidden className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
          <span
            className={cn("animate-word", accentSet.has(clean(word)) && "text-gradient")}
            style={{ "--d": `${delay + i * stagger}s` } as CSSProperties}
          >
            {word}
          </span>
        </span>
        {i < words.length - 1 && " "}
      </Fragment>
    )),
  );
}
