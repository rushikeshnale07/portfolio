import { ArrowUpRight } from "lucide-react";
import { profile, socials } from "@/data/portfolio";
import { SocialIcon } from "@/components/ui/BrandIcons";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { ContactForm, CopyEmail } from "./ContactForm";

const EMAIL = socials.find((s) => s.key === "email")!.handle;
export function Contact() {
  return (
    <Section
      id="contact"
      index={6}
      eyebrow="Contact"
      title={
        <>
          Have a retrieval problem, <span className="text-gradient">or a role to fill?</span>
        </>
      }
      intro={`I'm looking for AI/ML engineering roles and research collaborations in NLP, computer vision and RAG. ${profile.status}.`}
    >
      <div className="grid gap-4 lg:grid-cols-12">
        <Reveal className="flex flex-col gap-4 lg:col-span-5">
          <div className="glass rounded-3xl p-6 md:p-8">
            <div className="label mb-4">Direct line</div>
            <div className="flex flex-wrap items-center gap-3">
              <a href={`mailto:${EMAIL}`} className="break-all font-display text-xl font-medium tracking-tight hover:text-cyan md:text-2xl">
                {EMAIL}
              </a>
              <CopyEmail />
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-3">
            {socials
              .filter((s) => s.key !== "email")
              .concat([{ key: "email", label: "Résumé", handle: "PDF · 1 page", href: profile.resume }])
              .map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass group flex h-full flex-col justify-between gap-6 rounded-2xl p-4 transition-colors hover:border-cyan/30"
                  >
                    <div className="flex items-center justify-between">
                      {s.label === "Résumé" ? (
                        <span className="font-mono text-[11px] text-cyan">CV</span>
                      ) : (
                        <SocialIcon k={s.key} className="size-4 text-muted transition-colors group-hover:text-cyan" />
                      )}
                      <ArrowUpRight className="size-4 text-faint transition-all duration-500 group-hover:rotate-45 group-hover:text-cyan" />
                    </div>
                    <div>
                      <div className="font-display text-base font-medium">{s.label}</div>
                      <div className="truncate font-mono text-[11px] text-muted">{s.handle}</div>
                    </div>
                  </a>
                </li>
              ))}
          </ul>
        </Reveal>

        <Reveal delay={0.08} className="lg:col-span-7">
          <ContactForm />
        </Reveal>
      </div>
    </Section>
  );
}
