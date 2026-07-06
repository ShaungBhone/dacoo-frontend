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
/*                                  Mock data                                 */
/* -------------------------------------------------------------------------- */

export const CUSTOMER: Customer = {
  id: "cus_8f42a1",
  name: "Amara Okonkwo",
  avatar: "/customers/amara-okonkwo.png",
  company: "Northwind Apparel",
  jobTitle: "Head of Operations",
  email: "amara.okonkwo@northwind-apparel.com",
  phone: "+1 (415) 555-0182",
  location: "Austin, TX",
  stage: "active",
  customerSince: "2023-02-14",
  insights: {
    summary:
      "Amara is a high-intent operations lead who prioritizes fast, no-nonsense support and tends to buy in bulk ahead of seasonal launches. She responds best to concise, data-backed answers and has repeatedly asked about inventory automation and bulk-order discounts.",
    preferences: [
      {
        category: "Product interest",
        detail:
          "Repeatedly asks about inventory automation and bulk-order tooling for seasonal restocks.",
      },
      {
        category: "Communication style",
        detail:
          "Prefers short, direct replies with numbers up front — gets impatient with long back-and-forth.",
      },
      {
        category: "Buying pattern",
        detail:
          "Purchases in large batches 4–6 weeks before spring and fall launches.",
      },
      {
        category: "Support sensitivity",
        detail:
          "Highly responsive to fast first replies; two past escalations were about slow response times.",
      },
      {
        category: "Channel preference",
        detail: "Starts in live chat but asks for an email summary afterward.",
      },
    ],
    generatedAt: "2026-07-05T14:32:00Z",
    basedOnConversations: 12,
  },
  sales: {
    lifetimeSpend: 48260.5,
    orderCount: 27,
    averageOrderValue: 1787.43,
    lastOrderDate: "2026-06-21",
    orders: [
      {
        number: "#NW-10428",
        date: "2026-06-21",
        status: "fulfilled",
        total: 4120.0,
      },
      {
        number: "#NW-10391",
        date: "2026-05-30",
        status: "paid",
        total: 2860.5,
      },
      {
        number: "#NW-10355",
        date: "2026-05-02",
        status: "refunded",
        total: 640.0,
      },
      {
        number: "#NW-10312",
        date: "2026-04-11",
        status: "fulfilled",
        total: 3990.0,
      },
      {
        number: "#NW-10288",
        date: "2026-03-19",
        status: "paid",
        total: 1250.75,
      },
      {
        number: "#NW-10241",
        date: "2026-02-28",
        status: "cancelled",
        total: 0,
      },
    ],
  },
  conversations: [
    {
      id: "conv_a91",
      preview:
        "Hey — can you confirm the bulk pricing tier kicks in at 500 units or 1000? Need to lock the PO today.",
      timestamp: "2026-07-05T13:58:00Z",
      status: "open",
      channel: "chat",
      agent: "You",
    },
    {
      id: "conv_a84",
      preview:
        "Thanks for the quick turnaround on the refund. Everything reconciled on our end.",
      timestamp: "2026-06-24T09:12:00Z",
      status: "closed",
      channel: "email",
      agent: "Devin Park",
    },
    {
      id: "conv_a77",
      preview:
        "The inventory sync webhook is firing twice for a few SKUs — flagging before the launch.",
      timestamp: "2026-06-18T16:41:00Z",
      status: "closed",
      channel: "chat",
      agent: "Priya Nair",
    },
    {
      id: "conv_a70",
      preview:
        "Following up on the automation demo — is there a way to schedule restock alerts by region?",
      timestamp: "2026-05-29T11:05:00Z",
      status: "pending",
      channel: "whatsapp",
      agent: "You",
    },
    {
      id: "conv_a63",
      preview:
        "Order #NW-10312 arrived early, appreciate it. Sending the next batch request shortly.",
      timestamp: "2026-04-14T14:20:00Z",
      status: "closed",
      channel: "chat",
      agent: "Devin Park",
    },
  ],
}

/* -------------------------------------------------------------------------- */
/*                             Simulated AI request                           */
/* -------------------------------------------------------------------------- */

/**
 * Simulates an async call to an AI model that regenerates customer insights.
 * In a real app this would hit an endpoint that streams a summary + preferences.
 */
export function regenerateInsights(): Promise<CustomerInsights> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ...CUSTOMER.insights!,
        generatedAt: new Date().toISOString(),
      })
    }, 2600)
  })
}
