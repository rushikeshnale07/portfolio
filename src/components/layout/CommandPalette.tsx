"use client";

import { AnimatePresence, m } from "framer-motion";
import { ArrowRight, Copy, CornerDownLeft, ExternalLink, FileText, Hash, Search } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { nav, profile, projects, socials } from "@/data/portfolio";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { OPEN_PALETTE_EVENT } from "./palette-event";

type Action = { id: string; group: string; label: string; hint: string; icon: ReactNode; run: () => void; keywords?: string };


export function CommandPalette({ initialOpen = false }: { initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const [toast, setToast] = useState<string | null>(null);

  const goSection = useCallback(
    (hash: string) => {
      if (pathname !== "/") {
        router.push(`/${hash}`);
        return;
      }
      const el = document.querySelector(hash);
      if (!el) return;
      if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -72, duration: 1.4 });
      else el.scrollIntoView({ behavior: "smooth" });
    },
    [lenis, pathname, router],
  );

  const actions = useMemo<Action[]>(() => {
    const email = socials.find((s) => s.key === "email")!.handle;
    return [
      ...nav.map((n) => ({
        id: `nav-${n.href}`,
        group: "Navigate",
        label: n.label,
        hint: `cd ${n.href.replace("#", "~/")}`,
        icon: <Hash className="size-4" />,
        run: () => goSection(n.href),
      })),
      ...projects.map((p) => ({
        id: `p-${p.slug}`,
        group: "Projects",
        label: p.title,
        hint: `open ${p.slug}`,
        keywords: `${p.kicker} ${p.stack.join(" ")} ${p.domain}`,
        icon: <ArrowRight className="size-4" />,
        run: () => router.push(`/work/${p.slug}`),
      })),
      {
        id: "copy-email",
        group: "Actions",
        label: "Copy email address",
        hint: email,
        icon: <Copy className="size-4" />,
        run: () => {
          void navigator.clipboard?.writeText(email).then(() => {
            setToast("Email copied");
            setTimeout(() => setToast(null), 1600);
          });
        },
      },
      {
        id: "resume",
        group: "Actions",
        label: "Open résumé",
        hint: "cat resume.pdf",
        icon: <FileText className="size-4" />,
        run: () => window.open(profile.resume, "_blank", "noopener"),
      },
      ...socials
        .filter((s) => s.key !== "email")
        .map((s) => ({
          id: `s-${s.key}`,
          group: "Links",
          label: s.label,
          hint: s.handle,
          icon: <ExternalLink className="size-4" />,
          run: () => window.open(s.href, "_blank", "noopener"),
        })),
    ];
  }, [goSection, router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions
      .map((a) => {
        const hay = `${a.label} ${a.hint} ${a.group} ${a.keywords ?? ""}`.toLowerCase();
        const score = hay.startsWith(q) ? 3 : a.label.toLowerCase().includes(q) ? 2 : q.split(/\s+/).every((t) => hay.includes(t)) ? 1 : 0;
        return { a, score };
      })
      .filter((x) => x.score > 0)
      .sort((x, y) => y.score - x.score)
      .map((x) => x.a);
  }, [actions, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      lenis?.stop();
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      lenis?.start();
    }
  }, [open, lenis]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const exec = (a: Action | undefined) => {
    if (!a) return;
    setOpen(false);
    // let the dialog close (and Lenis restart) before scrolling/navigating
    setTimeout(a.run, 60);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      exec(filtered[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  let lastGroup = "";

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[14vh]">
            <m.div
              className="absolute inset-0 bg-void/75 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <m.div
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
              className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-line-strong bg-obsidian/95 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.28, ease: EASE }}
            >
              <div className="flex items-center gap-3 border-b border-line px-4">
                <Search className="size-4 text-muted" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="rushi --help   (try “yolo”, “rag”, “resume”)"
                  className="h-14 flex-1 bg-transparent font-mono text-[14px] text-text placeholder:text-faint focus:outline-none focus-visible:outline-none"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls="palette-list"
                  aria-activedescendant={filtered[active] ? `cmd-${filtered[active]!.id}` : undefined}
                />
                <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-faint">esc</kbd>
              </div>
              <ul ref={listRef} id="palette-list" role="listbox" data-lenis-prevent className="max-h-[50vh] overflow-y-auto p-2">
                {filtered.length === 0 && <li className="px-3 py-8 text-center font-mono text-[12px] text-faint">0 results · top score 0.00</li>}
                {filtered.map((a, i) => {
                  const header = a.group !== lastGroup ? a.group : null;
                  lastGroup = a.group;
                  return (
                    <li key={a.id} role="presentation">
                      {header && <div className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-faint">{header}</div>}
                      <div
                        id={`cmd-${a.id}`}
                        role="option"
                        aria-selected={i === active}
                        data-idx={i}
                        onPointerMove={() => setActive(i)}
                        onClick={() => exec(a)}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                          i === active ? "bg-cyan/[0.08] text-text" : "text-muted",
                        )}
                      >
                        <span className={cn(i === active ? "text-cyan" : "text-faint")}>{a.icon}</span>
                        <span className="flex-1 truncate text-[14px]">{a.label}</span>
                        <span className="hidden truncate font-mono text-[11px] text-faint sm:block">{a.hint}</span>
                        {i === active && <CornerDownLeft className="size-3.5 text-cyan" />}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </m.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast && (
          <m.div
            role="status"
            className="fixed bottom-6 left-1/2 z-[95] -translate-x-1/2 rounded-full border border-cyan/40 bg-obsidian px-4 py-2 font-mono text-[12px] text-cyan"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {toast}
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
