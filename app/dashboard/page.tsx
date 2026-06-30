import { AppSidebar } from "@/components/app-sidebar"
import { DashboardConsole } from "@/components/rag/dashboard-console"
import { RagProvider } from "@/components/rag/rag-context"
import { RightSidebar, RightSidebarTrigger } from "@/components/right-sidebar"
import { RightSidebarProvider } from "@/components/right-sidebar-provider"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function Page() {
  return (
    <RagProvider>
      <RightSidebarProvider>
        <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="h-svh min-w-0 overflow-hidden">
          <ResizablePanelGroup
            orientation="horizontal"
            className="min-w-0 flex-1 overflow-hidden"
          >
            <ResizablePanel
              id="dashboard-main"
              defaultSize="75%"
              minSize="40%"
              className="min-w-0"
            >
              <div className="flex h-full min-w-0 flex-col overflow-hidden">
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                  <div className="flex flex-1 items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                      orientation="vertical"
                      className="mr-2 data-vertical:h-4 data-vertical:self-auto"
                    />
                    <Breadcrumb>
                      <BreadcrumbList>
                        <BreadcrumbItem className="hidden md:block">
                          <BreadcrumbLink href="#">
                            Dacoo Workspace
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem>
                          <BreadcrumbPage>Dashboard</BreadcrumbPage>
                        </BreadcrumbItem>
                      </BreadcrumbList>
                    </Breadcrumb>
                    <RightSidebarTrigger className="ml-auto" />
                  </div>
                </header>
                <div className="scrollbar-thin flex flex-1 flex-col gap-4 overflow-auto p-4">
                  <DashboardConsole />
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <RightSidebar />
          </ResizablePanelGroup>
        </SidebarInset>
        </SidebarProvider>
      </RightSidebarProvider>
    </RagProvider>
  )
}
