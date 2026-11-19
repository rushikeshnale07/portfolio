/**
 * Data for the RAG Pipeline Visualizer (Lab → tab 1).
 *
 * The chunk texts are from the Constitution of India (public domain).
 * ⚠ REPLACE: the scores, latencies and aggregate metrics are realistic
 * placeholders. Swap in numbers from your own retriever / eval runs
 * (LLM Evaluation Framework) by editing the values below.
 */

export type Mode = "bm25" | "dense" | "hybrid";

export const MODES: { id: Mode; label: string; blurb: string }[] = [
  { id: "bm25", label: "BM25", blurb: "Lexical: exact term overlap" },
  { id: "dense", label: "Dense", blurb: "Semantic: embedding cosine" },
  { id: "hybrid", label: "Hybrid", blurb: "BM25 ∥ Dense → RRF → rerank + article parser" },
];

/** Aggregate metrics over the full eval set, per retrieval mode. ⚠ REPLACE */
export const AGGREGATE: Record<Mode, { recall5: number; mrr: number; ndcg5: number; faithfulness: number }> = {
  bm25: { recall5: 0.78, mrr: 0.64, ndcg5: 0.69, faithfulness: 0.81 },
  dense: { recall5: 0.81, mrr: 0.66, ndcg5: 0.71, faithfulness: 0.84 },
  hybrid: { recall5: 0.91, mrr: 0.84, ndcg5: 0.86, faithfulness: 0.92 },
};

export type Chunk = { id: string; ref: string; part: string; text: string };

export type Question = {
  id: string;
  q: string;
  /** What this example demonstrates — shown under the selector */
  lesson: string;
  gold: string;
  chunks: Record<string, Chunk>;
  ranks: Record<Mode, { id: string; score: number }[]>;
  answers: Record<Mode, string>;
  /** Stage latencies in ms (⚠ REPLACE with real p50s) */
  latency: { embed: number; bm25: number; dense: number; fuse: number; rerank: number; generate: number };
};

const LAT = { embed: 18, bm25: 9, dense: 31, fuse: 2, rerank: 142, generate: 610 };

