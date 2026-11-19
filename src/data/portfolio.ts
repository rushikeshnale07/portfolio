/**
 * ─────────────────────────────────────────────────────────────
 *  SINGLE SOURCE OF TRUTH for all portfolio content.
 *  Edit this file to update the site — no component changes needed.
 *
 *  Anything marked  ⚠ REPLACE  is a realistic placeholder.
 *  Search the repo for "⚠ REPLACE" to find every one.
 * ─────────────────────────────────────────────────────────────
 */

export const site = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://rushikeshnale.vercel.app",
  title: "Rushikesh Nale — AI/ML Engineer · RAG · Computer Vision",
  description:
    "M.Tech AI at IIT Roorkee. I build retrieval-augmented LLM systems, real-time computer vision pipelines, and the evaluation frameworks that prove they work.",
  keywords: [
    "Rushikesh Nale",
    "AI Engineer",
    "ML Engineer",
    "RAG",
    "Retrieval-Augmented Generation",
    "Computer Vision",
    "YOLOv8",
    "NLP",
    "IIT Roorkee",
    "LLM Evaluation",
  ],
} as const;

export const profile = {
  name: "Rushikesh Nale",
  shortName: "Rushi",
  initials: "RN",
  role: "AI/ML Engineer",
  affiliation: "M.Tech Artificial Intelligence · IIT Roorkee",
  location: "Roorkee, India",
  status: "Open to AI/ML roles · 2027",
  headline: "I build systems that find the right answer — and prove it.",
  /** Words in the headline that get the cyan→violet gradient treatment */
  headlineAccent: ["right", "answer"],
  bio: "M.Tech AI at IIT Roorkee working across NLP, computer vision, and retrieval-augmented generation. I ship hybrid RAG systems, real-time YOLO pipelines, and the evaluation harnesses that tell you which configuration actually wins.",
  focus: ["NLP", "Computer Vision", "RAG"],
  /** 960×1200 (4:5) portrait, background replaced to match the site palette */
  photo: "/media/rushi.jpg",
  resume: "/resume.pdf",
} as const;

export type SocialKey = "github" | "linkedin" | "leetcode" | "email";

export const socials: { key: SocialKey; label: string; handle: string; href: string }[] = [
  { key: "github", label: "GitHub", handle: "rushikeshnale07", href: "https://github.com/rushikeshnale07" },
  { key: "linkedin", label: "LinkedIn", handle: "in/rsnale", href: "https://www.linkedin.com/in/rsnale/" },
  { key: "leetcode", label: "LeetCode", handle: "rushikesh_nale07", href: "https://leetcode.com/u/rushikesh_nale07/" },
  { key: "email", label: "Email", handle: "rushikeshnale07@gmail.com", href: "mailto:rushikeshnale07@gmail.com" },
];

/** Shown in the scrolling signal strip under the hero */
export const signals: string[] = [
  "M.Tech AI · IIT Roorkee",
  "Shortlisted · Scientist-B, CERT-In",
  "Amazon ML Summer School 2024",
  "GATE CSE Qualified",
  "SSRN Publication · 2025",
  "Best Research Paper Presentation",
];

export const nav = [
  { label: "Lab", href: "#lab" },
  { label: "Work", href: "#work" },
  { label: "Research", href: "#research" },
  { label: "Journey", href: "#timeline" },
  { label: "Stack", href: "#stack" },
  { label: "Contact", href: "#contact" },
] as const;

/* ───────────────────────── PROJECTS ───────────────────────── */

export type Metric = { label: string; value: string; placeholder?: boolean };

export type Project = {
  slug: string;
  title: string;
  kicker: string;
  org?: string;
  period: string;
  summary: string;
  problem: string;
  highlights: string[];
  metrics: Metric[];
  stack: string[];
  domain: "RAG" | "CV" | "NLP" | "RecSys" | "Eval";
  links: { github?: string; demo?: string; paper?: string };
  /** Bento size: "xl" = 2×2, "wide" = 2×1, "tall" = 1×2, "sm" = 1×1 */
  size: "xl" | "wide" | "tall" | "sm";
  featured: boolean;
};

