"use client"

import * as React from "react"
import { ChevronLeftIcon, RefreshCwIcon } from "lucide-react"
import type { Ticket } from "./data"
import { TicketHeader } from "./ticket-header"
import { TicketMessages } from "./ticket-messages"
import { ReplyComposer } from "./reply-composer"
import { CustomerContextPanel } from "./customer-context-panel"
import { Button } from "@/components/ui/button"

interface TicketDetailViewProps {
  ticket: Ticket
  onTicketUpdate: (ticket: Ticket) => void
  onClose?: () => void
}

export function TicketDetailView({ ticket, onTicketUpdate, onClose }: TicketDetailViewProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleReply = async (content: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const newMessage = {
        id: `msg_${Date.now()}`,
        author: "You",
        authorRole: "agent" as const,
        content,
        timestamp: new Date().toISOString(),
        channel: ticket.channel,
      }

      const updatedTicket = {
        ...ticket,
        messages: [...ticket.messages, newMessage],
      }

      onTicketUpdate(updatedTicket)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = (newStatus: string) => {
    const updatedTicket = {
      ...ticket,
      status: newStatus as any,
    }
    onTicketUpdate(updatedTicket)
  }

  const handleAssigneeChange = (newAssignee: string | null) => {
    const updatedTicket = {
      ...ticket,
      assignedTo: newAssignee,
    }
    onTicketUpdate(updatedTicket)
  }

  const handleAddTag = (tag: string) => {
    if (!ticket.tags.includes(tag)) {
      const updatedTicket = {
        ...ticket,
        tags: [...ticket.tags, tag],
      }
      onTicketUpdate(updatedTicket)
    }
  }

  const handleRemoveTag = (tag: string) => {
    const updatedTicket = {
      ...ticket,
      tags: ticket.tags.filter((t) => t !== tag),
    }
    onTicketUpdate(updatedTicket)
  }

  return (
    <div className="hidden flex-1 flex-col overflow-hidden md:flex">
      {/* Header with close button */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="px-2"
            >
              <ChevronLeftIcon className="size-5" />
            </Button>
          )}
          <h2 className="text-lg font-semibold text-foreground">Ticket Detail</h2>
        </div>
        <Button variant="ghost" size="sm" className="px-2">
          <RefreshCwIcon className="size-4" />
        </Button>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Ticket content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <TicketHeader
            ticket={ticket}
            onStatusChange={handleStatusChange}
            onAssigneeChange={handleAssigneeChange}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
          />

          {/* Messages */}
          <div className="flex-1 overflow-auto border-b border-border">
            <TicketMessages messages={ticket.messages} />
          </div>

          {/* Reply Composer */}
          <ReplyComposer onSubmit={handleReply} isLoading={isLoading} />
        </div>

        {/* Customer Context Sidebar */}
        <CustomerContextPanel customerId={ticket.customerId} />
      </div>
    </div>
  )
}
