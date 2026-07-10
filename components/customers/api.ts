import { apiFetch } from "@/lib/api"
import type {
  Customer,
  CustomerInsights,
  CustomerListItem,
  InsightsState,
  LifecycleStage,
} from "@/components/customers/data"

/* -------------------------------------------------------------------------- */
/*                                Customer profile                            */
/* -------------------------------------------------------------------------- */

type RawInsights = {
  state: InsightsState
  summary: string | null
  preferences: CustomerInsights["preferences"] | null
  generatedAt: string | null
  basedOnConversations: number | null
}

type RawCustomerProfile = Omit<Customer, "insights"> & { insights: RawInsights }

export interface CustomerProfile {
  customer: Customer
  insightsState: InsightsState
}

function normalizeInsights(raw: RawInsights): {
  insights: CustomerInsights | null
  state: InsightsState
} {
  if (
    raw.state !== "ready" ||
    !raw.summary ||
    !raw.preferences ||
    !raw.generatedAt ||
    raw.basedOnConversations == null
  ) {
    return { insights: null, state: raw.state }
  }

  return {
    insights: {
      summary: raw.summary,
      preferences: raw.preferences,
      generatedAt: raw.generatedAt,
      basedOnConversations: raw.basedOnConversations,
    },
    state: raw.state,
  }
}

/**
 * GET .../contacts/{contact}/profile — the composed CRM profile (contact +
 * AI insights + sales history + recent conversations).
 */
export async function fetchCustomerProfile(
  organizationId: number,
  contactId: number | string
): Promise<CustomerProfile> {
  const res = await apiFetch<{ data: RawCustomerProfile }>(
    `/api/v1/organizations/${organizationId}/contacts/${contactId}/profile`
  )
  const { insights, state } = normalizeInsights(res.data.insights)

  return {
    customer: { ...res.data, insights },
    insightsState: state,
  }
}

/**
 * POST .../contacts/{contact}/insights/refresh — force-regenerate the
 * contact's AI insights, bypassing the backend's message-count debounce.
 */
export async function refreshCustomerInsights(
  organizationId: number,
  contactId: number | string
): Promise<InsightsState> {
  const res = await apiFetch<{ data: { state: InsightsState } }>(
    `/api/v1/organizations/${organizationId}/contacts/${contactId}/insights/refresh`,
    { method: "POST" }
  )
  return res.data.state
}

/* -------------------------------------------------------------------------- */
/*                              Roster (list view)                            */
/* -------------------------------------------------------------------------- */

type RawContact = {
  id: number
  display_name: string
  avatar_url: string | null
  company: string | null
  email: string | null
  last_seen_at: string | null
  updated_at: string | null
  lifecycle_stage: { is_final: boolean } | null
  conversations_count: number | null
}

type RawContactPage = {
  data: RawContact[]
}

function mapStage(contact: RawContact): LifecycleStage {
  if (contact.lifecycle_stage?.is_final) {
    return "churned"
  }
  return (contact.conversations_count ?? 0) > 0 ? "active" : "lead"
}

/**
 * GET .../contacts — paginated roster of the organization's contacts,
 * adapted into the shape the customer list view renders.
 */
export async function fetchCustomers(
  organizationId: number,
  params?: { search?: string }
): Promise<CustomerListItem[]> {
  const query = new URLSearchParams()
  if (params?.search) {
    query.set("search", params.search)
  }
  const qs = query.toString()

  const res = await apiFetch<RawContactPage>(
    `/api/v1/organizations/${organizationId}/contacts${qs ? `?${qs}` : ""}`
  )

  return res.data.map((contact) => ({
    id: contact.id,
    name: contact.display_name,
    avatar: contact.avatar_url ?? "",
    company: contact.company ?? "",
    email: contact.email ?? "",
    stage: mapStage(contact),
    conversationsCount: contact.conversations_count ?? 0,
    lastActive: contact.last_seen_at ?? contact.updated_at ?? new Date(0).toISOString(),
  }))
}
