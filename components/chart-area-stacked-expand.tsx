"use client"

import React, { useEffect, useState } from "react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { apiFetch } from "@/lib/api"

export const description = "A stacked area chart with expand stacking"

type DashboardResponse = {
  year: number
  quarterly: {
    labels: string[]
    revenue: number[]
    expenses: number[]
    profit: number[]
  }
  totals: {
    profit: { change_percent: number }
  }
}

// Fallback demo data if the backend fails or has no organization yet
const fallbackData: DashboardResponse = {
  year: 2026,
  quarterly: {
    labels: ["Q1", "Q2", "Q3", "Q4"],
    revenue: [24000, 31000, 38000, 32400],
    expenses: [11000, 13400, 12500, 12000],
    profit: [13000, 17600, 25500, 20400],
  },
  totals: {
    profit: { change_percent: 5.2 },
  },
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
  expenses: {
    label: "Expenses",
    color: "var(--chart-2)",
  },
  profit: {
    label: "Profit",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

export function ChartAreaStackedExpand() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const activeOrg = user?.organizations?.[0]

  useEffect(() => {
    async function loadDashboard() {
      if (!activeOrg) {
        setData(fallbackData)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const raw = await apiFetch<DashboardResponse | { data: DashboardResponse }>(
          `/api/v1/organizations/${activeOrg.id}/dashboard`
        )
        // Laravel JsonResource wraps the body in a top-level `data` key
        const payload = ((raw as { data?: DashboardResponse }).data ??
          raw) as DashboardResponse
        // If quarterly data is empty/missing, fall back to demo data
        if (!payload?.quarterly?.labels?.length) {
          setData(fallbackData)
        } else {
          setData(payload)
        }
      } catch (err) {
        console.warn(
          "Failed to fetch live dashboard, using fallback demo data:",
          err
        )
        setData(fallbackData)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [activeOrg])

  if (isLoading || !data) {
    return <Skeleton className="h-[24rem] w-full rounded-xl" />
  }

  const { quarterly } = data
  const chartData = quarterly.labels.map((quarter, idx) => ({
    quarter,
    revenue: quarterly.revenue[idx] ?? 0,
    expenses: quarterly.expenses[idx] ?? 0,
    profit: quarterly.profit[idx] ?? 0,
  }))

  const profitChange = data.totals?.profit?.change_percent ?? 0
  const trendingUp = profitChange >= 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Composition</CardTitle>
        <CardDescription>
          Share of revenue, expenses, and profit per quarter in {data.year}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
            }}
            stackOffset="expand"
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="quarter"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="profit"
              type="natural"
              fill="var(--color-profit)"
              fillOpacity={0.1}
              stroke="var(--color-profit)"
              stackId="a"
            />
            <Area
              dataKey="expenses"
              type="natural"
              fill="var(--color-expenses)"
              fillOpacity={0.4}
              stroke="var(--color-expenses)"
              stackId="a"
            />
            <Area
              dataKey="revenue"
              type="natural"
              fill="var(--color-revenue)"
              fillOpacity={0.4}
              stroke="var(--color-revenue)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {trendingUp ? (
                <>
                  Trending up by {profitChange}% this year{" "}
                  <TrendingUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Trending down by {Math.abs(profitChange)}% this year{" "}
                  <TrendingDown className="h-4 w-4" />
                </>
              )}
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Q1 - Q4 {data.year}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
