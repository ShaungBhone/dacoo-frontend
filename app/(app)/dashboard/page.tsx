import { DashboardConsole } from "@/components/rag/dashboard-console"
import { RagProvider } from "@/components/rag/rag-context"
import { RightSidebar } from "@/components/right-sidebar"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

export default function Page() {
  return (
    <RagProvider>
      <ResizablePanelGroup
        orientation="horizontal"
        className="min-h-0 min-w-0 flex-1 overflow-hidden"
      >
        <ResizablePanel
          id="dashboard-main"
          defaultSize="75%"
          minSize="40%"
          className="min-w-0"
        >
          <div className="flex scrollbar-thin h-full min-w-0 flex-col gap-4 overflow-auto px-4 pt-4">
            <DashboardConsole />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <RightSidebar />
      </ResizablePanelGroup>
    </RagProvider>
  )
}
