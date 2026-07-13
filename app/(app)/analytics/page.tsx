import { InboundPeakTimeChart } from "@/components/analytics/inbound-peak-time-chart"

export default function AnalyticsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
        <InboundPeakTimeChart />
      </div>
    </div>
  )
}
