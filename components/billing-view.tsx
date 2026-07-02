"use client"

import * as React from "react"
import {
  CoinsIcon,
  DownloadIcon,
  ZapIcon,
  CpuIcon,
  BrainIcon,
  SparklesIcon,
  CircleCheckIcon,
  ClockIcon,
  CircleAlertIcon,
  XIcon,
  PlusIcon,
  ArrowUpRightIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/*                                  Mock data                                  */
/* -------------------------------------------------------------------------- */

const CREDIT_BALANCE = 42_380
const CREDIT_TOTAL = 100_000
const CREDIT_USED = CREDIT_TOTAL - CREDIT_BALANCE

type ModelUsage = {
  model: string
  icon: React.ComponentType<{ className?: string }>
  creditsUsed: number
  requests: number
  color: string
}

const MODEL_USAGE: ModelUsage[] = [
  {
    model: "gpt-4o",
    icon: BrainIcon,
    creditsUsed: 31_450,
    requests: 1_204,
    color: "bg-primary",
  },
  {
    model: "gpt-4o-mini",
    icon: SparklesIcon,
    creditsUsed: 18_290,
    requests: 3_871,
    color: "bg-chart-1",
  },
  {
    model: "claude-3-5-sonnet",
    icon: ZapIcon,
    creditsUsed: 5_880,
    requests: 312,
    color: "bg-chart-3",
  },
  {
    model: "text-embedding-3-large",
    icon: CpuIcon,
    creditsUsed: 2_000,
    requests: 5_660,
    color: "bg-chart-5",
  },
]

type InvoiceStatus = "paid" | "pending" | "overdue"

type Invoice = {
  id: string
  number: string
  period: string
  date: string
  amount: number
  creditsPurchased: number
  status: InvoiceStatus
}

const INVOICES: Invoice[] = [
  {
    id: "inv_001",
    number: "INV-2025-0006",
    period: "Jun 2025",
    date: "Jul 1, 2025",
    amount: 99.0,
    creditsPurchased: 100_000,
    status: "paid",
  },
  {
    id: "inv_002",
    number: "INV-2025-0005",
    period: "May 2025",
    date: "Jun 1, 2025",
    amount: 99.0,
    creditsPurchased: 100_000,
    status: "paid",
  },
  {
    id: "inv_003",
    number: "INV-2025-0004",
    period: "Apr 2025",
    date: "May 1, 2025",
    amount: 49.0,
    creditsPurchased: 50_000,
    status: "paid",
  },
  {
    id: "inv_004",
    number: "INV-2025-0003",
    period: "Mar 2025",
    date: "Apr 1, 2025",
    amount: 99.0,
    creditsPurchased: 100_000,
    status: "paid",
  },
  {
    id: "inv_005",
    number: "INV-2025-0002",
    period: "Feb 2025",
    date: "Mar 1, 2025",
    amount: 49.0,
    creditsPurchased: 50_000,
    status: "paid",
  },
  {
    id: "inv_006",
    number: "INV-2025-0001",
    period: "Jan 2025",
    date: "Feb 1, 2025",
    amount: 49.0,
    creditsPurchased: 50_000,
    status: "paid",
  },
]

const TOP_UP_OPTIONS = [
  { label: "25,000 credits", amount: 25, credits: 25_000 },
  { label: "50,000 credits", amount: 49, credits: 50_000 },
  { label: "100,000 credits", amount: 99, credits: 100_000 },
  { label: "250,000 credits", amount: 229, credits: 250_000 },
]

/* -------------------------------------------------------------------------- */
/*                                  Component                                  */
/* -------------------------------------------------------------------------- */

export function BillingView() {
  const [topUpOpen, setTopUpOpen] = React.useState(false)
  const [selectedTopUp, setSelectedTopUp] = React.useState(2) // index

  const usedPct = Math.round((CREDIT_USED / CREDIT_TOTAL) * 100)

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 lg:px-6">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">Billing</h1>
          <p className="text-sm text-muted-foreground text-pretty">
            Manage your organization&apos;s AI credit balance, usage breakdown, and invoice history.
          </p>
        </header>

        {/* ── Credit balance card ─────────────────────────────────────────  */}
        <section className="rounded-xl border border-border bg-card">
          <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-start sm:justify-between">
            {/* Left: balance */}
            <div className="flex flex-col gap-4 min-w-0">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                  <CoinsIcon className="size-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Organization Credits
                </span>
              </div>

              <div className="flex items-end gap-3">
                <span className="font-mono text-4xl font-bold tracking-tight text-foreground">
                  {CREDIT_BALANCE.toLocaleString()}
                </span>
                <span className="mb-1 text-sm text-muted-foreground">
                  / {CREDIT_TOTAL.toLocaleString()} total
                </span>
              </div>

              {/* Progress bar */}
              <div className="flex flex-col gap-1.5 max-w-md">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${usedPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    <span className="font-mono font-medium text-foreground">
                      {CREDIT_USED.toLocaleString()}
                    </span>{" "}
                    credits used ({usedPct}%)
                  </span>
                  <span className="text-xs text-muted-foreground">
                    <span className="font-mono font-medium text-foreground">
                      {CREDIT_BALANCE.toLocaleString()}
                    </span>{" "}
                    remaining
                  </span>
                </div>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex flex-col gap-2 sm:items-end">
              <button
                type="button"
                onClick={() => setTopUpOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <PlusIcon className="size-4" />
                Purchase Credits
              </button>
              <p className="text-xs text-muted-foreground">
                Credits never expire
              </p>
            </div>
          </div>

          {/* Divider + summary strip */}
          <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
            <StatCell
              label="Credits used"
              value={CREDIT_USED.toLocaleString()}
            />
            <StatCell
              label="Remaining"
              value={CREDIT_BALANCE.toLocaleString()}
            />
            <StatCell
              label="Utilization"
              value={`${usedPct}%`}
            />
          </div>
        </section>

        {/* ── Per-model breakdown ─────────────────────────────────────────── */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">
              Credit Usage by Model
            </h2>
            <span className="text-xs text-muted-foreground">Current billing period</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {MODEL_USAGE.map((m) => {
              const pct = Math.round((m.creditsUsed / CREDIT_USED) * 100)
              return (
                <ModelCard key={m.model} usage={m} pct={pct} />
              )
            })}
          </div>
        </section>

        {/* ── Invoices table ──────────────────────────────────────────────── */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">Invoices</h2>
            <span className="text-xs text-muted-foreground">
              {INVOICES.length} invoices
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center border-b border-border bg-muted/30 px-4 py-2.5 text-[11px] uppercase tracking-wide text-muted-foreground gap-4">
              <span>Invoice</span>
              <span className="hidden sm:block">Period</span>
              <span className="hidden md:block text-right">Credits</span>
              <span className="text-right">Amount</span>
              <span className="text-center">Status</span>
            </div>

            {/* Table rows */}
            <ul>
              {INVOICES.map((inv) => (
                <li
                  key={inv.id}
                  className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center border-b border-border px-4 py-3.5 last:border-b-0 gap-4 hover:bg-muted/20 transition-colors"
                >
                  {/* Invoice number + date */}
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-mono text-sm font-medium text-foreground">
                      {inv.number}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Issued {inv.date}
                    </span>
                  </div>

                  {/* Period */}
                  <span className="hidden sm:block shrink-0 text-sm text-muted-foreground">
                    {inv.period}
                  </span>

                  {/* Credits purchased */}
                  <span className="hidden md:block shrink-0 text-right font-mono text-sm text-foreground">
                    {inv.creditsPurchased.toLocaleString()}
                  </span>

                  {/* Amount */}
                  <span className="shrink-0 text-right font-mono text-sm font-medium text-foreground">
                    ${inv.amount.toFixed(2)}
                  </span>

                  {/* Status + download */}
                  <div className="flex shrink-0 items-center gap-2 justify-end">
                    <StatusBadge status={inv.status} />
                    <button
                      type="button"
                      title="Download PDF"
                      className="flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <DownloadIcon className="size-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* ── Top-up dialog ───────────────────────────────────────────────── */}
      {topUpOpen && (
        <TopUpDialog
          options={TOP_UP_OPTIONS}
          selected={selectedTopUp}
          onSelect={setSelectedTopUp}
          onClose={() => setTopUpOpen(false)}
        />
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                               Sub-components                                */
/* -------------------------------------------------------------------------- */

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 px-5 py-3">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-sm font-semibold text-foreground">
        {value}
      </span>
    </div>
  )
}

function ModelCard({
  usage,
  pct,
}: {
  usage: ModelUsage
  pct: number
}) {
  const Icon = usage.icon
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <Icon className="size-3.5 text-muted-foreground" />
            <span className="font-mono text-xs text-muted-foreground">
              {usage.model}
            </span>
          </div>
          <span className="font-mono text-xl font-bold tracking-tight text-foreground">
            {usage.creditsUsed.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">credits used</span>
        </div>
        <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-medium text-muted-foreground">
          {pct}%
        </span>
      </div>

      {/* Mini progress bar */}
      <div className="flex flex-col gap-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all", usage.color)}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          <span className="font-mono font-medium text-foreground">
            {usage.requests.toLocaleString()}
          </span>{" "}
          requests
        </span>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  if (status === "paid") {
    return (
      <span className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
        <CircleCheckIcon className="size-3" />
        Paid
      </span>
    )
  }
  if (status === "pending") {
    return (
      <span className="flex items-center gap-1 rounded-md bg-chart-1/20 px-2 py-0.5 text-xs font-medium text-chart-4">
        <ClockIcon className="size-3" />
        Pending
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
      <CircleAlertIcon className="size-3" />
      Overdue
    </span>
  )
}

function TopUpDialog({
  options,
  selected,
  onSelect,
  onClose,
}: {
  options: typeof TOP_UP_OPTIONS
  selected: number
  onSelect: (i: number) => void
  onClose: () => void
}) {
  const opt = options[selected]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Dialog header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-semibold text-foreground">
              Purchase Credits
            </h2>
            <p className="text-xs text-muted-foreground">
              Credits are added immediately to your organization.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        {/* Credit tier picker */}
        <div className="flex flex-col gap-2 p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
            Select a package
          </p>
          {options.map((o, i) => (
            <button
              key={o.credits}
              type="button"
              onClick={() => onSelect(i)}
              className={cn(
                "flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors",
                selected === i
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background hover:bg-muted/40"
              )}
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-sm font-semibold text-foreground">
                  {o.credits.toLocaleString()} credits
                </span>
                <span className="text-xs text-muted-foreground">
                  ~${(o.amount / o.credits * 1000).toFixed(2)} per 1k credits
                </span>
              </div>
              <span className="font-mono text-base font-bold text-foreground">
                ${o.amount}
              </span>
            </button>
          ))}
        </div>

        {/* Summary + CTA */}
        <div className="flex flex-col gap-3 border-t border-border px-5 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">You&apos;ll receive</span>
            <span className="font-mono font-semibold text-foreground">
              {opt.credits.toLocaleString()} credits
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total charge</span>
            <span className="font-mono font-semibold text-foreground">
              ${opt.amount}.00
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <ArrowUpRightIcon className="size-4" />
            Confirm Purchase
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Billed to card on file &middot; Credits never expire
          </p>
        </div>
      </div>
    </div>
  )
}
