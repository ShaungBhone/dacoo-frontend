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
  const [activeId, setActiveId] = React.useState(DATASETS[0].id)
  const [filter, setFilter] = React.useState("")

  const active = DATASETS.find((d) => d.id === activeId) ?? DATASETS[0]

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
            {DATASETS.map((dataset) => {
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
            className="mt-2 flex items-center justify-center gap-2 rounded-md border border-dashed border-border px-3 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
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
