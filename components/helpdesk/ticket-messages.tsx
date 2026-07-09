"use client"

import { MessageSquareIcon, MailIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TicketMessage } from "./data"
import { formatDateTime } from "@/components/customers/format"

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

interface TicketMessagesProps {
  messages: TicketMessage[]
}

export function TicketMessages({ messages }: TicketMessagesProps) {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">No messages yet</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 px-6 py-4">
      {messages.map((message, idx) => {
        const ChannelIcon = CHANNEL_ICON[message.channel]
        const isAgent = message.authorRole === "agent"

        return (
          <div key={message.id} className={cn("flex gap-3", isAgent ? "flex-row-reverse" : "")}>
            {/* Avatar / Channel Icon */}
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full",
                isAgent ? "bg-primary/10" : "bg-muted"
              )}
            >
              <ChannelIcon
                className={cn("size-4", isAgent ? "text-primary" : "text-muted-foreground")}
                aria-hidden="true"
              />
            </div>

            {/* Message Content */}
            <div className={cn("flex flex-1 flex-col gap-1", isAgent ? "items-end" : "")}>
              <div className={cn("flex items-center gap-2 text-xs text-muted-foreground")}>
                <span className="font-medium">{message.author}</span>
                <span>·</span>
                <span>{formatDateTime(message.timestamp)}</span>
                <span>·</span>
                <span>{CHANNEL_LABEL[message.channel]}</span>
              </div>

              <div
                className={cn(
                  "rounded-lg px-4 py-2 text-sm leading-relaxed",
                  isAgent
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                {message.content}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
