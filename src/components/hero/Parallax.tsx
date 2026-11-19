"use client";

import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

/**
 * Scroll-linked parallax for the hero layers. The hero is the first screen,
 * so progress = scrollY / viewport height. Children stay server-rendered.
 */
export function Parallax({ kind, children, className }: { kind: "field" | "content"; children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  const [vh, setVh] = useState(900);
  useEffect(() => {
    const set = () => setVh(window.innerHeight);
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, []);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, vh], ["0%", reduced ? "0%" : "18%"]);
  const opacity = useTransform(scrollY, [0, vh * 0.7], [1, 0]);
  const scale = useTransform(scrollY, [0, vh], [1, reduced ? 1 : 1.08]);

  return (
    <m.div className={className} style={kind === "field" ? { scale } : { y, opacity }}>
      {children}
    </m.div>
  );
}
