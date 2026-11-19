"use client";

import { LazyMotion } from "framer-motion";
import type { ReactNode } from "react";

// Animation + layout (layoutId) features load in a separate async chunk,
// keeping ~100 KB of framer-motion out of the critical path.
const loadFeatures = () => import("./motion-features").then((mod) => mod.default);

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}
