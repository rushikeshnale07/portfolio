import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { profile, site, socials } from "@/data/portfolio";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { Nav } from "@/components/layout/Nav";
import { DeferredExtras } from "@/components/layout/DeferredExtras";
import { MotionProvider } from "@/components/layout/MotionProvider";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s — ${profile.name}` },
  description: site.description,
  keywords: [...site.keywords],
  authors: [{ name: profile.name, url: site.url }],
  creator: profile.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: site.url,
    title: site.title,
    description: site.description,
    siteName: profile.name,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050507",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  alternateName: profile.shortName,
  jobTitle: profile.role,
  url: site.url,
  email: `mailto:${socials.find((s) => s.key === "email")?.handle ?? ""}`,
  affiliation: { "@type": "CollegeOrUniversity", name: "Indian Institute of Technology Roorkee" },
  knowsAbout: ["Retrieval-Augmented Generation", "Natural Language Processing", "Computer Vision", "Deep Learning"],
  sameAs: socials.filter((s) => s.key !== "email").map((s) => s.href),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a
          href="#main"
          className="sr-only z-[200] rounded-md bg-cyan px-4 py-2 font-mono text-sm text-void focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <MotionProvider>
          <SmoothScroll>
            <Nav />
            <DeferredExtras />
            <main id="main">{children}</main>
          </SmoothScroll>
        </MotionProvider>
      </body>
    </html>
  );
}
