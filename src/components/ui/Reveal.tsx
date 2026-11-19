"use client";

import { createElement, useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * Fade-up on first entry into the viewport.
 * Deliberately framer-free: one shared IntersectionObserver toggles a class
 * and CSS does the transition (transform + opacity only). Dozens of these
 * hydrate for almost nothing, which keeps mobile TBT low.
 */
let observer: IntersectionObserver | null = null;
function getObserver() {
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          observer?.unobserve(e.target);
        }
      }
    },
    { rootMargin: "0px 0px -10% 0px" },
  );
  return observer;
}

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article";
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = getObserver();
    io.observe(el);
    return () => io.unobserve(el);
  }, []);

  return createElement(
    as,
    {
      ref,
      className: className ? `reveal ${className}` : "reveal",
      style: { "--d": `${delay}s`, "--y": `${y}px` } as CSSProperties,
    },
    children,
  );
}
