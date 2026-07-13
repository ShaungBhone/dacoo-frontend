import Image from "next/image"

import { cn } from "@/lib/utils"

export const CARD_THEMES = [
  "gray-strip",
  "gradient-strip",
  "transparent-gradient",
  "brand-dark",
  "brand-light",
  "gray-dark",
] as const

export type CardTheme = (typeof CARD_THEMES)[number]

const CONTACTLESS_ASSETS: Record<CardTheme, string> = {
  "gray-strip": "/card-contactless-gray.svg",
  "gradient-strip": "/card-contactless-gradient.svg",
  "transparent-gradient": "/card-contactless-transparent.svg",
  "brand-dark": "/card-contactless-brand-dark.svg",
  "brand-light": "/card-contactless-brand-light.svg",
  "gray-dark": "/card-contactless-gray-dark.svg",
}

export function isCardTheme(value: string): value is CardTheme {
  return CARD_THEMES.includes(value as CardTheme)
}

export function PaymentCard({
  theme,
  last4 = "1234",
  expiry = "06/28",
  cardholder = "OLIVIA RHYE",
  className,
}: {
  theme: CardTheme
  last4?: string
  expiry?: string
  cardholder?: string
  className?: string
}) {
  const isLight = theme === "brand-light"
  const isStrip = theme === "gray-strip" || theme === "gradient-strip"

  return (
    <div
      className={cn(
        "relative h-47.5 w-79 shrink-0 overflow-hidden rounded-2xl border",
        theme === "gray-strip" && "border-white bg-white backdrop-blur-[6px]",
        theme === "gradient-strip" &&
          "border-white bg-[linear-gradient(180deg,#fbc2eb_0%,#a18cd1_105.25%)]",
        theme === "transparent-gradient" &&
          "border-white bg-white backdrop-blur-[6px]",
        theme === "brand-dark" && "border-white",
        theme === "brand-light" && "bg-[#f4ebff]",
        theme === "gray-dark" && "border-white",
        className
      )}
    >
      {theme === "gray-strip" && (
        <div className="absolute inset-0 bg-[linear-gradient(125.102deg,rgba(255,255,255,0.3)_3.5118%,rgba(255,255,255,0)_111.71%)]" />
      )}
      {theme === "transparent-gradient" && (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(125.102deg,rgba(255,255,255,0.3)_3.5118%,rgba(255,255,255,0)_111.71%),linear-gradient(90deg,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.1)_100%)]" />
          <div className="absolute -top-4.25 -left-4.25 size-40">
            <Image
              src="/card-transparent-gradient.svg"
              alt=""
              fill
              className="max-w-none scale-[2.6] object-contain"
            />
          </div>
        </>
      )}
      {theme === "brand-dark" && (
        <Image
          src="/card-brand-dark.png"
          alt=""
          fill
          className="object-cover"
        />
      )}
      {theme === "gray-dark" && (
        <Image src="/card-gray-dark.png" alt="" fill className="object-cover" />
      )}
      {isStrip && (
        <div className="absolute -inset-y-px right-21.75 -left-px bg-[#252b37]" />
      )}

      <p
        className={cn(
          "absolute top-4.75 left-4.75 text-base leading-normal font-semibold",
          isLight ? "text-[#414651]" : "text-white"
        )}
      >
        Untitled.
      </p>

      <Image
        src={CONTACTLESS_ASSETS[theme]}
        alt=""
        width={20}
        height={24}
        className="absolute top-[19px] right-[19px] h-6 w-5"
      />

      <p
        className={cn(
          "absolute top-[127px] left-[15px] text-xs leading-normal font-semibold tracking-[0.6px] uppercase",
          isLight ? "text-[#414651]" : "text-white"
        )}
      >
        {cardholder}
      </p>
      <p
        className={cn(
          "absolute top-[127px] left-[208px] -translate-x-full text-right text-xs leading-normal font-semibold tracking-[0.6px] whitespace-nowrap",
          isLight ? "text-[#414651]" : "text-white"
        )}
      >
        {expiry}
      </p>
      <p
        className={cn(
          "absolute top-[151px] left-[15px] font-mono text-base leading-normal font-medium tracking-[0.64px] whitespace-nowrap",
          isLight ? "text-[#414651]" : "text-white"
        )}
      >
        1234 1234 1234 {last4}
      </p>

      <Image
        src="/logo-mark.png"
        alt=""
        width={28}
        height={28}
        className="absolute top-[143px] right-[19px] size-7 object-contain"
      />
    </div>
  )
}

export function PaymentCardPreview(
  props: React.ComponentProps<typeof PaymentCard>
) {
  return (
    <div className="h-[137px] w-[228px] overflow-hidden rounded-xl">
      <PaymentCard
        {...props}
        className={cn("origin-top-left scale-[0.72]", props.className)}
      />
    </div>
  )
}
