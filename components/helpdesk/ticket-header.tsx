"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import type { Ticket, Priority } from "./data"

const PRIORITY_STYLES: Record<Priority, string> = {
  low: "bg-chart-3/15 text-chart-4 dark:text-chart-2",
  medium: "bg-yellow-500/15 text-yellow-700 dark:bg-yellow-400/15 dark:text-yellow-400",
  high: "bg-orange-500/15 text-orange-700 dark:bg-orange-400/15 dark:text-orange-400",
  urgent: "bg-destructive/15 text-destructive dark:bg-destructive/20",
}

const STATUS_STYLES: Record<string, string> = {
  open: "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-400",
  pending: "bg-chart-3/15 text-chart-4 dark:text-chart-2",
  snoozed: "bg-muted",
  closed: "bg-border",
}

interface TicketHeaderProps {
  ticket: Ticket
  onStatusChange: (status: string) => void
  onAssigneeChange: (assignee: string | null) => void
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
}

export function TicketHeader({
  ticket,
  onStatusChange,
  onAssigneeChange,
  onAddTag,
  onRemoveTag,
}: TicketHeaderProps) {
  const [newTag, setNewTag] = React.useState("")
  const [showAddTag, setShowAddTag] = React.useState(false)

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(newTag.trim())
      setNewTag("")
      setShowAddTag(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 border-b border-border px-6 py-4">
      {/* Title and Priority */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-foreground">{ticket.subject}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            ID: {ticket.id} · {ticket.customerName}
          </p>
        </div>
        <Badge className={cn("border-transparent", PRIORITY_STYLES[ticket.priority])}>
          {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
        </Badge>
      </div>

      {/* Status and Assignee Row */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Status:</span>
          <Select value={ticket.status} onValueChange={onStatusChange}>
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="snoozed">Snoozed</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Assigned:</span>
          <Select value={ticket.assignedTo || ""} onValueChange={(val) => onAssigneeChange(val || null)}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Unassigned</SelectItem>
              <SelectItem value="You">You</SelectItem>
              <SelectItem value="Devin Park">Devin Park</SelectItem>
              <SelectItem value="Priya Nair">Priya Nair</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {ticket.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {tag}
              <button
                onClick={() => onRemoveTag(tag)}
                className="ml-1 inline-flex items-center hover:opacity-70"
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))}
          {showAddTag ? (
            <div className="flex items-center gap-1">
              <Input
                autoFocus
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddTag()
                  if (e.key === "Escape") setShowAddTag(false)
                }}
                className="h-7 w-32 text-xs"
              />
              <Button size="sm" variant="ghost" onClick={handleAddTag} className="h-7 px-2">
                Add
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAddTag(true)}
              className="h-7 text-xs"
            >
              + Tag
            </Button>
          )}
        </div>
      </div>

      {/* Internal Notes */}
      {ticket.internalNotes && (
        <div className="rounded-lg bg-muted/40 px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground">Internal Notes</p>
          <p className="mt-1 text-xs text-foreground">{ticket.internalNotes}</p>
        </div>
      )}
    </div>
  )
}
