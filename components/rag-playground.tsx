"use client"

import * as React from "react"
import {
  SparklesIcon,
  SendHorizontalIcon,
  Loader2Icon,
  FileTextIcon,
  GaugeIcon,
  LayersIcon,
  CoinsIcon,
  CopyIcon,
  CheckIcon,
  RotateCcwIcon,
  DatabaseIcon,
  ChevronDownIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/*                              Demo knowledge base                            */
/* -------------------------------------------------------------------------- */

type Doc = {
  id: string
  source: string
  title: string
  text: string
}

const KNOWLEDGE_BASE: Doc[] = [
  {
    id: "chunk_01",
    source: "billing-guide.md",
    title: "Invoicing & payment terms",
    text: "Invoices are generated on the first of each month and are due within 30 days. Overdue invoices accrue a 1.5% monthly late fee. Clients can pay by card, ACH transfer, or wire. Partial payments are applied to the oldest outstanding balance first.",
  },
  {
    id: "chunk_02",
    source: "billing-guide.md",
    title: "Refunds and credits",
    text: "Refunds are issued to the original payment method within 5 to 10 business days. Account credits never expire and are automatically applied to the next invoice. Annual plans are refundable on a pro-rated basis within the first 14 days.",
  },
  {
    id: "chunk_03",
    source: "security-policy.pdf",
    title: "Data encryption",
    text: "All customer data is encrypted at rest using AES-256 and in transit using TLS 1.3. Encryption keys are rotated every 90 days and stored in a hardware security module. Database backups are encrypted and replicated across three availability zones.",
  },
  {
    id: "chunk_04",
    source: "security-policy.pdf",
    title: "Access control",
    text: "Access to production systems requires multi-factor authentication and is restricted by role-based access control. All privileged access is logged and reviewed quarterly. Employees lose access automatically within one hour of offboarding.",
  },
  {
    id: "chunk_05",
    source: "onboarding.md",
    title: "Creating your first workspace",
    text: "After signing up, you are prompted to create a workspace. A workspace groups your team, projects, and billing under one organization. You can invite teammates by email and assign them owner, admin, or member roles from the workspace settings page.",
  },
  {
    id: "chunk_06",
    source: "onboarding.md",
    title: "Connecting data sources",
    text: "You can connect data sources such as PDFs, Markdown files, and websites from the Sources tab. Each source is chunked, embedded, and indexed for retrieval. Re-indexing happens automatically whenever a source changes.",
  },
  {
    id: "chunk_07",
    source: "api-reference.md",
    title: "Authentication tokens",
    text: "The API uses bearer tokens passed in the Authorization header. Tokens are scoped to a single workspace and can be revoked at any time. Rate limits are 600 requests per minute per token, returning a 429 status when exceeded.",
  },
  {
    id: "chunk_08",
    source: "api-reference.md",
    title: "Query endpoint",
    text: "The /v1/query endpoint accepts a question, an optional top_k, and a temperature. It returns the generated answer along with the source chunks used to ground the response and per-chunk similarity scores.",
  },
  {
    id: "chunk_09",
    source: "model-card.md",
    title: "Retrieval model",
    text: "Retrieval uses a 1024-dimension embedding model with cosine similarity. Chunks are 512 tokens with a 64-token overlap. A reranker can be enabled to reorder the top candidates before they are passed to the generator.",
  },
  {
    id: "chunk_10",
    source: "model-card.md",
    title: "Generation model",
    text: "The generator is an instruction-tuned model with a 128k context window. Lower temperatures produce more deterministic, grounded answers, while higher temperatures increase creativity at the cost of factual precision.",
  },
]

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "is", "are", "for", "on",
  "with", "how", "what", "do", "does", "can", "i", "my", "we", "you", "it",
  "be", "by", "at", "as", "this", "that", "from", "your",
])

const SAMPLE_QUERIES = [
  "How long do I have to pay an invoice?",
  "How is customer data encrypted?",
  "How do I connect a new data source?",
  "What does the query endpoint return?",
]

