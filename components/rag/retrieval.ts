export type Doc = {
  id: string
  source: string
  path: string
  page: number
  tokens: number
  text: string
}

export const KNOWLEDGE_BASE: Doc[] = [
  {
    id: "chunk_01",
    source: "food-safety-handbook.pdf",
    path: "Cold Storage → Poultry & Meat",
    page: 47,
    tokens: 214,
    text: "Fresh poultry must be stored at or below 40°F (4°C) to inhibit bacterial growth. Prior to service, poultry must reach a minimum internal cooking temperature of 165°F (74°C) verified with a calibrated probe thermometer. Frozen poultry should be held at 0°F (-18°C) or lower.",
  },
  {
    id: "chunk_02",
    source: "cold-chain-sop.md",
    path: "Refrigerated Transport Standards",
    page: 12,
    tokens: 168,
    text: "Refrigerated transport units carrying fresh poultry must maintain an air temperature between 34°F and 38°F (1–3°C) with continuous temperature logging at no more than 15-minute intervals. Any excursion beyond range must trigger an alert to the dispatch desk.",
  },
  {
    id: "chunk_03",
    source: "food-safety-handbook.pdf",
    path: "Food Safety → Danger Zone",
    page: 51,
    tokens: 142,
    text: "Any product held in the 40–140°F (4–60°C) temperature danger zone for more than four cumulative hours must be discarded and logged as a deviation. Logs are reviewed weekly by the food safety lead.",
  },
  {
    id: "chunk_04",
    source: "kyc-aml-policy.pdf",
    path: "Merchant Onboarding → KYC",
    page: 8,
    tokens: 198,
    text: "When onboarding a new merchant, KYC checks require collection of government-issued identification, business registration documents, and beneficial ownership disclosure. High-risk merchants undergo enhanced due diligence and sanctions screening before activation.",
  },
  {
    id: "chunk_05",
    source: "payments-fee-schedule.md",
    path: "Settlements → Cross-border",
    page: 3,
    tokens: 121,
    text: "Cross-border card settlements incur a 1.0% currency conversion fee plus a fixed interchange surcharge of 0.30 per transaction. Settlements in non-supported currencies are converted at the daily mid-market rate.",
  },
  {
    id: "chunk_06",
    source: "last-mile-logistics-guide.pdf",
    path: "Delivery Exceptions → SLA",
    page: 22,
    tokens: 176,
    text: "The standard SLA for resolving last-mile delivery exceptions is 24 hours from the time the exception is logged. Failed delivery attempts trigger an automatic reattempt on the next business day, and a third failure routes the parcel back to the hub.",
  },
  {
    id: "chunk_07",
    source: "kyc-aml-policy.pdf",
    path: "Monitoring → Transactions",
    page: 14,
    tokens: 159,
    text: "Ongoing transaction monitoring flags activity that deviates from a merchant's expected volume profile. Flagged events generate a case for the compliance team and may pause settlements pending review.",
  },
  {
    id: "chunk_08",
    source: "warehouse-onboarding-faq.md",
    path: "Getting Started",
    page: 1,
    tokens: 98,
    text: "New warehouses are onboarded within 10 business days, including dock scheduling, inventory synchronization, and staff access provisioning. A dedicated implementation manager coordinates the cutover.",
  },
]

export const FILES = [
  { name: "food-safety-handbook.pdf", tokens: 524, status: "ready" as const },
  { name: "cold-chain-sop.md", tokens: 187, status: "ready" as const },
  { name: "kyc-aml-policy.pdf", tokens: 318, status: "ready" as const },
  { name: "payments-fee-schedule.md", tokens: 142, status: "ready" as const },
  {
    name: "last-mile-logistics-guide.pdf",
    tokens: 463,
    status: "ready" as const,
  },
  {
    name: "warehouse-onboarding-faq.md",
    tokens: 0,
    status: "indexing" as const,
  },
]

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "is", "are", "for", "on",
  "with", "how", "what", "do", "does", "can", "i", "my", "we", "you", "it",
  "be", "by", "at", "as", "this", "that", "from", "your", "when", "which",
  "applies", "apply", "handled", "standard",
])

