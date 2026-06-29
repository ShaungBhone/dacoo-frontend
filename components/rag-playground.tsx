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

type AnswerSegment = { text: string; cite?: number }

function synthesizeAnswer(chunks: Retrieved[]): AnswerSegment[] {
  if (chunks.length === 0) {
    return [
      {
        text: "I could not find anything in the indexed sources that answers this question. Try rephrasing the query, raising Top-K, or re-indexing your knowledge base.",
      },
    ]
  }

  const segments: AnswerSegment[] = []
  chunks.slice(0, 3).forEach((chunk, idx) => {
    const sentences = chunk.text
      .split(/(?<=\.)\s+/)
      .map((s) => s.trim())
      .filter(Boolean)
    const claim = sentences.slice(0, idx === 0 ? 2 : 1).join(" ")
    segments.push({ text: idx === 0 ? claim : ` ${claim}`, cite: idx + 1 })
  })
  return segments
}

type RunResult = {
  query: string
  answer: AnswerSegment[]
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
  const [result, setResult] = React.useState<RunResult | null>(null)

  const runQuery = React.useCallback(async () => {
    if (!query.trim() || isRunning) return
    setIsRunning(true)

    const start = performance.now()
    let chunks = retrieve(query, topK)
    if (rerank) {
      chunks = [...chunks].sort((a, b) => b.score - a.score)
    }
    const answer = synthesizeAnswer(chunks)

    await new Promise((r) => setTimeout(r, 700 + Math.random() * 700))

    const latencyMs = Math.round(performance.now() - start)
    const usedTokens = chunks.reduce((sum, c) => sum + c.tokens, 0)
    const top = chunks[0]?.score ?? 0
    setResult({
      query,
      answer,
      chunks,
      latencyMs,
      tokens: usedTokens + 1300 + tokenize(query).length * 4,
      faithfulness: chunks.length ? Math.round((0.82 + top * 0.13) * 100) : 0,
      relevance: chunks.length ? Math.round((0.7 + top * 0.2) * 100) : 0,
      model: genModel,
    })
    setIsRunning(false)
  }, [query, topK, rerank, genModel, isRunning])

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
          />

          {result && (
            <>
              <AnswerPanel result={result} />
              <ChunksList chunks={result.chunks} />
            </>
          )}
        </main>
      </div>
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
}: {
  query: string
  setQuery: (v: string) => void
  onRun: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  isRunning: boolean
}) {
  return (
    <div className="flex flex-col gap-3">
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

/* -------------------------------------------------------------------------- */
/*                               Answer panel                                  */
/* -------------------------------------------------------------------------- */

function AnswerPanel({ result }: { result: RunResult }) {
  const [copied, setCopied] = React.useState(false)

  function copy() {
    const text = result.answer.map((s) => s.text).join("")
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const metrics = [
    { label: "Latency", value: `${result.latencyMs} ms`, icon: ClockIcon },
    { label: "Tokens", value: result.tokens.toLocaleString(), icon: CoinsIcon },
    {
      label: "Faithfulness",
      value: `${result.faithfulness}%`,
      icon: ShieldCheckIcon,
    },
    {
      label: "Answer relevance",
      value: `${result.relevance}%`,
      icon: TargetIcon,
    },
  ]

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SparklesIcon className="size-4 text-primary" />
          <h2 className="text-sm font-semibold">Generated answer</h2>
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
            {result.model}
          </span>
        </div>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {copied ? (
            <CheckIcon className="size-3.5 text-primary" />
          ) : (
            <CopyIcon className="size-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <TooltipProvider delayDuration={100}>
        <p className="mt-4 text-sm leading-7 text-foreground">
          {result.answer.map((seg, i) => (
            <React.Fragment key={i}>
              {seg.text}
              {seg.cite != null && (
                <Citation n={seg.cite} chunk={result.chunks[seg.cite - 1]} />
              )}
            </React.Fragment>
          ))}
        </p>
      </TooltipProvider>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 md:grid-cols-4">
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
