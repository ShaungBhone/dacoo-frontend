"use client"

import { ChevronRightIcon, MessageSquareIcon, MailIcon } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { Ticket } from "./data"
import { formatRelative } from "@/components/customers/format"

const PRIORITY_STYLES = {
  low: "bg-chart-3/15 text-chart-4 dark:text-chart-2",
  medium: "bg-yellow-500/15 text-yellow-700 dark:bg-yellow-400/15 dark:text-yellow-400",
  high: "bg-orange-500/15 text-orange-700 dark:bg-orange-400/15 dark:text-orange-400",
  urgent: "bg-destructive/15 text-destructive dark:bg-destructive/20",
}

const STATUS_DOT = {
  open: "bg-emerald-500",
  pending: "bg-chart-3",
  snoozed: "bg-muted-foreground",
  closed: "bg-border",
}

const CHANNEL_ICON = {
  chat: MessageSquareIcon,
  email: MailIcon,
  whatsapp: MessageSquareIcon,
}

const CHANNEL_LABEL = {
  chat: "Chat",
  email: "Email",
  whatsapp: "WhatsApp",
}

interface CustomerInboxPanelProps {
  tickets: Ticket[]
}

export function CustomerInboxPanel({ tickets }: CustomerInboxPanelProps) {
  const recentTickets = tickets.slice(0, 5)

  return (
    <section className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <header className="flex items-center justify-between gap-2 border-b border-border px-5 py-3.5">
        <h2 className="text-sm font-semibold text-foreground">Recent Tickets</h2>
        <Link
          href="/inbox"
          className="text-xs font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </header>

      {recentTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
          <p className="text-xs text-muted-foreground">No open tickets</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {recentTickets.map((ticket) => {
            const ChannelIcon = CHANNEL_ICON[ticket.channel]
            return (
              <li key={ticket.id}>
                <Link
                  href={`/inbox?ticket=${ticket.id}`}
                  className="group flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30"
                >
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <ChannelIcon
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <span
                          className={cn("size-1.5 rounded-full", STATUS_DOT[ticket.status])}
                          aria-hidden="true"
                        />
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </span>
                      <Badge
                        className={cn("border-transparent text-xs py-0", PRIORITY_STYLES[ticket.priority])}
                      >
                        {ticket.priority}
                      </Badge>
                    </div>
                    <p className="line-clamp-2 text-sm leading-relaxed text-pretty text-foreground/90">
                      {ticket.preview}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatRelative(ticket.timestamp)}
                    </span>
                  </div>

                  <ChevronRightIcon
                    className="mt-1 size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
