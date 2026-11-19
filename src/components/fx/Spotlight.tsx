"use client";

import { useRef, type ComponentPropsWithoutRef, type ElementType, type PointerEvent } from "react";
import { cn } from "@/lib/utils";

type SpotlightProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

/**
 * Cursor-tracking radial spotlight + glowing border. Writes CSS vars
 * (--mx, --my, --spot-o) directly — no React re-renders on pointer move.
 * Styling lives in the `spotlight` utility in globals.css.
 */
export function Spotlight<T extends ElementType = "div">({ as, className, ...rest }: SpotlightProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);
  const frame = useRef(0);

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${clientX - r.left}px`);
      el.style.setProperty("--my", `${clientY - r.top}px`);
    });
  };

  return (
    <Tag
      ref={ref}
      className={cn("spotlight", className)}
      onPointerMove={onPointerMove}
      onPointerEnter={() => ref.current?.style.setProperty("--spot-o", "1")}
      onPointerLeave={() => ref.current?.style.setProperty("--spot-o", "0")}
      {...rest}
    />
  );
}
