"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Mounts children only once the placeholder is within `rootMargin` of the
 * viewport. Keeps heavy interactive widgets (and their JS chunks) out of the
 * initial load. The placeholder reserves height so nothing jumps.
 */
export function LazyMount({
  children,
  minHeight,
  rootMargin = "600px 0px",
}: {
  children: ReactNode;
  minHeight: string;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || show) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, show]);

  return (
    <div ref={ref} style={show ? undefined : { minHeight }}>
      {show ? children : <div aria-hidden className="glass h-full rounded-2xl" style={{ minHeight }} />}
    </div>
  );
}
