"use client"

import * as React from "react"
import {
  DatabaseIcon,
  FileTextIcon,
  SearchIcon,
  PlusIcon,
  Loader2Icon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  LayersIcon,
  CoinsIcon,
  ClockIcon,
  HashIcon,
  UploadIcon,
  SparklesIcon,
  XIcon,
  WandSparklesIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { PlaygroundNav } from "@/components/playground-nav"

/* -------------------------------------------------------------------------- */
/*                                  Demo data                                  */
/* -------------------------------------------------------------------------- */

type DocStatus = "ready" | "indexing" | "failed"

type Document = {
  id: string
  name: string
  type: string
  chunks: number
  tokens: number
  updated: string
  status: DocStatus
}

type Dataset = {
  id: string
  name: string
  description: string
  embedModel: string
  lastIndexed: string
  documents: Document[]
}

const DATASETS: Dataset[] = [
  {
    id: "support-kb",
    name: "support-kb",
    description: "Customer support knowledge base for the retrieval pipeline.",
    embedModel: "text-embedding-3-large",
    lastIndexed: "2 hours ago",
    documents: [
      {
        id: "d1",
        name: "food-safety-handbook.pdf",
        type: "PDF",
        chunks: 524,
        tokens: 98240,
        updated: "2h ago",
        status: "ready",
      },
      {
        id: "d2",
        name: "cold-chain-sop.md",
        type: "Markdown",
        chunks: 187,
        tokens: 31180,
        updated: "2h ago",
        status: "ready",
      },
      {
        id: "d3",
        name: "kyc-aml-policy.pdf",
        type: "PDF",
        chunks: 318,
        tokens: 60410,
        updated: "5h ago",
        status: "ready",
      },
      {
        id: "d4",
        name: "payments-fee-schedule.md",
        type: "Markdown",
        chunks: 142,
        tokens: 22890,
        updated: "1d ago",
        status: "ready",
      },
      {
        id: "d5",
        name: "last-mile-logistics-guide.pdf",
        type: "PDF",
        chunks: 463,
        tokens: 81020,
        updated: "1d ago",
        status: "ready",
      },
      {
        id: "d6",
        name: "warehouse-onboarding-faq.md",
        type: "Markdown",
        chunks: 0,
        tokens: 0,
        updated: "just now",
        status: "indexing",
      },
    ],
  },
  {
    id: "product-docs",
    name: "product-docs",
    description: "Public product documentation and API references.",
    embedModel: "text-embedding-3-small",
    lastIndexed: "1 day ago",
    documents: [
      {
        id: "p1",
        name: "api-reference.mdx",
        type: "MDX",
        chunks: 612,
        tokens: 120400,
        updated: "1d ago",
        status: "ready",
      },
      {
        id: "p2",
        name: "getting-started.md",
        type: "Markdown",
        chunks: 88,
        tokens: 14200,
        updated: "1d ago",
        status: "ready",
      },
      {
        id: "p3",
        name: "webhooks-guide.pdf",
        type: "PDF",
        chunks: 0,
        tokens: 0,
        updated: "3d ago",
        status: "failed",
      },
    ],
  },
  {
    id: "sales-transcripts",
    name: "sales-transcripts",
    description: "Anonymized sales call transcripts for grounding.",
    embedModel: "text-embedding-3-large",
    lastIndexed: "4 days ago",
    documents: [
      {
        id: "s1",
        name: "q1-discovery-calls.txt",
        type: "Text",
        chunks: 1240,
        tokens: 248900,
        updated: "4d ago",
        status: "ready",
      },
      {
        id: "s2",
        name: "objection-handling.md",
        type: "Markdown",
        chunks: 96,
        tokens: 15800,
        updated: "4d ago",
        status: "ready",
      },
    ],
  },
]

/* -------------------------------------------------------------------------- */
/*                                  Component                                  */
/* -------------------------------------------------------------------------- */

export function DatasetsView() {
  const [datasets, setDatasets] = React.useState<Dataset[]>(DATASETS)
  const [activeId, setActiveId] = React.useState(DATASETS[0].id)
  const [filter, setFilter] = React.useState("")
  const [generateOpen, setGenerateOpen] = React.useState(false)

  const active = datasets.find((d) => d.id === activeId) ?? datasets[0]

  // Insert a freshly generated doc into the active dataset, then flip it from
  // "indexing" to "ready" after a short delay to mimic the embedding pipeline.
  function handleGenerated(name: string, content: string) {
    const id = `gen-${Date.now()}`
    const tokens = Math.max(1, Math.round(content.trim().split(/\s+/).length * 1.3))
    const chunks = Math.max(1, Math.round(tokens / 180))

    const newDoc: Document = {
      id,
      name,
      type: "Markdown",
      chunks: 0,
      tokens: 0,
      updated: "just now",
      status: "indexing",
    }

    setDatasets((prev) =>
      prev.map((d) =>
        d.id === active.id
          ? { ...d, documents: [newDoc, ...d.documents] }
          : d
      )
    )

    setTimeout(() => {
      setDatasets((prev) =>
        prev.map((d) =>
          d.id === active.id
            ? {
                ...d,
                lastIndexed: "just now",
                documents: d.documents.map((doc) =>
                  doc.id === id
                    ? { ...doc, status: "ready" as DocStatus, chunks, tokens }
                    : doc
                ),
              }
            : d
        )
      )
    }, 2200)
  }

  const filteredDocs = active.documents.filter((doc) =>
    doc.name.toLowerCase().includes(filter.trim().toLowerCase())
  )

  const totalChunks = active.documents.reduce((s, d) => s + d.chunks, 0)
  const totalTokens = active.documents.reduce((s, d) => s + d.tokens, 0)

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <PlaygroundNav active="Datasets" />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-6 lg:flex-row lg:gap-10 lg:px-6">
        {/* ------------------------------ Left rail ----------------------------- */}
        <aside className="flex w-full shrink-0 flex-col gap-3 lg:w-64">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <DatabaseIcon className="size-3.5" />
              Datasets
            </div>
            <button
              type="button"
              className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <PlusIcon className="size-3.5" />
              New
            </button>
          </div>

          <ul className="flex flex-col gap-1">
            {datasets.map((dataset) => {
              const isActive = dataset.id === active.id
              const indexing = dataset.documents.some(
                (d) => d.status === "indexing"
              )
              return (
                <li key={dataset.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveId(dataset.id)
                      setFilter("")
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md border px-3 py-2.5 text-left transition-colors",
                      isActive
                        ? "border-primary/40 bg-primary/10"
                        : "border-transparent hover:bg-muted/50"
                    )}
                  >
                    <DatabaseIcon
                      className={cn(
                        "size-4 shrink-0",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate font-mono text-sm",
                          isActive
                            ? "font-medium text-foreground"
                            : "text-foreground"
                        )}
                      >
                        {dataset.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {dataset.documents.length} docs
                      </span>
                    </span>
                    {indexing && (
                      <Loader2Icon className="size-3.5 shrink-0 animate-spin text-primary" />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>

          <button
            type="button"
            onClick={() => setGenerateOpen(true)}
            className="mt-2 flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <SparklesIcon className="size-4" />
            Generate with AI
          </button>

          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-md border border-dashed border-border px-3 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <UploadIcon className="size-4" />
            Upload source
          </button>
        </aside>

        {/* ------------------------------- Detail ------------------------------- */}
        <main className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-xl font-semibold tracking-tight">
                {active.name}
              </h1>
              <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                indexed
              </span>
            </div>
            <p className="text-sm text-muted-foreground text-pretty">
              {active.description}
            </p>
          </header>

          {/* Stats strip */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat
              icon={FileTextIcon}
              label="Documents"
              value={String(active.documents.length)}
            />
            <Stat
              icon={LayersIcon}
              label="Chunks"
              value={totalChunks.toLocaleString()}
            />
            <Stat
              icon={CoinsIcon}
              label="Tokens"
              value={totalTokens.toLocaleString()}
            />
            <Stat
              icon={ClockIcon}
              label="Last indexed"
              value={active.lastIndexed}
            />
          </div>

          {/* Embedding model line */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm">
            <HashIcon className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">Embedding model</span>
            <span className="ml-auto font-mono text-foreground">
              {active.embedModel}
            </span>
          </div>

          {/* Documents */}
          <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-semibold">Documents</h2>
              <div className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 sm:w-64">
                <SearchIcon className="size-3.5 shrink-0 text-muted-foreground" />
                <input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Filter documents…"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card">
              {/* Table header */}
              <div className="hidden grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-border px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:grid">
                <span>Source</span>
                <span className="w-20 text-right">Chunks</span>
                <span className="w-24 text-right">Tokens</span>
                <span className="w-24 text-right">Status</span>
              </div>

              {filteredDocs.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No documents match {`"${filter}"`}.
                </p>
              ) : (
                <ul>
                  {filteredDocs.map((doc) => (
                    <li
                      key={doc.id}
                      className="grid grid-cols-1 gap-2 border-b border-border px-4 py-3 last:border-b-0 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center sm:gap-4"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
                        <span className="min-w-0">
                          <span className="block truncate font-mono text-sm text-foreground">
                            {doc.name}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {doc.type} · updated {doc.updated}
                          </span>
                        </span>
                      </div>
                      <span className="font-mono text-sm text-muted-foreground sm:w-20 sm:text-right">
                        <span className="text-muted-foreground sm:hidden">
                          Chunks:{" "}
                        </span>
                        {doc.chunks.toLocaleString()}
                      </span>
                      <span className="font-mono text-sm text-muted-foreground sm:w-24 sm:text-right">
                        <span className="text-muted-foreground sm:hidden">
                          Tokens:{" "}
                        </span>
                        {doc.tokens.toLocaleString()}
                      </span>
                      <span className="sm:w-24 sm:text-right">
                        <StatusBadge status={doc.status} />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </main>
      </div>

      {generateOpen && (
        <GenerateDocDialog
          datasetName={active.name}
          onClose={() => setGenerateOpen(false)}
          onSave={handleGenerated}
        />
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                            Generate with AI dialog                          */
/* -------------------------------------------------------------------------- */

type GenStep = "input" | "generating" | "preview"

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "untitled"
  )
}

// Build a believable markdown doc from the title + topic. Purely client-side —
// no model call — to stay consistent with the rest of the demo.
function buildMockMarkdown(title: string, topic: string) {
  const t = title.trim() || "Untitled Document"
  const subject = topic.trim() || t

  return `# ${t}

## Overview

${subject}. This document was generated to help ground the retrieval pipeline with
structured, chunk-friendly content so the model can cite it during answers.

## Key points

- Summarizes the most important facts about ${subject.toLowerCase()}.
- Written in short, self-contained paragraphs that embed cleanly.
- Uses clear headings so chunks keep their context.

## Details

When users ask about ${subject.toLowerCase()}, the assistant should reference the
guidance below. Each section is kept concise so that a single chunk carries a
complete idea rather than splitting a thought across boundaries.

### Common questions

1. What is ${subject.toLowerCase()}?
2. When does it apply?
3. Who is responsible for keeping it up to date?

## Summary

This is an AI-drafted starting point. Review the content, make any edits, then
save it to add it to the knowledge base for indexing.`
}

function GenerateDocDialog({
  datasetName,
  onClose,
  onSave,
}: {
  datasetName: string
  onClose: () => void
  onSave: (name: string, content: string) => void
}) {
  const [step, setStep] = React.useState<GenStep>("input")
  const [title, setTitle] = React.useState("")
  const [topic, setTopic] = React.useState("")
  const [content, setContent] = React.useState("")

  const canGenerate = title.trim().length > 0 && topic.trim().length > 0

  function handleGenerate() {
    if (!canGenerate) return
    setStep("generating")
    // Simulate the drafting latency, then reveal an editable preview.
    setTimeout(() => {
      setContent(buildMockMarkdown(title, topic))
      setStep("preview")
    }, 1400)
  }

  function handleSave() {
    const name = `${slugify(title)}.md`
    onSave(name, content)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Generate document with AI"
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
      />

      <div className="relative flex max-h-[85svh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <WandSparklesIcon className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold">Generate with AI</h2>
            <p className="truncate text-xs text-muted-foreground">
              Adds to{" "}
              <span className="font-mono text-foreground">{datasetName}</span>
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
          {step === "input" && (
            <>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="gen-title"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Title
                </label>
                <input
                  id="gen-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Cold chain handling guide"
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary/50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="gen-topic"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Topic
                </label>
                <textarea
                  id="gen-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={4}
                  placeholder="Describe what this document should cover, e.g. temperature thresholds, packaging, and escalation steps for perishable shipments."
                  className="resize-none rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none transition-colors focus:border-primary/50"
                />
                <p className="text-xs text-muted-foreground">
                  The AI drafts the markdown for you — no need to write it by hand.
                </p>
              </div>
            </>
          )}

          {step === "generating" && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
              <Loader2Icon className="size-7 animate-spin text-primary" />
              <p className="text-sm font-medium">Drafting your document…</p>
              <p className="max-w-xs text-xs text-muted-foreground text-pretty">
                Generating structured, chunk-friendly markdown from your topic.
              </p>
            </div>
          )}

          {step === "preview" && (
            <div className="flex min-h-0 flex-1 flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="gen-content"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Generated markdown · review &amp; edit
                </label>
                <button
                  type="button"
                  onClick={() => setStep("input")}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Regenerate
                </button>
              </div>
              <textarea
                id="gen-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-64 flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 font-mono text-xs leading-relaxed outline-none transition-colors focus:border-primary/50"
              />
            </div>
          )}
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

          {step === "preview" ? (
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <CheckCircle2Icon className="size-4" />
              Save to dataset
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate || step === "generating"}
              className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SparklesIcon className="size-4" />
              Generate
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                Small parts                                  */
/* -------------------------------------------------------------------------- */

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="font-mono text-sm font-semibold leading-tight">{value}</p>
        <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: DocStatus }) {
  if (status === "indexing") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
        <Loader2Icon className="size-3 animate-spin" />
        Indexing
      </span>
    )
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
        <AlertTriangleIcon className="size-3" />
        Failed
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      <CheckCircle2Icon className="size-3 text-primary" />
      Ready
    </span>
  )
}
