import { Hero } from "@/components/hero/Hero";
import { Lab } from "@/components/lab/Lab";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { Research } from "@/components/sections/Research";
import { SignalStrip } from "@/components/sections/SignalStrip";
import { Stack } from "@/components/sections/Stack";
import { Timeline } from "@/components/sections/Timeline";
import { Work } from "@/components/sections/Work";

/**
 * Sections are server components wherever possible; only the interactive
 * islands inside them ship and hydrate client JS.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <SignalStrip />
      <Lab />
      <Work />
      <Research />
      <Timeline />
      <Stack />
      <Contact />
      <Footer />
    </>
  );
}
