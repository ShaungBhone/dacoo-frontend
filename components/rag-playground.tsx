"use client"

import * as React from "react"
import {
  SparklesIcon,
  Loader2Icon,
  FileTextIcon,
  CopyIcon,
  CheckIcon,
  SearchIcon,
  ClockIcon,
  CoinsIcon,
  ShieldCheckIcon,
  TargetIcon,
  DatabaseIcon,
  CornerDownLeftIcon,
  TerminalIcon,
  MessageCircleIcon,
  BarChart2Icon,
  ListChecksIcon,
  AlignLeftIcon,
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { PlaygroundNav } from "@/components/playground-nav"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/* -------------------------------------------------------------------------- */
/*                              Demo knowledge base                            */
/* -------------------------------------------------------------------------- */

type Doc = {
  id: string
  source: string
  path: string
  page: number
  tokens: number
  text: string
}

const KNOWLEDGE_BASE: Doc[] = [
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

/* Aggregated file list for the knowledge-base rail. */
const FILES = [
  { name: "food-safety-handbook.pdf", tokens: 524, status: "ready" as const },
  { name: "cold-chain-sop.md", tokens: 187, status: "ready" as const },
  { name: "kyc-aml-policy.pdf", tokens: 318, status: "ready" as const },
  { name: "payments-fee-schedule.md", tokens: 142, status: "ready" as const },
  { name: "last-mile-logistics-guide.pdf", tokens: 463, status: "ready" as const },
  { name: "warehouse-onboarding-faq.md", tokens: 0, status: "indexing" as const },
]

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "is", "are", "for", "on",
  "with", "how", "what", "do", "does", "can", "i", "my", "we", "you", "it",
  "be", "by", "at", "as", "this", "that", "from", "your", "when", "which",
  "applies", "apply", "handled", "standard",
])

const SAMPLE_QUERIES = [
  "What is the safe internal temperature for storing fresh poultry?",
  "How are KYC checks handled when onboarding a new merchant?",
  "What is the standard SLA for last-mile delivery exceptions?",
  "Which fees apply to cross-border card settlements?",
]

/* -------------------------------------------------------------------------- */
/*                            Retrieval simulation                             */
/* -------------------------------------------------------------------------- */

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t))
}

type Retrieved = Doc & { score: number }