export const projects: Project[] = [
  {
    slug: "constitutional-rag",
    title: "RAG for Indian Constitutional Law",
    kicker: "Hybrid retrieval · Legal QA",
    org: "Primus Partners",
    period: "Dec 2025 – Jan 2026",
    summary:
      "Production retrieval-augmented Q&A over the Constitution of India, combining BM25 and dense semantic search with custom logic for legal article-numbering quirks.",
    problem:
      "Legal articles like 21, 21A and 243ZH break naive chunking and embedding search — the right article is often lexically exact but semantically distant.",
    highlights: [
      "Hybrid BM25 + dense retrieval fused with reciprocal rank fusion",
      "Article-aware parser resolves suffixes (21A, 243ZH) and cross-references",
      "Served via FastAPI, Streamlit UI, fully Dockerized",
    ],
    metrics: [
      { label: "Recall@5", value: "0.91", placeholder: true }, // ⚠ REPLACE
      { label: "MRR", value: "0.84", placeholder: true }, // ⚠ REPLACE
      { label: "p50 latency", value: "820ms", placeholder: true }, // ⚠ REPLACE
    ],
    stack: ["Python", "LangChain", "BM25", "FastAPI", "Streamlit", "Docker"],
    domain: "RAG",
    links: { github: "https://github.com/rushikeshnale07" }, // ⚠ REPLACE with the repo URL
    size: "xl",
    featured: true,
  },
  {
    slug: "smart-parking-cv",
    title: "Smart Parking — Real-Time Vehicle Monitoring",
    kicker: "YOLOv8 · OpenCV · Plate OCR",
    org: "MIT ADT University",
    period: "Jul 2024 – May 2025",
    summary:
      "Real-time vehicle detection with license-plate OCR for automated entry/exit logging, deployed as a live Streamlit monitoring dashboard.",
    problem:
      "Manual gate logging is slow and error-prone; plates must be read reliably under motion blur, glare and varied angles.",
    highlights: [
      "YOLOv8 detection → plate crop → OCR → entry/exit event log",
      "Frame-level tracking to avoid duplicate entries",
      "Published as “Specific Vehicle Detection System” (SSRN, 2025)",
    ],
    metrics: [
      { label: "mAP@0.5", value: "0.89", placeholder: true }, // ⚠ REPLACE
      { label: "Throughput", value: "28 FPS", placeholder: true }, // ⚠ REPLACE
      { label: "Plate acc.", value: "93%", placeholder: true }, // ⚠ REPLACE
    ],
    stack: ["Python", "YOLOv8", "OpenCV", "EasyOCR", "Streamlit"],
    domain: "CV",
    links: { github: "https://github.com/rushikeshnale07", paper: "https://ssrn.com/" }, // ⚠ REPLACE with repo + SSRN URLs
    size: "tall",
    featured: true,
  },
  {
    slug: "chart-rag-research",
    title: "Multimodal Chart-RAG Benchmark",
    kicker: "Research · Vision-language retrieval",
    org: "Dept. of CSE, IIT Roorkee",
    period: "Jun 2026 – Aug 2026",
    summary:
      "Showed where standard RAG fails on charts and figures, then built a synthetic benchmark to test multimodal retrieval approaches against published claims.",
    problem:
      "Text-only RAG silently drops information locked in charts — and published multimodal gains are rarely reproduced under controlled conditions.",
    highlights: [
      "Synthetic benchmark isolating chart/figure retrieval failures",
      "6 pipelines: text-only, OCR-augmented, vision-grounded BM25/TF-IDF, Qwen2-VL / Qwen2.5, Gemini captioning",
      "Controlled comparison against published research claims",
    ],
    metrics: [
      { label: "Pipelines", value: "6" },
      { label: "VLMs", value: "3" },
      { label: "Δ vs text-only", value: "+24pt", placeholder: true }, // ⚠ REPLACE
    ],
    stack: ["PyTorch", "Qwen2-VL", "Gemini", "OCR", "BM25", "TF-IDF"],
    domain: "RAG",
    links: {},
    size: "wide",
    featured: true,
  },
  {
    slug: "mood-time-recommender",
    title: "Mood-Time Recommender",
    kicker: "Context-aware recommendations",
    period: "2025", // ⚠ REPLACE
    summary:
      "Full-stack recommendation engine that adapts suggestions to the user's current mood and time of day.", // ⚠ REPLACE with real description
    problem:
      "Static recommenders ignore context — what you want at 7am is not what you want at midnight.", // ⚠ REPLACE
    highlights: [
      "Context features: mood signal × time-of-day buckets", // ⚠ REPLACE
      "MongoDB-backed user history and feedback loop",
      "Interactive Streamlit front end",
    ],
    metrics: [{ label: "Context dims", value: "2" }],
    stack: ["Python", "Streamlit", "MongoDB", "scikit-learn"],
    domain: "RecSys",
    links: { github: "https://github.com/rushikeshnale07" }, // ⚠ REPLACE with the repo URL
    size: "sm",
    featured: true,
  },
  {
    slug: "llm-eval-framework",
    title: "LLM Evaluation & Benchmarking Framework",
    kicker: "RAG evaluation harness",
    org: "IIT Roorkee",
    period: "Jan 2026 – Mar 2026",
    summary:
      "Automated harness benchmarking retrieval, reranking and generation configurations to find the optimal accuracy–cost–latency trade-off.",
    problem: "Teams tune RAG by vibes. Without per-stage metrics you can't tell whether retrieval or generation is the bottleneck.",
    highlights: [
      "Retrieval: Recall@K, MRR, nDCG",
      "Generation: Context Precision/Recall, Faithfulness, Answer Relevancy",
      "Latency + token-efficiency tracking per configuration",
    ],
    metrics: [
      { label: "Metrics", value: "8" },
      { label: "Configs swept", value: "24", placeholder: true }, // ⚠ REPLACE
    ],
    stack: ["Python", "LangChain", "RAGAS", "Pandas"],
    domain: "Eval",
    links: { github: "https://github.com/rushikeshnale07" }, // ⚠ REPLACE with the repo URL
    size: "sm",
    featured: true,
  },
  {
    slug: "depression-detection",
    title: "Multimodal Depression Detection",
    kicker: "NLP + vision feature fusion",
    org: "MIT ADT University",
    period: "Jul 2024 – Nov 2024",
    summary:
      "Depression-screening pipeline on the 189-interview DAIC-WOZ corpus, fusing NLP semantic features with CNN visual/behavioral features.",
    problem: "Single-modality screening misses signals that only appear when language and behavior are read together.",
    highlights: [
      "Semantic text representations from interview transcripts",
      "CNN-based visual/behavioral feature extraction",
      "Multimodal fusion for binary classification",
    ],
    metrics: [{ label: "Interviews", value: "189" }],
    stack: ["PyTorch", "NLP", "CNN", "DAIC-WOZ"],
    domain: "NLP",
    links: {},
    size: "wide",
    featured: true,
  },
];