const MODELS = [
  { id: "dacoo-rag-pro", label: "dacoo-rag-pro" },
  { id: "dacoo-rag-mini", label: "dacoo-rag-mini" },
  { id: "dacoo-rag-fast", label: "dacoo-rag-fast" },
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

function retrieve(query: string, topK: number, threshold: number): Retrieved[] {
  const qTokens = tokenize(query)
  if (qTokens.length === 0) return []

  const scored = KNOWLEDGE_BASE.map((doc) => {
    const docTokens = tokenize(`${doc.title} ${doc.text}`)
    const docSet = new Set(docTokens)
    let overlap = 0
    for (const t of qTokens) if (docSet.has(t)) overlap += 1
    // Pseudo cosine-like similarity, kept in a believable 0.4 - 0.95 range.
    const base = overlap / qTokens.length
    const score = base === 0 ? 0 : 0.42 + base * 0.5
    return { ...doc, score: Math.min(0.97, Number(score.toFixed(3))) }
  })

  return scored
    .filter((d) => d.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
}

function synthesizeAnswer(query: string, chunks: Retrieved[]): string {
  if (chunks.length === 0) {
    return "I could not find anything in the indexed sources that answers this question. Try rephrasing your query, lowering the similarity threshold, or connecting additional data sources."
  }
  const top = chunks[0]
  const supporting = chunks
    .slice(1, 3)
    .map((c) => c.text.split(".")[0].trim())
    .filter(Boolean)

  const lead = top.text.split(".").slice(0, 2).join(".").trim()
  const extra =
    supporting.length > 0
      ? ` Additional context from the indexed material notes that ${supporting
          .join("; ")
          .toLowerCase()}.`
      : ""

  return `${lead}.${extra} This response is grounded in ${chunks.length} retrieved source ${
    chunks.length === 1 ? "chunk" : "chunks"
  }.`
}

type RunResult = {
  query: string
  answer: string
  chunks: Retrieved[]
  latencyMs: number
  promptTokens: number
  completionTokens: number
  model: string
  temperature: number
  topK: number
}

/* -------------------------------------------------------------------------- */
/*                                 Component                                   */
/* -------------------------------------------------------------------------- */

export function RagPlayground() {
  const [query, setQuery] = React.useState("")
  const [topK, setTopK] = React.useState(4)
  const [temperature, setTemperature] = React.useState(0.2)
  const [threshold, setThreshold] = React.useState(0.45)
  const [model, setModel] = React.useState(MODELS[0].id)
  const [isRunning, setIsRunning] = React.useState(false)
  const [result, setResult] = React.useState<RunResult | null>(null)

  async function runQuery() {
    if (!query.trim() || isRunning) return
    setIsRunning(true)

    const start = performance.now()
    const chunks = retrieve(query, topK, threshold)
    const answer = synthesizeAnswer(query, chunks)

    // Simulate network + inference latency.
    await new Promise((r) => setTimeout(r, 650 + Math.random() * 700))

    const latencyMs = Math.round(performance.now() - start)
    setResult({
      query,
      answer,
      chunks,
      latencyMs,
      promptTokens: tokenize(query).length * 3 + chunks.length * 96 + 48,
      completionTokens: Math.round(answer.length / 4),
      model,
      temperature,
      topK,
    })
    setIsRunning(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const native = e.nativeEvent as unknown as { isComposing?: boolean; keyCode?: number }
    if (native.isComposing || native.keyCode === 229) return
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      runQuery()
    }
  }

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-5 lg:gap-6">
      {/* ----------------------------- Left: console ---------------------------- */}
      <div className="flex flex-col gap-4 lg:col-span-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <SparklesIcon className="size-4 text-primary" />
              Query Console
            </CardTitle>
            <CardDescription>
              Ask a question against your indexed knowledge base.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="rag-query">Question</Label>
              <Textarea
                id="rag-query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. How long do I have to pay an invoice?"
                className="min-h-28 resize-none"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_QUERIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuery(q)}
                  className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={runQuery}
                disabled={!query.trim() || isRunning}
                className="flex-1"
              >
                {isRunning ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    Running…
                  </>
                ) : (
                  <>
                    <SendHorizontalIcon className="size-4" />
                    Run query
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Reset"
                disabled={isRunning}
                onClick={() => {
                  setQuery("")
                  setResult(null)
                }}
              >
                <RotateCcwIcon className="size-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Press{" "}
              <kbd className="rounded border border-border bg-muted px-1 font-mono text-[10px]">
                ⌘/Ctrl
              </kbd>{" "}
              +{" "}
              <kbd className="rounded border border-border bg-muted px-1 font-mono text-[10px]">
                Enter
              </kbd>{" "}
              to run.
            </p>
          </CardContent>
        </Card>

        {/* ---------------------------- Parameters ---------------------------- */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">
              Retrieval Parameters
            </CardTitle>
            <CardDescription>
              Tune how context is fetched and generated.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="rag-model">Model</Label>
              <div className="relative">
                <select
                  id="rag-model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="h-9 w-full appearance-none rounded-md border border-input bg-transparent px-3 pr-8 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  {MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <ParamSlider
              id="rag-topk"
              label="Top K"
              value={topK}
              min={1}
              max={10}
              step={1}
              display={String(topK)}
              onChange={setTopK}
              hint="Number of chunks retrieved as context."
            />
            <ParamSlider
              id="rag-threshold"
              label="Similarity threshold"
              value={threshold}
              min={0}
              max={0.9}
              step={0.05}
              display={threshold.toFixed(2)}
              onChange={setThreshold}
              hint="Minimum relevance score to include a chunk."
            />
            <ParamSlider
              id="rag-temp"
              label="Temperature"
              value={temperature}
              min={0}
              max={1}
              step={0.1}
              display={temperature.toFixed(1)}
              onChange={setTemperature}
              hint="Higher values increase answer creativity."
            />
          </CardContent>
        </Card>
      </div>

      {/* ----------------------------- Right: results --------------------------- */}
      <div className="flex flex-col gap-4 lg:col-span-3 lg:gap-6">
        {!result && !isRunning && <EmptyState />}
        {isRunning && !result && <RunningState />}

        {result && (
          <>
            <MetricsRow result={result} />
            <AnswerCard result={result} />
            <ChunksCard chunks={result.chunks} />
          </>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                               Sub-components                                */
/* -------------------------------------------------------------------------- */

function ParamSlider({
  id,
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
  hint,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  display: string
  onChange: (v: number) => void
  hint: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
          {display}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
      />
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}

function MetricsRow({ result }: { result: RunResult }) {
  const metrics = [
    {
      label: "Latency",
      value: `${result.latencyMs} ms`,
      icon: GaugeIcon,
    },
    {
      label: "Chunks used",
      value: String(result.chunks.length),
      icon: LayersIcon,
    },
    {
      label: "Prompt tokens",
      value: result.promptTokens.toLocaleString(),
      icon: CoinsIcon,
    },
    {
      label: "Completion tokens",
      value: result.completionTokens.toLocaleString(),
      icon: FileTextIcon,
    },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {metrics.map((m) => (
        <Card key={m.label}>
          <CardContent className="flex items-center gap-3 p-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <m.icon className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">
                {m.label}
              </p>
              <p className="font-mono text-base font-bold text-foreground">
                {m.value}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function AnswerCard({ result }: { result: RunResult }) {
  const [copied, setCopied] = React.useState(false)

  function copy() {
    navigator.clipboard.writeText(result.answer).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <SparklesIcon className="size-4 text-primary" />
            Generated Answer
          </CardTitle>
          <CardDescription className="mt-1 font-mono text-xs">
            {result.model} · temp {result.temperature.toFixed(1)} · top_k{" "}
            {result.topK}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={copy}>
          {copied ? (
            <>
              <CheckIcon className="size-3.5" />
              Copied
            </>
          ) : (
            <>
              <CopyIcon className="size-3.5" />
              Copy
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-foreground">
          {result.answer}
        </p>
      </CardContent>
    </Card>
  )
}

function ChunksCard({ chunks }: { chunks: Retrieved[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-bold">
          <DatabaseIcon className="size-4 text-primary" />
          Retrieved Context
          <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {chunks.length}
          </span>
        </CardTitle>
        <CardDescription>
          Source chunks ranked by similarity to the query.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {chunks.length === 0 && (
          <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            No chunks passed the similarity threshold.
          </p>
        )}
        {chunks.map((chunk, idx) => (
          <div
            key={chunk.id}
            className="rounded-lg border border-border bg-muted/30 p-3"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-[11px] font-bold text-primary">
                  {idx + 1}
                </span>
                <span className="truncate text-sm font-semibold text-foreground">
                  {chunk.title}
                </span>
              </div>
              <ScoreBadge score={chunk.score} />
            </div>
            <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
              {chunk.text}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileTextIcon className="size-3" />
              <span className="font-mono">{chunk.source}</span>
              <Separator orientation="vertical" className="h-3" />
              <span className="font-mono">{chunk.id}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const strong = score >= 0.75
  const medium = score >= 0.6 && score < 0.75
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 font-mono text-xs font-bold",
        strong && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        medium && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        !strong && !medium && "bg-muted text-muted-foreground"
      )}
    >
      {score.toFixed(3)}
    </span>
  )
}

function EmptyState() {
  return (
    <Card className="flex flex-1 items-center justify-center border-dashed">
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <SparklesIcon className="size-6" />
        </div>
        <div>
          <p className="font-semibold text-foreground">
            Run a query to test retrieval
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Enter a question and hit run. You&apos;ll see the generated answer,
            retrieved source chunks, relevance scores, and run metrics here.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function RunningState() {
  return (
    <Card className="flex flex-1 items-center justify-center">
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <Loader2Icon className="size-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Retrieving context and generating an answer…
        </p>
      </CardContent>
    </Card>
  )
}
