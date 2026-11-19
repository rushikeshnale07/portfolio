"use client";

import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Momentum scrolling via Lenis. Anchor links (#lab, #work…) are smoothed too,
 * offset by the fixed nav height. On touch devices Lenis leaves native
 * scrolling alone (syncTouch is off). Disabled for prefers-reduced-motion.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  if (reduced) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.09,
        wheelMultiplier: 1,
        anchors: { offset: -72, duration: 1.4 },
      }}
    >
      {children}
    </ReactLenis>
  );
}
