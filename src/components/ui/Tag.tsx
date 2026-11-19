import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Tag({ children, className, active }: { children: ReactNode; className?: string; active?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] tracking-[0.04em] transition-colors",
        active ? "border-cyan/40 bg-cyan/10 text-cyan" : "border-line bg-surface text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
