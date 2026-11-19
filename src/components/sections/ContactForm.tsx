"use client";

import { AnimatePresence, m } from "framer-motion";
import { Check, Copy, CornerDownLeft } from "lucide-react";
import { useState, type FormEvent } from "react";
import { socials } from "@/data/portfolio";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Magnetic } from "@/components/fx/Magnetic";

const EMAIL = socials.find((s) => s.key === "email")!.handle;
const INTENTS = ["Full-time role", "Internship", "Research collab", "Just saying hi"] as const;

type Line = { text: string; tone: "cmd" | "ok" | "err" | "out" };

export function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted transition-colors hover:border-cyan/50 hover:text-cyan"
      aria-label="Copy email address"
    >
      {copied ? <Check className="size-3.5 text-cyan" /> : <Copy className="size-3.5" />}
      <span aria-live="polite">{copied ? "copied" : "copy"}</span>
    </button>
  );
}

export function ContactForm() {
  const [intent, setIntent] = useState<(typeof INTENTS)[number]>("Full-time role");
  const [lines, setLines] = useState<Line[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();
    const errs: Record<string, string> = {};
    if (!name) errs.name = "required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "invalid address";
    if (message.length < 10) errs.message = "min 10 chars";
    setErrors(errs);

    if (Object.keys(errs).length) {
      setLines([
        { text: `$ send --to rushi --intent "${intent}"`, tone: "cmd" },
        ...Object.entries(errs).map(([k, v]) => ({ text: `✗ ValidationError: ${k} ${v}`, tone: "err" as const })),
      ]);
      return;
    }

    const subject = `[Portfolio] ${intent}: ${name}`;
    const body = `${message}\n\n— ${name}\n${email}`;
    setLines([
      { text: `$ send --to rushi --intent "${intent}"`, tone: "cmd" },
      { text: `✓ payload validated · ${message.length} chars`, tone: "ok" },
      { text: "→ opening your mail client with the message prefilled…", tone: "out" },
    ]);
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form onSubmit={onSubmit} noValidate className="glass flex h-full flex-col overflow-hidden rounded-3xl" aria-label="Contact form">
            <div className="flex items-center gap-2 border-b border-line px-5 py-3">
              <span className="size-2.5 rounded-full bg-white/10" />
              <span className="size-2.5 rounded-full bg-white/10" />
              <span className="size-2.5 rounded-full bg-cyan/60" />
              <span className="ml-3 font-mono text-[11px] text-muted">rushi@iitr:~/inbox — compose</span>
            </div>

            <div className="flex flex-1 flex-col gap-5 p-5 md:p-7">
              <fieldset>
                <legend className="mb-2 font-mono text-[12px] text-muted">
                  <span className="text-cyan">--intent</span>
                </legend>
                <div className="flex flex-wrap gap-2">
                  {INTENTS.map((it) => (
                    <button
                      key={it}
                      type="button"
                      onClick={() => setIntent(it)}
                      aria-pressed={intent === it}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 font-mono text-[12px] transition-colors",
                        intent === it ? "border-cyan/50 bg-cyan/10 text-cyan" : "border-line text-muted hover:text-text",
                      )}
                    >
                      {it}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="name" label="--name" error={errors.name} autoComplete="name" placeholder="Ada Lovelace" />
                <Field id="email" label="--from" type="email" error={errors.email} autoComplete="email" placeholder="ada@company.com" />
              </div>
              <Field id="message" label="--message" error={errors.message} textarea placeholder="Tell me about the problem, the team, or the role…" />

              <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
                <div className="min-h-[3.5rem] flex-1 font-mono text-[12px] leading-relaxed" aria-live="polite">
                  <AnimatePresence>
                    {lines.map((l, i) => (
                      <m.div
                        key={`${l.text}-${i}`}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35, ease: EASE, delay: i * 0.18 }}
                        className={cn(
                          l.tone === "cmd" && "text-muted",
                          l.tone === "ok" && "text-cyan",
                          l.tone === "err" && "text-[#ff9b9b]",
                          l.tone === "out" && "text-text",
                        )}
                      >
                        {l.text}
                      </m.div>
                    ))}
                  </AnimatePresence>
                </div>
                <Magnetic>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-3 rounded-full bg-cyan px-6 py-3 font-mono text-[13px] font-medium uppercase tracking-[0.08em] text-void shadow-[0_0_40px_-8px_rgba(0,240,255,0.7)]"
                  >
                    Send <CornerDownLeft className="size-4" />
                  </button>
                </Magnetic>
              </div>
            </div>
          </form>
  );
}

function Field({
  id,
  label,
  error,
  textarea,
  type = "text",
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  error?: string;
  textarea?: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  const cls = cn(
    "w-full rounded-xl border bg-void/60 px-4 py-3 text-[15px] text-text placeholder:text-faint transition-colors focus:border-cyan/60 focus:outline-none",
    error ? "border-[#ff8a8a]/60" : "border-line",
  );
  return (
    <div>
      <label htmlFor={id} className="mb-2 flex items-baseline justify-between font-mono text-[12px] text-cyan">
        {label}
        {error && <span className="text-[#ff9b9b]">{error}</span>}
      </label>
      {textarea ? (
        <textarea id={id} name={id} rows={5} placeholder={placeholder} aria-invalid={!!error} className={cn(cls, "resize-none")} data-lenis-prevent />
      ) : (
        <input id={id} name={id} type={type} placeholder={placeholder} autoComplete={autoComplete} aria-invalid={!!error} className={cls} />
      )}
    </div>
  );
}
