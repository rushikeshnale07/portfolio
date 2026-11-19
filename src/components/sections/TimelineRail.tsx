"use client";

import { m, useScroll, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

/** The cyan progress line that fills as the timeline scrolls past. */
export function TimelineRail({ targetId }: { targetId: string }) {
  const target = useRef<HTMLElement | null>(null);
  useEffect(() => {
    target.current = document.getElementById(targetId);
  }, [targetId]);
  const { scrollYProgress } = useScroll({ target, offset: ["start 70%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  return (
    <m.span
      aria-hidden
      className="absolute bottom-2 left-0 top-2 w-px origin-top bg-gradient-to-b from-cyan via-cyan to-violet"
      style={{ scaleY }}
    />
  );
}
