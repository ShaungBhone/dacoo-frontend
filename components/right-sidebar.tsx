"use client"

import * as React from "react"
import { PanelRightIcon } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ResizablePanel } from "@/components/ui/resizable"
import { useRightSidebar } from "@/components/right-sidebar-provider"
import { ChunksList } from "@/components/rag/chunks-list"
import { ConfigRail } from "@/components/rag/config-rail"
import { KnowledgeBase } from "@/components/rag/knowledge-base"
import { useRag } from "@/components/rag/rag-context"

export function RightSidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggle } = useRightSidebar()
  return (
    <Button
      data-slot="right-sidebar-trigger"
      variant="ghost"
      size="icon-sm"
      className={className}
      onClick={(event) => {
        onClick?.(event)
        toggle()
      }}
      {...props}
    >
      <PanelRightIcon />
      <span className="sr-only">Toggle Right Sidebar</span>
    </Button>
  )
}

export function RightSidebar() {
  const { panelRef, _onPanelCollapse, _onPanelExpand } = useRightSidebar()
  const { runResult } = useRag()

  return (
    <ResizablePanel
      panelRef={panelRef}
      id="right-sidebar"
      defaultSize="25%"
      minSize="15%"
      maxSize="45%"
      collapsible
      collapsedSize="0%"
      onResize={(size) => {
        if (size.asPercentage <= 0) _onPanelCollapse()
        else _onPanelExpand()
      }}
      className="min-w-0"
      style={
        {
          "--sidebar-width": "100%",
        } as React.CSSProperties
      }
    >
      <Sidebar side="right" collapsible="none" className="h-full">
        <SidebarContent className="gap-5 px-3 py-4">
          <ConfigRail />
          {runResult && (
            <>
              <SidebarSeparator className="mx-0" />
              <ChunksList chunks={runResult.chunks} />
            </>
          )}
          <SidebarSeparator className="mx-0" />
          <KnowledgeBase />
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
    </ResizablePanel>
  )
}
