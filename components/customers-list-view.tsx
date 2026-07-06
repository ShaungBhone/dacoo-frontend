"use client"

import Link from "next/link"
import { SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CUSTOMER, type LifecycleStage } from "@/components/customers/data"
import { formatCurrency, formatRelative } from "@/components/customers/format"

const STAGE_STYLES: Record<LifecycleStage, string> = {
  lead: "bg-chart-3/15 text-chart-4 dark:text-chart-2",
  active:
    "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-400",
  churned: "bg-destructive/10 text-destructive",
}

const STAGE_LABEL: Record<LifecycleStage, string> = {
  lead: "Lead",
  active: "Active",
  churned: "Churned",
}

// A small roster; the primary customer links to the full profile page.
const ROSTER = [
  {
    ...CUSTOMER,
    lastActive: CUSTOMER.conversations[0]?.timestamp ?? CUSTOMER.customerSince,
    href: `/customers/${CUSTOMER.id}`,
  },
  {
    id: "cus_3b19c7",
    name: "Marcus Feldman",
    avatar: "",
    company: "Bright Harbor Logistics",
    email: "marcus@brightharbor.io",
    stage: "lead" as LifecycleStage,
    sales: { lifetimeSpend: 0 },
    lastActive: "2026-07-03T10:15:00Z",
    href: `/customers/${CUSTOMER.id}`,
  },
  {
    id: "cus_9d55e2",
    name: "Yuki Tanaka",
    avatar: "",
    company: "Meridian Studio",
    email: "yuki.tanaka@meridian.design",
    stage: "churned" as LifecycleStage,
    sales: { lifetimeSpend: 12840 },
    lastActive: "2026-04-22T08:40:00Z",
    href: `/customers/${CUSTOMER.id}`,
  },
]

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
}

export function CustomersListView() {
  return (
    <div className="flex flex-1 flex-col overflow-auto bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">Customers</h1>
          <p className="text-sm text-pretty text-muted-foreground">
            Browse the people and companies your team supports. Select a
            customer to open their full profile.
          </p>
        </header>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
          <SearchIcon className="size-4" aria-hidden="true" />
          <span>Search customers by name, company, or email…</span>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <ul className="divide-y divide-border">
            {ROSTER.map((c) => (
              <li key={c.id}>
                <Link
                  href={c.href}
                  className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/30"
                >
                  <Avatar className="size-9">
                    {c.avatar ? <AvatarImage src={c.avatar} alt="" /> : null}
                    <AvatarFallback className="text-xs font-medium">
                      {initials(c.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-foreground">
                        {c.name}
                      </span>
                      <Badge
                        className={cn(
                          "border-transparent",
                          STAGE_STYLES[c.stage]
                        )}
                      >
                        {STAGE_LABEL[c.stage]}
                      </Badge>
                    </div>
                    <span className="truncate text-xs text-muted-foreground">
                      {c.company} · {c.email}
                    </span>
                  </div>

                  <div className="hidden shrink-0 flex-col items-end sm:flex">
                    <span className="font-mono text-sm font-medium text-foreground tabular-nums">
                      {formatCurrency(c.sales.lifetimeSpend)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Active {formatRelative(c.lastActive)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
