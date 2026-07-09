"use client"

import * as React from "react"
import { PlusCircleIcon, CpuIcon, WifiIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OrderCardFlow } from "@/components/order-card-flow"
import { cn } from "@/lib/utils"

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
  { id: "1", last4: "8080", currency: "USD", expiry: "12/24", variant: "dark", status: "active" },
  { id: "2", last4: "4222", currency: "USD", expiry: "07/29", variant: "light", status: "active" },
]

const PAST_CARDS: CardData[] = [
  { id: "3", last4: "9870", currency: "USD", expiry: "02/24", variant: "dark", status: "expired" },
]

/* -------------------------------------------------------------------------- */
/*                               Card Component                                */
/* -------------------------------------------------------------------------- */

function BankCard({ card }: { card: CardData }) {
  const isDark = card.variant === "dark"
  const isExpired = card.status === "expired"

  return (
    <div
      className={cn(
        "relative w-full rounded-2xl p-5 select-none overflow-hidden",
        "transition-transform duration-200 hover:scale-[1.02]",
        isDark
          ? "bg-[#1a1f2e] text-white"
          : "bg-[#e8eaed] text-[#1a1f2e]"
      )}
      style={{ aspectRatio: "1.6 / 1", maxWidth: 300 }}
    >
      {/* Top row: chip + contactless */}
      <div className="flex items-center gap-2 mb-auto">
        {/* Chip */}
        <div
          className={cn(
            "w-8 h-6 rounded-md flex items-center justify-center",
            isDark ? "bg-amber-500" : "bg-amber-500"
          )}
        >
          <div className="grid grid-cols-2 gap-0.5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-1.5 h-1.5 rounded-[1px]",
                  isDark ? "bg-amber-700/60" : "bg-amber-700/60"
                )}
              />
            ))}
          </div>
        </div>
        {/* Contactless */}
        <WifiIcon
          className={cn(
            "size-4 rotate-90",
            isDark ? "text-white/60" : "text-[#1a1f2e]/60"
          )}
        />
      </div>

      {/* Bottom row */}
      <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
        <div className="flex flex-col gap-0.5">
          <span className={cn("font-mono text-sm font-medium tracking-widest", isDark ? "text-white" : "text-[#1a1f2e]")}>
            ···· {card.last4} | {card.currency}
          </span>
          <span
            className={cn(
              "text-xs font-medium",
              isExpired
                ? "text-red-400"
                : isDark
                  ? "text-white/60"
                  : "text-[#1a1f2e]/60"
            )}
          >
            {isExpired ? "Expired" : "Expires"} {card.expiry}
          </span>
        </div>

        {/* Mastercard logo */}
        <div className="flex items-center -space-x-2">
          <div className="size-6 rounded-full bg-red-500 opacity-90" />
          <div className="size-6 rounded-full bg-orange-400 opacity-80" />
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                               Main CardsView                                */
/* -------------------------------------------------------------------------- */

export function CardsView() {
  const [orderOpen, setOrderOpen] = React.useState(false)

  return (
    <>
      <div className="flex flex-col gap-8 p-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Cards</h1>
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
              <BankCard key={card.id} card={card} />
            ))}
          </div>
        </section>

        {/* Past Cards */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-foreground">Past cards</h2>
          <div className="flex flex-wrap gap-4">
            {PAST_CARDS.map((card) => (
              <BankCard key={card.id} card={card} />
            ))}
          </div>
        </section>
      </div>

      {/* Order Card Flow */}
      {orderOpen && <OrderCardFlow onClose={() => setOrderOpen(false)} />}
    </>
  )
}
