import { profile, socials } from "@/data/portfolio";
import { BackToTop, LocalTime } from "./FooterClient";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line pt-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_100%,rgba(124,58,237,0.2),transparent_75%)]" />
      <div className="container-lab relative">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="label mb-3">Currently</p>
            <p className="max-w-sm text-muted">
              {profile.affiliation}. {profile.status}.
            </p>
          </div>
          <nav aria-label="Social" className="md:col-span-3">
            <p className="label mb-3">Elsewhere</p>
            <ul className="space-y-1.5">
              {socials.map((s) => (
                <li key={s.key}>
                  <a href={s.href} target={s.key === "email" ? undefined : "_blank"} rel="noopener noreferrer" className="text-[15px] text-text transition-colors hover:text-cyan">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="md:col-span-3">
            <p className="label mb-3">Local time</p>
            <LocalTime />
            <BackToTop />
          </div>
        </div>

        <div aria-hidden className="mt-20 select-none whitespace-nowrap font-display text-[clamp(3rem,11vw,12rem)] font-medium leading-[0.8] tracking-[-0.05em] text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.12)]">
          {profile.name}
        </div>
        <div className="flex flex-col gap-2 border-t border-line py-6 font-mono text-[11px] text-faint sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} {profile.name}</span>
          <span>Next.js · Tailwind · Framer Motion · Canvas · press ⌘K</span>
        </div>
      </div>
    </footer>
  );
}