/* ───────────────────────── RESEARCH ───────────────────────── */

export const publications = [
  {
    title: "Specific Vehicle Detection System",
    authors: "Rushikesh Nale, Ujjwal Kulkarni, Manasi Kulkarni, Tanuja Zende",
    venue: "SSRN",
    year: 2025,
    href: "https://ssrn.com/", // ⚠ REPLACE with the paper's SSRN URL
  },
];

export const awards = [
  { title: "Shortlisted — Scientist-B", org: "CERT-In, Govt. of India", year: "2026" },
  { title: "Amazon Machine Learning Summer School", org: "Amazon", year: "2024" },
  { title: "GATE CSE Qualified", org: "GATE", year: "2025" }, // ⚠ REPLACE year if different
  { title: "Best Research Paper Presentation", org: "National Conference on Global Tech Trends", year: "2025" }, // ⚠ REPLACE year
];

/* ───────────────────────── TIMELINE ───────────────────────── */

export type TimelineItem = {
  period: string;
  title: string;
  org: string;
  kind: "education" | "research" | "industry" | "leadership";
  points: string[];
};

export const timeline: TimelineItem[] = [
  {
    period: "Jun 2026 – Aug 2026",
    title: "AI Research Intern",
    org: "Dept. of CSE, IIT Roorkee",
    kind: "research",
    points: [
      "Identified limitations of standard RAG in retrieving chart/figure information.",
      "Implemented 6 retrieval/LLM pipelines spanning OCR, vision-grounded retrieval, Qwen2-VL/Qwen2.5 and Gemini.",
    ],
  },
  {
    period: "May 2026 – Sep 2026",
    title: "Contingent Leader — Srishti 2026",
    org: "IIT Roorkee",
    kind: "leadership",
    points: ["Led Bhawan teams across 12+ technical and innovation domains."],
  },
  {
    period: "Mar 2026 – Jun 2026",
    title: "Additional Technical Secretary",
    org: "IIT Roorkee",
    kind: "leadership",
    points: ["Coordinated technical events across students and Bhawan administration."],
  },
  {
    period: "Dec 2025 – Jan 2026",
    title: "RAG Engineer — Constitutional Law QA",
    org: "Primus Partners",
    kind: "industry",
    points: ["Built a hybrid BM25 + semantic retrieval system deployed via FastAPI, Streamlit and Docker."],
  },
  {
    period: "Aug 2025 – Present",
    title: "M.Tech, Artificial Intelligence",
    org: "Indian Institute of Technology Roorkee",
    kind: "education",
    points: ["DAPC PG Student Representative."],
  },
  {
    period: "2021 – 2025",
    title: "B.Tech, Computer Science & Engineering",
    org: "MIT ADT University, Pune",
    kind: "education",
    points: ["Smart Parking CV system → SSRN publication.", "Amazon ML Summer School 2024."],
  },
];

/* ───────────────────────── STACK ───────────────────────── */

export const stack: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["Python", "C++", "C", "SQL"] },
  { group: "Modeling", items: ["PyTorch", "Deep Learning", "CNNs", "Transformers", "scikit-learn"] },
  { group: "Retrieval & LLMs", items: ["LangChain", "BM25", "Dense Retrieval", "Reranking", "RAG Evaluation", "Qwen2-VL", "Gemini"] },
  { group: "Vision", items: ["YOLOv8", "OpenCV", "OCR"] },
  { group: "Serving & Infra", items: ["FastAPI", "Flask", "Docker", "Streamlit", "Git"] },
  { group: "Data", items: ["MySQL", "SQLite", "MongoDB"] },
];

export const languages = ["English", "Hindi", "Marathi"];
