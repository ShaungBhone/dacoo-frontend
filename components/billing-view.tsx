"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
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
  ArrowDownLeftIcon,
  LayersIcon,
  RefreshCwIcon,
  FileTextIcon,
  BanIcon,
  AlertTriangleIcon,
  HistoryIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { ApiError } from "@/lib/api"
import { useActiveOrganization } from "@/hooks/use-active-organization"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { DataTable } from "@/components/data-table"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { PlanPickerDialog } from "@/components/plan-picker-dialog"
import {
  fetchSubscription,
  fetchWallets,
  fetchUsageByModel,
  fetchWalletTransactions,
  fetchInvoices,
  topUpCredits,
  downloadInvoicePdf,
  CREDIT_CURRENCY,
  type Subscription,
  type Wallet,
  type ModelUsage,
  type WalletTransaction,
  type Invoice,
  type InvoiceStatus,
} from "@/components/billing-api"

/* -------------------------------------------------------------------------- */
/*                                  Component                                  */
/* -------------------------------------------------------------------------- */

export function BillingView() {
  const organization = useActiveOrganization()
  const [topUpOpen, setTopUpOpen] = React.useState(false)

  const [subscription, setSubscription] = React.useState<Subscription | null>(
    null
  )
  const [isLoadingSubscription, setIsLoadingSubscription] = React.useState(true)
  const [subscriptionError, setSubscriptionError] = React.useState<
    string | null
  >(null)
  const [planPickerOpen, setPlanPickerOpen] = React.useState(false)

  const [wallets, setWallets] = React.useState<Wallet[]>([])
  const [isLoadingWallets, setIsLoadingWallets] = React.useState(true)
  const [walletsError, setWalletsError] = React.useState<string | null>(null)

  const [modelUsage, setModelUsage] = React.useState<ModelUsage[]>([])
  const [isLoadingUsage, setIsLoadingUsage] = React.useState(true)
  const [usageError, setUsageError] = React.useState<string | null>(null)

  const [transactions, setTransactions] = React.useState<WalletTransaction[]>(
    []
  )
  const [isLoadingTransactions, setIsLoadingTransactions] = React.useState(true)
  const [transactionsError, setTransactionsError] = React.useState<
    string | null
  >(null)

  const [invoices, setInvoices] = React.useState<Invoice[]>([])
  const [isLoadingInvoices, setIsLoadingInvoices] = React.useState(true)
  const [invoicesError, setInvoicesError] = React.useState<string | null>(null)
  const [downloadingInvoiceId, setDownloadingInvoiceId] = React.useState<
    number | null
  >(null)

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

  const loadWallets = React.useCallback(async () => {
    if (!organization) return
    setIsLoadingWallets(true)
    setWalletsError(null)
    try {
      const list = await fetchWallets(organization.id)
      setWallets(list)
    } catch (err) {
      setWalletsError(
        err instanceof ApiError ? err.message : "Failed to load credit balance."
      )
    } finally {
      setIsLoadingWallets(false)
    }
  }, [organization])

  const loadInvoices = React.useCallback(async () => {
    if (!organization) return
    setIsLoadingInvoices(true)
    setInvoicesError(null)
    try {
      const list = await fetchInvoices(organization.id)
      setInvoices(list)
    } catch (err) {
      setInvoicesError(
        err instanceof ApiError ? err.message : "Failed to load invoices."
      )
    } finally {
      setIsLoadingInvoices(false)
    }
  }, [organization])

  React.useEffect(() => {
    loadSubscription()
  }, [loadSubscription])

  React.useEffect(() => {
    loadWallets()
  }, [loadWallets])

  React.useEffect(() => {
    loadInvoices()
  }, [loadInvoices])

  const creditWallet =
    wallets.find((w) => w.currency_code === CREDIT_CURRENCY) ?? null
  const otherWallets = wallets.filter(
    (w) => w.currency_code !== CREDIT_CURRENCY
  )

  const loadUsage = React.useCallback(async () => {
    if (!organization || isLoadingWallets) return

    if (!creditWallet) {
      setModelUsage([])
      setUsageError(null)
      setIsLoadingUsage(false)
      return
    }

    setIsLoadingUsage(true)
    setUsageError(null)
    try {
      const usage = await fetchUsageByModel(organization.id, creditWallet.id)
      setModelUsage(usage)
    } catch (err) {
      setUsageError(
        err instanceof ApiError
          ? err.message
          : "Failed to load usage breakdown."
      )
    } finally {
      setIsLoadingUsage(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization, creditWallet?.id, isLoadingWallets])

  React.useEffect(() => {
    loadUsage()
  }, [loadUsage])

  const loadTransactions = React.useCallback(async () => {
    if (!organization || isLoadingWallets) return

    if (!creditWallet) {
      setTransactions([])
      setTransactionsError(null)
      setIsLoadingTransactions(false)
      return
    }

    setIsLoadingTransactions(true)
    setTransactionsError(null)
    try {
      const list = await fetchWalletTransactions(
        organization.id,
        creditWallet.id
      )
      setTransactions(list)
    } catch (err) {
      setTransactionsError(
        err instanceof ApiError
          ? err.message
          : "Failed to load recent activity."
      )
    } finally {
      setIsLoadingTransactions(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization, creditWallet?.id, isLoadingWallets])

  React.useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  const handleDownloadInvoice = React.useCallback(
    async (invoice: Invoice) => {
      if (!organization) return
      setDownloadingInvoiceId(invoice.id)
      try {
        await downloadInvoicePdf(organization.id, invoice)
      } catch {
        // Swallow — the download simply won't start; nothing else to show inline here.
      } finally {
        setDownloadingInvoiceId(null)
      }
    },
    [organization]
  )

  const transactionColumns = React.useMemo<ColumnDef<WalletTransaction>[]>(
    () => [
      {
        accessorKey: "type",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) => <TransactionTypeBadge type={row.original.type} />,
        meta: {
          label: "Type",
          headerClassName:
            "px-4 py-2.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase",
          cellClassName: "px-4 py-3",
        },
      },
      {
        id: "description",
        accessorFn: (transaction) =>
          transaction.description ?? transaction.model ?? "—",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Description" />
        ),
        meta: {
          label: "Description",
          headerClassName:
            "hidden px-4 py-2.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase sm:table-cell",
          cellClassName:
            "hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell",
        },
      },
      {
        id: "amount",
        accessorFn: (transaction) => Number(transaction.amount),
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Amount"
            className="ml-auto"
          />
        ),
        cell: ({ row }) => (
          <span
            className={cn(
              "font-mono text-sm font-medium tabular-nums",
              row.original.type === "debit"
                ? "text-destructive"
                : "text-primary"
            )}
          >
            {row.original.type === "debit" ? "-" : "+"}
            {Number(row.original.amount).toLocaleString()}
          </span>
        ),
        meta: {
          label: "Amount",
          headerClassName:
            "px-4 py-2.5 text-right text-[11px] font-semibold tracking-wide text-muted-foreground uppercase",
          cellClassName: "px-4 py-3 text-right",
        },
      },
      {
        id: "balance_after",
        accessorFn: (transaction) => Number(transaction.balance_after),
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Balance"
            className="ml-auto"
          />
        ),
        cell: ({ row }) => Number(row.original.balance_after).toLocaleString(),
        meta: {
          label: "Balance",
          headerClassName:
            "px-4 py-2.5 text-right text-[11px] font-semibold tracking-wide text-muted-foreground uppercase",
          cellClassName:
            "px-4 py-3 text-right font-mono text-sm text-muted-foreground tabular-nums",
        },
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Date"
            className="ml-auto"
          />
        ),
        cell: ({ row }) => formatDate(row.original.created_at),
        meta: {
          label: "Date",
          headerClassName:
            "hidden px-4 py-2.5 text-right text-[11px] font-semibold tracking-wide text-muted-foreground uppercase sm:table-cell",
          cellClassName:
            "hidden px-4 py-3 text-right text-sm text-muted-foreground sm:table-cell",
        },
      },
    ],
    []
  )

  const invoiceColumns = React.useMemo<ColumnDef<Invoice>[]>(
    () => [
      {
        accessorKey: "number",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Invoice" />
        ),
        cell: ({ row }) => (
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="font-mono text-sm font-medium text-foreground tabular-nums">
              {row.original.number}
            </span>
            <span className="text-xs text-muted-foreground">
              Issued {formatDate(row.original.issued_at)}
            </span>
          </div>
        ),
        meta: {
          label: "Invoice",
          headerClassName:
            "px-4 py-2.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase",
          cellClassName: "px-4 py-3",
        },
      },
      {
        accessorKey: "due_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Due" />
        ),
        cell: ({ row }) => (
          <>
            {formatDate(row.original.due_at)}
            {row.original.is_overdue && (
              <span className="ml-2 text-xs font-medium text-destructive">
                Overdue
              </span>
            )}
          </>
        ),
        meta: {
          label: "Due date",
          headerClassName:
            "hidden px-4 py-2.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase sm:table-cell",
          cellClassName:
            "hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell",
        },
      },
      {
        id: "total",
        accessorFn: (invoice) => Number(invoice.total),
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Total"
            className="ml-auto"
          />
        ),
        cell: ({ row }) => `$${Number(row.original.total).toFixed(2)}`,
        meta: {
          label: "Total",
          headerClassName:
            "px-4 py-2.5 text-right text-[11px] font-semibold tracking-wide text-muted-foreground uppercase",
          cellClassName:
            "px-4 py-3 text-right font-mono text-sm font-medium text-foreground tabular-nums",
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Status"
            className="ml-auto"
          />
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <StatusBadge status={row.original.status} />
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={`Download ${row.original.number} PDF`}
              disabled={downloadingInvoiceId === row.original.id}
              onClick={() => handleDownloadInvoice(row.original)}
            >
              {downloadingInvoiceId === row.original.id ? (
                <Spinner className="size-4" />
              ) : (
                <DownloadIcon aria-hidden="true" />
              )}
            </Button>
          </div>
        ),
        meta: {
          label: "Status",
          headerClassName:
            "px-4 py-2.5 text-right text-[11px] font-semibold tracking-wide text-muted-foreground uppercase",
          cellClassName: "px-4 py-3",
        },
      },
    ],
    [downloadingInvoiceId, handleDownloadInvoice]
  )

  const totalUsedThisMonth = modelUsage.reduce(
    (acc, m) => acc + m.credits_used,
    0
  )
  const balance = creditWallet ? Number(creditWallet.balance) : 0

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">Billing</h1>
          <p className="text-sm text-pretty text-muted-foreground">
            Manage your organization&apos;s plan, AI credit balance, usage
            breakdown, and invoice history.
          </p>
        </header>

        {/* ── Low balance warning ──────────────────────────────────────────  */}
        {creditWallet?.low_balance && (
          <Alert variant="destructive">
            <AlertTriangleIcon />
            <AlertTitle>Your credit balance is running low</AlertTitle>
            <AlertDescription>
              Top up now to avoid interruptions to your AI assistant&apos;s
              replies.
              <div className="pt-2.5">
                <Button size="sm" onClick={() => setTopUpOpen(true)}>
                  <PlusIcon data-icon="inline-start" aria-hidden="true" />
                  Purchase Credits
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* ── Current plan card ───────────────────────────────────────────  */}
        <CurrentPlanCard
          subscription={subscription}
          isLoading={isLoadingSubscription}
          error={subscriptionError}
          onChangePlan={() => setPlanPickerOpen(true)}
          onRetry={loadSubscription}
        />

        {/* ── Credit balance card ─────────────────────────────────────────  */}
        {isLoadingWallets ? (
          <Card className="gap-0 border border-border py-0 shadow-none ring-0">
            <CardContent className="flex flex-col gap-3 p-5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-10 w-56" />
              <Skeleton className="h-4 w-64" />
            </CardContent>
          </Card>
        ) : walletsError ? (
          <Card className="gap-0 border border-border py-0 shadow-none ring-0">
            <CardContent className="p-0">
              <Empty className="border-0 p-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <CircleAlertIcon />
                  </EmptyMedia>
                  <EmptyTitle>
                    Couldn&apos;t load your credit balance
                  </EmptyTitle>
                  <EmptyDescription>{walletsError}</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={loadWallets}
                  >
                    Retry
                  </Button>
                </EmptyContent>
              </Empty>
            </CardContent>
          </Card>
        ) : (
          <Card className="gap-0 border border-border py-0 shadow-none ring-0">
            <CardContent className="flex flex-col gap-6 p-5 sm:flex-row sm:items-start sm:justify-between">
              {/* Left: balance */}
              <div className="flex min-w-0 flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                    <CoinsIcon
                      className="size-4 text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Organization Credits
                  </span>
                </div>

                <div className="flex items-end gap-3">
                  <span className="font-mono text-4xl font-bold tracking-tight text-foreground tabular-nums">
                    {balance.toLocaleString()}
                  </span>
                  <span className="mb-1 text-sm text-muted-foreground tabular-nums">
                    credits available
                  </span>
                </div>

                <span className="text-xs text-muted-foreground">
                  <span className="font-mono font-medium text-foreground tabular-nums">
                    {totalUsedThisMonth.toLocaleString()}
                  </span>{" "}
                  credits used this month
                </span>
              </div>

              {/* Right: actions */}
              <div className="flex flex-col gap-2 sm:items-end">
                <Button type="button" onClick={() => setTopUpOpen(true)}>
                  <PlusIcon data-icon="inline-start" aria-hidden="true" />
                  Purchase Credits
                </Button>
                <p className="text-xs text-muted-foreground">
                  Credits never expire
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Per-model breakdown ─────────────────────────────────────────── */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">
              Credit Usage by Model
            </h2>
            <span className="text-xs text-muted-foreground">This month</span>
          </div>

          {isLoadingUsage ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : usageError ? (
            <Card className="gap-0 border border-border py-0 shadow-none ring-0">
              <CardContent className="p-0">
                <Empty className="border-0 p-6">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CircleAlertIcon />
                    </EmptyMedia>
                    <EmptyTitle>Couldn&apos;t load usage breakdown</EmptyTitle>
                    <EmptyDescription>{usageError}</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={loadUsage}
                    >
                      Retry
                    </Button>
                  </EmptyContent>
                </Empty>
              </CardContent>
            </Card>
          ) : modelUsage.length === 0 ? (
            <Card className="gap-0 border border-border py-0 shadow-none ring-0">
              <CardContent className="p-0">
                <Empty className="border-0 p-6">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <ZapIcon />
                    </EmptyMedia>
                    <EmptyTitle>No usage yet this month</EmptyTitle>
                    <EmptyDescription>
                      Credit usage will show up here once your AI assistant
                      starts replying.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {modelUsage.map((m, i) => (
                <ModelCard
                  key={m.model}
                  usage={m}
                  pct={
                    totalUsedThisMonth > 0
                      ? Math.round((m.credits_used / totalUsedThisMonth) * 100)
                      : 0
                  }
                  colorIndex={i}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Recent activity ─────────────────────────────────────────────── */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">
              Recent Activity
            </h2>
            <span className="text-xs text-muted-foreground">
              {transactions.length}{" "}
              {transactions.length === 1 ? "transaction" : "transactions"}
            </span>
          </div>

          {isLoadingTransactions ? (
            <Skeleton className="h-40 w-full rounded-xl" />
          ) : transactionsError ? (
            <Card className="gap-0 border border-border py-0 shadow-none ring-0">
              <CardContent className="p-0">
                <Empty className="border-0 p-6">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CircleAlertIcon />
                    </EmptyMedia>
                    <EmptyTitle>Couldn&apos;t load recent activity</EmptyTitle>
                    <EmptyDescription>{transactionsError}</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={loadTransactions}
                    >
                      Retry
                    </Button>
                  </EmptyContent>
                </Empty>
              </CardContent>
            </Card>
          ) : transactions.length === 0 ? (
            <Card className="gap-0 border border-border py-0 shadow-none ring-0">
              <CardContent className="p-0">
                <Empty className="border-0 p-6">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <HistoryIcon />
                    </EmptyMedia>
                    <EmptyTitle>No activity yet</EmptyTitle>
                    <EmptyDescription>
                      Credit top-ups and AI usage will show up here.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <DataTable
                columns={transactionColumns}
                data={transactions}
                searchPlaceholder="Search transactions…"
                searchableColumnIds={["type", "description", "amount"]}
                headerClassName="bg-muted/30"
                rowClassName="hover:bg-muted/20"
                className="p-3"
              />
            </div>
          )}
        </section>

        {/* ── Invoices table ──────────────────────────────────────────────── */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">Invoices</h2>
            <span className="text-xs text-muted-foreground">
              {invoices.length} {invoices.length === 1 ? "invoice" : "invoices"}
            </span>
          </div>

          {isLoadingInvoices ? (
            <Skeleton className="h-40 w-full rounded-xl" />
          ) : invoicesError ? (
            <Card className="gap-0 border border-border py-0 shadow-none ring-0">
              <CardContent className="p-0">
                <Empty className="border-0 p-6">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CircleAlertIcon />
                    </EmptyMedia>
                    <EmptyTitle>Couldn&apos;t load invoices</EmptyTitle>
                    <EmptyDescription>{invoicesError}</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={loadInvoices}
                    >
                      Retry
                    </Button>
                  </EmptyContent>
                </Empty>
              </CardContent>
            </Card>
          ) : invoices.length === 0 ? (
            <Card className="gap-0 border border-border py-0 shadow-none ring-0">
              <CardContent className="p-0">
                <Empty className="border-0 p-6">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <FileTextIcon />
                    </EmptyMedia>
                    <EmptyTitle>No invoices yet</EmptyTitle>
                    <EmptyDescription>
                      Invoices for your organization will appear here once
                      issued.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <DataTable
                columns={invoiceColumns}
                data={invoices}
                searchPlaceholder="Search invoices…"
                searchableColumnIds={["number", "status", "total"]}
                headerClassName="bg-muted/30"
                rowClassName="hover:bg-muted/20"
                className="p-3"
              />
            </div>
          )}
        </section>
      </div>

      {/* ── Top-up dialog ───────────────────────────────────────────────── */}
      {topUpOpen && organization && (
        <TopUpDialog
          organizationId={organization.id}
          sourceWallets={otherWallets}
          onClose={() => setTopUpOpen(false)}
          onTopUp={(updated) =>
            setWallets((prev) => {
              const rest = prev.filter(
                (w) => w.currency_code !== CREDIT_CURRENCY
              )
              return [...rest, updated]
            })
          }
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

function SubscriptionStatusBadge({
  status,
}: {
  status: Subscription["status"]
}) {
  if (status === "active") {
    return (
      <Badge className="border-transparent bg-primary/10 text-primary shadow-none hover:bg-primary/10">
        Active
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
      <Card className="gap-0 border border-border py-0 shadow-none ring-0">
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
      <Card className="gap-0 border border-border py-0 shadow-none ring-0">
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRetry}
              >
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
      <Card className="gap-0 border border-border py-0 shadow-none ring-0">
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRetry}
              >
                Retry
              </Button>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  const dateLine =
    subscription.status === "active"
      ? `Active since ${formatDate(subscription.starts_at)}`
      : subscription.status === "cancelled"
        ? `Cancelled ${formatDate(subscription.cancelled_at)}`
        : `Ended ${formatDate(subscription.ends_at)}`

  return (
    <Card className="gap-0 border border-border py-0 shadow-none ring-0">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
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

const MODEL_ICONS = [BrainIcon, SparklesIcon, ZapIcon, CpuIcon]
const MODEL_COLORS = [
  "bg-primary",
  "bg-chart-1",
  "bg-chart-3",
  "bg-chart-5",
  "bg-chart-2",
  "bg-chart-4",
]

function ModelCard({
  usage,
  pct,
  colorIndex,
}: {
  usage: ModelUsage
  pct: number
  colorIndex: number
}) {
  const Icon = MODEL_ICONS[colorIndex % MODEL_ICONS.length]
  const color = MODEL_COLORS[colorIndex % MODEL_COLORS.length]

  return (
    <Card className="gap-0 border border-border py-0 shadow-none ring-0">
      <CardContent className="flex flex-col gap-4 p-4">
        <div className="flex items-start justify-between">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Icon
                className="size-3.5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="truncate font-mono text-xs text-muted-foreground">
                {usage.model}
              </span>
            </div>
            <span className="font-mono text-xl font-bold tracking-tight text-foreground tabular-nums">
              {usage.credits_used.toLocaleString()}
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
              className={cn("h-full rounded-full transition-all", color)}
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

function TransactionTypeBadge({ type }: { type: WalletTransaction["type"] }) {
  if (type === "credit") {
    return (
      <Badge className="border-transparent bg-primary/10 text-primary shadow-none hover:bg-primary/10">
        <ArrowDownLeftIcon data-icon="inline-start" aria-hidden="true" />
        Credit
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="shadow-none">
      <ArrowUpRightIcon data-icon="inline-start" aria-hidden="true" />
      Debit
    </Badge>
  )
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  if (status === "paid") {
    return (
      <Badge className="border-transparent bg-primary/10 text-primary shadow-none hover:bg-primary/10">
        <CircleCheckIcon data-icon="inline-start" aria-hidden="true" />
        Paid
      </Badge>
    )
  }
  if (status === "sent") {
    return (
      <Badge className="border-transparent bg-chart-1/20 text-chart-4 shadow-none hover:bg-chart-1/20">
        <ClockIcon data-icon="inline-start" aria-hidden="true" />
        Sent
      </Badge>
    )
  }
  if (status === "cancelled") {
    return (
      <Badge variant="secondary" className="shadow-none">
        <BanIcon data-icon="inline-start" aria-hidden="true" />
        Cancelled
      </Badge>
    )
  }
  if (status === "unpaid") {
    return (
      <Badge variant="destructive" className="shadow-none">
        <CircleAlertIcon data-icon="inline-start" aria-hidden="true" />
        Unpaid
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="shadow-none">
      <FileTextIcon data-icon="inline-start" aria-hidden="true" />
      Draft
    </Badge>
  )
}

function TopUpDialog({
  organizationId,
  sourceWallets,
  onClose,
  onTopUp,
}: {
  organizationId: number
  sourceWallets: Wallet[]
  onClose: () => void
  onTopUp: (wallet: Wallet) => void
}) {
  const [sourceCurrency, setSourceCurrency] = React.useState(
    sourceWallets[0]?.currency_code ?? ""
  )
  const [amount, setAmount] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleConfirm() {
    if (!sourceCurrency || !amount) return
    setIsSubmitting(true)
    setError(null)
    try {
      const updated = await topUpCredits(organizationId, sourceCurrency, amount)
      onTopUp(updated)
      onClose()
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to top up credits."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (sourceWallets.length === 0) {
    return (
      <Dialog
        open={true}
        onOpenChange={(open) => {
          if (!open) onClose()
        }}
      >
        <DialogContent className="max-w-md gap-0 p-0">
          <DialogHeader className="border-b border-border px-5 py-4">
            <DialogTitle>Purchase Credits</DialogTitle>
            <DialogDescription>
              Credits are converted from another currency wallet your
              organization holds.
            </DialogDescription>
          </DialogHeader>
          <Empty className="border-0 p-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CircleAlertIcon />
              </EmptyMedia>
              <EmptyTitle>No funding source available</EmptyTitle>
              <EmptyDescription>
                Your organization doesn&apos;t hold a balance in any other
                currency to convert into credits. Contact support to add funds.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle>Purchase Credits</DialogTitle>
          <DialogDescription>
            Convert balance from another wallet into credits.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="topup-source"
            >
              Pay from wallet
            </label>
            <Select value={sourceCurrency} onValueChange={setSourceCurrency}>
              <SelectTrigger id="topup-source" className="w-full">
                <SelectValue placeholder="Select a wallet" />
              </SelectTrigger>
              <SelectContent>
                {sourceWallets.map((w) => (
                  <SelectItem key={w.currency_code} value={w.currency_code}>
                    {w.currency_code} &middot;{" "}
                    {w.formatted_balance ?? w.balance} available
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="topup-amount"
            >
              Amount
            </label>
            <Input
              id="topup-amount"
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border px-5 py-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="button"
            size="lg"
            onClick={handleConfirm}
            disabled={isSubmitting || !amount || !sourceCurrency}
            className="w-full"
          >
            {isSubmitting ? (
              <Spinner className="size-4" />
            ) : (
              <ArrowUpRightIcon data-icon="inline-start" aria-hidden="true" />
            )}
            Confirm Purchase
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Credits never expire
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
