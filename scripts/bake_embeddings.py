"""
Bake the hero's Latent Query Field data -> src/data/embeddings.json

Two modes:

  1) REAL (recommended) — project your actual RAG chunk embeddings to 2D:
       pip install sentence-transformers umap-learn numpy
       python scripts/bake_embeddings.py --chunks path/to/chunks.jsonl

     chunks.jsonl: one JSON object per line with at least
       {"text": "...", "article": "21", "part": "III"}

  2) PLACEHOLDER (default, no dependencies) — clustered synthetic layout:
       python scripts/bake_embeddings.py

Output schema (compact, ~25 KB for 600 points):
  { "clusters": [{"id": "III", "name": "Fundamental Rights"}, ...],
    "points":   [[x, y, clusterIndex, "Art. 21"], ...] }      x, y in [0, 1]
"""

from __future__ import annotations

import argparse
import json
import math
import random
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "src" / "data" / "embeddings.json"
MAX_POINTS = 600

PARTS = [
    ("I", "The Union and its Territory", (1, 4)),
    ("II", "Citizenship", (5, 11)),
    ("III", "Fundamental Rights", (12, 35)),
    ("IV", "Directive Principles", (36, 51)),
    ("IVA", "Fundamental Duties", (51, 51)),
    ("V", "The Union", (52, 151)),
    ("VI", "The States", (152, 237)),
    ("IX", "The Panchayats", (243, 243)),
    ("XI", "Union–State Relations", (245, 263)),
    ("XII", "Finance & Property", (264, 300)),
    ("XVIII", "Emergency Provisions", (352, 360)),
    ("XX", "Amendment", (368, 368)),
]


def normalise(xy: list[tuple[float, float]], pad: float = 0.06) -> list[tuple[float, float]]:
    xs = [p[0] for p in xy]
    ys = [p[1] for p in xy]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    sx = (1 - 2 * pad) / ((x1 - x0) or 1)
    sy = (1 - 2 * pad) / ((y1 - y0) or 1)
    return [(pad + (x - x0) * sx, pad + (y - y0) * sy) for x, y in xy]


def placeholder() -> dict:
    rng = random.Random(21)  # Article 21, naturally
    n_clusters = len(PARTS)
    # Place cluster centres on a jittered ring + a centre cluster so the field fills a wide hero
    centres = []
    for i in range(n_clusters):
        a = (i / n_clusters) * math.tau + rng.uniform(-0.25, 0.25)
        r = rng.uniform(0.28, 0.46)
        centres.append((0.5 + math.cos(a) * r * 1.55, 0.5 + math.sin(a) * r))

    weights = [3 if p[0] in ("III", "V", "VI") else 1.4 if p[0] in ("IV", "XI", "XII") else 1 for p in PARTS]
    total_w = sum(weights)
    raw: list[tuple[float, float]] = []
    meta: list[tuple[int, str]] = []
    for ci, ((pid, _name, (a0, a1)), (cx, cy), w) in enumerate(zip(PARTS, centres, weights)):
        n = max(8, round(MAX_POINTS * w / total_w))
        spread = 0.045 + 0.03 * (w / 3)
        for _ in range(n):
            # anisotropic gaussian blob, slightly elongated like real UMAP clusters
            theta = rng.uniform(0, math.tau)
            dx, dy = rng.gauss(0, spread * 1.5), rng.gauss(0, spread)
            x = cx + dx * math.cos(theta * 0.1) - dy * math.sin(theta * 0.1)
            y = cy + dx * math.sin(theta * 0.1) + dy * math.cos(theta * 0.1)
            raw.append((x, y))
            art = rng.randint(a0, a1)
            suffix = rng.choice(["", "", "", "", "A", "B"]) if pid in ("III", "IX", "XII") else ""
            meta.append((ci, f"Art. {art}{suffix}"))

    # a sprinkling of outliers (preambles, schedules) for texture
    for _ in range(30):
        raw.append((rng.uniform(-0.2, 1.2), rng.uniform(-0.05, 1.05)))
        meta.append((rng.randrange(n_clusters), f"Schedule {rng.choice(['I','IV','VII','VIII','X'])}"))

    pts = normalise(raw)
    points = [[round(x, 4), round(y, 4), c, label] for (x, y), (c, label) in zip(pts, meta)][: MAX_POINTS + 30]
    return {
        "placeholder": True,
        "clusters": [{"id": pid, "name": name} for pid, name, _ in PARTS],
        "points": points,
    }


def real(chunks_path: Path) -> dict:
    import numpy as np  # noqa: WPS433
    import umap  # type: ignore
    from sentence_transformers import SentenceTransformer  # type: ignore

    rows = [json.loads(l) for l in chunks_path.read_text(encoding="utf-8").splitlines() if l.strip()]
    random.Random(0).shuffle(rows)
    rows = rows[:MAX_POINTS]
    model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    emb = model.encode([r["text"] for r in rows], normalize_embeddings=True, show_progress_bar=True)
    xy = umap.UMAP(n_neighbors=15, min_dist=0.15, metric="cosine", random_state=42).fit_transform(np.asarray(emb))
    # widen x so the field suits a landscape hero
    pts = normalise([(float(x) * 1.6, float(y)) for x, y in xy])

    part_ids = sorted({str(r.get("part", "?")) for r in rows})
    names = {pid: name for pid, name, _ in PARTS}
    idx = {pid: i for i, pid in enumerate(part_ids)}
    points = [
        [round(x, 4), round(y, 4), idx[str(r.get("part", "?"))], f"Art. {r.get('article', '?')}"]
        for (x, y), r in zip(pts, rows)
    ]
    return {
        "placeholder": False,
        "clusters": [{"id": pid, "name": names.get(pid, f"Part {pid}")} for pid in part_ids],
        "points": points,
    }


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--chunks", type=Path, help="JSONL of chunks with text/article/part")
    args = ap.parse_args()
    data = real(args.chunks) if args.chunks else placeholder()
    OUT.write_text(json.dumps(data, separators=(",", ":")), encoding="utf-8")
    print(f"wrote {len(data['points'])} points -> {OUT}")
