import { Suspense } from "react"
import { AgentsView } from "@/components/agents-view"
import { Spinner } from "@/components/ui/spinner"

export default function AgentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 flex-col items-center justify-center min-h-[400px]">
          <Spinner className="size-8 text-primary animate-spin" />
          <p className="text-sm font-medium text-muted-foreground mt-2">Loading Agents...</p>
        </div>
      }
    >
      <AgentsView />
    </Suspense>
  )
}

