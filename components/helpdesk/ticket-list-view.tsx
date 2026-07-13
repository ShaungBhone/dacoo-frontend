"use client"

import * as React from "react"
import { SearchIcon, XIcon } from "lucide-react"
import type { Ticket } from "./data"
import { TicketListItem } from "./ticket-list-item"
import { TicketFilters } from "./ticket-filters"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface TicketListViewProps {
  tickets: Ticket[]
  selectedTicket: Ticket | null
  onSelectTicket: (ticket: Ticket) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  filterStatus: string | null
  onFilterStatusChange: (status: string | null) => void
  filterChannel: string | null
  onFilterChannelChange: (channel: string | null) => void
  filterPriority: string | null
  onFilterPriorityChange: (priority: string | null) => void
  filterAssignee: string | null
  onFilterAssigneeChange: (assignee: string | null) => void
}

export function TicketListView({
  tickets,
  selectedTicket,
  onSelectTicket,
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterChannel,
  onFilterChannelChange,
  filterPriority,
  onFilterPriorityChange,
  filterAssignee,
  onFilterAssigneeChange,
}: TicketListViewProps) {
  const hasActiveFilters =
    filterStatus || filterChannel || filterPriority || filterAssignee || searchQuery

  const handleClearFilters = () => {
    onSearchChange("")
    onFilterStatusChange(null)
    onFilterChannelChange(null)
    onFilterPriorityChange(null)
    onFilterAssigneeChange(null)
  }

  return (
    <div className="flex w-full flex-col overflow-hidden border-r border-border md:w-96">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border px-4 py-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-foreground">Help Desk</h1>
          <p className="text-xs text-muted-foreground">
            {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>

        {/* Filters */}
        <TicketFilters
          filterStatus={filterStatus}
          onFilterStatusChange={onFilterStatusChange}
          filterChannel={filterChannel}
          onFilterChannelChange={onFilterChannelChange}
          filterPriority={filterPriority}
          onFilterPriorityChange={onFilterPriorityChange}
          filterAssignee={filterAssignee}
          onFilterAssigneeChange={onFilterAssigneeChange}
        />

        {/* Clear filters button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="justify-start text-xs"
          >
            <XIcon className="mr-1 size-3" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Ticket List */}
      <div className="flex-1 overflow-auto">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
            <p className="text-sm font-medium text-foreground">No tickets found</p>
            <p className="text-xs text-muted-foreground">
              {hasActiveFilters ? "Try adjusting your filters" : "Your inbox is all caught up!"}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {tickets.map((ticket) => (
              <li key={ticket.id}>
                <TicketListItem
                  ticket={ticket}
                  isSelected={selectedTicket?.id === ticket.id}
                  onSelect={() => onSelectTicket(ticket)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
