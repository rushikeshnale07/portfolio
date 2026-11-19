"use client";

import { useEffect, useRef } from "react";
import embeddings from "@/data/embeddings.json";
import { cn } from "@/lib/utils";

/**
 * LATENT QUERY FIELD
 * ─────────────────────────────────────────────────────────────
 * Every point is a document chunk projected to 2D (UMAP of real
 * embeddings — see scripts/bake_embeddings.py). The cursor is the
 * query vector: the k nearest chunks light up and get retrieval
 * edges, exactly what a dense retriever does — just visible.
 *
 * Perf: single Canvas2D, DPR-capped at 2, O(n) top-k per frame,
 * pre-rendered glow sprite, paused off-screen / in hidden tabs.
 * Reduced motion: no drift or auto-orbit; redraws on pointer only.
 */

type Raw = [number, number, number, string];
type Data = { clusters: { id: string; name: string }[]; points: Raw[] };
const DATA = embeddings as unknown as Data;

const K = 6;
const LENS_RADIUS = 240; // px — "attention" falloff around the query
const IDLE_MS = 2600; // after this long without pointer input, the query auto-orbits

// Cluster tints: slate → violet ramp (cyan is reserved for retrieval hits)
const TINTS = ["142,146,164", "124,58,237", "167,139,250", "110,116,140", "139,92,246", "99,102,241"];

type Pt = {
  bx: number; // base position (css px)
  by: number;
  x: number; // animated position
  y: number;
  phase: number;
  amp: number;
  cluster: number;
  label: string;
  nn: [number, number]; // two nearest neighbours (static mesh)
};

