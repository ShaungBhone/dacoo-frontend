"use client"

import * as React from "react"
import {
  SearchIcon,
  ChevronRightIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  ClockIcon,
  CoinsIcon,
  DatabaseIcon,
  CpuIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { PlaygroundNav } from "@/components/playground-nav"

/* -------------------------------------------------------------------------- */
/*                                  Demo data                                  */
/* -------------------------------------------------------------------------- */

type LogStatus = "success" | "warning" | "error"

type LogEntry = {
  id: string
  time: string
  query: string
  dataset: string
  model: string
  status: LogStatus
  latencyMs: number
  tokens: number
  chunks: number
  faithfulness: number | null
  note?: string
}

const LOGS: LogEntry[] = [
  {
    id: "req_9f2a",
    time: "14:32:09",
    query: "What is the safe internal temperature for storing fresh poultry?",
    dataset: "support-kb",
    model: "gpt-4o",
    status: "success",
    latencyMs: 1284,
    tokens: 2505,
    chunks: 4,
    faithfulness: 0.94,
  },
  {
    id: "req_9f2b",
    time: "14:31:55",
    query: "How are KYC checks handled when onboarding a new merchant?",
    dataset: "support-kb",
    model: "gpt-4o",
    status: "success",
    latencyMs: 1102,
    tokens: 2210,
    chunks: 5,
    faithfulness: 0.91,
  },
  {
    id: "req_9f2c",
    time: "14:30:41",
    query: "Which fees apply to cross-border card settlements?",
    dataset: "support-kb",
    model: "gpt-4o-mini",
    status: "warning",
    latencyMs: 1890,
    tokens: 3120,
    chunks: 8,
    faithfulness: 0.62,
    note: "Low faithfulness — answer may contain unsupported claims.",
  },
  {
    id: "req_9f2d",
    time: "14:29:12",
    query: "Standard SLA for last-mile delivery exceptions?",
    dataset: "support-kb",
    model: "gpt-4o",
    status: "success",
    latencyMs: 940,
    tokens: 1980,
    chunks: 4,
    faithfulness: 0.88,
  },
  {
    id: "req_9f2e",
    time: "14:27:03",
    query: "Summarize the webhook retry policy for failed payments.",
    dataset: "product-docs",
    model: "gpt-4o",
    status: "error",
    latencyMs: 0,
    tokens: 0,
    chunks: 0,
    faithfulness: null,
    note: "Retrieval failed — index for product-docs is incomplete.",
  },
  {
    id: "req_9f2f",
    time: "14:25:48",
    query: "What objection-handling scripts exist for pricing pushback?",
    dataset: "sales-transcripts",
    model: "gpt-4o",
    status: "success",
    latencyMs: 1320,
    tokens: 2740,
    chunks: 6,
    faithfulness: 0.9,
  },
]

const FILTERS: { key: "all" | LogStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "success", label: "Success" },
  { key: "warning", label: "Warning" },
  { key: "error", label: "Error" },
]

/* -------------------------------------------------------------------------- */
/*                                  Component                                  */
/* -------------------------------------------------------------------------- */

