import { apiFetch, apiDownload } from "@/lib/api"

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

export const CREDIT_CURRENCY = "CREDIT"

export type Wallet = {
  id: string
  organization_id: number
  currency_code: string
  balance: string
  formatted_balance: string | null
  created_at: string
  updated_at: string
}

export type WalletTransaction = {
  id: number
  wallet_id: number
  type: "debit" | "credit"
  amount: string
  balance_after: string
  currency_exchange_id: string | null
  description: string | null
  model: string | null
  created_at: string
}

export type ModelUsage = {
  model: string
  credits_used: number
  requests: number
}

export async function fetchWallets(organizationId: number): Promise<Wallet[]> {
  const res = await apiFetch<{ data: Wallet[] }>(
    `/api/v1/organizations/${organizationId}/wallets`
  )
  return res.data
}

export async function fetchWalletTransactions(
  organizationId: number,
  walletId: string
): Promise<WalletTransaction[]> {
  const res = await apiFetch<{ data: WalletTransaction[] }>(
    `/api/v1/organizations/${organizationId}/wallets/${walletId}/transactions`
  )
  return res.data
}

export async function fetchUsageByModel(
  organizationId: number,
  walletId: string,
  period: "month" | "all" = "month"
): Promise<ModelUsage[]> {
  const res = await apiFetch<{ data: ModelUsage[] }>(
    `/api/v1/organizations/${organizationId}/wallets/${walletId}/usage-by-model?period=${period}`
  )
  return res.data
}

export async function topUpCredits(
  organizationId: number,
  sourceCurrency: string,
  amount: string
): Promise<Wallet> {
  const res = await apiFetch<{ data: Wallet }>(
    `/api/v1/organizations/${organizationId}/wallets/topup`,
    { method: "POST", body: { source_currency: sourceCurrency, amount } }
  )
  return res.data
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "cancelled" | "unpaid"

export type Invoice = {
  id: number
  number: string
  subject: string
  status: InvoiceStatus
  is_overdue: boolean
  issued_at: string
  due_at: string
  total: string
  created_at: string
}

export async function fetchInvoices(organizationId: number): Promise<Invoice[]> {
  const res = await apiFetch<{ data: Invoice[] }>(
    `/api/v1/organizations/${organizationId}/invoices`
  )
  return res.data
}

export async function downloadInvoicePdf(
  organizationId: number,
  invoice: Invoice
): Promise<void> {
  await apiDownload(
    `/api/v1/organizations/${organizationId}/invoices/${invoice.id}/pdf`,
    `${invoice.number}.pdf`
  )
}
