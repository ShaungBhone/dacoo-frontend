"use client"

import * as React from "react"

import {
  CUSTOMER,
  regenerateInsights,
  type CustomerInsights,
  type InsightsState,
} from "@/components/customers/data"
import { CustomerHeader } from "@/components/customers/customer-header"
import { InsightsPanel } from "@/components/customers/insights-panel"
import { SaleHistoryPanel } from "@/components/customers/sale-history-panel"
import { ConversationsPanel } from "@/components/customers/conversations-panel"

export function CustomerProfileView() {
  const customer = CUSTOMER

  const [insights, setInsights] = React.useState<CustomerInsights | null>(
    customer.insights
  )
  const [insightsState, setInsightsState] = React.useState<InsightsState>(
    customer.insights ? "ready" : "pending"
  )

  const handleRefreshInsights = React.useCallback(async () => {
    setInsightsState("generating")
    try {
      const next = await regenerateInsights()
      setInsights(next)
      setInsightsState("ready")
    } catch {
      // Fall back to whatever we had before; keep prior data if present.
      setInsightsState(insights ? "ready" : "pending")
    }
  }, [insights])

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
        <CustomerHeader customer={customer} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <InsightsPanel
              state={insightsState}
              insights={insights}
              onRefresh={handleRefreshInsights}
            />
            <SaleHistoryPanel sales={customer.sales} />
          </div>

          {/* Side column */}
          <div className="flex flex-col gap-6">
            <ConversationsPanel conversations={customer.conversations} />
          </div>
        </div>
      </div>
    </div>
  )
}