export function LogsView() {
  const [filter, setFilter] = React.useState<"all" | LogStatus>("all")
  const [query, setQuery] = React.useState("")
  const [expanded, setExpanded] = React.useState<string | null>(null)

  const filtered = LOGS.filter((log) => {
    const matchesFilter = filter === "all" || log.status === filter
    const matchesQuery = log.query
      .toLowerCase()
      .includes(query.trim().toLowerCase())
    return matchesFilter && matchesQuery
  })

  const counts = {
    success: LOGS.filter((l) => l.status === "success").length,
    warning: LOGS.filter((l) => l.status === "warning").length,
    error: LOGS.filter((l) => l.status === "error").length,
  }

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <PlaygroundNav active="Logs" />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
        {/* Header */}
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">Query logs</h1>
          <p className="text-sm text-muted-foreground text-pretty">
            Every retrieval request with latency, token usage, and faithfulness.
            Select a row to inspect the trace.
          </p>
        </header>

        {/* Summary strip */}
        <div className="grid grid-cols-3 gap-3">
          <Summary
            label="Success"
            value={String(counts.success)}
            tone="ok"
          />
          <Summary
            label="Warnings"
            value={String(counts.warning)}
            tone="warn"
          />
          <Summary label="Errors" value={String(counts.error)} tone="err" />
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  filter === f.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 sm:w-72">
            <SearchIcon className="size-3.5 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search queries…"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Log list */}
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          {filtered.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              No log entries match your filters.
            </p>
          ) : (
            <ul>
              {filtered.map((log) => {
                const isOpen = expanded === log.id
                return (
                  <li
                    key={log.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : log.id)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                    >
                      <ChevronRightIcon
                        className={cn(
                          "size-4 shrink-0 text-muted-foreground transition-transform",
                          isOpen && "rotate-90"
                        )}
                      />
                      <StatusDot status={log.status} />
                      <span className="hidden shrink-0 font-mono text-xs text-muted-foreground sm:inline">
                        {log.time}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                        {log.query}
                      </span>
                      <span className="hidden shrink-0 items-center gap-1 font-mono text-xs text-muted-foreground md:flex">
                        <ClockIcon className="size-3.5" />
                        {log.latencyMs > 0 ? `${log.latencyMs}ms` : "—"}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="border-t border-border bg-muted/20 px-4 py-4 pl-11">
                        {log.note && (
                          <p
                            className={cn(
                              "mb-3 rounded-md px-3 py-2 text-xs",
                              log.status === "error"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-primary/10 text-primary"
                            )}
                          >
                            {log.note}
                          </p>
                        )}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
                          <Detail
                            icon={CpuIcon}
                            label="Model"
                            value={log.model}
                          />
                          <Detail
                            icon={DatabaseIcon}
                            label="Dataset"
                            value={log.dataset}
                          />
                          <Detail
                            icon={ClockIcon}
                            label="Latency"
                            value={
                              log.latencyMs > 0 ? `${log.latencyMs} ms` : "—"
                            }
                          />
                          <Detail
                            icon={CoinsIcon}
                            label="Tokens"
                            value={
                              log.tokens > 0
                                ? log.tokens.toLocaleString()
                                : "—"
                            }
                          />
                          <Detail
                            icon={DatabaseIcon}
                            label="Chunks"
                            value={log.chunks > 0 ? String(log.chunks) : "—"}
                          />
                          <Detail
                            icon={CheckCircle2Icon}
                            label="Faithfulness"
                            value={
                              log.faithfulness != null
                                ? log.faithfulness.toFixed(2)
                                : "—"
                            }
                          />
                          <Detail
                            icon={SearchIcon}
                            label="Request ID"
                            value={log.id}
                          />
                        </div>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                Small parts                                  */
/* -------------------------------------------------------------------------- */

function Summary({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: "ok" | "warn" | "err"
}) {
  const dot =
    tone === "ok"
      ? "bg-primary"
      : tone === "warn"
        ? "bg-amber-500"
        : "bg-destructive"
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5">
      <span className={cn("size-2.5 shrink-0 rounded-full", dot)} />
      <div className="min-w-0">
        <p className="font-mono text-sm font-semibold leading-tight">{value}</p>
        <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  )
}

function StatusDot({ status }: { status: LogStatus }) {
  if (status === "error") {
    return <AlertTriangleIcon className="size-4 shrink-0 text-destructive" />
  }
  if (status === "warning") {
    return <AlertTriangleIcon className="size-4 shrink-0 text-amber-500" />
  }
  return <CheckCircle2Icon className="size-4 shrink-0 text-primary" />
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </span>
      <span className="font-mono text-sm text-foreground">{value}</span>
    </div>
  )
}
