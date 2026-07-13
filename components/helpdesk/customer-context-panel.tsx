"use client"

import { CUSTOMER } from "@/components/customers/data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/components/customers/format"
import Link from "next/link"

interface CustomerContextPanelProps {
  customerId: string
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
}

export function CustomerContextPanel({ customerId }: CustomerContextPanelProps) {
  // In a real app, fetch by customerId. For now, use the mock customer
  const customer = CUSTOMER

  return (
    <div className="hidden w-72 flex-col overflow-auto border-l border-border bg-muted/30 p-4 lg:flex">
      {/* Customer Header */}
      <div className="mb-4 flex flex-col gap-3">
        <Link
          href={`/customers/${customer.id}`}
          className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
        >
          <Avatar className="size-12">
            {customer.avatar ? <AvatarImage src={customer.avatar} alt="" /> : null}
            <AvatarFallback>{initials(customer.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground group-hover:text-primary">
              {customer.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
            <p className="text-xs text-muted-foreground">{customer.company}</p>
          </div>
        </Link>
      </div>

      {/* Life Cycle Stage */}
      <div className="mb-4 space-y-2 rounded-lg border border-border bg-background p-3">
        <p className="text-xs font-semibold text-muted-foreground">Status</p>
        <Badge className="inline-block">
          {customer.stage.charAt(0).toUpperCase() + customer.stage.slice(1)}
        </Badge>
      </div>

      {/* Sales Information */}
      <div className="mb-4 space-y-3 rounded-lg border border-border bg-background p-3">
        <p className="text-xs font-semibold text-muted-foreground">Sales History</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Lifetime Spend</p>
            <p className="font-mono text-sm font-semibold text-foreground">
              {formatCurrency(customer.sales.lifetimeSpend)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Orders</p>
            <p className="font-mono text-sm font-semibold text-foreground">
              {customer.sales.orderCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg Order</p>
            <p className="font-mono text-sm font-semibold text-foreground">
              {formatCurrency(customer.sales.averageOrderValue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Last Order</p>
            <p className="font-mono text-sm font-semibold text-foreground">
              {new Date(customer.sales.lastOrderDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      {customer.insights && (
        <div className="space-y-3 rounded-lg border border-border bg-background p-3">
          <p className="text-xs font-semibold text-muted-foreground">AI Insights</p>
          <p className="text-xs leading-relaxed text-foreground">
            {customer.insights.summary}
          </p>
          {customer.insights.preferences.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Key Preferences</p>
              <ul className="space-y-1">
                {customer.insights.preferences.slice(0, 2).map((pref, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{pref.category}:</span> {pref.detail}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
