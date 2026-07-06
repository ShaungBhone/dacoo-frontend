"use client"

import {
  DollarSignIcon,
  ShoppingBagIcon,
  TrendingUpIcon,
  ClockIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { OrderStatus, SaleHistory } from "@/components/customers/data"
import { formatCurrency, formatDate } from "@/components/customers/format"

const STATUS_STYLES: Record<OrderStatus, string> = {
  paid: "bg-primary/10 text-primary",
  fulfilled:
    "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-400",
  pending: "bg-chart-3/15 text-chart-4 dark:text-chart-2",
  refunded: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  paid: "Paid",
  fulfilled: "Fulfilled",
  pending: "Pending",
  refunded: "Refunded",
  cancelled: "Cancelled",
}

export function SaleHistoryPanel({ sales }: { sales: SaleHistory }) {
  const stats = [
    {
      icon: DollarSignIcon,
      label: "Lifetime spend",
      value: formatCurrency(sales.lifetimeSpend),
    },
    {
      icon: ShoppingBagIcon,
      label: "Orders",
      value: sales.orderCount.toString(),
    },
    {
      icon: TrendingUpIcon,
      label: "Avg. order value",
      value: formatCurrency(sales.averageOrderValue),
    },
    {
      icon: ClockIcon,
      label: "Last order",
      value: formatDate(sales.lastOrderDate),
    },
  ]

  return (
    <section className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <header className="flex items-center justify-between gap-2 border-b border-border px-5 py-3.5">
        <h2 className="text-sm font-semibold text-foreground">Sale history</h2>
        <span className="text-xs text-muted-foreground">
          {sales.orders.length} recent orders
        </span>
      </header>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-px bg-border lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-1.5 bg-card p-4">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <s.icon className="size-3.5" aria-hidden="true" />
              <span className="text-xs">{s.label}</span>
            </div>
            <span className="font-mono text-lg font-semibold tracking-tight text-foreground tabular-nums">
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* Orders table */}
      <div className="border-t border-border">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-5 py-2.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Order
              </TableHead>
              <TableHead className="hidden px-4 py-2.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase sm:table-cell">
                Date
              </TableHead>
              <TableHead className="px-4 py-2.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Status
              </TableHead>
              <TableHead className="px-5 py-2.5 text-right text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Total
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.orders.map((order) => (
              <TableRow key={order.number} className="hover:bg-muted/20">
                <TableCell className="px-5 py-3">
                  <span className="font-mono text-sm font-medium text-foreground tabular-nums">
                    {order.number}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground sm:hidden">
                    {formatDate(order.date)}
                  </span>
                </TableCell>
                <TableCell className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">
                  {formatDate(order.date)}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Badge
                    className={cn(
                      "border-transparent",
                      STATUS_STYLES[order.status]
                    )}
                  >
                    {STATUS_LABEL[order.status]}
                  </Badge>
                </TableCell>
                <TableCell className="px-5 py-3 text-right font-mono text-sm font-medium text-foreground tabular-nums">
                  {formatCurrency(order.total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
