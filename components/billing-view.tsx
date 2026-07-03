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
  PlusIcon,
  ArrowUpRightIcon,
  LayersIcon,
  RefreshCwIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { ApiError } from "@/lib/api"
import { useActiveOrganization } from "@/hooks/use-active-organization"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PlanPickerDialog } from "@/components/plan-picker-dialog"
import { fetchSubscription, type Subscription } from "@/components/billing-api"

/* -------------------------------------------------------------------------- */
/*                                  Mock data                                  */
/* -------------------------------------------------------------------------- */

const CREDIT_BALANCE = 42_380
const CREDIT_TOTAL = 100_000
const CREDIT_USED = CREDIT_TOTAL - CREDIT_BALANCE

type ModelUsage = {
  model: string
  icon: React.ComponentType<any>
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
  const organization = useActiveOrganization()
  const [topUpOpen, setTopUpOpen] = React.useState(false)
  const [selectedTopUp, setSelectedTopUp] = React.useState(2) // index

  const [subscription, setSubscription] = React.useState<Subscription | null>(null)
  const [isLoadingSubscription, setIsLoadingSubscription] = React.useState(true)
  const [subscriptionError, setSubscriptionError] = React.useState<string | null>(null)
  const [planPickerOpen, setPlanPickerOpen] = React.useState(false)

  const loadSubscription = React.useCallback(async () => {
    if (!organization) return
    setIsLoadingSubscription(true)
    setSubscriptionError(null)
    try {
      const sub = await fetchSubscription(organization.id)
      setSubscription(sub)
    } catch (err) {
      setSubscriptionError(
        err instanceof ApiError ? err.message : "Failed to load subscription."
      )
    } finally {
      setIsLoadingSubscription(false)
    }
  }, [organization])

  React.useEffect(() => {
    loadSubscription()
  }, [loadSubscription])

  const usedPct = Math.round((CREDIT_USED / CREDIT_TOTAL) * 100)

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 lg:px-6">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">Billing</h1>
          <p className="text-sm text-muted-foreground text-pretty">
            Manage your organization&apos;s plan, AI credit balance, usage breakdown, and invoice history.
          </p>
        </header>

        {/* ── Current plan card ───────────────────────────────────────────  */}
        <CurrentPlanCard
          subscription={subscription}
          isLoading={isLoadingSubscription}
          error={subscriptionError}
          onChangePlan={() => setPlanPickerOpen(true)}
          onRetry={loadSubscription}
        />

        {/* ── Credit balance card ─────────────────────────────────────────  */}
        <Card className="shadow-none border border-border ring-0 py-0 gap-0">
          <CardContent className="flex flex-col gap-6 p-5 sm:flex-row sm:items-start sm:justify-between">
            {/* Left: balance */}
            <div className="flex flex-col gap-4 min-w-0">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                  <CoinsIcon className="size-4 text-primary" aria-hidden="true" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Organization Credits
                </span>
              </div>

              <div className="flex items-end gap-3">
                <span className="font-mono text-4xl font-bold tracking-tight text-foreground tabular-nums">
                  {CREDIT_BALANCE.toLocaleString()}
                </span>
                <span className="mb-1 text-sm text-muted-foreground tabular-nums">
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
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    <span className="font-mono font-medium text-foreground tabular-nums">
                      {CREDIT_USED.toLocaleString()}
                    </span>{" "}
                    credits used ({usedPct}%)
                  </span>
                  <span className="text-xs text-muted-foreground">
                    <span className="font-mono font-medium text-foreground tabular-nums">
                      {CREDIT_BALANCE.toLocaleString()}
                    </span>{" "}
                    remaining
                  </span>
                </div>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex flex-col gap-2 sm:items-end">
              <Button
                type="button"
                onClick={() => setTopUpOpen(true)}
              >
                <PlusIcon data-icon="inline-start" aria-hidden="true" />
                Purchase Credits
              </Button>
              <p className="text-xs text-muted-foreground">
                Credits never expire
              </p>
            </div>
          </CardContent>

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
        </Card>

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
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-4 py-2.5 text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Invoice</TableHead>
                  <TableHead className="hidden sm:table-cell px-4 py-2.5 text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Period</TableHead>
                  <TableHead className="hidden md:table-cell px-4 py-2.5 text-right text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Credits</TableHead>
                  <TableHead className="px-4 py-2.5 text-right text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Amount</TableHead>
                  <TableHead className="px-4 py-2.5 text-right text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {INVOICES.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-muted/20">
                    <TableCell className="px-4 py-3">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-mono text-sm font-medium text-foreground tabular-nums">
                          {inv.number}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Issued {inv.date}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell px-4 py-3 text-sm text-muted-foreground">
                      {inv.period}
                    </TableCell>
                    <TableCell className="hidden md:table-cell px-4 py-3 text-right font-mono text-sm text-foreground tabular-nums">
                      {inv.creditsPurchased.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right font-mono text-sm font-medium text-foreground tabular-nums">
                      ${inv.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <StatusBadge status={inv.status} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          aria-label="Download PDF"
                        >
                          <DownloadIcon aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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

      {/* ── Plan picker dialog ──────────────────────────────────────────── */}
      {planPickerOpen && organization && subscription && (
        <PlanPickerDialog
          organizationId={organization.id}
          currentPlanId={subscription.plan.id}
          onClose={() => setPlanPickerOpen(false)}
          onChanged={(updated) => setSubscription(updated)}
        />
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                               Sub-components                                */
/* -------------------------------------------------------------------------- */

function formatPlanPrice(plan: Subscription["plan"]): string {
  const amount = (plan.price / 100).toFixed(2)
  const suffix = plan.interval === "monthly" ? "mo" : "yr"
  return `$${amount}/${suffix}`
}

function formatDate(value: string | null): string {
  if (!value) return "—"
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function SubscriptionStatusBadge({ status }: { status: Subscription["status"] }) {
  if (status === "active") {
    return (
      <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-transparent shadow-none">
        Active
      </Badge>
    )
  }
  if (status === "trialing") {
    return (
      <Badge className="bg-chart-1/20 text-chart-4 hover:bg-chart-1/20 border-transparent shadow-none">
        Trialing
      </Badge>
    )
  }
  if (status === "cancelled") {
    return (
      <Badge variant="destructive" className="shadow-none">
        Cancelled
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="shadow-none">
      Expired
    </Badge>
  )
}

function CurrentPlanCard({
  subscription,
  isLoading,
  error,
  onChangePlan,
  onRetry,
}: {
  subscription: Subscription | null
  isLoading: boolean
  error: string | null
  onChangePlan: () => void
  onRetry: () => void
}) {
  if (isLoading && !subscription) {
    return (
      <Card className="shadow-none border border-border ring-0 py-0 gap-0">
        <CardContent className="flex flex-col gap-3 p-5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-40" />
        </CardContent>
      </Card>
    )
  }

  if (error && !subscription) {
    return (
      <Card className="shadow-none border border-border ring-0 py-0 gap-0">
        <CardContent className="p-0">
          <Empty className="border-0 p-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CircleAlertIcon />
              </EmptyMedia>
              <EmptyTitle>Couldn&apos;t load your plan</EmptyTitle>
              <EmptyDescription>{error}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                Retry
              </Button>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  if (!subscription) {
    return (
      <Card className="shadow-none border border-border ring-0 py-0 gap-0">
        <CardContent className="p-0">
          <Empty className="border-0 p-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <LayersIcon />
              </EmptyMedia>
              <EmptyTitle>No plan found</EmptyTitle>
              <EmptyDescription>
                We couldn&apos;t find a subscription for this organization.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                Retry
              </Button>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  const dateLine =
    subscription.status === "trialing" && subscription.trial_ends_at
      ? `Trial ends ${formatDate(subscription.trial_ends_at)}`
      : subscription.status === "active"
        ? `Active since ${formatDate(subscription.starts_at)}`
        : subscription.status === "cancelled"
          ? `Cancelled ${formatDate(subscription.cancelled_at)}`
          : `Ended ${formatDate(subscription.ends_at)}`

  return (
    <Card className="shadow-none border border-border ring-0 py-0 gap-0">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <LayersIcon className="size-4 text-primary" aria-hidden="true" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Current Plan
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {subscription.plan.name}
            </span>
            <SubscriptionStatusBadge status={subscription.status} />
          </div>
          <span className="text-xs text-muted-foreground">
            {formatPlanPrice(subscription.plan)} &middot; {dateLine}
          </span>
        </div>

        <Button type="button" variant="outline" onClick={onChangePlan}>
          <RefreshCwIcon data-icon="inline-start" aria-hidden="true" />
          Change Plan
        </Button>
      </CardContent>
    </Card>
  )
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 px-5 py-3">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-sm font-semibold text-foreground tabular-nums">
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
    <Card className="shadow-none border border-border ring-0 py-0 gap-0">
      <CardContent className="flex flex-col gap-4 p-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Icon className="size-3.5 text-muted-foreground" aria-hidden="true" />
              <span className="font-mono text-xs text-muted-foreground">
                {usage.model}
              </span>
            </div>
            <span className="font-mono text-xl font-bold tracking-tight text-foreground tabular-nums">
              {usage.creditsUsed.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">credits used</span>
          </div>
          <Badge variant="secondary" className="font-mono shadow-none">
            {pct}%
          </Badge>
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
            <span className="font-mono font-medium text-foreground tabular-nums">
              {usage.requests.toLocaleString()}
            </span>{" "}
            requests
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  if (status === "paid") {
    return (
      <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-transparent shadow-none">
        <CircleCheckIcon data-icon="inline-start" aria-hidden="true" />
        Paid
      </Badge>
    )
  }
  if (status === "pending") {
    return (
      <Badge className="bg-chart-1/20 text-chart-4 hover:bg-chart-1/20 border-transparent shadow-none">
        <ClockIcon data-icon="inline-start" aria-hidden="true" />
        Pending
      </Badge>
    )
  }
  return (
    <Badge variant="destructive" className="shadow-none">
      <CircleAlertIcon data-icon="inline-start" aria-hidden="true" />
      Overdue
    </Badge>
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
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-md gap-0 p-0">
        {/* Dialog header */}
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle>Purchase Credits</DialogTitle>
          <DialogDescription>
            Credits are added immediately to your organization.
          </DialogDescription>
        </DialogHeader>

        {/* Credit tier picker */}
        <div className="flex flex-col gap-2 p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
            Select a package
          </p>
          <ToggleGroup
            type="single"
            value={String(selected)}
            onValueChange={(val) => {
              if (val !== "") onSelect(Number(val))
            }}
            orientation="vertical"
            spacing={2}
            className="w-full flex-col items-stretch gap-2"
          >
            {options.map((o, i) => (
              <ToggleGroupItem
                key={o.credits}
                value={String(i)}
                className={cn(
                  "flex h-auto items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-left transition-colors hover:bg-muted/40 data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-foreground",
                  "w-full text-left"
                )}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-sm font-semibold text-foreground tabular-nums">
                    {o.credits.toLocaleString()} credits
                  </span>
                  <span className="text-xs text-muted-foreground font-normal tabular-nums">
                    ~${(o.amount / o.credits * 1000).toFixed(2)} per 1k credits
                  </span>
                </div>
                <span className="font-mono text-base font-bold text-foreground tabular-nums">
                  ${o.amount}
                </span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Summary + CTA */}
        <div className="flex flex-col gap-3 border-t border-border px-5 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">You&apos;ll receive</span>
            <span className="font-mono font-semibold text-foreground tabular-nums">
              {opt.credits.toLocaleString()} credits
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total charge</span>
            <span className="font-mono font-semibold text-foreground tabular-nums">
              ${opt.amount}.00
            </span>
          </div>
          <Button
            type="button"
            size="lg"
            onClick={onClose}
            className="mt-1 w-full"
          >
            <ArrowUpRightIcon data-icon="inline-start" aria-hidden="true" />
            Confirm Purchase
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Billed to card on file &middot; Credits never expire
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