export function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t))
}

export type Retrieved = Doc & { score: number }

export function retrieve(query: string, topK: number): Retrieved[] {
  const qTokens = tokenize(query)
  if (qTokens.length === 0) return []

  const scored = KNOWLEDGE_BASE.map((doc) => {
    const docTokens = tokenize(`${doc.path} ${doc.text}`)
    const docSet = new Set(docTokens)
    let overlap = 0
    for (const t of qTokens) if (docSet.has(t)) overlap += 1
    const base = overlap / qTokens.length
    const score = base === 0 ? 0 : 0.5 + base * 0.45
    return { ...doc, score: Math.min(0.97, Number(score.toFixed(3))) }
  })

  return scored
    .filter((d) => d.score > 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
}

export type ReportSection = {
  heading: string
  bullets: Array<{ text: string; cite?: number }>
}

export type StructuredAnswer = {
  summary: { text: string; cite?: number }
  sections: ReportSection[]
  sourceNote: string
}

export function synthesizeStructuredAnswer(
  query: string,
  chunks: Retrieved[]
): StructuredAnswer {
  if (chunks.length === 0) {
    return {
      summary: {
        text: "No relevant content was found in the indexed sources for this query. Try rephrasing the question, increasing Top-K, or re-indexing your knowledge base.",
      },
      sections: [],
      sourceNote: "",
    }
  }

  const primary = chunks[0]
  const rest = chunks.slice(1)

  const primarySentences = primary.text
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
  const summaryText = primarySentences.slice(0, 2).join(" ")

  const findingBullets = chunks.slice(0, 4).map((c, idx) => {
    const sentences = c.text
      .split(/(?<=\.)\s+/)
      .map((s) => s.trim())
      .filter(Boolean)
    return { text: sentences[0] ?? c.text, cite: idx + 1 }
  })

  const additionalBullets = rest.slice(0, 2).map((c, idx) => {
    const sentences = c.text
      .split(/(?<=\.)\s+/)
      .map((s) => s.trim())
      .filter(Boolean)
    return { text: sentences[1] ?? sentences[0] ?? c.text, cite: idx + 2 }
  })

  const sections: ReportSection[] = [
    { heading: "Key findings", bullets: findingBullets },
    ...(additionalBullets.length > 0
      ? [{ heading: "Additional context", bullets: additionalBullets }]
      : []),
  ]

  const srcNames = [...new Set(chunks.map((c) => c.source))].join(", ")

  return {
    summary: { text: summaryText, cite: 1 },
    sections,
    sourceNote: `Based on ${chunks.length} chunk${chunks.length > 1 ? "s" : ""} from: ${srcNames}`,
  }
}

export function buildPromptPreview(
  query: string,
  chunks: Retrieved[],
  model: string,
  systemPrompt: string
): string {
  const context = chunks
    .map(
      (c, i) =>
        `--- Chunk ${i + 1} | ${c.source} | ${c.path} | p.${c.page} ---\n${c.text}`
    )
    .join("\n\n")

  return [
    `[system]`,
    systemPrompt,
    ``,
    `[context]`,
    context,
    ``,
    `[user]`,
    query,
    ``,
    `[model: ${model}]`,
  ].join("\n")
}

export function streamText(
  fullText: string,
  onChunk: (partial: string) => void,
  onDone: () => void,
  wordsPerTick = 4,
  intervalMs = 28
): () => void {
  const words = fullText.split(" ")
  let index = 0
  const id = setInterval(() => {
    index += wordsPerTick
    if (index >= words.length) {
      onChunk(fullText)
      onDone()
      clearInterval(id)
    } else {
      onChunk(words.slice(0, index).join(" "))
    }
  }, intervalMs)
  return () => clearInterval(id)
}

export type RunResult = {
  query: string
  structured: StructuredAnswer
  promptPreview: string
  chunks: Retrieved[]
  latencyMs: number
  tokens: number
  faithfulness: number
  relevance: number
  model: string
}
