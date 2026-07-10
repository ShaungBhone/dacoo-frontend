import { apiFetch } from "@/lib/api"
import { isCardTheme, type CardTheme } from "@/components/payment-card"

export type CardTier = "standard" | "premium"

export type CardDesign = {
  id: string
  name: string
  slug: string
  theme: CardTheme
  tier: CardTier
  price: {
    amount: number
    currency: string
  }
}

export type CardPurpose = {
  id: string
  name: string
  slug: string
  description: string | null
}

export type CardPaymentMethod = {
  id: string
  name: string
  slug: string
  brand_color: string
  account_name: string | null
  account_number: string | null
  logo_url: string | null
  qr_code_url: string | null
}

export type CardOrderCatalog = {
  designs: CardDesign[]
  purposes: CardPurpose[]
  payment_methods: CardPaymentMethod[]
}

export type CardOrder = {
  id: string
  number: string
  status: string
  design: {
    name: string
    theme: CardTheme
  }
  purpose: string
  payment_method: string | null
  price: {
    amount: number
    currency: string
  }
  initial_balance: {
    amount: number
    currency: string
  }
  total: {
    amount: number
    currency: string
  }
  created_at: string
}

export async function fetchCardOrderCatalog(
  organizationId: number
): Promise<CardOrderCatalog> {
  const response = await apiFetch<{ data: CardOrderCatalog }>(
    `/api/v1/organizations/${organizationId}/card-order-catalog`
  )

  return {
    ...response.data,
    designs: response.data.designs.filter((design) =>
      isCardTheme(design.theme)
    ),
  }
}

export async function createCardOrder(
  organizationId: number,
  input: {
    cardDesignId: string
    cardPurposeId: string
    idempotencyKey: string
    initialBalanceAmount: number
    cardPaymentMethodId?: string
    paymentProof?: File
  }
): Promise<CardOrder> {
  const body = new FormData()
  body.append("card_design_id", input.cardDesignId)
  body.append("card_purpose_id", input.cardPurposeId)
  body.append("idempotency_key", input.idempotencyKey)
  body.append("initial_balance_amount", String(input.initialBalanceAmount))

  if (input.cardPaymentMethodId) {
    body.append("card_payment_method_id", input.cardPaymentMethodId)
  }
  if (input.paymentProof) {
    body.append("payment_proof", input.paymentProof)
  }

  const response = await apiFetch<{ data: CardOrder }>(
    `/api/v1/organizations/${organizationId}/card-orders`,
    { method: "POST", body }
  )

  return response.data
}
