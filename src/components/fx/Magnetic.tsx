"use client";

import { m, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useRef, type ReactNode, type PointerEvent } from "react";
import { SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Pulls its child toward the cursor while hovered, then springs back.
 * `strength` = fraction of the pointer offset applied (0.3 feels right for buttons).
 */
export function Magnetic({
  children,
  strength = 0.3,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, SPRING.magnetic);
  const y = useSpring(my, SPRING.magnetic);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * strength);
    my.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <m.div
      ref={ref}
      className={cn("inline-block will-change-transform", className)}
      style={{ x, y }}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {children}
    </m.div>
  );
}