export const QUESTIONS: Question[] = [
  {
    id: "art21",
    q: "What does Article 21 protect?",
    lesson: "Exact article numbers are lexical. Dense retrieval drifts to semantically similar neighbours (Art. 20, 22).",
    gold: "a21",
    latency: LAT,
    chunks: {
      a21: {
        id: "a21",
        ref: "Art. 21",
        part: "Part III",
        text: "Protection of life and personal liberty. — No person shall be deprived of his life or personal liberty except according to procedure established by law.",
      },
      a21a: {
        id: "a21a",
        ref: "Art. 21A",
        part: "Part III",
        text: "Right to education. — The State shall provide free and compulsory education to all children of the age of six to fourteen years in such manner as the State may, by law, determine.",
      },
      a20: {
        id: "a20",
        ref: "Art. 20",
        part: "Part III",
        text: "Protection in respect of conviction for offences. — No person shall be convicted of any offence except for violation of a law in force at the time of the commission of the act…",
      },
      a22: {
        id: "a22",
        ref: "Art. 22",
        part: "Part III",
        text: "Protection against arrest and detention in certain cases. — No person who is arrested shall be detained in custody without being informed, as soon as may be, of the grounds for such arrest…",
      },
      a19: {
        id: "a19",
        ref: "Art. 19",
        part: "Part III",
        text: "Protection of certain rights regarding freedom of speech, etc. — All citizens shall have the right to freedom of speech and expression; to assemble peaceably and without arms…",
      },
      a359: {
        id: "a359",
        ref: "Art. 359",
        part: "Part XVIII",
        text: "Suspension of the enforcement of the rights conferred by Part III during emergencies — except articles 20 and 21, which cannot be suspended.",
      },
    },
    ranks: {
      bm25: [
        { id: "a21", score: 14.2 },
        { id: "a21a", score: 11.8 },
        { id: "a359", score: 9.6 },
        { id: "a20", score: 6.1 },
        { id: "a22", score: 5.4 },
      ],
      dense: [
        { id: "a22", score: 0.82 },
        { id: "a20", score: 0.8 },
        { id: "a21", score: 0.79 },
        { id: "a19", score: 0.74 },
        { id: "a359", score: 0.71 },
      ],
      hybrid: [
        { id: "a21", score: 0.97 },
        { id: "a359", score: 0.81 },
        { id: "a21a", score: 0.66 },
        { id: "a22", score: 0.58 },
        { id: "a20", score: 0.55 },
      ],
    },
    answers: {
      bm25: "Article 21 guarantees that no person shall be deprived of life or personal liberty except according to procedure established by law [1]. Article 21A separately adds the right to free and compulsory education for children aged 6–14 [2].",
      dense:
        "Article 22 protects arrested persons, requiring that they be informed of the grounds of arrest [1]; Article 20 protects against retrospective conviction [2]. Article 21 protects life and personal liberty [3]. ⚠ Top-ranked context was a neighbouring article.",
      hybrid:
        "Article 21 protects life and personal liberty: no person may be deprived of either except according to procedure established by law [1]. It is one of only two rights (with Article 20) that cannot be suspended even during an Emergency [2].",
    },
  },
  {
    id: "emergency",
    q: "Can the President declare a national emergency because of internal disturbance?",
    lesson: "The query uses outdated wording. BM25 latches onto “internal disturbance” in Art. 355; semantics recover Art. 352’s “armed rebellion”.",
    gold: "a352",
    latency: { ...LAT, generate: 720 },
    chunks: {
      a352: {
        id: "a352",
        ref: "Art. 352",
        part: "Part XVIII",
        text: "Proclamation of Emergency. — If the President is satisfied that a grave emergency exists whereby the security of India… is threatened, whether by war or external aggression or armed rebellion, he may, by Proclamation, make a declaration to that effect…",
      },
      a355: {
        id: "a355",
        ref: "Art. 355",
        part: "Part XVIII",
        text: "Duty of the Union to protect States against external aggression and internal disturbance, and to ensure that the government of every State is carried on in accordance with the provisions of this Constitution.",
      },
      a356: {
        id: "a356",
        ref: "Art. 356",
        part: "Part XVIII",
        text: "Provisions in case of failure of constitutional machinery in States. — If the President… is satisfied that a situation has arisen in which the government of the State cannot be carried on in accordance with the provisions of this Constitution…",
      },
      a359: {
        id: "a359",
        ref: "Art. 359",
        part: "Part XVIII",
        text: "Suspension of the enforcement of the rights conferred by Part III during emergencies.",
      },
      am44: {
        id: "am44",
        ref: "44th Amdt.",
        part: "1978",
        text: "Constitution (Forty-fourth Amendment) Act, 1978 — substituted the words “armed rebellion” for “internal disturbance” in article 352.",
      },
      a360: {
        id: "a360",
        ref: "Art. 360",
        part: "Part XVIII",
        text: "Provisions as to financial emergency. — If the President is satisfied that a situation has arisen whereby the financial stability or credit of India… is threatened…",
      },
    },
    ranks: {
      bm25: [
        { id: "a355", score: 13.7 },
        { id: "a360", score: 8.9 },
        { id: "a356", score: 8.2 },
        { id: "a359", score: 7.5 },
        { id: "am44", score: 7.1 },
      ],
      dense: [
        { id: "a352", score: 0.86 },
        { id: "a355", score: 0.81 },
        { id: "a356", score: 0.77 },
        { id: "am44", score: 0.75 },
        { id: "a360", score: 0.72 },
      ],
      hybrid: [
        { id: "a352", score: 0.94 },
        { id: "am44", score: 0.88 },
        { id: "a355", score: 0.83 },
        { id: "a356", score: 0.62 },
        { id: "a359", score: 0.47 },
      ],
    },
    answers: {
      bm25: "Yes. The Union has a duty to protect States against internal disturbance [1], and the President may act on it. ✗ Unfaithful: Art. 352 was never retrieved, so the answer misses the 1978 change.",
      dense:
        "A national emergency under Article 352 requires war, external aggression or armed rebellion [1]. Article 355 separately places a duty on the Union to protect States against internal disturbance [2].",
      hybrid:
        "Not on that ground alone. Since the 44th Amendment (1978), Article 352 allows a national emergency only for war, external aggression or armed rebellion [1]; “internal disturbance” was replaced [2]. Article 355 still obliges the Union to protect States against internal disturbance [3].",
    },
  },
  {
    id: "243zh",
    q: "What is Article 243ZH about?",
    lesson: "Alphanumeric suffixes break tokenizers. The custom article parser pins “243ZH” exactly; without it, 243Z and 243H crowd it out.",
    gold: "a243zh",
    latency: { ...LAT, fuse: 3 },
    chunks: {
      a243zh: {
        id: "a243zh",
        ref: "Art. 243ZH",
        part: "Part IXB",
        text: "Definitions. — In this Part, unless the context otherwise requires, (a) “authorised person” means a person referred to in article 243ZQ; (b) “board” means the board of directors or the governing body of a co-operative society…",
      },
      a243z: {
        id: "a243z",
        ref: "Art. 243Z",
        part: "Part IXA",
        text: "Audit of accounts. — The Legislature of a State may, by law, make provisions with respect to the maintenance of accounts by the Municipalities and the auditing of such accounts.",
      },
      a243h: {
        id: "a243h",
        ref: "Art. 243H",
        part: "Part IX",
        text: "Powers to impose taxes by, and Funds of, the Panchayats. — The Legislature of a State may, by law, authorise a Panchayat to levy, collect and appropriate such taxes, duties, tolls and fees…",
      },
      a243zi: {
        id: "a243zi",
        ref: "Art. 243ZI",
        part: "Part IXB",
        text: "Incorporation of co-operative societies. — Subject to the provisions of this Part, the Legislature of a State may, by law, make provisions with respect to the incorporation, regulation and winding up of co-operative societies…",
      },
      a243zd: {
        id: "a243zd",
        ref: "Art. 243ZD",
        part: "Part IXA",
        text: "Committee for district planning. — There shall be constituted in every State at the district level a District Planning Committee to consolidate the plans prepared by the Panchayats and the Municipalities…",
      },
    },
    ranks: {
      bm25: [
        { id: "a243z", score: 9.4 },
        { id: "a243h", score: 9.1 },
        { id: "a243zd", score: 6.3 },
        { id: "a243zi", score: 5.8 },
        { id: "a243zh", score: 5.2 },
      ],
      dense: [
        { id: "a243zi", score: 0.69 },
        { id: "a243zd", score: 0.66 },
        { id: "a243zh", score: 0.64 },
        { id: "a243z", score: 0.63 },
        { id: "a243h", score: 0.6 },
      ],
      hybrid: [
        { id: "a243zh", score: 0.99 },
        { id: "a243zi", score: 0.71 },
        { id: "a243z", score: 0.44 },
        { id: "a243zd", score: 0.39 },
        { id: "a243h", score: 0.33 },
      ],
    },
    answers: {
      bm25: "Article 243Z deals with the audit of Municipal accounts [1]. ✗ Wrong article: the tokenizer matched “243Z” and the answer never reached 243ZH.",
      dense:
        "This relates to co-operative societies; Article 243ZI lets State Legislatures provide for their incorporation and regulation [1]. Article 243ZH appears to contain definitions for that Part [3].",
      hybrid:
        "Article 243ZH is the definitions clause of Part IXB (Co-operative Societies). It defines terms used in that Part, such as “authorised person” and “board” [1]; the substantive powers begin with Article 243ZI [2].",
    },
  },
];
