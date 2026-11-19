import { ImageResponse } from "next/og";
import { profile } from "@/data/portfolio";

export const alt = `${profile.name} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Deterministic pseudo-embedding scatter for the card background
const dots = Array.from({ length: 140 }, (_, i) => {
  const a = i * 2.399;
  const r = 40 + ((i * 37) % 260);
  return { x: 820 + Math.cos(a) * r * 1.3, y: 315 + Math.sin(a) * r * 0.9, hit: i % 23 === 0 };
});

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "radial-gradient(circle at 80% 20%, rgba(124,58,237,0.35), #050507 60%)",
          color: "#F4F4F6",
          padding: 72,
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {dots.map((d, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: d.x,
              top: d.y,
              width: d.hit ? 8 : 4,
              height: d.hit ? 8 : 4,
              borderRadius: 8,
              background: d.hit ? "#00F0FF" : "rgba(142,146,164,0.45)",
            }}
          />
        ))}
        <div style={{ display: "flex", fontSize: 22, letterSpacing: 4, color: "#00F0FF", textTransform: "uppercase" }}>
          {profile.affiliation}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 88, fontWeight: 700, letterSpacing: -3, lineHeight: 1 }}>{profile.name}</div>
          <div style={{ marginTop: 20, fontSize: 34, color: "#8E92A4" }}>AI/ML Engineer · NLP · Computer Vision · RAG</div>
        </div>
      </div>
    ),
    size,
  );
}
