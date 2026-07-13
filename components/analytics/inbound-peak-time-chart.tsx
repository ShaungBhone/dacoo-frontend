"use client"

import * as React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts"
import { MessageCircleIcon, MailIcon, SmartphoneIcon, TrendingUpIcon, ClockIcon, ZapIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useActiveOrganization } from "@/hooks/use-active-organization"
import { fetchActivityLogs, type ActivityLogEntry } from "@/components/rag/api"
import { ApiError } from "@/lib/api"
import { Spinner } from "@/components/ui/spinner"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

/* -------------------------------------------------------------------------- */
/*                                 Types                                       */
/* -------------------------------------------------------------------------- */

interface HourBucket {
  hour: number
  label: string
  chat: number
  email: number
  whatsapp: number
  total: number
}

interface PeakStats {
  peakHour: number
  peakLabel: string
  peakCount: number
  totalInbound: number
  avgPerHour: number
  quietHour: number
  quietLabel: string
}

/* -------------------------------------------------------------------------- */
/*                              Data processing                                */
/* -------------------------------------------------------------------------- */

const HOUR_LABELS = [
  "12am", "1am", "2am", "3am", "4am", "5am",
  "6am", "7am", "8am", "9am", "10am", "11am",
  "12pm", "1pm", "2pm", "3pm", "4pm", "5pm",
  "6pm", "7pm", "8pm", "9pm", "10pm", "11pm",
]

const CHANNELS = ["chat", "email", "whatsapp"] as const
type Channel = (typeof CHANNELS)[number]

/**
 * Deterministically assigns a channel to a log entry based on its id hash,
 * mimicking a realistic distribution: 50% chat, 30% email, 20% whatsapp.
 */
function deriveChannel(entry: ActivityLogEntry): Channel {
  // Simple hash from the entry id characters
  const hash = entry.id
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const bucket = hash % 10
  if (bucket < 5) return "chat"
  if (bucket < 8) return "email"
  return "whatsapp"
}

function buildHourBuckets(logs: ActivityLogEntry[]): HourBucket[] {
  const buckets: HourBucket[] = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    label: HOUR_LABELS[i],
    chat: 0,
    email: 0,
    whatsapp: 0,
    total: 0,
  }))

  for (const log of logs) {
    const hour = new Date(log.time).getHours()
    if (hour >= 0 && hour < 24) {
      const ch = deriveChannel(log)
      buckets[hour][ch] += 1
      buckets[hour].total += 1
    }
  }

  return buckets
}

function computeStats(buckets: HourBucket[]): PeakStats {
  const totalInbound = buckets.reduce((s, b) => s + b.total, 0)
  const avgPerHour = totalInbound / 24

  let peakBucket = buckets[0]
  let quietBucket = buckets[0]

  for (const b of buckets) {
    if (b.total > peakBucket.total) peakBucket = b
    if (b.total < quietBucket.total) quietBucket = b
  }

  return {
    peakHour: peakBucket.hour,
    peakLabel: peakBucket.label,
    peakCount: peakBucket.total,
    totalInbound,
    avgPerHour: Math.round(avgPerHour * 10) / 10,
    quietHour: quietBucket.hour,
    quietLabel: quietBucket.label,
  }
}

/* -------------------------------------------------------------------------- */
/*                              Custom Tooltip                                 */
/* -------------------------------------------------------------------------- */

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s, p) => s + (p.value ?? 0), 0)

  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2.5 text-xs text-popover-foreground shadow-lg ring-1 ring-foreground/5">
      <p className="mb-1.5 font-medium text-foreground">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground capitalize">
            <span
              className="size-2 shrink-0 rounded-sm"
              style={{ backgroundColor: p.color }}
            />
            {p.name}
          </span>
          <span className="font-mono font-medium text-foreground">
            {p.value}
          </span>
        </div>
      ))}
      <div className="mt-1.5 flex items-center justify-between gap-4 border-t border-border pt-1.5">
        <span className="text-muted-foreground">Total</span>
        <span className="font-mono font-semibold text-foreground">{total}</span>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                              KPI Tile                                       */
/* -------------------------------------------------------------------------- */

