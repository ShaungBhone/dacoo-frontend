"use client"

import * as React from "react"
import Link from "next/link"
import { SearchIcon, AlertTriangleIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { ApiError } from "@/lib/api"
import { useActiveOrganization } from "@/hooks/use-active-organization"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { fetchCustomers } from "@/components/customers/api"
import type { CustomerListItem, LifecycleStage } from "@/components/customers/data"
import { formatRelative } from "@/components/customers/format"

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

const SEARCH_DEBOUNCE_MS = 300

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
}

function RosterSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <ul className="divide-y divide-border">
        {[0, 1, 2, 3, 4].map((i) => (
          <li key={i} className="flex items-center gap-3 px-4 py-3.5">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function CustomersListView() {
  const organization = useActiveOrganization()

  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [customers, setCustomers] = React.useState<CustomerListItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [search])

  React.useEffect(() => {
    if (!organization) return
    setIsLoading(true)
    setError(null)
    fetchCustomers(organization.id, { search: debouncedSearch || undefined })
      .then(setCustomers)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Failed to load customers."
        )
      )
      .finally(() => setIsLoading(false))
  }, [organization, debouncedSearch])

  if (!organization) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-muted-foreground">No active organisation.</p>
      </div>
    )
  }

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

        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <SearchIcon
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name, company, or email…"
            className="h-auto border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
          />
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertTriangleIcon className="size-4" />
            <AlertTitle>Failed to load customers</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : isLoading ? (
          <RosterSkeleton />
        ) : customers.length === 0 ? (
          <Empty className="rounded-xl border border-border bg-card">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchIcon />
              </EmptyMedia>
              <EmptyTitle>No customers found</EmptyTitle>
              <EmptyDescription>
                {debouncedSearch
                  ? "Try a different search term."
                  : "Customers will appear here once contacts start messaging your team."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <ul className="divide-y divide-border">
              {customers.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/customers/${c.id}`}
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
                      <span className="text-xs text-muted-foreground">
                        {c.conversationsCount} conversation
                        {c.conversationsCount === 1 ? "" : "s"}
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
        )}
      </div>
    </div>
  )
}
