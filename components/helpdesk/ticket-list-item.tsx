"use client"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Ticket, Priority } from "./data"
import { formatRelative } from "@/components/customers/format"

const PRIORITY_STYLES: Record<Priority, string> = {
  low: "bg-chart-3/15 text-chart-4 dark:text-chart-2",
  medium: "bg-yellow-500/15 text-yellow-700 dark:bg-yellow-400/15 dark:text-yellow-400",
  high: "bg-orange-500/15 text-orange-700 dark:bg-orange-400/15 dark:text-orange-400",
  urgent: "bg-destructive/15 text-destructive dark:bg-destructive/20",
}

const PRIORITY_LABEL: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
}

interface TicketListItemProps {
  ticket: Ticket
  isSelected: boolean
  onSelect: () => void
}

export function TicketListItem({ ticket, isSelected, onSelect }: TicketListItemProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/40",
        isSelected && "bg-muted/60"
      )}
    >
      <Avatar className="size-10 shrink-0">
        {ticket.customerAvatar ? (
          <AvatarImage src={ticket.customerAvatar} alt={ticket.customerName} />
        ) : null}
        <AvatarFallback className="text-xs font-medium">
          {initials(ticket.customerName)}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {ticket.customerName}
          </span>
          <Badge className={cn("border-transparent", PRIORITY_STYLES[ticket.priority])}>
            {PRIORITY_LABEL[ticket.priority]}
          </Badge>
        </div>

        <p className="line-clamp-1 text-xs font-medium text-muted-foreground">
          {ticket.subject}
        </p>

        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {ticket.preview}
        </p>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
          {ticket.assignedTo && (
            <>
              <span className="truncate">Assigned to {ticket.assignedTo}</span>
              <span>·</span>
            </>
          )}
          <span>{formatRelative(ticket.timestamp)}</span>
        </div>
      </div>
    </button>
  )
}
