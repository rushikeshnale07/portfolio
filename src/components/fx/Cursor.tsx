"use client";

import { m, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { SPRING } from "@/lib/motion";

type Mode = "default" | "hover" | "text" | "hidden";

const INTERACTIVE = "a, button, [role='button'], [data-cursor], input, textarea, select, label";

/**
 * Two-part cursor: a precise cyan dot + a lagging ring that grows over
 * interactive elements. Elements can set data-cursor="View" to show a label.
 * Only mounts on fine pointers without reduced motion.
 */
export function Cursor() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<Mode>("hidden");
  const [label, setLabel] = useState<string | null>(null);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const dotX = useSpring(x, SPRING.cursor);
  const dotY = useSpring(y, SPRING.cursor);
  const ringX = useSpring(x, SPRING.ring);
  const ringY = useSpring(y, SPRING.ring);

  useEffect(() => {
    if (reduced) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const apply = () => setEnabled(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [reduced]);

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      setMode((m) => (m === "hidden" ? "default" : m));
    };
    const onOver = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.(INTERACTIVE) as HTMLElement | null;
      if (!el) {
        setMode("default");
        setLabel(null);
        return;
      }
      const tag = el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") {
        setMode("text");
        setLabel(null);
        return;
      }
      setMode("hover");
      const l = el.dataset.cursor;
      setLabel(l && l !== "true" ? l : null);
    };
    const onLeave = () => setMode("hidden");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const ringScale = mode === "hover" ? (label ? 2.6 : 1.8) : mode === "text" ? 0.4 : 1;
  const visible = mode !== "hidden";

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      <m.div
        className="absolute left-0 top-0 size-9 rounded-full border border-cyan/50"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          scale: ringScale,
          opacity: visible ? 1 : 0,
          backgroundColor: mode === "hover" ? "rgba(0,240,255,0.08)" : "rgba(0,240,255,0)",
          borderColor: mode === "hover" ? "rgba(0,240,255,0.35)" : "rgba(0,240,255,0.5)",
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      />
      <m.span
        className="absolute left-0 top-0 font-mono text-[10px] uppercase tracking-[0.12em] text-cyan"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{ opacity: label && visible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </m.span>
      <m.div
        className="absolute left-0 top-0 size-1.5 rounded-full bg-cyan shadow-[0_0_12px_2px_rgba(0,240,255,0.6)]"
        style={{ x: dotX, y: dotY, translateX: "-50%", translateY: "-50%" }}
        animate={{ opacity: visible && mode !== "hover" ? 1 : 0, scale: mode === "text" ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      />
    </div>
  );
}