function retrieve(query: string, topK: number): Retrieved[] {
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

/* -------------------------------------------------------------------------- */
/*                         Structured report builder                           */
/* -------------------------------------------------------------------------- */

/** A single section of the structured report. */
type ReportSection = {
  heading: string
  bullets: Array<{ text: string; cite?: number }>
}

type StructuredAnswer = {
  summary: { text: string; cite?: number }
  sections: ReportSection[]
  sourceNote: string
}

function synthesizeStructuredAnswer(
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

  // Pull the first two sentences from the top chunk as the summary.
  const primarySentences = primary.text
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
  const summaryText = primarySentences.slice(0, 2).join(" ")

  // Build "Key findings" bullets from all retrieved chunks.
  const findingBullets = chunks.slice(0, 4).map((c, idx) => {
    const sentences = c.text
      .split(/(?<=\.)\s+/)
      .map((s) => s.trim())
      .filter(Boolean)
    return { text: sentences[0] ?? c.text, cite: idx + 1 }
  })

  // Build an "Additional context" section from the remaining chunks if any.
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

/* -------------------------------------------------------------------------- */
/*                            Prompt templates                                 */
/* -------------------------------------------------------------------------- */

export type PromptTemplate = {
  id: string
  label: string
  description: string
  system: string
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "default",
    label: "Default assistant",
    description: "Strict grounding — answer only from context, admit gaps.",
    system:
      "You are a helpful assistant. Answer questions strictly using the context provided below. If the context does not contain enough information, say so.",
  },
  {
    id: "support",
    label: "Customer support",
    description: "Friendly tone, actionable next steps, escalation path.",
    system:
      "You are a friendly customer support agent. Use the context below to answer the user's question clearly and empathetically. If you cannot resolve it, suggest escalating to a human agent.",
  },
  {
    id: "analyst",
    label: "Data analyst",
    description: "Precise, citation-heavy, structured with numbers.",
    system:
      "You are a precise data analyst. Provide a structured answer using only the figures, thresholds, and facts stated in the context below. Cite each claim with the chunk it came from. Avoid inference beyond what the data supports.",
  },
  {
    id: "compliance",
    label: "Compliance officer",
    description: "Conservative, policy-first, flags missing coverage.",
    system:
      "You are a compliance officer. Answer using only the policies and regulations present in the context below. If a specific scenario is not explicitly covered by the provided policy, state that clearly and recommend seeking formal legal or compliance review.",
  },
  {
    id: "onboarding",
    label: "Onboarding guide",
    description: "Step-by-step instructions for new team members.",
    system:
      "You are an onboarding guide for new employees. Translate the context below into clear, numbered steps that someone unfamiliar with the domain can follow. Use plain language and avoid jargon.",
  },
  {
    id: "concise",
    label: "Concise summary",
    description: "One-paragraph TL;DR, no bullets.",
    system:
      "You are a summarization assistant. Produce a single concise paragraph that captures the key answer from the context below. Do not use bullet points. Prioritize brevity without losing accuracy.",
  },
]

/** Build the raw prompt string shown in the Prompt tab. */
function buildPromptPreview(
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

/** Stream the full report text word-by-word via an interval; returns a cleanup fn. */
function streamText(
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

type RunResult = {
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


/* -------------------------------------------------------------------------- */
/*                                 Component                                   */
/* -------------------------------------------------------------------------- */

export function RagPlayground() {
  const [query, setQuery] = React.useState(SAMPLE_QUERIES[0])
  const [genModel, setGenModel] = React.useState("gpt-4o")
  const [embedModel, setEmbedModel] = React.useState("text-embedding-3-large")
  const [topK, setTopK] = React.useState(4)
  const [temperature, setTemperature] = React.useState(0.2)
  const [rerank, setRerank] = React.useState(true)
  const [isRunning, setIsRunning] = React.useState(false)
  const [isStreaming, setIsStreaming] = React.useState(false)
  const [result, setResult] = React.useState<RunResult | null>(null)
  const [streamedText, setStreamedText] = React.useState("")
  const stopStreamRef = React.useRef<(() => void) | null>(null)
  const [templates, setTemplates] = React.useState<PromptTemplate[]>(PROMPT_TEMPLATES)
  const [templateId, setTemplateId] = React.useState(PROMPT_TEMPLATES[0].id)
  // null = closed; { mode: "add" } or { mode: "edit", template } when open.
  const [templateDialog, setTemplateDialog] = React.useState<
    { mode: "add" } | { mode: "edit"; template: PromptTemplate } | null
  >(null)

  const activeTemplate =
    templates.find((t) => t.id === templateId) ?? templates[0]

  // Create or update a template. New templates get a generated id and become active.
  // NOTE: wire to POST/PUT /api/v1/organizations/{orgId}/prompt-templates here later.
  function upsertTemplate(input: Omit<PromptTemplate, "id"> & { id?: string }) {
    if (input.id) {
      setTemplates((prev) =>
        prev.map((t) => (t.id === input.id ? { ...t, ...input, id: t.id } : t))
      )
    } else {
      const id = `tpl-${Date.now()}`
      setTemplates((prev) => [...prev, { ...input, id }])
      setTemplateId(id)
    }
    setTemplateDialog(null)
  }

  // Delete a template. If the active one is removed, fall back to the first remaining.
  // NOTE: wire to DELETE /api/v1/organizations/{orgId}/prompt-templates/{id} here later.
  function deleteTemplate(id: string) {
    setTemplates((prev) => {
      const next = prev.filter((t) => t.id !== id)
      if (id === templateId && next.length > 0) {
        setTemplateId(next[0].id)
      }
      return next
    })
  }

  const runQuery = React.useCallback(async () => {
    if (!query.trim() || isRunning) return

    // Cancel any in-progress stream from a prior run.
    stopStreamRef.current?.()
    setIsRunning(true)
    setIsStreaming(false)
    setStreamedText("")
    setResult(null)

    const start = performance.now()
    let chunks = retrieve(query, topK)
    if (rerank) {
      chunks = [...chunks].sort((a, b) => b.score - a.score)
    }

    // Brief retrieval latency, then start streaming.
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 300))

    const latencyMs = Math.round(performance.now() - start)
    const usedTokens = chunks.reduce((sum, c) => sum + c.tokens, 0)
    const top = chunks[0]?.score ?? 0

    const structured = synthesizeStructuredAnswer(query, chunks)
    const promptPreview = buildPromptPreview(
      query,
      chunks,
      genModel,
      activeTemplate.system
    )

    const pendingResult: RunResult = {
      query,
      structured,
      promptPreview,
      chunks,
      latencyMs,
      tokens: usedTokens + 1300 + tokenize(query).length * 4,
      faithfulness: chunks.length ? Math.round((0.82 + top * 0.13) * 100) : 0,
      relevance: chunks.length ? Math.round((0.7 + top * 0.2) * 100) : 0,
      model: genModel,
    }

    // Build the full prose string to stream (summary + all bullet texts joined).
    const allBullets = structured.sections.flatMap((s) => s.bullets)
    const fullText = [
      structured.summary.text,
      ...allBullets.map((b) => b.text),
    ].join(" ")

    setIsRunning(false)
    setIsStreaming(true)
    setResult(pendingResult)

    stopStreamRef.current = streamText(
      fullText,
      (partial) => setStreamedText(partial),
      () => {
        setIsStreaming(false)
        setStreamedText(fullText)
      }
    )
  }, [query, topK, rerank, genModel, isRunning, activeTemplate])

  // Run the default query once on mount for an immediately useful view.
  React.useEffect(() => {
    runQuery()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const native = e.nativeEvent as unknown as {
      isComposing?: boolean
      keyCode?: number
    }
    if (native.isComposing || native.keyCode === 229) return
    if (e.key === "Enter") {
      e.preventDefault()
      runQuery()
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <PlaygroundNav active="Playground" />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-6 lg:flex-row lg:gap-10 lg:px-6">
        {/* ------------------------------ Left rail ----------------------------- */}
        <aside className="flex w-full shrink-0 flex-col gap-6 lg:w-64">
          <ConfigRail
            genModel={genModel}
            setGenModel={setGenModel}
            embedModel={embedModel}
            setEmbedModel={setEmbedModel}
            topK={topK}
            setTopK={setTopK}
            temperature={temperature}
            setTemperature={setTemperature}
            rerank={rerank}
            setRerank={setRerank}
          />
          <KnowledgeBase />
        </aside>

        {/* ------------------------------- Console ------------------------------ */}
        <main className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold tracking-tight text-pretty">
              Retrieval testing console
            </h1>
            <p className="text-sm text-muted-foreground text-pretty">
              Run a query, inspect the generated answer, and trace every claim
              back to its source chunk.
            </p>
          </header>

          <QueryBar
            query={query}
            setQuery={setQuery}
            onRun={runQuery}
            onKeyDown={handleKeyDown}
            isRunning={isRunning}
            templates={templates}
            templateId={templateId}
            setTemplateId={setTemplateId}
            onAddTemplate={() => setTemplateDialog({ mode: "add" })}
            onEditTemplate={(template) =>
              setTemplateDialog({ mode: "edit", template })
            }
            onDeleteTemplate={deleteTemplate}
          />

          {result && (
            <>
              <AnswerPanel
                result={result}
                isStreaming={isStreaming}
                streamedText={streamedText}
              />
              <ChunksList chunks={result.chunks} />
            </>
          )}
        </main>
      </div>

      {templateDialog && (
        <TemplateDialog
          template={templateDialog.mode === "edit" ? templateDialog.template : null}
          onClose={() => setTemplateDialog(null)}
          onSave={upsertTemplate}
        />
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                               Config rail                                   */
/* -------------------------------------------------------------------------- */

function ConfigRail({
  genModel,
  setGenModel,
  embedModel,
  setEmbedModel,
  topK,
  setTopK,
  temperature,
  setTemperature,
  rerank,
  setRerank,
}: {
  genModel: string
  setGenModel: (v: string) => void
  embedModel: string
  setEmbedModel: (v: string) => void
  topK: number
  setTopK: (v: number) => void
  temperature: number
  setTemperature: (v: number) => void
  rerank: boolean
  setRerank: (v: boolean) => void
}) {
  return (
    <section className="flex flex-col gap-5">
      <RailHeading icon={<SlidersIcon />}>Retrieval config</RailHeading>

      <Field label="Generation model">
        <input
          value={genModel}
          onChange={(e) => setGenModel(e.target.value)}
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
        />
      </Field>

      <Field label="Embedding model">
        <input
          value={embedModel}
          onChange={(e) => setEmbedModel(e.target.value)}
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
        />
      </Field>

      <Slider
        label="Top-K chunks"
        value={topK}
        min={1}
        max={10}
        step={1}
        display={String(topK)}
        onChange={setTopK}
      />
      <Slider
        label="Temperature"
        value={temperature}
        min={0}
        max={1}
        step={0.05}
        display={temperature.toFixed(2)}
        onChange={setTemperature}
      />

      <button
        type="button"
        onClick={() => setRerank(!rerank)}
        className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
      >
        <span className="flex flex-col">
          <span className="text-sm font-medium">Cohere rerank</span>
          <span className="text-xs text-muted-foreground">
            Re-score retrieved chunks
          </span>
        </span>
        <Toggle on={rerank} />
      </button>
    </section>
  )
}

function KnowledgeBase() {
  return (
    <section className="flex flex-col gap-3">
      <RailHeading icon={<DatabaseIcon className="size-3.5" />}>
        Knowledge base
      </RailHeading>
      <ul className="flex flex-col gap-1">
        {FILES.map((file) => (
          <li
            key={file.name}
            className="flex items-center gap-2 rounded-md px-1.5 py-1.5 text-sm transition-colors hover:bg-muted/50"
          >
            <FileTextIcon className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">
              {file.name}
            </span>
            {file.status === "indexing" ? (
              <Loader2Icon className="size-3.5 shrink-0 animate-spin text-primary" />
            ) : (
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                {file.tokens}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*                                Query bar                                    */
/* -------------------------------------------------------------------------- */

function QueryBar({
  query,
  setQuery,
  onRun,
  onKeyDown,
  isRunning,
  templates,
  templateId,
  setTemplateId,
  onAddTemplate,
  onEditTemplate,
  onDeleteTemplate,
}: {
  query: string
  setQuery: (v: string) => void
  onRun: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  isRunning: boolean
  templates: PromptTemplate[]
  templateId: string
  setTemplateId: (id: string) => void
  onAddTemplate: () => void
  onEditTemplate: (template: PromptTemplate) => void
  onDeleteTemplate: (id: string) => void
}) {
  const active = templates.find((t) => t.id === templateId) ?? templates[0]

  return (
    <div className="flex flex-col gap-3">
      {/* Prompt template picker */}
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Prompt template
          </p>
          <button
            type="button"
            onClick={onAddTemplate}
            className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <PlusIcon className="size-3" />
            Add template
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {templates.map((t) => {
            const isActive = t.id === templateId
            return (
              <div
                key={t.id}
                className={cn(
                  "group flex items-center gap-1 rounded-lg border pr-1 transition-colors",
                  isActive
                    ? "border-primary/60 bg-primary/10"
                    : "border-border bg-background hover:border-primary/30"
                )}
              >
                <button
                  type="button"
                  onClick={() => setTemplateId(t.id)}
                  title={t.description}
                  className={cn(
                    "flex items-center gap-1.5 rounded-l-lg py-1.5 pl-3 pr-1 text-xs font-medium transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  <TemplateIcon id={t.id} />
                  {t.label}
                </button>
                <button
                  type="button"
                  onClick={() => onEditTemplate(t)}
                  aria-label={`Edit ${t.label}`}
                  className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <PencilIcon className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteTemplate(t.id)}
                  aria-label={`Delete ${t.label}`}
                  disabled={templates.length <= 1}
                  className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                >
                  <Trash2Icon className="size-3" />
                </button>
              </div>
            )
          })}
        </div>

        {/* Active template system prompt preview */}
        {active && (
          <p className="mt-1 rounded-md bg-muted/50 px-3 py-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
            {active.system}
          </p>
        )}
      </div>

      {/* Search input */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-2 pl-3 shadow-sm focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
        <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask a question against your indexed sources…"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="button"
          onClick={onRun}
          disabled={!query.trim() || isRunning}
          className="flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isRunning ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <CornerDownLeftIcon className="size-4" />
          )}
          Run
        </button>
      </div>

      {/* Sample queries */}
      <div className="flex flex-wrap gap-2">
        {SAMPLE_QUERIES.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setQuery(q)}
            className="rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Small icon per template id — maps each template to a relevant lucide icon. */
function TemplateIcon({ id }: { id: string }) {
  switch (id) {
    case "support":
      return <MessageCircleIcon className="size-3" />
    case "analyst":
      return <BarChart2Icon className="size-3" />
    case "compliance":
      return <ShieldCheckIcon className="size-3" />
    case "onboarding":
      return <ListChecksIcon className="size-3" />
    case "concise":
      return <AlignLeftIcon className="size-3" />
    default:
      return <SparklesIcon className="size-3" />
  }
}

/* -------------------------------------------------------------------------- */
/*                            Template add/edit dialog                         */
/* -------------------------------------------------------------------------- */

function TemplateDialog({
  template,
  onClose,
  onSave,
}: {
  template: PromptTemplate | null
  onClose: () => void
  onSave: (input: Omit<PromptTemplate, "id"> & { id?: string }) => void
}) {
  const isEdit = template != null
  const [label, setLabel] = React.useState(template?.label ?? "")
  const [description, setDescription] = React.useState(template?.description ?? "")
  const [system, setSystem] = React.useState(template?.system ?? "")

  const canSave = label.trim().length > 0 && system.trim().length > 0

  function handleSave() {
    if (!canSave) return
    onSave({
      id: template?.id,
      label: label.trim(),
      description: description.trim() || "Custom template",
      system: system.trim(),
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? "Edit prompt template" : "Add prompt template"}
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
      />

      <div className="relative flex max-h-[85svh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-card shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <SparklesIcon className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold">
              {isEdit ? "Edit template" : "New prompt template"}
            </h2>
            <p className="truncate text-xs text-muted-foreground">
              {isEdit
                ? "Adjust how this template instructs the model."
                : "Define a reusable system prompt for your answers."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="tpl-label"
              className="text-xs font-medium text-muted-foreground"
            >
              Name
            </label>
            <input
              id="tpl-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Technical writer"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="tpl-desc"
              className="text-xs font-medium text-muted-foreground"
            >
              Description
            </label>
            <input
              id="tpl-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short hint shown on hover (optional)"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="tpl-system"
              className="text-xs font-medium text-muted-foreground"
            >
              System prompt
            </label>
            <textarea
              id="tpl-system"
              value={system}
              onChange={(e) => setSystem(e.target.value)}
              rows={6}
              placeholder="You are a… Answer using only the context provided below."
              className="resize-none rounded-md border border-border bg-background px-3 py-2 font-mono text-xs leading-relaxed outline-none transition-colors focus:border-primary/50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckIcon className="size-4" />
            {isEdit ? "Save changes" : "Add template"}
          </button>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                               Answer panel                                  */
/* -------------------------------------------------------------------------- */

function AnswerPanel({
  result,
  isStreaming,
  streamedText,
}: {
  result: RunResult
  isStreaming: boolean
  streamedText: string
}) {
  const [tab, setTab] = React.useState<"answer" | "prompt">("answer")
  const [copied, setCopied] = React.useState(false)

  // Reset to answer tab when a new result arrives.
  React.useEffect(() => {
    setTab("answer")
  }, [result])

  function copy() {
    const allBullets = result.structured.sections.flatMap((s) => s.bullets)
    const text = [
      result.structured.summary.text,
      ...allBullets.map((b) => b.text),
    ].join("\n")
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const metrics = [
    { label: "Latency", value: `${result.latencyMs} ms`, icon: ClockIcon },
    { label: "Tokens", value: result.tokens.toLocaleString(), icon: CoinsIcon },
    { label: "Faithfulness", value: `${result.faithfulness}%`, icon: ShieldCheckIcon },
    { label: "Answer relevance", value: `${result.relevance}%`, icon: TargetIcon },
  ]

  // Words streamed so far — used to show only the visible portion in structured sections.
  const streamedWords = new Set(streamedText.split(" ").filter(Boolean))

  function isTextVisible(text: string): boolean {
    if (!isStreaming) return true
    const firstWord = text.split(" ")[0]
    return streamedWords.has(firstWord ?? "")
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-1">
          {(["answer", "prompt"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                tab === t
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "answer" ? (
                <SparklesIcon className="size-3.5" />
              ) : (
                <TerminalIcon className="size-3.5" />
              )}
              {t === "answer" ? "Answer" : "Prompt"}
            </button>
          ))}
          <span className="ml-2 rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
            {result.model}
          </span>
        </div>

        {tab === "answer" && (
          <button
            type="button"
            onClick={copy}
            disabled={isStreaming}
            className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
          >
            {copied ? (
              <CheckIcon className="size-3.5 text-primary" />
            ) : (
              <CopyIcon className="size-3.5" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>

      {/* Answer tab */}
      {tab === "answer" && (
        <div className="px-5 py-5">
          <TooltipProvider delayDuration={100}>
            {/* Summary */}
            <p className="text-sm leading-7 text-foreground">
              {result.structured.summary.text}
              {isStreaming && (
                <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse rounded-sm bg-primary" />
              )}
              {result.structured.summary.cite != null && !isStreaming && (
                <Citation
                  n={result.structured.summary.cite}
                  chunk={result.chunks[result.structured.summary.cite - 1]}
                />
              )}
            </p>

            {/* Sections — fade in progressively as stream covers their words */}
            {result.structured.sections.map((section) => (
              <div
                key={section.heading}
                className={cn(
                  "mt-5 transition-opacity duration-300",
                  isStreaming && !isTextVisible(section.bullets[0]?.text ?? "")
                    ? "opacity-0"
                    : "opacity-100"
                )}
              >
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {section.heading}
                </p>
                <ul className="flex flex-col gap-2">
                  {section.bullets.map((bullet, bi) => (
                    <li
                      key={bi}
                      className={cn(
                        "flex items-start gap-2 text-sm leading-6 text-foreground/90 transition-opacity duration-200",
                        isStreaming && !isTextVisible(bullet.text)
                          ? "opacity-0"
                          : "opacity-100"
                      )}
                    >
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/60" />
                      <span>
                        {bullet.text}
                        {bullet.cite != null && !isStreaming && (
                          <Citation
                            n={bullet.cite}
                            chunk={result.chunks[bullet.cite - 1]}
                          />
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Source note */}
            {result.structured.sourceNote && !isStreaming && (
              <p className="mt-4 text-xs text-muted-foreground">
                {result.structured.sourceNote}
              </p>
            )}
          </TooltipProvider>

          {/* Metrics — only shown once streaming finishes */}
          <div
            className={cn(
              "mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 transition-opacity duration-500 md:grid-cols-4",
              isStreaming ? "opacity-0" : "opacity-100"
            )}
          >
            {metrics.map((m) => (
              <div
                key={m.label}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
              >
                <m.icon className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="font-mono text-sm font-semibold leading-tight">
                    {m.value}
                  </p>
                  <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">
                    {m.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prompt tab */}
      {tab === "prompt" && (
        <div className="px-5 py-5">
          <p className="mb-3 text-xs text-muted-foreground text-pretty">
            The exact context window sent to the model — system prompt, retrieved chunks, and user query.
          </p>
          <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-xs leading-6 text-foreground/80 whitespace-pre-wrap break-words">
            {result.promptPreview}
          </pre>
        </div>
      )}
    </div>
  )
}

function Citation({ n, chunk }: { n: number; chunk?: Retrieved }) {
  const badge = (
    <button
      type="button"
      className="mx-0.5 inline-flex size-4 translate-y-[-1px] cursor-pointer items-center justify-center rounded bg-primary/10 align-middle font-mono text-[10px] font-semibold text-primary outline-none transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
      aria-label={
        chunk ? `Source ${n}: ${chunk.source}` : `Source ${n}`
      }
    >
      {n}
    </button>
  )

  if (!chunk) return badge

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent
        side="top"
        className="block max-w-sm rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-md [&_svg]:hidden"
      >
        <span className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
          <span className="flex min-w-0 items-center gap-1.5">
            <FileTextIcon className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate font-mono text-xs font-medium text-foreground">
              {chunk.source}
            </span>
          </span>
          <span className="shrink-0 font-mono text-xs font-semibold text-primary">
            {chunk.score.toFixed(3)}
          </span>
        </span>
        <span className="block px-3 pt-1.5 text-[11px] text-muted-foreground">
          {chunk.path} · p.&nbsp;{chunk.page} · {chunk.tokens} tok
        </span>
        <span className="block px-3 pb-3 pt-1.5 text-xs leading-5 text-foreground/80">
          {chunk.text}
        </span>
      </TooltipContent>
    </Tooltip>
  )
}

/* -------------------------------------------------------------------------- */
/*                               Chunks list                                   */
/* -------------------------------------------------------------------------- */

function ChunksList({ chunks }: { chunks: Retrieved[] }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayersIcon />
          <h2 className="text-sm font-semibold">Retrieved chunks</h2>
        </div>
        <span className="text-xs text-muted-foreground">
          {chunks.length} {chunks.length === 1 ? "source" : "sources"}
        </span>
      </div>

      {chunks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No chunks crossed the retrieval threshold for this query.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {chunks.map((chunk, idx) => (
            <li
              key={chunk.id}
              className="rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded bg-primary/10 font-mono text-[11px] font-semibold text-primary">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <FileTextIcon className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate font-mono text-sm font-medium">
                      {chunk.source}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {chunk.path} · p.&nbsp;{chunk.page} · {chunk.tokens} tok
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-muted sm:block">
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{ width: `${Math.round(chunk.score * 100)}%` }}
                    />
                  </span>
                  <span className="font-mono text-sm font-semibold text-primary">
                    {chunk.score.toFixed(3)}
                  </span>
                </div>
              </div>
              <p className="mt-3 pl-8 text-sm leading-6 text-foreground/80">
                {chunk.text}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*                              Small primitives                               */
/* -------------------------------------------------------------------------- */

function RailHeading({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      <span className="text-muted-foreground">{icon}</span>
      {children}
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  display: string
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="font-mono text-sm text-muted-foreground">
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
        aria-label={label}
      />
    </div>
  )
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
        on ? "bg-primary" : "bg-muted-foreground/30"
      )}
    >
      <span
        className={cn(
          "inline-block size-4 translate-x-0.5 rounded-full bg-background transition-transform",
          on && "translate-x-[18px]"
        )}
      />
    </span>
  )
}

function SlidersIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="4" x2="4" y1="21" y2="14" />
      <line x1="4" x2="4" y1="10" y2="3" />
      <line x1="12" x2="12" y1="21" y2="12" />
      <line x1="12" x2="12" y1="8" y2="3" />
      <line x1="20" x2="20" y1="21" y2="16" />
      <line x1="20" x2="20" y1="12" y2="3" />
      <line x1="2" x2="6" y1="14" y2="14" />
      <line x1="10" x2="14" y1="8" y2="8" />
      <line x1="18" x2="22" y1="16" y2="16" />
    </svg>
  )
}

function LayersIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground"
      aria-hidden
    >
      <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
      <path d="M2 12.3a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 .59-.92" />
      <path d="M2 16.3a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 .59-.92" />
    </svg>
  )
}
