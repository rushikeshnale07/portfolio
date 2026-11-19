"use client";

import { AnimatePresence, m, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowUpRight, Command, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { OPEN_PALETTE_EVENT } from "./palette-event";
import { useEffect, useState } from "react";
import { nav, profile } from "@/data/portfolio";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Magnetic } from "@/components/fx/Magnetic";

export function Nav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const home = pathname === "/";
  const link = (hash: string) => (home ? hash : `/${hash}`);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > prev && y > 400 && !open);
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <m.header
        className="fixed inset-x-0 top-0 z-50"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: hidden ? -80 : 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE, delay: hidden ? 0 : 0.2 }}
      >
        <div
          className={cn(
            "transition-[background-color,border-color,backdrop-filter] duration-500",
            scrolled
              ? "border-b border-line bg-void/70 backdrop-blur-xl"
              : "border-b border-transparent bg-transparent",
          )}
        >
          <nav className="container-lab flex h-[var(--nav-h)] items-center justify-between" aria-label="Primary">
            <a href={home ? "#top" : "/"} className="group flex items-center gap-3" aria-label={`${profile.name} — home`}>
              <span className="grid size-9 place-items-center rounded-lg border border-line-strong bg-surface font-mono text-xs tracking-wider text-text transition-colors group-hover:border-cyan/60 group-hover:text-cyan">
                {profile.initials}
              </span>
              <span className="hidden font-display text-sm font-medium tracking-tight sm:block">
                {profile.name}
                <span className="ml-2 font-mono text-[11px] text-muted">/ {profile.role}</span>
              </span>
            </a>

            <ul className="hidden items-center gap-1 lg:flex">
              {nav.map((item, i) => (
                <li key={item.href}>
                  <a
                    href={link(item.href)}
                    className="group relative rounded-md px-3 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-muted transition-colors hover:text-text"
                  >
                    <span className="mr-1 text-faint transition-colors group-hover:text-cyan">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
                className="hidden items-center gap-1 rounded-full border border-line bg-surface px-3 py-2 font-mono text-[11px] text-muted transition-colors hover:border-cyan/50 hover:text-cyan md:inline-flex"
                aria-label="Open command palette"
              >
                <Command className="size-3" />K
              </button>
              <Magnetic strength={0.25} className="hidden sm:inline-block">
                <a
                  href={profile.resume}
                  target="_blank"
                  rel="noopener"
                  className="group inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface px-4 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-text transition-colors hover:border-cyan/50 hover:text-cyan"
                >
                  Résumé
                  <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </Magnetic>
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="grid size-10 place-items-center rounded-full border border-line-strong bg-surface text-text lg:hidden"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="mobile-menu"
              >
                {open ? <X className="size-4" /> : <Menu className="size-4" />}
              </button>
            </div>
          </nav>
        </div>
      </m.header>

      <AnimatePresence>
        {open && (
          <m.div
            id="mobile-menu"
            className="fixed inset-0 z-40 bg-void/95 backdrop-blur-xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            data-lenis-prevent
          >
            <ul className="container-lab flex h-full flex-col justify-center gap-2">
              {nav.map((item, i) => (
                <m.li
                  key={item.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.05 + i * 0.05 }}
                >
                  <a
                    href={link(item.href)}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-4 py-2 font-display text-4xl font-medium tracking-tight"
                  >
                    <span className="font-mono text-xs text-cyan">{String(i + 1).padStart(2, "0")}</span>
                    {item.label}
                  </a>
                </m.li>
              ))}
              <m.li
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="mt-8"
              >
                <a href={profile.resume} target="_blank" rel="noopener" className="label !text-cyan">
                  Download résumé ↗
                </a>
              </m.li>
            </ul>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
