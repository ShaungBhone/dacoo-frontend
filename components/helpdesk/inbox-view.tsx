"use client"

import * as React from "react"
import { HELPDESK_TICKETS, searchTickets, type Ticket } from "./data"
import { TicketListView } from "./ticket-list-view"
import { TicketDetailView } from "./ticket-detail-view"

export function HelpDeskInboxView() {
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(
    HELPDESK_TICKETS[0] || null
  )
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterStatus, setFilterStatus] = React.useState<string | null>(null)
  const [filterChannel, setFilterChannel] = React.useState<string | null>(null)
  const [filterPriority, setFilterPriority] = React.useState<string | null>(null)
  const [filterAssignee, setFilterAssignee] = React.useState<string | null>(null)

  // Apply all filters
  const filteredTickets = React.useMemo(() => {
    let tickets = searchQuery ? searchTickets(searchQuery) : HELPDESK_TICKETS

    if (filterStatus) {
      tickets = tickets.filter((t) => t.status === filterStatus)
    }
    if (filterChannel) {
      tickets = tickets.filter((t) => t.channel === filterChannel)
    }
    if (filterPriority) {
      tickets = tickets.filter((t) => t.priority === filterPriority)
    }
    if (filterAssignee) {
      tickets = tickets.filter(
        (t) =>
          (filterAssignee === "unassigned" ? t.assignedTo === null : t.assignedTo === filterAssignee)
      )
    }

    return tickets
  }, [searchQuery, filterStatus, filterChannel, filterPriority, filterAssignee])

  // Update selected ticket if it's filtered out
  React.useEffect(() => {
    if (selectedTicket && !filteredTickets.find((t) => t.id === selectedTicket.id)) {
      setSelectedTicket(filteredTickets[0] || null)
    }
  }, [filteredTickets, selectedTicket])

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background text-foreground">
      <div className="flex flex-1 overflow-hidden">
        {/* List View */}
        <TicketListView
          tickets={filteredTickets}
          selectedTicket={selectedTicket}
          onSelectTicket={setSelectedTicket}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
          filterChannel={filterChannel}
          onFilterChannelChange={setFilterChannel}
          filterPriority={filterPriority}
          onFilterPriorityChange={setFilterPriority}
          filterAssignee={filterAssignee}
          onFilterAssigneeChange={setFilterAssignee}
        />

        {/* Detail View */}
        {selectedTicket && (
          <TicketDetailView ticket={selectedTicket} onTicketUpdate={setSelectedTicket} />
        )}
      </div>
    </div>
  )
}
