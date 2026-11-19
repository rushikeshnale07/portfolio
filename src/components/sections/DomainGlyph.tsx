import type { Project } from "@/data/portfolio";

/**
 * Small architecture sketches that sit inside large bento cards.
 * Pure SVG + CSS: no JS, no layout cost.
 */
export function DomainGlyph({ domain, large }: { domain: Project["domain"]; large?: boolean }) {
  if (domain === "RAG") return <RagGlyph />;
  if (domain === "CV") return <CvGlyph />;
  return (
    <svg viewBox="0 0 200 80" className={large ? "h-full w-full" : "h-12 w-auto"} aria-hidden>
      {Array.from({ length: 18 }, (_, i) => (
        <rect
          key={i}
          x={i * 11}
          y={80 - (20 + ((i * 37) % 55))}
          width="6"
          height={20 + ((i * 37) % 55)}
          rx="1"
          fill={i % 5 === 0 ? "#00F0FF" : "rgba(142,146,164,0.25)"}
        />
      ))}
    </svg>
  );
}

function RagGlyph() {
  const node = "fill-[#0B0D12] stroke-[rgba(255,255,255,0.18)]";
  const label = "fill-[#8E92A4] font-mono text-[9px] uppercase tracking-[0.1em]";
  return (
    <svg viewBox="0 0 520 200" className="h-full max-h-[260px] w-full" aria-hidden>
      <defs>
        <linearGradient id="rag-flow" x1="0" x2="1">
          <stop offset="0" stopColor="#00F0FF" stopOpacity="0" />
          <stop offset="0.5" stopColor="#00F0FF" stopOpacity="0.9" />
          <stop offset="1" stopColor="#7C3AED" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* edges */}
      <g fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1">
        <path d="M70 100 C 120 100, 120 50, 170 50" />
        <path d="M70 100 C 120 100, 120 150, 170 150" />
        <path d="M250 50 C 290 50, 290 100, 320 100" />
        <path d="M250 150 C 290 150, 290 100, 320 100" />
        <path d="M380 100 L 450 100" />
      </g>
      <g fill="none" stroke="url(#rag-flow)" strokeWidth="1.5" strokeDasharray="30 220" className="[animation:rag-dash_3.2s_linear_infinite]">
        <path d="M70 100 C 120 100, 120 50, 170 50 L 250 50 C 290 50, 290 100, 320 100 L 450 100" />
        <path d="M70 100 C 120 100, 120 150, 170 150 L 250 150 C 290 150, 290 100, 320 100 L 450 100" style={{ animationDelay: "-1.6s" }} />
      </g>
      {/* nodes */}
      <rect x="10" y="82" width="60" height="36" rx="8" className={node} />
      <text x="40" y="104" textAnchor="middle" className={label}>query</text>
      <rect x="170" y="32" width="80" height="36" rx="8" className={node} />
      <text x="210" y="54" textAnchor="middle" className={label}>bm25</text>
      <rect x="170" y="132" width="80" height="36" rx="8" className={node} />
      <text x="210" y="154" textAnchor="middle" className={label}>dense</text>
      <rect x="320" y="82" width="60" height="36" rx="8" className="fill-[#0B0D12] stroke-[rgba(0,240,255,0.5)]" />
      <text x="350" y="104" textAnchor="middle" className="fill-[#00F0FF] font-mono text-[9px] uppercase tracking-[0.1em]">rrf</text>
      <rect x="450" y="82" width="62" height="36" rx="8" className={node} />
      <text x="481" y="104" textAnchor="middle" className={label}>llm</text>
      <style>{`@keyframes rag-dash{to{stroke-dashoffset:-250}}@media (prefers-reduced-motion:reduce){g{animation:none!important}}`}</style>
    </svg>
  );
}

function CvGlyph() {
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" aria-hidden>
      <rect x="40" y="30" width="80" height="50" rx="6" fill="rgba(142,146,164,0.15)" />
      <path d="M36 40v-14h14M110 26h14v14M124 70v14h-14M50 84H36V70" fill="none" stroke="#00F0FF" strokeWidth="1.5" />
      <rect x="36" y="12" width="56" height="12" fill="#00F0FF" />
      <text x="40" y="21" className="fill-[#050507] font-mono text-[8px]">car 0.94</text>
    </svg>
  );
}
