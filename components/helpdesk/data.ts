import type { Customer, Conversation, ConversationStatus } from "@/components/customers/data"

export type Priority = "low" | "medium" | "high" | "urgent"
export type Channel = "chat" | "email" | "whatsapp"

export interface Ticket {
  id: string
  customerId: string
  customerName: string
  customerAvatar: string
  subject: string
  preview: string
  timestamp: string
  status: ConversationStatus
  channel: Channel
  priority: Priority
  assignedTo: string | null
  tags: string[]
  internalNotes: string
  messages: TicketMessage[]
}

export interface TicketMessage {
  id: string
  author: string
  authorRole: "customer" | "agent"
  content: string
  timestamp: string
  channel: Channel
}

// Mock data for the inbox
const NOW = new Date().toISOString()
const HOUR_AGO = new Date(Date.now() - 3600000).toISOString()
const TWO_HOURS_AGO = new Date(Date.now() - 7200000).toISOString()
const DAY_AGO = new Date(Date.now() - 86400000).toISOString()

export const HELPDESK_TICKETS: Ticket[] = [
  {
    id: "tick_001",
    customerId: "cus_8f42a1",
    customerName: "Amara Okonkwo",
    customerAvatar: "/customers/amara-okonkwo.png",
    subject: "Bulk pricing tier clarification needed",
    preview: "Hey — can you confirm the bulk pricing tier kicks in at 500 units or 1000? Need to lock the PO today.",
    timestamp: NOW,
    status: "open",
    channel: "chat",
    priority: "high",
    assignedTo: null,
    tags: ["billing", "urgent"],
    internalNotes: "Customer is time-sensitive, needs response within the hour",
    messages: [
      {
        id: "msg_1",
        author: "Amara Okonkwo",
        authorRole: "customer",
        content: "Hey — can you confirm the bulk pricing tier kicks in at 500 units or 1000? Need to lock the PO today.",
        timestamp: NOW,
        channel: "chat",
      },
    ],
  },
  {
    id: "tick_002",
    customerId: "cus_9d55e2",
    customerName: "Yuki Tanaka",
    customerAvatar: "",
    subject: "Issue with recent order",
    preview: "The items I received yesterday don't match what was ordered. Need to resolve this quickly.",
    timestamp: HOUR_AGO,
    status: "open",
    channel: "email",
    priority: "urgent",
    assignedTo: "You",
    tags: ["order-issue", "urgent"],
    internalNotes: "",
    messages: [
      {
        id: "msg_2",
        author: "Yuki Tanaka",
        authorRole: "customer",
        content: "The items I received yesterday don't match what was ordered. Need to resolve this quickly.",
        timestamp: HOUR_AGO,
        channel: "email",
      },
    ],
  },
  {
    id: "tick_003",
    customerId: "cus_3b19c7",
    customerName: "Marcus Feldman",
    customerAvatar: "",
    subject: "Feature request: Inventory alerts",
    preview: "Is there a way to set up automated alerts for low inventory levels? This would help us a lot.",
    timestamp: TWO_HOURS_AGO,
    status: "pending",
    channel: "whatsapp",
    priority: "medium",
    assignedTo: "Devin Park",
    tags: ["feature-request"],
    internalNotes: "Follow up on product roadmap, could be good feature to add",
    messages: [
      {
        id: "msg_3",
        author: "Marcus Feldman",
        authorRole: "customer",
        content: "Is there a way to set up automated alerts for low inventory levels? This would help us a lot.",
        timestamp: TWO_HOURS_AGO,
        channel: "whatsapp",
      },
    ],
  },
  {
    id: "tick_004",
    customerId: "cus_8f42a1",
    customerName: "Amara Okonkwo",
    customerAvatar: "/customers/amara-okonkwo.png",
    subject: "Following up on automation demo",
    preview: "Following up on the automation demo — is there a way to schedule restock alerts by region?",
    timestamp: DAY_AGO,
    status: "pending",
    channel: "whatsapp",
    priority: "medium",
    assignedTo: "You",
    tags: ["demo-follow-up"],
    internalNotes: "",
    messages: [
      {
        id: "msg_4",
        author: "Amara Okonkwo",
        authorRole: "customer",
        content: "Following up on the automation demo — is there a way to schedule restock alerts by region?",
        timestamp: DAY_AGO,
        channel: "whatsapp",
      },
    ],
  },
]

export function getTicketById(id: string): Ticket | undefined {
  return HELPDESK_TICKETS.find((t) => t.id === id)
}

export function getTicketsByStatus(status: ConversationStatus): Ticket[] {
  return HELPDESK_TICKETS.filter((t) => t.status === status)
}

export function getTicketsByPriority(priority: Priority): Ticket[] {
  return HELPDESK_TICKETS.filter((t) => t.priority === priority)
}

export function getTicketsByAssignee(agent: string | null): Ticket[] {
  return HELPDESK_TICKETS.filter((t) => t.assignedTo === agent)
}

export function getTicketsByChannel(channel: Channel): Ticket[] {
  return HELPDESK_TICKETS.filter((t) => t.channel === channel)
}

export function searchTickets(query: string): Ticket[] {
  const lowerQuery = query.toLowerCase()
  return HELPDESK_TICKETS.filter(
    (t) =>
      t.customerName.toLowerCase().includes(lowerQuery) ||
      t.subject.toLowerCase().includes(lowerQuery) ||
      t.preview.toLowerCase().includes(lowerQuery)
  )
}
