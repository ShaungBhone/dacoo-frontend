import { apiFetch } from "@/lib/api"

export type PlanInterval = "monthly" | "yearly"

export type Plan = {
  id: number
  name: string
  slug: string
  price: number
  interval: PlanInterval
  features: string[]
  limits: Record<string, number>
  is_active: boolean
}

export type SubscriptionStatus = "trialing" | "active" | "cancelled" | "expired"

export type Subscription = {
  id: number
  organization_id: number
  plan: Plan
  status: SubscriptionStatus
  trial_ends_at: string | null
  starts_at: string | null
  ends_at: string | null
  cancelled_at: string | null
}

export async function fetchPlans(): Promise<Plan[]> {
  const res = await apiFetch<{ data: Plan[] }>("/api/v1/plans")
  return res.data
}

export async function fetchSubscription(
  organizationId: number
): Promise<Subscription> {
  const res = await apiFetch<{ data: Subscription }>(
    `/api/v1/organizations/${organizationId}/subscription`
  )
  return res.data
}

export async function changePlan(
  organizationId: number,
  planId: number
): Promise<Subscription> {
  const res = await apiFetch<{ data: Subscription }>(
    `/api/v1/organizations/${organizationId}/subscription`,
    { method: "PATCH", body: { plan_id: planId } }
  )
  return res.data
}
