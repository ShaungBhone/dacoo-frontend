"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TicketFiltersProps {
  filterStatus: string | null
  onFilterStatusChange: (status: string | null) => void
  filterChannel: string | null
  onFilterChannelChange: (channel: string | null) => void
  filterPriority: string | null
  onFilterPriorityChange: (priority: string | null) => void
  filterAssignee: string | null
  onFilterAssigneeChange: (assignee: string | null) => void
}

export function TicketFilters({
  filterStatus,
  onFilterStatusChange,
  filterChannel,
  onFilterChannelChange,
  filterPriority,
  onFilterPriorityChange,
  filterAssignee,
  onFilterAssigneeChange,
}: TicketFiltersProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        {/* Status Filter */}
        <Select value={filterStatus || ""} onValueChange={(val) => onFilterStatusChange(val || null)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="snoozed">Snoozed</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        {/* Channel Filter */}
        <Select value={filterChannel || ""} onValueChange={(val) => onFilterChannelChange(val || null)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Channels</SelectItem>
            <SelectItem value="chat">Chat</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select value={filterPriority || ""} onValueChange={(val) => onFilterPriorityChange(val || null)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        {/* Assignee Filter */}
        <Select value={filterAssignee || ""} onValueChange={(val) => onFilterAssigneeChange(val || null)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Agents</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            <SelectItem value="You">You</SelectItem>
            <SelectItem value="Devin Park">Devin Park</SelectItem>
            <SelectItem value="Priya Nair">Priya Nair</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
