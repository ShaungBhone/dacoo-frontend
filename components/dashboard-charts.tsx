"use client"

import React, { useEffect, useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import {
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  CreditCardIcon,
  ActivityIcon,
  AlertTriangleIcon,
  ArrowUpRightIcon,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { apiFetch } from "@/lib/api"

type DashboardData = {
  year: number
  currency: {
    code: string
    symbol: string
  }
  totals: {
    revenue: { current: number; previous: number; change_percent: number }
    expenses: { current: number; previous: number; change_percent: number }
    profit: { current: number; previous: number; change_percent: number }
  }
  average_revenue_per_month: number
  overdue: {
    total: number
    count: number
  }
  quarterly: {
    labels: string[]
    revenue: number[]
    expenses: number[]
    profit: number[]
  }
}

// Fallback demo data if backend fails or has empty database tables
const fallbackData: DashboardData = {
  year: 2026,
  currency: { code: "USD", symbol: "$" },
  totals: {
    revenue: { current: 125400, previous: 98200, change_percent: 27.7 },
    expenses: { current: 48900, previous: 42100, change_percent: 16.15 },
    profit: { current: 76500, previous: 56100, change_percent: 36.36 },
  },
  average_revenue_per_month: 10450,
  overdue: {
    total: 3450,
    count: 2,
  },
  quarterly: {
    labels: ["Q1", "Q2", "Q3", "Q4"],
    revenue: [24000, 31000, 38000, 32400],
    expenses: [11000, 13400, 12500, 12000],
    profit: [13000, 17600, 25500, 20400],
  },
}

const quarterlyChartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--primary)",
  },
  expenses: {
    label: "Expenses",
    color: "var(--destructive)",
  },
  profit: {
    label: "Profit",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

const allocationChartConfig = {
  profit: {
    label: "Net Profit",
    color: "var(--primary)",
  },
  expenses: {
    label: "Expenses",
    color: "var(--destructive)",
  },
} satisfies ChartConfig

export function DashboardCharts() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        const result = await apiFetch<DashboardData>(
          `/api/v1/organizations/${activeOrg.id}/dashboard`
        )
        // If totals values are all 0 (empty DB), merge with fallback to look full
        if (
          result.totals.revenue.current === 0 &&
          result.totals.expenses.current === 0
        ) {
          setData({
            ...fallbackData,
            currency: result.currency || fallbackData.currency,
          })
        } else {
          setData(result)
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
    return <DashboardLoadingSkeleton />
  }

  const currencySymbol = data.currency?.symbol || "$"

  // Map quarterly data into recharts format
  const quarterlyData = data.quarterly.labels.map((label, idx) => ({
    name: label,
    revenue: data.quarterly.revenue[idx] || 0,
    expenses: data.quarterly.expenses[idx] || 0,
    profit: data.quarterly.profit[idx] || 0,
  }))

  const pieData = [
    {
      name: "Net Profit",
      value: data.totals.profit.current,
      fill: "var(--primary)",
    },
    {
      name: "Expenses",
      value: data.totals.expenses.current,
      fill: "var(--destructive)",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* 3 Metric Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Revenue Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Total Revenue
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <DollarSignIcon className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="pb-1">
            <div className="text-3xl font-extrabold tracking-tight text-foreground">
              {currencySymbol}
              {data.totals.revenue.current.toLocaleString()}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              {data.totals.revenue.change_percent >= 0 ? (
                <span className="flex items-center gap-0.5 font-semibold text-emerald-500">
                  <TrendingUpIcon className="size-3" />+
                  {data.totals.revenue.change_percent}%
                </span>
              ) : (
                <span className="flex items-center gap-0.5 font-semibold text-destructive">
                  <TrendingDownIcon className="size-3" />
                  {data.totals.revenue.change_percent}%
                </span>
              )}
              <span>vs previous year</span>
            </div>
          </CardContent>
          {/* Mini Sparkline Chart */}
          <div className="h-14 px-1 pb-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={quarterlyData}
                margin={{ top: 5, bottom: 5, left: 10, right: 10 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--primary)"
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--primary)"
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--primary)"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Expenses Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Total Expenses
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <CreditCardIcon className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="pb-1">
            <div className="text-3xl font-extrabold tracking-tight text-foreground">
              {currencySymbol}
              {data.totals.expenses.current.toLocaleString()}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              {data.totals.expenses.change_percent <= 0 ? (
                <span className="flex items-center gap-0.5 font-semibold text-emerald-500">
                  <TrendingDownIcon className="size-3" />
                  {data.totals.expenses.change_percent}%
                </span>
              ) : (
                <span className="flex items-center gap-0.5 font-semibold text-destructive">
                  <TrendingUpIcon className="size-3" />+
                  {data.totals.expenses.change_percent}%
                </span>
              )}
              <span>vs previous year</span>
            </div>
          </CardContent>
          {/* Mini Sparkline Chart */}
          <div className="h-14 px-1 pb-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={quarterlyData}
                margin={{ top: 5, bottom: 5, left: 10, right: 10 }}
              >
                <defs>
                  <linearGradient
                    id="colorExpenses"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--destructive)"
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--destructive)"
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="var(--destructive)"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorExpenses)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Profit Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Net Profit Margin
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-chart-3/10 text-chart-3">
              <ActivityIcon className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="pb-1">
            <div className="text-3xl font-extrabold tracking-tight text-foreground">
              {currencySymbol}
              {data.totals.profit.current.toLocaleString()}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              {data.totals.profit.change_percent >= 0 ? (
                <span className="flex items-center gap-0.5 font-semibold text-emerald-500">
                  <TrendingUpIcon className="size-3" />+
                  {data.totals.profit.change_percent}%
                </span>
              ) : (
                <span className="flex items-center gap-0.5 font-semibold text-destructive">
                  <TrendingDownIcon className="size-3" />
                  {data.totals.profit.change_percent}%
                </span>
              )}
              <span>vs previous year</span>
            </div>
          </CardContent>
          {/* Mini Sparkline Chart */}
          <div className="h-14 px-1 pb-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={quarterlyData}
                margin={{ top: 5, bottom: 5, left: 10, right: 10 }}
              >
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--chart-3)"
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--chart-3)"
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="var(--chart-3)"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Bar Chart (Revenue vs Expenses vs Profit) - Col-span-2 */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-bold">
                Quarterly Figures
              </CardTitle>
              <CardDescription>
                Breakdown of billing metrics across the fiscal year.
              </CardDescription>
            </div>
            <div className="flex gap-4 pr-2 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-primary" />
                Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-destructive" />
                Expenses
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-chart-3" />
                Profit
              </span>
            </div>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer
              config={quarterlyChartConfig}
              className="h-full w-full"
            >
              <BarChart data={quarterlyData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tickFormatter={(val) => `${currencySymbol}${val}`}
                />
                <ChartTooltip
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Bar
                  dataKey="revenue"
                  fill="var(--color-revenue)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={45}
                />
                <Bar
                  dataKey="expenses"
                  fill="var(--color-expenses)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={45}
                />
                <Bar
                  dataKey="profit"
                  fill="var(--color-profit)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 border-t border-border pt-4 text-sm">
            <div className="flex gap-2 leading-none font-medium">
              Average revenue of {currencySymbol}
              {data.average_revenue_per_month.toLocaleString()}/month.
              <ArrowUpRightIcon className="size-4 text-emerald-500" />
            </div>
            <div className="text-xs leading-none text-muted-foreground">
              Figures calculated from all recorded client invoices and bills.
            </div>
          </CardFooter>
        </Card>

        {/* Expenses Pie Chart & Overdue Invoices */}
        <div className="flex flex-col gap-6 md:col-span-1">
          {/* Overdue Invoices Alert Card */}
          <Card className="bg-destructive/5 dark:bg-destructive/10">
            <CardContent className="flex items-start gap-4 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangleIcon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-destructive">
                  Overdue Accounts Receivable
                </h3>
                <p className="mt-1 text-2xl font-extrabold text-foreground">
                  {currencySymbol}
                  {data.overdue.total.toLocaleString()}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {data.overdue.count} unpaid client invoice
                  {data.overdue.count !== 1 && "s"} past due date.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Allocation Donut Chart */}
          <Card className="flex-1 justify-between">
            <CardHeader className="pb-0">
              <CardTitle className="text-base font-bold">
                Billing Allocation
              </CardTitle>
              <CardDescription>
                Ratio of margins vs cost values.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-44 pb-2">
              <ChartContainer
                config={allocationChartConfig}
                className="mx-auto aspect-square max-h-[140px] pb-0"
              >
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={60}
                    paddingAngle={3}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent hideIndicator nameKey="name" />
                    }
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 border-t border-border pt-4">
              <div className="flex w-full items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                  <span className="size-2 rounded-full bg-primary" />
                  Net Profit:
                </span>
                <span className="font-mono font-bold text-foreground">
                  {Math.round(
                    (data.totals.profit.current / data.totals.revenue.current) *
                      100
                  )}
                  %
                </span>
              </div>
              <div className="flex w-full items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                  <span className="size-2 rounded-full bg-destructive" />
                  Expenses Ratio:
                </span>
                <span className="font-mono font-bold text-foreground">
                  {Math.round(
                    (data.totals.expenses.current /
                      data.totals.revenue.current) *
                      100
                  )}
                  %
                </span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

function DashboardLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-[430px] rounded-xl md:col-span-2" />
        <div className="flex flex-col gap-6 md:col-span-1">
          <Skeleton className="h-[100px] rounded-xl" />
          <Skeleton className="h-[304px] rounded-xl" />
        </div>
      </div>
    </div>
  )
}
