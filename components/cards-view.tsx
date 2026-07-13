"use client"

import * as React from "react"
import { PlusCircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OrderCardFlow } from "@/components/order-card-flow"
import { PaymentCard, type CardTheme } from "@/components/payment-card"

/* -------------------------------------------------------------------------- */
/*                               Card Data Types                               */
/* -------------------------------------------------------------------------- */

interface CardData {
  id: string
  last4: string
  currency: string
  expiry: string
  variant: "dark" | "light"
  status: "active" | "expired"
}

const CURRENT_CARDS: CardData[] = [
  {
    id: "1",
    last4: "8080",
    currency: "USD",
    expiry: "12/24",
    variant: "dark",
    status: "active",
  },
  {
    id: "2",
    last4: "4222",
    currency: "USD",
    expiry: "07/29",
    variant: "light",
    status: "active",
  },
]

const PAST_CARDS: CardData[] = [
  {
    id: "3",
    last4: "9870",
    currency: "USD",
    expiry: "02/24",
    variant: "dark",
    status: "expired",
  },
]

const PREMIUM_THEMES: CardTheme[] = [
  "transparent-gradient",
  "brand-dark",
  "brand-light",
  "gray-dark",
]

/* -------------------------------------------------------------------------- */
/*                               Main CardsView                                */
/* -------------------------------------------------------------------------- */

export function CardsView() {
  const [orderOpen, setOrderOpen] = React.useState(false)

  return (
    <>
      <div className="flex flex-col gap-8 overflow-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Cards
          </h1>
          <Button
            variant="ghost"
            className="gap-1.5 text-primary hover:text-primary/80"
            onClick={() => setOrderOpen(true)}
          >
            <PlusCircleIcon className="size-4" />
            Order card
          </Button>
        </div>

        {/* Current Cards */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-foreground">Current cards</h2>
          <div className="flex flex-wrap gap-4">
            {CURRENT_CARDS.map((card) => (
              <PaymentCard
                key={card.id}
                theme={
                  card.variant === "light" ? "gradient-strip" : "gray-strip"
                }
                last4={card.last4}
                expiry={card.expiry}
              />
            ))}
          </div>
        </section>

        {/* Premium Cards */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-foreground">Premium cards</h2>
          <div className="flex flex-wrap gap-4">
            {PREMIUM_THEMES.map((theme) => (
              <PaymentCard
                key={theme}
                theme={theme}
                last4={CURRENT_CARDS[0].last4}
                expiry={CURRENT_CARDS[0].expiry}
              />
            ))}
          </div>
        </section>

        {/* Past Cards */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-foreground">Past cards</h2>
          <div className="flex flex-wrap gap-4">
            {PAST_CARDS.map((card) => (
              <PaymentCard
                key={card.id}
                theme={
                  card.variant === "light" ? "gradient-strip" : "gray-strip"
                }
                last4={card.last4}
                expiry={card.expiry}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Order Card Flow */}
      {orderOpen && <OrderCardFlow onClose={() => setOrderOpen(false)} />}
    </>
  )
}
