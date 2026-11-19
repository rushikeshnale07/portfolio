import { timeline, type TimelineItem } from "@/data/portfolio";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { TimelineRail } from "./TimelineRail";

const KIND: Record<TimelineItem["kind"], { label: string; cls: string }> = {
  research: { label: "Research", cls: "text-cyan border-cyan/30" },
  industry: { label: "Industry", cls: "text-text border-line-strong" },
  education: { label: "Education", cls: "text-violet-soft border-violet/40" },
  leadership: { label: "Leadership", cls: "text-muted border-line" },
};

export function Timeline() {
  return (
    <Section
      id="timeline"
      index={4}
      eyebrow="Journey"
      title={
        <>
          From parking lots <span className="text-muted">to the Constitution.</span>
        </>
      }
      intro="Education, research, industry and leadership. I lead teams as well as ship code."
    >
      <ol id="timeline-list" className="relative ml-1 md:ml-[calc(25%+1px)]">
        <span aria-hidden className="absolute bottom-2 left-0 top-2 w-px bg-line" />
        <TimelineRail targetId="timeline-list" />
        {timeline.map((item, i) => (
          <Reveal as="li" key={`${item.title}-${item.period}`} delay={0.04 * i} className="relative pb-12 pl-8 last:pb-0 md:pl-12">
            <span aria-hidden className="absolute -left-[4.5px] top-2 size-2.5 rotate-45 border border-cyan bg-void" />
            <div className="md:absolute md:-left-[calc(33.333%+3rem)] md:top-0.5 md:w-[calc(33.333%)] md:text-right">
              <span className="font-mono text-[12px] text-muted">{item.period}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 md:mt-0">
              <h3 className="font-display text-xl font-medium tracking-tight md:text-2xl">{item.title}</h3>
              <span className={cn("rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em]", KIND[item.kind].cls)}>
                {KIND[item.kind].label}
              </span>
            </div>
            <div className="mt-1 text-[14px] text-muted">{item.org}</div>
            <ul className="mt-3 max-w-2xl space-y-1.5">
              {item.points.map((pt) => (
                <li key={pt} className="text-[15px] leading-relaxed text-muted">
                  {pt}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