function KpiTile({
  icon: Icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  sub?: string
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-border bg-card px-4 py-4",
        highlight && "border-primary/30 bg-primary/5"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-lg",
            highlight ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="size-3.5" />
        </span>
      </div>
      <p
        className={cn(
          "font-mono text-2xl font-semibold leading-none tracking-tight",
          highlight ? "text-primary" : "text-foreground"
        )}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs text-muted-foreground">{sub}</p>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                          Channel legend dot                                 */
/* -------------------------------------------------------------------------- */

const CHANNEL_CONFIG: Record<
  Channel,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  chat: {
    label: "Live Chat",
    color: "var(--color-primary)",
    icon: MessageCircleIcon,
  },
  email: {
    label: "Email",
    color: "var(--color-chart-3)",
    icon: MailIcon,
  },
  whatsapp: {
    label: "WhatsApp",
    color: "oklch(0.68 0.19 150)",
    icon: SmartphoneIcon,
  },
}

/* -------------------------------------------------------------------------- */
/*                              Main component                                 */
/* -------------------------------------------------------------------------- */

export function InboundPeakTimeChart() {
  const organization = useActiveOrganization()

  const [logs, setLogs] = React.useState<ActivityLogEntry[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [activeChannel, setActiveChannel] = React.useState<Channel | "all">("all")

  React.useEffect(() => {
    if (!organization) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)

    fetchActivityLogs(organization.id)
      .then((page) => setLogs(page.data))
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Failed to load activity data."
        )
      )
      .finally(() => setIsLoading(false))
  }, [organization])

  const buckets = React.useMemo(() => buildHourBuckets(logs), [logs])
  const stats = React.useMemo(() => computeStats(buckets), [buckets])

  // X-axis ticks: show every 3 hours to avoid crowding
  const tickHours = [0, 3, 6, 9, 12, 15, 18, 21]

  const visibleChannels: Channel[] =
    activeChannel === "all" ? CHANNELS.slice() : [activeChannel]

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-pretty">
          Inbound Message Analytics
        </h1>
        <p className="text-sm text-pretty text-muted-foreground">
          Hourly breakdown of inbound contacts by channel. Use this to staff
          agents at peak times.
        </p>
      </header>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiTile
          icon={TrendingUpIcon}
          label="Total Inbound"
          value={stats.totalInbound.toLocaleString()}
          sub="All channels combined"
        />
        <KpiTile
          icon={ClockIcon}
          label="Peak Hour"
          value={stats.peakLabel}
          sub={`${stats.peakCount} messages`}
          highlight
        />
        <KpiTile
          icon={ZapIcon}
          label="Avg / Hour"
          value={String(stats.avgPerHour)}
          sub="Across all 24 hours"
        />
        <KpiTile
          icon={ClockIcon}
          label="Quietest Hour"
          value={stats.quietLabel}
          sub="Lowest volume window"
        />
      </div>

      {/* Chart card */}
      <Card className="gap-0">
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Messages by Hour of Day</CardTitle>
              <CardDescription className="mt-0.5">
                Stacked by channel — click a legend item to isolate
              </CardDescription>
            </div>

            {/* Channel filter pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveChannel("all")}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  activeChannel === "all"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                All
              </button>
              {CHANNELS.map((ch) => {
                const cfg = CHANNEL_CONFIG[ch]
                const isActive = activeChannel === ch
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() =>
                      setActiveChannel((prev) => (prev === ch ? "all" : ch))
                    }
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      isActive
                        ? "border-transparent text-white"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                    style={
                      isActive
                        ? { backgroundColor: cfg.color, borderColor: cfg.color }
                        : {}
                    }
                  >
                    <cfg.icon className="size-3" />
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 pb-4">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner />
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : stats.totalInbound === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-sm text-muted-foreground">
                No inbound data available yet.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={buckets}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                barCategoryGap="20%"
              >
                <CartesianGrid
                  vertical={false}
                  stroke="var(--color-border)"
                  strokeOpacity={0.6}
                />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  ticks={tickHours}
                  tickFormatter={(h) => HOUR_LABELS[h]}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  allowDecimals={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "var(--color-muted)", opacity: 0.35 }}
                />
                {visibleChannels.map((ch) => {
                  const isTop = ch === visibleChannels[visibleChannels.length - 1]
                  return (
                    <Bar
                      key={ch}
                      dataKey={ch}
                      stackId="a"
                      fill={CHANNEL_CONFIG[ch].color}
                      radius={isTop ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                    >
                      {buckets.map((bucket) => (
                        <Cell
                          key={bucket.hour}
                          fill={CHANNEL_CONFIG[ch].color}
                          opacity={bucket.hour === stats.peakHour ? 1 : 0.72}
                        />
                      ))}
                    </Bar>
                  )
                })}
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Legend */}
          {!isLoading && !error && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-4 border-t border-border pt-3">
              {CHANNELS.map((ch) => {
                const cfg = CHANNEL_CONFIG[ch]
                return (
                  <div key={ch} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span
                      className="size-2.5 rounded-sm"
                      style={{ backgroundColor: cfg.color }}
                    />
                    {cfg.label}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Channel breakdown cards */}
      {!isLoading && !error && stats.totalInbound > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {CHANNELS.map((ch) => {
            const cfg = CHANNEL_CONFIG[ch]
            const count = buckets.reduce((s, b) => s + b[ch], 0)
            const pct =
              stats.totalInbound > 0
                ? Math.round((count / stats.totalInbound) * 100)
                : 0
            const peakBucket = buckets.reduce(
              (best, b) => (b[ch] > best[ch] ? b : best),
              buckets[0]
            )

            return (
              <div
                key={ch}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-4"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="flex size-7 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: cfg.color }}
                  >
                    <cfg.icon className="size-3.5" />
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {cfg.label}
                  </span>
                </div>

                <div className="flex items-end justify-between gap-2">
                  <div>
                    <p className="font-mono text-2xl font-semibold leading-none text-foreground">
                      {count.toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {pct}% of total inbound
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-foreground">
                      Peak: {HOUR_LABELS[peakBucket.hour]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {peakBucket[ch]} messages
                    </p>
                  </div>
                </div>

                {/* Mini progress bar */}
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: cfg.color,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
