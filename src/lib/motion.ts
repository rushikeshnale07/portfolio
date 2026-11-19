import type { Transition, Variants } from "framer-motion";

/** Signature easing — weighty, decisive deceleration. */
export const EASE = [0.22, 1, 0.36, 1] as const;

export const DURATION = { fast: 0.2, base: 0.6, slow: 1.0 } as const;

export const transition = (delay = 0, duration: number = DURATION.base): Transition => ({
  duration,
  delay,
  ease: EASE,
});

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (delay: number = 0) => ({ opacity: 1, y: 0, transition: transition(delay) }),
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: (delay: number = 0) => ({ opacity: 1, transition: transition(delay) }),
};

export const stagger = (each = 0.06, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: each, delayChildren } },
});

/** Spring presets */
export const SPRING = {
  magnetic: { stiffness: 220, damping: 18, mass: 0.6 },
  cursor: { stiffness: 520, damping: 40, mass: 0.5 },
  ring: { stiffness: 180, damping: 22, mass: 0.6 },
} as const;
