import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

type Props = {
  id: string;
  index: number;
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Extra content aligned right of the header (e.g. a legend) */
  aside?: ReactNode;
};

export function Section({ id, index, eyebrow, title, intro, children, className, aside }: Props) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("cv-auto relative scroll-mt-20 py-28 md:py-36", className)}>
      <div className="container-lab">
        <header className="mb-14 grid gap-8 md:mb-20 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <Reveal>
              <p className="label mb-5 flex items-center gap-3">
                <span className="text-cyan">{String(index).padStart(2, "0")}</span>
                <span className="h-px w-8 bg-line-strong" />
                {eyebrow}
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 id={`${id}-title`} className="font-display text-h2 font-medium text-balance">
                {title}
              </h2>
            </Reveal>
            {intro && (
              <Reveal delay={0.1}>
                <p className="mt-6 max-w-2xl text-pretty text-muted md:text-lg">{intro}</p>
              </Reveal>
            )}
          </div>
          {aside && (
            <Reveal delay={0.15} className="lg:col-span-4 lg:justify-self-end">
              {aside}
            </Reveal>
          )}
        </header>
        {children}
      </div>
    </section>
  );
}