export function LatentField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hudTop = useRef<HTMLDivElement>(null);
  const hudMeta = useRef<HTMLDivElement>(null);
  const hudQuery = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Phones/tablets: half the points, no lens mesh, ~30fps cap → keeps main thread free.
    const lite = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    const SOURCE = lite ? DATA.points.filter((_, i) => i % 2 === 0) : DATA.points;
    let lastDraw = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let pts: Pt[] = [];
    let raf = 0;
    let running = false;
    let visible = true;
    let lastHud = 0;
    const t0 = performance.now();

    // Query state
    const q = { x: 0, y: 0, tx: 0, ty: 0, lastInput: -Infinity, inside: false };
    const hits = new Int32Array(K).fill(-1);
    const hitD = new Float64Array(K).fill(Infinity);

    // Pre-rendered glow sprite (much cheaper than shadowBlur)
    const sprite = document.createElement("canvas");
    const S = 64;
    sprite.width = sprite.height = S;
    const sctx = sprite.getContext("2d");
    if (sctx) {
      const g = sctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
      g.addColorStop(0, "rgba(0,240,255,0.9)");
      g.addColorStop(0.25, "rgba(0,240,255,0.35)");
      g.addColorStop(1, "rgba(0,240,255,0)");
      sctx.fillStyle = g;
      sctx.fillRect(0, 0, S, S);
    }

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Fit the [0,1]² field into the hero. On narrow screens, keep aspect and let it bleed.
      const narrow = w < 768;
      const fw = narrow ? w * 1.6 : w * 1.04;
      const fh = narrow ? h * 0.9 : h * 0.92;
      const ox = (w - fw) / 2;
      const oy = (h - fh) / 2 + (narrow ? -h * 0.08 : 0);

      pts = SOURCE.map(([x, y, c, label], i) => ({
        bx: ox + x * fw,
        by: oy + y * fh,
        x: ox + x * fw,
        y: oy + y * fh,
        phase: (i * 2.399) % (Math.PI * 2), // golden-angle spread
        amp: 1.5 + ((i * 7) % 5),
        cluster: c,
        label,
        nn: [-1, -1],
      }));

      // Static 2-NN mesh (O(n²) once, ~400k ops for 630 pts — trivial)
      for (let i = 0; i < pts.length; i++) {
        let a = -1, b = -1, da = Infinity, db = Infinity;
        const pi = pts[i]!;
        for (let j = 0; j < pts.length; j++) {
          if (i === j) continue;
          const pj = pts[j]!;
          const d = (pi.bx - pj.bx) ** 2 + (pi.by - pj.by) ** 2;
          if (d < da) { b = a; db = da; a = j; da = d; }
          else if (d < db) { b = j; db = d; }
        }
        pi.nn = [a, b];
      }

      if (q.x === 0 && q.y === 0) {
        q.x = q.tx = w * 0.68;
        q.y = q.ty = h * 0.42;
      }
    };

    const topK = () => {
      hits.fill(-1);
      hitD.fill(Infinity);
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]!;
        const d = (p.x - q.x) ** 2 + (p.y - q.y) ** 2;
        if (d >= hitD[K - 1]!) continue;
        let j = K - 1;
        while (j > 0 && hitD[j - 1]! > d) {
          hitD[j] = hitD[j - 1]!;
          hits[j] = hits[j - 1]!;
          j--;
        }
        hitD[j] = d;
        hits[j] = i;
      }
    };

    // Display-only similarity: monotone map from pixel distance to a cosine-like score
    const cosFrom = (d2: number) => {
      const d = Math.sqrt(d2) / Math.max(w, h);
      return Math.max(0.41, 0.985 - d * 2.1);
    };

    const draw = (now: number) => {
      const t = (now - t0) / 1000;

      // Query target: pointer if recently active, else a slow Lissajous orbit
      if (!reduced && now - q.lastInput > IDLE_MS) {
        q.tx = w * (0.62 + 0.22 * Math.sin(t * 0.13)) ;
        q.ty = h * (0.45 + 0.24 * Math.sin(t * 0.21 + 1.3));
      }
      const ease = reduced ? 1 : 0.075;
      q.x += (q.tx - q.x) * ease;
      q.y += (q.ty - q.y) * ease;

      // Drift
      if (!reduced) {
        for (const p of pts) {
          p.x = p.bx + Math.sin(t * 0.35 + p.phase) * p.amp;
          p.y = p.by + Math.cos(t * 0.29 + p.phase * 1.3) * p.amp;
        }
      }

      topK();
      ctx.clearRect(0, 0, w, h);

      // 1) Faint neighbour mesh — brighter inside the attention lens
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(142,146,164,0.075)";
      ctx.beginPath();
      for (const p of pts) {
        for (const n of p.nn) {
          if (n < 0) continue;
          const o = pts[n]!;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(o.x, o.y);
        }
      }
      ctx.stroke();

      ctx.strokeStyle = "rgba(124,58,237,0.16)";
      ctx.beginPath();
      const R2 = LENS_RADIUS * LENS_RADIUS;
      for (const p of pts) {
        if (lite || (p.x - q.x) ** 2 + (p.y - q.y) ** 2 > R2) continue;
        for (const n of p.nn) {
          if (n < 0) continue;
          const o = pts[n]!;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(o.x, o.y);
        }
      }
      ctx.stroke();

      // 2) Points — alpha rises with proximity to the query
      for (const p of pts) {
        const d2 = (p.x - q.x) ** 2 + (p.y - q.y) ** 2;
        const lens = d2 < R2 ? 1 - Math.sqrt(d2) / LENS_RADIUS : 0;
        const a = 0.34 + lens * 0.56;
        const r = 1.1 + lens * 1.1;
        ctx.fillStyle = `rgba(${TINTS[p.cluster % TINTS.length]},${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3) Retrieval edges query → top-k
      for (let r = K - 1; r >= 0; r--) {
        const idx = hits[r]!;
        if (idx < 0) continue;
        const p = pts[idx]!;
        const strength = 1 - r / K;
        const grad = ctx.createLinearGradient(q.x, q.y, p.x, p.y);
        grad.addColorStop(0, `rgba(0,240,255,${0.05 + 0.1 * strength})`);
        grad.addColorStop(1, `rgba(0,240,255,${0.25 + 0.5 * strength})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.6 + strength * 0.9;
        ctx.beginPath();
        ctx.moveTo(q.x, q.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        const gs = 14 + strength * 18;
        ctx.drawImage(sprite, p.x - gs / 2, p.y - gs / 2, gs, gs);
        ctx.fillStyle = "#00F0FF";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.8 + strength * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Rank-1 ring
      const top = hits[0]!;
      if (top >= 0) {
        const p = pts[top]!;
        const pulse = reduced ? 0 : (Math.sin(t * 3) + 1) * 1.5;
        ctx.strokeStyle = "rgba(0,240,255,0.7)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8 + pulse, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 4) Query reticle
      ctx.strokeStyle = "rgba(244,244,246,0.75)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(q.x, q.y, 5, 0, Math.PI * 2);
      ctx.moveTo(q.x - 11, q.y); ctx.lineTo(q.x - 7, q.y);
      ctx.moveTo(q.x + 7, q.y); ctx.lineTo(q.x + 11, q.y);
      ctx.moveTo(q.x, q.y - 11); ctx.lineTo(q.x, q.y - 7);
      ctx.moveTo(q.x, q.y + 7); ctx.lineTo(q.x, q.y + 11);
      ctx.stroke();
      ctx.strokeStyle = "rgba(0,240,255,0.08)";
      ctx.beginPath();
      ctx.arc(q.x, q.y, LENS_RADIUS, 0, Math.PI * 2);
      ctx.stroke();

      // 5) HUD @ ~10Hz (direct DOM writes, no React renders)
      if (now - lastHud > 100 && top >= 0) {
        lastHud = now;
        const p = pts[top]!;
        const cluster = DATA.clusters[p.cluster];
        if (hudTop.current) hudTop.current.textContent = `${p.label} · cos ${cosFrom(hitD[0]!).toFixed(2)}`;
        if (hudMeta.current) hudMeta.current.textContent = cluster ? `Part ${cluster.id} — ${cluster.name}` : "";
        if (hudQuery.current)
          hudQuery.current.textContent = `q = [${(q.x / w - 0.5).toFixed(3)}, ${(0.5 - q.y / h).toFixed(3)}]`;
      }
    };

    const loop = (now: number) => {
      if (!lite || now - lastDraw > 32) {
        lastDraw = now;
        draw(now);
      }
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduced || !visible || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      q.inside = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
      if (!q.inside) return;
      q.tx = x;
      q.ty = y;
      q.lastInput = performance.now();
      if (reduced) draw(performance.now());
    };

    let ready = false;
    const ro = new ResizeObserver(() => {
      if (!ready) return;
      layout();
      draw(performance.now());
    });
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = !!entry?.isIntersecting;
        if (!ready) return;
        if (visible) start();
        else stop();
      },
      { threshold: 0 },
    );
    const onVis = () => (document.hidden ? stop() : start());

    // Defer all canvas work until the browser is idle so it never competes
    // with first paint / hydration (LCP + TBT).
    const begin = () => {
      ready = true;
      layout();
      draw(performance.now());
      ro.observe(canvas);
      io.observe(canvas);
      document.addEventListener("visibilitychange", onVis);
      window.addEventListener("pointermove", onPointer, { passive: true });
      start();
    };
    const w8 = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    const idleId = w8.requestIdleCallback ? w8.requestIdleCallback(begin, { timeout: 2000 }) : window.setTimeout(begin, 800);

    return () => {
      if (w8.cancelIdleCallback) w8.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <div className={cn("absolute inset-0", className)}>
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 size-full" />

      {/* Retrieval HUD */}
      <div
        aria-hidden
        className="glass-blur pointer-events-none absolute right-[clamp(1.25rem,4vw,2.5rem)] top-[calc(var(--nav-h)+1.5rem)] hidden w-[19rem] rounded-xl p-4 font-mono text-[11px] leading-relaxed md:block"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="label !text-[10px]">dense_retriever.query()</span>
          <span className="flex items-center gap-1.5 text-cyan">
            <span className="animate-pulse-dot size-1.5 rounded-full bg-cyan" />
            live
          </span>
        </div>
        <div className="space-y-1 whitespace-pre text-muted">
          <div>
            <span className="text-faint">corpus </span>constitution_in · {DATA.points.length} chunks
          </div>
          <div>
            <span className="text-faint">k      </span>
            {K} · metric=cosine
          </div>
          <div>
            <span className="text-faint">vec    </span>
            <span ref={hudQuery}>q = [0.000, 0.000]</span>
          </div>
        </div>
        <div className="mt-3 border-t border-line pt-3">
          <div className="text-faint">#1 retrieved</div>
          <div ref={hudTop} className="text-text">
            —
          </div>
          <div ref={hudMeta} className="truncate text-muted">
            —
          </div>
        </div>
      </div>
    </div>
  );
}
