"use client";

import { useReducedMotion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * INFERENCE TERMINAL
 * ─────────────────────────────────────────────────────────────
 * A procedurally-rendered parking lot with a simulated YOLOv8 head:
 * every frame emits raw boxes (true objects + duplicate anchors +
 * low-confidence false positives). The *post-processing is real*:
 * confidence filtering and class-wise greedy NMS run in the browser
 * on every frame, driven by the sliders. Vehicles crossing the gate
 * trigger a plate-OCR log entry — or a MISS if the detector dropped them.
 */

type Cls = "car" | "motorcycle" | "person";
type Box = { x: number; y: number; w: number; h: number; conf: number; cls: Cls; obj: number; kind: "main" | "dup" | "fp" };
type Vehicle = {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  cls: Cls;
  c0: number;
  color: string;
  seed: number;
  moving: boolean;
  speed: number;
  plate: string;
  logged: boolean;
};
type LogEntry = { t: string; text: string; tone: "ok" | "miss" | "sys" };

const VW = 1000;
const VH = 600;
const GATE_X = 760;
const LANE_Y = 300;

const PLATES = ["MH12 AB 1234", "MH14 KD 8821", "DL3C AQ 5410", "KA05 MN 2207", "UK07 BX 3398", "MH01 ZZ 0042", "GJ01 RT 7716", "UP16 CK 9051", "TS09 EV 6603", "MH20 PL 4180"];
const COLORS = ["#2a2f3d", "#343a4a", "#1f2430", "#3b3350", "#2b3545", "#40455a"];

// Deterministic PRNG so the scene is stable between renders
function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const iou = (a: Box, b: Box) => {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w);
  const y2 = Math.min(a.y + a.h, b.y + b.h);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  return inter / (a.w * a.h + b.w * b.h - inter || 1);
};

/** Class-wise greedy NMS. Returns indices of kept boxes. */
function nms(boxes: Box[], iouT: number): { kept: Set<number>; suppressed: Set<number> } {
  const order = boxes.map((_, i) => i).sort((a, b) => boxes[b]!.conf - boxes[a]!.conf);
  const kept = new Set<number>();
  const suppressed = new Set<number>();
  for (const i of order) {
    if (suppressed.has(i)) continue;
    kept.add(i);
    for (const j of order) {
      if (j === i || kept.has(j) || suppressed.has(j)) continue;
      if (boxes[j]!.cls === boxes[i]!.cls && iou(boxes[i]!, boxes[j]!) > iouT) suppressed.add(j);
    }
  }
  return { kept, suppressed };
}

