export type LifecycleStage = "lead" | "active" | "churned"

export type InsightsState = "pending" | "generating" | "ready"

export interface CustomerPreference {
  category: string
  detail: string
}

export interface CustomerInsights {
  summary: string
  preferences: CustomerPreference[]
  /** ISO timestamp of when the insights were last generated. */
  generatedAt: string
  /** Number of conversations the model had access to. */
  basedOnConversations: number
}

export type OrderStatus =
  | "paid"
  | "refunded"
  | "pending"
  | "cancelled"
  | "fulfilled"

export interface Order {
  number: string
  date: string
  status: OrderStatus
  total: number
}

export interface SaleHistory {
  lifetimeSpend: number
  orderCount: number
  averageOrderValue: number
  lastOrderDate: string
  orders: Order[]
}

export type ConversationStatus = "open" | "pending" | "closed" | "snoozed"

export interface Conversation {
  id: string
  preview: string
  timestamp: string
  status: ConversationStatus
  channel: "chat" | "email" | "whatsapp"
  agent: string
}

export interface Customer {
  id: string
  name: string
  avatar: string
  company: string
  jobTitle: string
  email: string
  phone: string
  location: string
  stage: LifecycleStage
  customerSince: string
  insights: CustomerInsights | null
  sales: SaleHistory
  conversations: Conversation[]
}

/* -------------------------------------------------------------------------- */
/*                              Roster (list view)                            */
/* -------------------------------------------------------------------------- */

export interface CustomerListItem {
  id: number
  name: string
  avatar: string
  company: string
  email: string
  stage: LifecycleStage
  conversationsCount: number
  lastActive: string
}
