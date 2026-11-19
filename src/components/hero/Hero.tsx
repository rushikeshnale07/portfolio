import { ArrowDownRight, ArrowRight } from "lucide-react";
import Image from "next/image";
import type { CSSProperties } from "react";
import { profile, socials } from "@/data/portfolio";
import { KineticText } from "@/components/fx/KineticText";
import { Magnetic } from "@/components/fx/Magnetic";
import { Spotlight } from "@/components/fx/Spotlight";
import { SocialIcon } from "@/components/ui/BrandIcons";
import { LatentField } from "./LatentField";
import { Parallax } from "./Parallax";

const HEADLINE_DELAY = 0;
const HEADLINE_DONE = HEADLINE_DELAY + profile.headline.split(" ").length * 0.045 + 0.3;

/** CSS-driven entrance (runs before hydration). */
const rise = (delay: number) => ({ className: "animate-rise", style: { "--d": `${delay}s` } as CSSProperties });

export function Hero() {
  const isSvg = profile.photo.endsWith(".svg");

  return (
    <section
      id="top"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden"
      aria-labelledby="hero-title"
    >
      {/* ── Background stack ─────────────────────────── */}
      <div aria-hidden className="dot-grid absolute inset-0 -z-30" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-30 bg-[radial-gradient(ellipse_55%_55%_at_85%_5%,rgba(124,58,237,0.22),transparent_70%),radial-gradient(ellipse_45%_40%_at_25%_105%,rgba(0,240,255,0.07),transparent_70%)]"
      />

      <Parallax kind="field" className="absolute inset-0 -z-20">
        <div className="animate-fade absolute inset-0" style={{ "--d": "0.3s" } as CSSProperties}>
          <LatentField />
        </div>
      </Parallax>

      {/* Scrims keep copy legible over the field */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_75%_at_18%_70%,rgba(5,5,7,0.92)_0%,rgba(5,5,7,0.55)_45%,transparent_75%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-b from-transparent to-void"
      />

      {/* ── Content ──────────────────────────────────── */}
      <Parallax
        kind="content"
        className="container-lab relative flex flex-1 items-end pb-20 pt-[calc(var(--nav-h)+4rem)] md:pb-24"
      >
        <div className="grid w-full items-end gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div {...rise(0.05)} className="animate-rise mb-7 flex flex-wrap items-center gap-3">
              <span className="relative size-9 overflow-hidden rounded-full border border-line-strong lg:hidden">
                <Image
                  src={profile.photo}
                  alt={`Portrait of ${profile.name}`}
                  fill
                  sizes="36px"
                  unoptimized={isSvg}
                  className="object-cover"
                />
              </span>
              <span className="glass-blur inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-text">
                <span className="relative flex size-1.5">
                  <span className="animate-pulse-dot absolute inset-0 rounded-full bg-cyan" />
                </span>
                {profile.status}
              </span>
              <span className="label hidden sm:inline">{profile.affiliation}</span>
            </div>

            <KineticText
              as="h1"
              text={profile.headline}
              accent={profile.headlineAccent}
              delay={HEADLINE_DELAY}
              className="max-w-[14ch] font-display text-display font-medium text-balance"
            />
            <span id="hero-title" className="sr-only">
              {profile.name} — {profile.role}
            </span>

            {/* LCP element on mobile: visible from first paint (transform-only entrance, no opacity) */}
            <p
              {...rise(0)}
              className="animate-slide mt-8 max-w-xl text-pretty text-base text-muted md:text-lg"
            >
              <span className="text-text">{profile.name}.</span> {profile.bio}
            </p>

            <div {...rise(HEADLINE_DONE)} className="animate-rise mt-10 flex flex-wrap items-center gap-4">
              <Magnetic>
                <a
                  href="#lab"
                  data-cursor="Run"
                  className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-cyan px-6 py-3.5 font-mono text-[13px] font-medium uppercase tracking-[0.08em] text-void shadow-[0_0_40px_-8px_rgba(0,240,255,0.7)] transition-shadow duration-500 hover:shadow-[0_0_60px_-6px_rgba(0,240,255,0.9)]"
                >
                  Enter the Lab
                  <ArrowRight className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1" />
                </a>
              </Magnetic>
              <Magnetic>
                <a
                  href="#work"
                  className="group inline-flex items-center gap-3 rounded-full border border-line-strong bg-surface px-6 py-3.5 font-mono text-[13px] uppercase tracking-[0.08em] text-text backdrop-blur-md transition-colors duration-300 hover:border-cyan/50"
                >
                  Selected work
                  <ArrowDownRight className="size-4 text-muted transition-all duration-500 group-hover:rotate-[-45deg] group-hover:text-cyan" />
                </a>
              </Magnetic>
            </div>

            <ul {...rise(HEADLINE_DONE + 0.1)} className="animate-rise mt-10 flex flex-wrap gap-2" aria-label="Focus areas">
              {profile.focus.map((f) => (
                <li
                  key={f}
                  className="rounded-md border border-line bg-surface px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-muted"
                >
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* ID card */}
          <div
            {...rise(HEADLINE_DONE + 0.15)}
            className="animate-rise hidden justify-self-end lg:col-span-4 lg:block"
          >
            <Spotlight className="glass-blur w-[280px] rounded-2xl p-3">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-line">
                <Image
                  src={profile.photo}
                  alt={`Portrait of ${profile.name}`}
                  fill
                  sizes="280px"
                  unoptimized={isSvg}
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-void/90 to-transparent p-3 pt-10">
                  <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-cyan">id: rsn-0021</div>
                </div>
              </div>
              <div className="flex items-end justify-between gap-2 px-1 pb-1 pt-4">
                <div>
                  <div className="font-display text-lg font-medium leading-tight tracking-tight">{profile.name}</div>
                  <div className="font-mono text-[11px] text-muted">{profile.location}</div>
                </div>
                <ul className="flex gap-1">
                  {socials.map((s) => (
                    <li key={s.key}>
                      <a
                        href={s.href}
                        target={s.key === "email" ? undefined : "_blank"}
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-hover hover:text-cyan"
                      >
                        <SocialIcon k={s.key} className="size-4" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </Spotlight>
          </div>
        </div>
      </Parallax>

      {/* Scroll cue */}
      <a
        href="#lab"
        aria-label="Scroll to the Lab"
        style={{ "--d": `${HEADLINE_DONE + 0.5}s` } as CSSProperties}
        className="animate-fade absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
      >
        <span className="label !text-[10px]">scroll</span>
        <span className="relative h-10 w-px overflow-hidden bg-line">
          <span className="animate-scroll-cue absolute inset-x-0 top-0 h-1/2 bg-cyan" />
        </span>
      </a>
    </section>
  );
}
