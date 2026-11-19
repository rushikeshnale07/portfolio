import { Section } from "@/components/ui/Section";
import { LabTabs } from "./LabTabs";

export function Lab() {
  return (
    <Section
      id="lab"
      index={1}
      eyebrow="The Lab"
      title={
        <>
          Don&apos;t take my word for it. <span className="text-muted">Run the systems.</span>
        </>
      }
      intro="Two interactive reconstructions of my production work. Everything on screen is computed live: retrieval ranks, citations, NMS and logs."
    >
      <LabTabs />
    </Section>
  );
}
