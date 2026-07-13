"use client"

import * as React from "react"
import { AlertTriangleIcon } from "lucide-react"

import { ApiError } from "@/lib/api"
import { useActiveOrganization } from "@/hooks/use-active-organization"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  fetchCustomerProfile,
  refreshCustomerInsights,
} from "@/components/customers/api"
import type { Customer, InsightsState } from "@/components/customers/data"
import { CustomerHeader } from "@/components/customers/customer-header"
import { InsightsPanel } from "@/components/customers/insights-panel"
import { SaleHistoryPanel } from "@/components/customers/sale-history-panel"
import { ConversationsPanel } from "@/components/customers/conversations-panel"
import { CustomerInboxPanel } from "@/components/helpdesk/customer-inbox-panel"
import { HELPDESK_TICKETS } from "@/components/helpdesk/data"

/** How often to poll the profile while insights are regenerating. */
const INSIGHTS_POLL_INTERVAL_MS = 3000

export function CustomerProfileView({ customerId }: { customerId: string }) {
  const organization = useActiveOrganization()

  const [customer, setCustomer] = React.useState<Customer | null>(null)
  const [insightsState, setInsightsState] =
    React.useState<InsightsState>("pending")
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(() => {
    if (!organization) return Promise.resolve()
    return fetchCustomerProfile(organization.id, customerId)
      .then((profile) => {
        setCustomer(profile.customer)
        setInsightsState(profile.insightsState)
        setError(null)
      })
      .catch((err) => {
        setError(
          err instanceof ApiError ? err.message : "Failed to load customer."
        )
      })
  }, [organization, customerId])

  React.useEffect(() => {
    setIsLoading(true)
    load().finally(() => setIsLoading(false))
  }, [load])

  React.useEffect(() => {
    if (insightsState !== "generating") return
    const timer = setInterval(() => void load(), INSIGHTS_POLL_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [insightsState, load])

  const handleRefreshInsights = React.useCallback(async () => {
    if (!organization) return
    const previousState = insightsState
    setInsightsState("generating")
    try {
      const state = await refreshCustomerInsights(organization.id, customerId)
      setInsightsState(state)
    } catch {
      setInsightsState(previousState)
    }
  }, [organization, customerId, insightsState])

  if (!organization) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-muted-foreground">No active organisation.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">
        <Alert variant="destructive">
          <AlertTriangleIcon className="size-4" />
          <AlertTitle>Failed to load customer</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isLoading || !customer) {
    return (
      <div className="flex flex-1 flex-col overflow-auto bg-background text-foreground">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-6 lg:col-span-2">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-56 w-full rounded-xl" />
            </div>
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
        <CustomerHeader customer={customer} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <InsightsPanel
              state={insightsState}
              insights={customer.insights}
              onRefresh={handleRefreshInsights}
            />
            <SaleHistoryPanel sales={customer.sales} />
          </div>

          {/* Side column */}
          <div className="flex flex-col gap-6">
            <ConversationsPanel conversations={customer.conversations} />
            <CustomerInboxPanel tickets={HELPDESK_TICKETS.filter((t) => t.customerId === customer.id)} />
          </div>
        </div>
      </div>
    </div>
  )
}
