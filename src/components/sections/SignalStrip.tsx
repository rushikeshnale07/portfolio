import { signals } from "@/data/portfolio";

/** Infinite mono marquee of credentials. Pure CSS transform animation (GPU). */
export function SignalStrip() {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {signals.map((s) => (
        <li key={s} className="flex items-center gap-10 pr-10">
          <span className="whitespace-nowrap font-mono text-[12px] uppercase tracking-[0.14em] text-muted">{s}</span>
          <span aria-hidden className="size-1 rotate-45 bg-cyan/70" />
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label="Highlights" className="relative border-y border-line bg-obsidian/60 py-5">
      <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <div className="animate-marquee flex w-max will-change-transform hover:[animation-play-state:paused]">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </section>
  );
}
