"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import {
  WalletIcon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  PlusIcon,
  CoinsIcon,
  CircleAlertIcon,
  AlertTriangleIcon,
  CpuIcon,
  BrainIcon,
  SparklesIcon,
  ZapIcon,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DataTable } from "@/components/data-table"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  fetchWallets,
  fetchWalletTransactions,
  fetchUsageByModel,
  topUpCredits,
  CREDIT_CURRENCY,
  type Wallet,
  type WalletTransaction,
  type ModelUsage,
} from "@/components/billing-api"

/* -------------------------------------------------------------------------- */
/*                               Helpers / sub-components                      */
/* -------------------------------------------------------------------------- */

const MODEL_ICONS = [ZapIcon, CpuIcon, BrainIcon, SparklesIcon]
const MODEL_COLORS = [
  "bg-primary",
  "bg-chart-1",
  "bg-chart-3",
  "bg-chart-5",
  "bg-chart-2",
  "bg-chart-4",
]

function formatBalance(wallet: Wallet): string {
  const num = parseFloat(wallet.balance)
  if (isNaN(num)) return wallet.balance

  if (wallet.currency_code === CREDIT_CURRENCY) {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  try {
    return num.toLocaleString(undefined, {
      style: "currency",
      currency: wallet.currency_code,
    })
  } catch {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }
}

function currencyLabel(code: string): string {
  return code === CREDIT_CURRENCY ? "Credit" : code
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/* -------------------------------- Wallet card ------------------------------ */

function CreditsWalletCard({
  wallet,
  onTopUp,
}: {
  wallet: Wallet
  onTopUp: () => void
}) {
  return (
    <Card className="relative overflow-hidden border border-border shadow-none ring-0">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
                <CoinsIcon className="size-4 text-primary" aria-hidden="true" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Credits Wallet
              </span>
              {wallet.low_balance && (
                <Badge
                  variant="destructive"
                  className="gap-1 text-xs shadow-none"
                >
                  <AlertTriangleIcon className="size-3" aria-hidden="true" />
                  Low balance
                </Badge>
              )}
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-4xl font-bold tracking-tight text-foreground tabular-nums">
                {formatBalance(wallet)}
              </span>
              <span className="text-sm text-muted-foreground">
                {currencyLabel(wallet.currency_code)} available
              </span>
            </div>
          </div>

          <Button onClick={onTopUp} size="sm" className="shrink-0">
            <PlusIcon aria-hidden="true" />
            Top up
          </Button>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Last updated{" "}
          <time dateTime={wallet.updated_at}>
            {formatDate(wallet.updated_at)}
          </time>
        </p>
      </CardContent>
    </Card>
  )
}

function SourceWalletCard({ wallet }: { wallet: Wallet }) {
  return (
    <Card className="border border-border shadow-none ring-0">
      <CardContent className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-muted">
            <WalletIcon
              className="size-3.5 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {wallet.currency_code} Wallet
          </span>
        </div>
        <span className="font-mono text-2xl font-semibold tracking-tight text-foreground tabular-nums">
          {formatBalance(wallet)}
        </span>
        <p className="mt-1 text-xs text-muted-foreground">
          {wallet.currency_code}
        </p>
      </CardContent>
    </Card>
  )
}

function WalletCardSkeleton() {
  return (
    <Card className="border border-border shadow-none ring-0">
      <CardContent className="flex flex-col gap-4 p-6">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  )
}

/* ----------------------------- Model usage cards --------------------------- */

function ModelUsageCard({
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

/* -------------------------- Transaction type badge ------------------------- */

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

/* ------------------------------ Top-up dialog ------------------------------ */

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

  const selectedWallet = sourceWallets.find(
    (w) => w.currency_code === sourceCurrency
  )

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
            <DialogTitle>Top Up Credits</DialogTitle>
            <DialogDescription>
              Credits are converted from another currency wallet your
              organisation holds.
            </DialogDescription>
          </DialogHeader>
          <Empty className="border-0 p-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CircleAlertIcon />
              </EmptyMedia>
              <EmptyTitle>No funding source available</EmptyTitle>
              <EmptyDescription>
                Your organisation doesn&apos;t hold a balance in any other
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
          <DialogTitle>Top Up Credits</DialogTitle>
          <DialogDescription>
            Convert balance from a source wallet into credits for your
            organisation.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 p-5">
          {/* Source wallet selector */}
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
            {selectedWallet && (
              <p className="text-xs text-muted-foreground">
                Available:{" "}
                <span className="font-mono font-medium text-foreground">
                  {formatBalance(selectedWallet)} {selectedWallet.currency_code}
                </span>
              </p>
            )}
          </div>

          {/* Amount */}
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

          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertTriangleIcon className="size-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-border px-5 py-4">
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting || !sourceCurrency || !amount}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Spinner className="size-4" aria-hidden="true" />
                Processing…
              </>
            ) : (
              "Confirm top up"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* -------------------------------------------------------------------------- */
/*                              Main WalletView                                */
/* -------------------------------------------------------------------------- */

export function WalletView() {
  const organization = useActiveOrganization()

  /* ---- wallets ---- */
  const [wallets, setWallets] = React.useState<Wallet[]>([])
  const [isLoadingWallets, setIsLoadingWallets] = React.useState(true)
  const [walletsError, setWalletsError] = React.useState<string | null>(null)

  /* ---- selected wallet for tx/usage ---- */
  const [selectedWalletId, setSelectedWalletId] = React.useState<string | null>(
    null
  )

  /* ---- transactions ---- */
  const [transactions, setTransactions] = React.useState<WalletTransaction[]>(
    []
  )
  const [isLoadingTransactions, setIsLoadingTransactions] =
    React.useState(false)
  const [transactionsError, setTransactionsError] = React.useState<
    string | null
  >(null)

  /* ---- model usage (credits wallet only) ---- */
  const [modelUsage, setModelUsage] = React.useState<ModelUsage[]>([])
  const [isLoadingUsage, setIsLoadingUsage] = React.useState(false)
  const [usagePeriod, setUsagePeriod] = React.useState<"month" | "all">("month")

  /* ---- top-up dialog ---- */
  const [topUpOpen, setTopUpOpen] = React.useState(false)

  /* ---- derived ---- */
  const creditsWallet = wallets.find((w) => w.currency_code === CREDIT_CURRENCY)
  const sourceWallets = wallets.filter(
    (w) => w.currency_code !== CREDIT_CURRENCY
  )
  const selectedWallet =
    wallets.find((w) => w.id === selectedWalletId) ??
    creditsWallet ??
    wallets[0] ??
    null
  const isCreditsWalletSelected =
    selectedWallet?.currency_code === CREDIT_CURRENCY

  /* ---- load wallets ---- */
  React.useEffect(() => {
    if (!organization) return
    setIsLoadingWallets(true)
    setWalletsError(null)
    fetchWallets(organization.id)
      .then((data) => {
        setWallets(data)
        const credits = data.find((w) => w.currency_code === CREDIT_CURRENCY)
        setSelectedWalletId(credits?.id ?? data[0]?.id ?? null)
      })
      .catch((err) =>
        setWalletsError(
          err instanceof ApiError ? err.message : "Failed to load wallets."
        )
      )
      .finally(() => setIsLoadingWallets(false))
  }, [organization])

  /* ---- load transactions whenever selected wallet changes ---- */
  React.useEffect(() => {
    if (!organization || !selectedWallet) return
    setIsLoadingTransactions(true)
    setTransactionsError(null)
    fetchWalletTransactions(organization.id, selectedWallet.id)
      .then(setTransactions)
      .catch((err) =>
        setTransactionsError(
          err instanceof ApiError ? err.message : "Failed to load transactions."
        )
      )
      .finally(() => setIsLoadingTransactions(false))
  }, [organization, selectedWallet])

  /* ---- load model usage for credits wallet ---- */
  React.useEffect(() => {
    if (!organization || !creditsWallet) return
    setIsLoadingUsage(true)
    fetchUsageByModel(organization.id, creditsWallet.id, usagePeriod)
      .then(setModelUsage)
      .catch(() => setModelUsage([]))
      .finally(() => setIsLoadingUsage(false))
  }, [organization, creditsWallet, usagePeriod])

  /* ---- total credits used for % calc ---- */
  const totalCreditsUsed = modelUsage.reduce((s, m) => s + m.credits_used, 0)

  /* ---- handlers ---- */
  function handleTopUpSuccess(updated: Wallet) {
    setWallets((prev) => prev.map((w) => (w.id === updated.id ? updated : w)))
    // refresh transactions
    if (organization && selectedWallet) {
      fetchWalletTransactions(organization.id, selectedWallet.id)
        .then(setTransactions)
        .catch(() => {})
    }
  }

  const transactionColumns = React.useMemo<
    ColumnDef<WalletTransaction>[]
  >(() => {
    const columns: ColumnDef<WalletTransaction>[] = [
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Date" />
        ),
        cell: ({ row }) => (
          <time dateTime={row.original.created_at}>
            {formatDateTime(row.original.created_at)}
          </time>
        ),
        meta: {
          label: "Date",
          cellClassName: "whitespace-nowrap text-xs text-muted-foreground",
        },
      },
      {
        accessorKey: "type",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) => <TransactionTypeBadge type={row.original.type} />,
        meta: { label: "Type" },
      },
      {
        accessorKey: "description",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Description" />
        ),
        cell: ({ row }) => row.original.description ?? "—",
        meta: {
          label: "Description",
          cellClassName: "max-w-[200px] truncate text-sm text-muted-foreground",
        },
      },
    ]

    if (isCreditsWalletSelected) {
      columns.push({
        accessorKey: "model",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Model" />
        ),
        cell: ({ row }) =>
          row.original.model ? (
            <span className="font-mono text-xs text-muted-foreground">
              {row.original.model}
            </span>
          ) : (
            "—"
          ),
        meta: {
          label: "Model",
          headerClassName: "hidden sm:table-cell",
          cellClassName: "hidden sm:table-cell",
        },
      })
    }

    columns.push(
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
              row.original.type === "credit"
                ? "text-primary"
                : "text-foreground"
            )}
          >
            {row.original.type === "credit" ? "+" : "-"}
            {Number(row.original.amount).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        ),
        meta: {
          label: "Amount",
          headerClassName: "text-right",
          cellClassName: "text-right",
        },
      },
      {
        id: "balance_after",
        accessorFn: (transaction) => Number(transaction.balance_after),
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Balance after"
            className="ml-auto"
          />
        ),
        cell: ({ row }) =>
          Number(row.original.balance_after).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
        meta: {
          label: "Balance after",
          headerClassName: "text-right",
          cellClassName:
            "text-right font-mono text-sm tabular-nums text-muted-foreground",
        },
      }
    )

    return columns
  }, [isCreditsWalletSelected])

  if (!organization) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-muted-foreground">No active organisation.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      {/* ------------------------------------------------------------------ */}
      {/*  Header                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Wallet
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your organisation&apos;s balances and top up credits.
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*  Wallet cards                                                        */}
      {/* ------------------------------------------------------------------ */}
      {walletsError ? (
        <Alert variant="destructive">
          <AlertTriangleIcon className="size-4" />
          <AlertTitle>Failed to load wallets</AlertTitle>
          <AlertDescription>{walletsError}</AlertDescription>
        </Alert>
      ) : isLoadingWallets ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <WalletCardSkeleton />
          <WalletCardSkeleton />
        </div>
      ) : wallets.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <WalletIcon />
            </EmptyMedia>
            <EmptyTitle>No wallets found</EmptyTitle>
            <EmptyDescription>
              Your organisation does not have any wallets yet.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Credits wallet hero card */}
          {creditsWallet && (
            <CreditsWalletCard
              wallet={creditsWallet}
              onTopUp={() => setTopUpOpen(true)}
            />
          )}

          {/* Source wallets grid */}
          {sourceWallets.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sourceWallets.map((w) => (
                <SourceWalletCard key={w.id} wallet={w} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/*  Model usage breakdown (credits wallet only)                         */}
      {/* ------------------------------------------------------------------ */}
      {!isLoadingWallets && creditsWallet && (
        <section
          aria-labelledby="usage-heading"
          className="flex flex-col gap-4"
        >
          <div className="flex items-center justify-between gap-4">
            <h2
              id="usage-heading"
              className="text-sm font-semibold text-foreground"
            >
              Usage by model
            </h2>
            <Select
              value={usagePeriod}
              onValueChange={(v) => setUsagePeriod(v as "month" | "all")}
            >
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">This month</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoadingUsage ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="border border-border shadow-none">
                  <CardContent className="flex flex-col gap-3 p-4">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-7 w-20" />
                    <Skeleton className="h-2 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : modelUsage.length === 0 ? (
            <Empty className="rounded-lg border border-border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CoinsIcon />
                </EmptyMedia>
                <EmptyTitle>No usage data</EmptyTitle>
                <EmptyDescription>
                  No model usage recorded for this period.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {modelUsage.map((m, i) => {
                const pct =
                  totalCreditsUsed > 0
                    ? Math.round((m.credits_used / totalCreditsUsed) * 100)
                    : 0
                return (
                  <ModelUsageCard
                    key={m.model}
                    usage={m}
                    pct={pct}
                    colorIndex={i}
                  />
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/*  Transaction history                                                 */}
      {/* ------------------------------------------------------------------ */}
      {!isLoadingWallets && wallets.length > 0 && (
        <section
          aria-labelledby="transactions-heading"
          className="flex flex-col gap-4"
        >
          <div className="flex items-center justify-between gap-4">
            <h2
              id="transactions-heading"
              className="text-sm font-semibold text-foreground"
            >
              Transaction history
            </h2>

            {/* Wallet selector */}
            {wallets.length > 1 && (
              <Select
                value={selectedWallet?.id ?? ""}
                onValueChange={setSelectedWalletId}
              >
                <SelectTrigger className="h-8 w-44 text-xs">
                  <SelectValue placeholder="Select wallet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {currencyLabel(w.currency_code)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {transactionsError ? (
            <Alert variant="destructive">
              <AlertTriangleIcon className="size-4" />
              <AlertTitle>Failed to load transactions</AlertTitle>
              <AlertDescription>{transactionsError}</AlertDescription>
            </Alert>
          ) : isLoadingTransactions ? (
            <Card className="border border-border shadow-none">
              <CardContent className="flex items-center justify-center p-8">
                <Spinner
                  className="size-5 text-muted-foreground"
                  aria-label="Loading transactions"
                />
              </CardContent>
            </Card>
          ) : transactions.length === 0 ? (
            <Empty className="rounded-lg border border-border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HistoryIcon />
                </EmptyMedia>
                <EmptyTitle>No transactions yet</EmptyTitle>
                <EmptyDescription>
                  Transactions for this wallet will appear here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Card className="border border-border shadow-none ring-0">
              <DataTable
                columns={transactionColumns}
                data={transactions}
                searchPlaceholder="Search wallet transactions…"
                searchableColumnIds={["type", "description", "model", "amount"]}
                className="p-3"
              />
            </Card>
          )}
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/*  Top-up dialog                                                       */}
      {/* ------------------------------------------------------------------ */}
      {topUpOpen && (
        <TopUpDialog
          organizationId={organization.id}
          sourceWallets={sourceWallets}
          onClose={() => setTopUpOpen(false)}
          onTopUp={handleTopUpSuccess}
        />
      )}
    </div>
  )
}