const fmtTime = (s: number) => {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${(s % 60).toFixed(2).padStart(5, "0")}`;
};

export function InferenceTerminal() {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [conf, setConf] = useState(0.25);
  const [iouT, setIouT] = useState(0.5);
  const [showRaw, setShowRaw] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [log, setLog] = useState<LogEntry[]>([
    { t: "00:00.00", text: "model=yolov8n.pt imgsz=640 device=cpu half=False", tone: "sys" },
    { t: "00:00.00", text: "ocr=easyocr lang=en · gate line x=760", tone: "sys" },
  ]);
  const [stats, setStats] = useState({ raw: 0, pass: 0, kept: 0, tp: 0, fp: 0, dup: 0, miss: 0, fps: 0 });

  const params = useRef({ conf, iouT, showRaw, playing });
  params.current = { conf, iouT, showRaw, playing };
  const redrawRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (reduced) setPlaying(false);
  }, [reduced]);

  const pushLog = useCallback((e: LogEntry) => setLog((l) => [...l.slice(-40), e]), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let s = 1;
    let raf = 0;
    let visible = false;
    let simT = 0;
    let last = performance.now();
    let spawnIn = 0.5;
    let nextId = 100;
    let plateIdx = 0;
    let fpsAcc = 0;
    let fpsFrames = 0;
    let lastStats = 0;
    let flash: { plate: string; until: number; ok: boolean } | null = null;
    const rnd = mulberry(7);

    // ── Static scene: two rows of bays with parked vehicles
    const parked: Vehicle[] = [];
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 11; i++) {
        if (rnd() < 0.28) continue;
        const bx = 55 + i * 82;
        const by = row === 0 ? 40 : 418;
        const occluded = rnd() < 0.2;
        parked.push({
          id: row * 20 + i,
          x: bx + 12,
          y: by + 14,
          w: 56,
          h: 114,
          cls: "car",
          c0: occluded ? 0.32 + rnd() * 0.22 : 0.62 + rnd() * 0.34,
          color: COLORS[Math.floor(rnd() * COLORS.length)]!,
          seed: rnd() * 10,
          moving: false,
          speed: 0,
          plate: "",
          logged: true,
        });
      }
    }
    const fps: { x: number; y: number; w: number; h: number; c0: number; cls: Cls; seed: number }[] = [
      { x: 18, y: 250, w: 40, h: 90, c0: 0.22, cls: "person", seed: 1 },
      { x: 905, y: 200, w: 70, h: 40, c0: 0.31, cls: "car", seed: 2 },
      { x: 420, y: 372, w: 90, h: 34, c0: 0.14, cls: "car", seed: 3 },
      { x: 640, y: 215, w: 30, h: 60, c0: 0.18, cls: "person", seed: 4 },
      { x: 300, y: 196, w: 110, h: 30, c0: 0.09, cls: "car", seed: 5 },
    ];
    let moving: Vehicle[] = [];

    const spawn = () => {
      const moto = rnd() < 0.25;
      moving.push({
        id: nextId++,
        x: -140,
        y: LANE_Y - (moto ? 16 : 30) + (rnd() - 0.5) * 16,
        w: moto ? 70 : 124,
        h: moto ? 32 : 60,
        cls: moto ? "motorcycle" : "car",
        c0: moto ? 0.48 + rnd() * 0.3 : 0.72 + rnd() * 0.26,
        color: COLORS[Math.floor(rnd() * COLORS.length)]!,
        seed: rnd() * 10,
        moving: true,
        speed: 110 + rnd() * 60,
        plate: PLATES[plateIdx++ % PLATES.length]!,
        logged: false,
      });
    };
    spawn();
    moving[0]!.x = 380;

    const layout = () => {
      const r = wrap.getBoundingClientRect();
      w = r.width;
      h = r.width * (VH / VW);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.height = `${h}px`;
      s = w / VW;
      ctx.setTransform(dpr * s, 0, 0, dpr * s, 0, 0);
    };

    const detect = (t: number): Box[] => {
      const out: Box[] = [];
      const all = [...parked, ...moving];
      all.forEach((v, oi) => {
        const c = Math.max(0.02, Math.min(0.99, v.c0 + 0.05 * Math.sin(t * 2.3 + v.seed * 3)));
        const j = (k: number) => Math.sin(t * 5 + v.seed * k) * 1.5;
        const main: Box = { x: v.x - 4 + j(1), y: v.y - 4 + j(2), w: v.w + 8, h: v.h + 8, conf: c, cls: v.cls, obj: oi, kind: "main" };
        out.push(main);
        // Neighbouring anchors fire too — what NMS exists to clean up
        const o1 = 7 + 3 * Math.sin(v.seed);
        out.push({ ...main, x: main.x + o1, y: main.y - o1 * 0.6, w: main.w * 0.94, h: main.h * 1.04, conf: c * 0.78, kind: "dup" });
        out.push({ ...main, x: main.x - o1 * 1.6, y: main.y + o1, w: main.w * 1.08, h: main.h * 0.92, conf: c * 0.52, kind: "dup" });
      });
      fps.forEach((f) => {
        const c = Math.max(0.01, f.c0 + 0.08 * Math.sin(t * 1.7 + f.seed * 5));
        out.push({ x: f.x, y: f.y, w: f.w, h: f.h, conf: c, cls: f.cls, obj: -1, kind: "fp" });
      });
      return out;
    };

    const drawScene = () => {
      ctx.fillStyle = "#08090d";
      ctx.fillRect(0, 0, VW, VH);
      // bays
      ctx.strokeStyle = "rgba(244,244,246,0.12)";
      ctx.lineWidth = 2;
      for (let i = 0; i <= 11; i++) {
        const x = 55 + i * 82;
        ctx.beginPath();
        ctx.moveTo(x, 40);
        ctx.lineTo(x, 182);
        ctx.moveTo(x, 418);
        ctx.lineTo(x, 560);
        ctx.stroke();
      }
      // lane dashes
      ctx.strokeStyle = "rgba(244,244,246,0.14)";
      ctx.setLineDash([26, 22]);
      ctx.beginPath();
      ctx.moveTo(0, LANE_Y);
      ctx.lineTo(VW, LANE_Y);
      ctx.stroke();
      ctx.setLineDash([]);
      // curbs
      ctx.fillStyle = "rgba(255,255,255,0.025)";
      ctx.fillRect(0, 196, VW, 6);
      ctx.fillRect(0, 398, VW, 6);
      // gate
      ctx.strokeStyle = "rgba(0,240,255,0.55)";
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(GATE_X, 206);
      ctx.lineTo(GATE_X, 394);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(0,240,255,0.8)";
      ctx.font = "600 11px 'JetBrains Mono Variable', monospace";
      ctx.fillText("ENTRY GATE", GATE_X + 8, 220);
    };

    const drawVehicle = (v: Vehicle) => {
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      roundRect(v.x + 3, v.y + 4, v.w, v.h, 10);
      ctx.fill();
      ctx.fillStyle = v.color;
      roundRect(v.x, v.y, v.w, v.h, v.cls === "motorcycle" ? 12 : 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "rgba(5,5,7,0.65)";
      if (v.moving) {
        if (v.cls === "car") {
          roundRect(v.x + v.w * 0.58, v.y + 6, v.w * 0.18, v.h - 12, 4); // windshield
          ctx.fill();
          roundRect(v.x + v.w * 0.14, v.y + 8, v.w * 0.14, v.h - 16, 4);
          ctx.fill();
        }
        // plate on the front bumper
        ctx.fillStyle = "rgba(244,244,246,0.85)";
        ctx.fillRect(v.x + v.w - 5, v.y + v.h / 2 - 7, 4, 14);
      } else {
        roundRect(v.x + 7, v.y + v.h * 0.2, v.w - 14, v.h * 0.18, 4);
        ctx.fill();
        roundRect(v.x + 7, v.y + v.h * 0.66, v.w - 14, v.h * 0.14, 4);
        ctx.fill();
      }
      ctx.restore();
    };

    function roundRect(x: number, y: number, rw: number, rh: number, r: number) {
      ctx!.beginPath();
      ctx!.roundRect(x, y, rw, rh, r);
    }

    const drawBox = (b: Box, style: "kept" | "suppressed" | "below") => {
      const color = b.cls === "car" ? "0,240,255" : b.cls === "motorcycle" ? "167,139,250" : "244,244,246";
      if (style === "kept") {
        ctx.strokeStyle = `rgba(${color},0.9)`;
        ctx.lineWidth = 1.5;
        const c = Math.min(14, b.w / 4, b.h / 4);
        ctx.beginPath();
        // corner brackets
        ctx.moveTo(b.x, b.y + c); ctx.lineTo(b.x, b.y); ctx.lineTo(b.x + c, b.y);
        ctx.moveTo(b.x + b.w - c, b.y); ctx.lineTo(b.x + b.w, b.y); ctx.lineTo(b.x + b.w, b.y + c);
        ctx.moveTo(b.x + b.w, b.y + b.h - c); ctx.lineTo(b.x + b.w, b.y + b.h); ctx.lineTo(b.x + b.w - c, b.y + b.h);
        ctx.moveTo(b.x + c, b.y + b.h); ctx.lineTo(b.x, b.y + b.h); ctx.lineTo(b.x, b.y + b.h - c);
        ctx.stroke();
        ctx.strokeStyle = `rgba(${color},0.22)`;
        ctx.lineWidth = 1;
        ctx.strokeRect(b.x, b.y, b.w, b.h);
        const label = `${b.cls} ${b.conf.toFixed(2)}`;
        ctx.font = "600 11px 'JetBrains Mono Variable', monospace";
        const tw = ctx.measureText(label).width + 10;
        const ly = b.y > 18 ? b.y - 17 : b.y + b.h + 1;
        ctx.fillStyle = `rgba(${color},0.92)`;
        ctx.fillRect(b.x, ly, tw, 16);
        ctx.fillStyle = "#050507";
        ctx.fillText(label, b.x + 5, ly + 12);
      } else {
        ctx.setLineDash(style === "suppressed" ? [4, 4] : [1, 4]);
        ctx.strokeStyle = style === "suppressed" ? "rgba(255,120,120,0.55)" : "rgba(142,146,164,0.35)";
        ctx.lineWidth = 1;
        ctx.strokeRect(b.x, b.y, b.w, b.h);
        ctx.setLineDash([]);
      }
    };

    const frame = (now: number, advance: boolean) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { conf: cT, iouT: iT, showRaw: raw } = params.current;

      if (advance) {
        simT += dt;
        spawnIn -= dt;
        if (spawnIn <= 0) {
          spawn();
          spawnIn = 2.6 + rnd() * 2.2;
        }
        for (const v of moving) {
          const prevFront = v.x + v.w;
          v.x += v.speed * dt;
          if (!v.logged && prevFront < GATE_X && v.x + v.w >= GATE_X) {
            v.logged = true;
            const c = v.c0 + 0.05 * Math.sin(simT * 2.3 + v.seed * 3);
            const ok = c >= params.current.conf;
            const ocr = 0.82 + ((v.seed * 1000) % 16) / 100;
            flash = { plate: v.plate, until: now + 1400, ok };
            pushLog(
              ok
                ? { t: fmtTime(simT), text: `ENTRY  ${v.plate}  ${v.cls} det=${c.toFixed(2)} ocr=${ocr.toFixed(2)}`, tone: "ok" }
                : { t: fmtTime(simT), text: `MISS   ${v.cls} det=${c.toFixed(2)} < conf=${params.current.conf.toFixed(2)}`, tone: "miss" },
            );
          }
        }
        moving = moving.filter((v) => v.x < VW + 40);
      }

      const boxes = detect(simT);
      const passIdx = boxes.map((b, i) => (b.conf >= cT ? i : -1)).filter((i) => i >= 0);
      const pass = passIdx.map((i) => boxes[i]!);
      const { kept, suppressed } = nms(pass, iT);

      drawScene();
      parked.forEach(drawVehicle);
      moving.forEach(drawVehicle);

      if (raw) {
        boxes.forEach((b) => b.conf < cT && drawBox(b, "below"));
        suppressed.forEach((i) => drawBox(pass[i]!, "suppressed"));
      }
      kept.forEach((i) => drawBox(pass[i]!, "kept"));

      // OCR crop flash
      if (flash && now < flash.until) {
        const a = Math.min(1, (flash.until - now) / 300);
        ctx.globalAlpha = a;
        ctx.fillStyle = "rgba(5,5,7,0.85)";
        ctx.strokeStyle = flash.ok ? "rgba(0,240,255,0.8)" : "rgba(255,120,120,0.8)";
        ctx.lineWidth = 1;
        roundRect(GATE_X + 20, 236, 200, 54, 8);
        ctx.fill();
        ctx.stroke();
        ctx.font = "600 10px 'JetBrains Mono Variable', monospace";
        ctx.fillStyle = flash.ok ? "rgba(0,240,255,0.9)" : "rgba(255,140,140,0.95)";
        ctx.fillText(flash.ok ? "PLATE OCR" : "NO DETECTION", GATE_X + 32, 254);
        ctx.font = "600 17px 'JetBrains Mono Variable', monospace";
        ctx.fillStyle = "#F4F4F6";
        ctx.fillText(flash.ok ? flash.plate : "— — —", GATE_X + 32, 278);
        ctx.globalAlpha = 1;
      }

      // stats @ 4Hz
      fpsAcc += dt;
      fpsFrames++;
      if (now - lastStats > 250) {
        const detected = new Set<number>();
        let fp = 0;
        kept.forEach((i) => {
          const b = pass[i]!;
          if (b.obj < 0) fp++;
          else detected.add(b.obj);
        });
        const objCount = parked.length + moving.length;
        setStats({
          raw: boxes.length,
          pass: pass.length,
          kept: kept.size,
          tp: detected.size,
          fp,
          dup: kept.size - detected.size - fp,
          miss: objCount - detected.size,
          fps: advance && fpsAcc > 0 ? Math.round(fpsFrames / fpsAcc) : 0,
        });
        fpsAcc = 0;
        fpsFrames = 0;
        lastStats = now;
      }
    };

    const loop = (now: number) => {
      frame(now, true);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      if (visible && params.current.playing && !document.hidden) raf = requestAnimationFrame(loop);
      else frame(performance.now(), false);
    };
    redrawRef.current = start;

    const ro = new ResizeObserver(() => {
      layout();
      frame(performance.now(), false);
    });
    ro.observe(wrap);
    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting;
      if (visible) start();
      else cancelAnimationFrame(raf);
    });
    io.observe(wrap);
    const onVis = () => (document.hidden ? cancelAnimationFrame(raf) : start());
    document.addEventListener("visibilitychange", onVis);

    layout();
    frame(performance.now(), false);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [pushLog]);

  // Re-render immediately on control changes (also when paused)
  useEffect(() => {
    redrawRef.current();
  }, [conf, iouT, showRaw, playing]);

  // Keep the terminal scrolled to the newest line
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log]);

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <div className="flex min-w-0 flex-col gap-5 lg:col-span-8">
        <div className="glass overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <div className="flex items-center gap-2 font-mono text-[11px] text-muted">
              <span className={cn("size-1.5 rounded-full", playing ? "animate-pulse-dot bg-cyan" : "bg-faint")} />
              cam_02 · gate-east · 640×384
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-muted">
              <span className="tabular-nums">{playing ? `${stats.fps} fps` : "paused"}</span>
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className="grid size-7 place-items-center rounded-md border border-line-strong text-text transition-colors hover:border-cyan/50 hover:text-cyan"
                aria-label={playing ? "Pause stream" : "Play stream"}
              >
                {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
              </button>
            </div>
          </div>
          <div ref={wrapRef} className="relative">
            <canvas
              ref={canvasRef}
              className="block w-full"
              role="img"
              aria-label="Simulated parking-lot camera feed with object-detection bounding boxes"
            />
          </div>
        </div>

        <div className="glass grid gap-6 rounded-2xl p-5 sm:grid-cols-2">
          <Slider
            label="Confidence threshold"
            hint="drop boxes scoring below this"
            value={conf}
            min={0.05}
            max={0.95}
            step={0.01}
            onChange={setConf}
          />
          <Slider
            label="NMS IoU threshold"
            hint="suppress overlaps above this"
            value={iouT}
            min={0.1}
            max={0.95}
            step={0.01}
            onChange={setIouT}
          />
          <label className="flex cursor-pointer items-center gap-3 sm:col-span-2">
            <input
              type="checkbox"
              checked={showRaw}
              onChange={(e) => setShowRaw(e.target.checked)}
              className="peer sr-only"
            />
            <span className="relative h-5 w-9 rounded-full border border-line-strong bg-void transition-colors peer-checked:border-cyan/50 peer-checked:bg-cyan/20 peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-cyan">
              <span
                className={cn(
                  "absolute left-0.5 top-0.5 size-3.5 rounded-full bg-muted transition-transform duration-300",
                  showRaw && "translate-x-4 bg-cyan",
                )}
              />
            </span>
            <span className="font-mono text-[12px] text-muted">
              show raw head output{" "}
              <span className="text-faint">(</span>
              <span className="text-[#ff8a8a]">- - suppressed</span>
              <span className="text-faint"> · ··· below conf)</span>
            </span>
          </label>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-5 lg:col-span-4">
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["raw", stats.raw, "text-muted"],
              ["≥ conf", stats.pass, "text-muted"],
              ["after NMS", stats.kept, "text-cyan"],
              ["detected", stats.tp, "text-text"],
              ["false +", stats.fp, stats.fp ? "text-[#ff9b9b]" : "text-text"],
              ["dupes", stats.dup, stats.dup ? "text-[#ff9b9b]" : "text-text"],
            ] as const
          ).map(([k, v, tone]) => (
            <div key={k} className="glass rounded-xl px-3 py-2.5">
              <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-faint">{k}</div>
              <div className={cn("font-mono text-lg tabular-nums", tone)}>{v}</div>
            </div>
          ))}
        </div>

        <div className="glass flex min-h-[320px] flex-1 flex-col overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <span className="font-mono text-[11px] text-muted">~/smart-parking $ tail -f gate.log</span>
            <span className="font-mono text-[11px] text-faint">missed {stats.miss}</span>
          </div>
          <div ref={logRef} data-lenis-prevent className="h-[300px] flex-1 overflow-y-auto px-4 py-3 font-mono text-[11.5px] leading-relaxed lg:h-auto">
            {log.map((e, i) => (
              <div key={i} className="whitespace-pre-wrap break-words">
                <span className="text-faint">[{e.t}] </span>
                <span className={e.tone === "ok" ? "text-text" : e.tone === "miss" ? "text-[#ff9b9b]" : "text-muted"}>{e.text}</span>
              </div>
            ))}
            <div className="text-cyan">
              ▍
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slider({
  label,
  hint,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const id = label.replace(/\s+/g, "-").toLowerCase();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor={id} className="font-mono text-[12px] text-text">
          {label}
        </label>
        <span className="font-mono text-[13px] tabular-nums text-cyan">{value.toFixed(2)}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="lab-range w-full"
        style={{ ["--pct" as string]: `${pct}%` }}
      />
      <div className="mt-1 font-mono text-[10px] text-faint">{hint}</div>
    </div>
  );
}
