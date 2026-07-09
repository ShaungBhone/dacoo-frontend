"use client"

import * as React from "react"
import {
  CheckIcon,
  XIcon,
  WifiIcon,
  UploadCloudIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"

/* -------------------------------------------------------------------------- */
/*                                  Types                                      */
/* -------------------------------------------------------------------------- */

type Step = "card" | "purpose" | "payment" | "verification"

const STEPS: { id: Step; label: string }[] = [
  { id: "card", label: "Card" },
  { id: "purpose", label: "Purpose" },
  { id: "payment", label: "Payment" },
  { id: "verification", label: "Verification" },
]

type PaymentMethod = "aya_pay" | "kbz_pay" | "wave_pay" | "cb_pay"

const PAYMENT_METHODS: { id: PaymentMethod; label: string; color: string }[] = [
  { id: "aya_pay", label: "AYA Pay", color: "#E31837" },
  { id: "kbz_pay", label: "KBZ Pay", color: "#0056A3" },
  { id: "wave_pay", label: "Wave Pay", color: "#F7941D" },
  { id: "cb_pay", label: "CB Pay", color: "#00833E" },
]

const PURPOSES = [
  { id: "expense", label: "Daily Expenses", description: "For everyday purchases and bills" },
  { id: "stock", label: "Buying Stock", description: "For stock market & investments" },
  { id: "receiving", label: "Receiving Money", description: "To receive payments & transfers" },
  { id: "travel", label: "Travel & Abroad", description: "For international travel use" },
  { id: "business", label: "Business Use", description: "For business transactions" },
  { id: "savings", label: "Savings", description: "Linked to a savings goal" },
]

/* -------------------------------------------------------------------------- */
/*                            Stepper Header                                   */
/* -------------------------------------------------------------------------- */

function StepperHeader({
  current,
  onClose,
}: {
  current: Step
  onClose: () => void
}) {
  const currentIdx = STEPS.findIndex((s) => s.id === current)

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border">
      {/* Steps */}
      <nav className="flex items-center gap-0" aria-label="Order progress">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentIdx
          const isActive = idx === currentIdx
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "size-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                    isDone
                      ? "bg-primary text-primary-foreground"
                      : isActive
                        ? "bg-primary text-primary-foreground"
                        : "border-2 border-muted-foreground/30 text-muted-foreground/50 bg-transparent"
                  )}
                >
                  {isDone ? (
                    <CheckIcon className="size-3.5" strokeWidth={3} />
                  ) : (
                    <span className="text-[10px]">{idx + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium whitespace-nowrap",
                    isActive
                      ? "text-primary"
                      : isDone
                        ? "text-foreground"
                        : "text-muted-foreground/50"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-px w-16 mx-1 mt-[-12px] transition-colors",
                    idx < currentIdx ? "bg-primary" : "bg-muted-foreground/20"
                  )}
                />
              )}
            </React.Fragment>
          )
        })}
      </nav>

      {/* Close */}
      <button
        onClick={onClose}
        className="size-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Close"
      >
        <XIcon className="size-4" />
      </button>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                         Mini Card Preview                                   */
/* -------------------------------------------------------------------------- */

function MiniCard({
  variant,
  selected,
  onClick,
  name,
}: {
  variant: "dark" | "light"
  selected: boolean
  onClick: () => void
  name: string
}) {
  const isDark = variant === "dark"

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative rounded-2xl p-4 w-full transition-all overflow-hidden",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isDark ? "bg-[#1a1f2e] text-white" : "bg-[#e8eaed] text-[#1a1f2e]",
        selected ? "ring-2 ring-primary ring-offset-2" : "ring-1 ring-transparent"
      )}
      style={{ aspectRatio: "1.6 / 1" }}
      aria-pressed={selected}
    >
      {/* Select indicator */}
      <div
        className={cn(
          "absolute top-3 right-3 size-5 rounded-full border-2 flex items-center justify-center transition-all",
          selected
            ? "bg-primary border-primary"
            : isDark
              ? "border-white/40"
              : "border-[#1a1f2e]/40"
        )}
      >
        {selected && <CheckIcon className="size-3 text-white" strokeWidth={3} />}
      </div>

      {/* Chip + Wifi */}
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-4 rounded bg-amber-500 grid grid-cols-2 gap-0.5 p-0.5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-[1px] bg-amber-700/60" />
          ))}
        </div>
        <WifiIcon className={cn("size-3 rotate-90", isDark ? "text-white/50" : "text-black/50")} />
      </div>

      {/* Bottom */}
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
        <div className="flex flex-col gap-0.5">
          <span className={cn("font-mono text-[10px] tracking-widest", isDark ? "text-white/80" : "text-black/80")}>
            0000 0000 0000 0000
          </span>
          <span className={cn("text-[9px] font-semibold uppercase tracking-wider", isDark ? "text-white/70" : "text-black/70")}>
            {name}
          </span>
        </div>
        <div className="flex -space-x-1.5">
          <div className="size-5 rounded-full bg-red-500 opacity-90" />
          <div className="size-5 rounded-full bg-orange-400 opacity-80" />
        </div>
      </div>
    </button>
  )
}

/* -------------------------------------------------------------------------- */
/*                               Step 1: Card                                  */
/* -------------------------------------------------------------------------- */

function CardStep({
  selectedStyle,
  onSelect,
  onContinue,
  onCancel,
}: {
  selectedStyle: "dark" | "light"
  onSelect: (v: "dark" | "light") => void
  onContinue: () => void
  onCancel: () => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">Card details</h2>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-foreground">Select card style</p>
        <div className="grid grid-cols-2 gap-3">
          <MiniCard variant="dark" selected={selectedStyle === "dark"} onClick={() => onSelect("dark")} name="YOUR NAME" />
          <MiniCard variant="light" selected={selectedStyle === "light"} onClick={() => onSelect("light")} name="YOUR NAME" />
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <Button onClick={onContinue} className="w-full h-11 text-sm font-semibold">
          Continue
        </Button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <XIcon className="size-3.5" />
          Cancel
        </button>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                             Step 2: Purpose                                 */
/* -------------------------------------------------------------------------- */

function PurposeStep({
  selected,
  onSelect,
  onContinue,
  onBack,
}: {
  selected: string | null
  onSelect: (id: string) => void
  onContinue: () => void
  onBack: () => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">{"What's your purpose?"}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us how you plan to use this card
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {PURPOSES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className={cn(
              "text-left px-4 py-3.5 rounded-xl border transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              selected === p.id
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border hover:border-muted-foreground/40 bg-background"
            )}
          >
            <p className="text-sm font-semibold text-foreground">{p.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <Button onClick={onContinue} disabled={!selected} className="w-full h-11 text-sm font-semibold">
          Continue
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeftIcon className="size-3.5" />
          Go back
        </button>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                            Step 3: Payment                                  */
/* -------------------------------------------------------------------------- */

function PaymentStep({
  amount,
  onAmountChange,
  selectedMethod,
  onSelectMethod,
  onContinue,
  onBack,
}: {
  amount: string
  onAmountChange: (v: string) => void
  selectedMethod: PaymentMethod | null
  onSelectMethod: (m: PaymentMethod) => void
  onContinue: () => void
  onBack: () => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">How would you like to pay?</h2>
        <p className="mt-1 text-sm text-muted-foreground">Enter the card pricing amount and choose a payment method</p>
      </div>

      {/* Amount Input */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="card-amount" className="text-sm font-medium">
          Card pricing amount (MMK)
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono">K</span>
          <Input
            id="card-amount"
            type="number"
            min="0"
            placeholder="0"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            className="pl-7 font-mono text-lg h-12"
          />
        </div>
        {amount && (
          <p className="text-xs text-muted-foreground">
            You will pay <span className="font-semibold text-foreground font-mono">K {Number(amount).toLocaleString()}</span> for your new card
          </p>
        )}
      </div>

      {/* Payment Methods */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">Select payment method</p>
        <div className="grid grid-cols-2 gap-2">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelectMethod(method.id)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                selectedMethod === method.id
                  ? "border-primary ring-1 ring-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/40"
              )}
            >
              {selectedMethod === method.id && (
                <div className="absolute top-2 right-2 size-5 rounded-full bg-primary flex items-center justify-center">
                  <CheckIcon className="size-3 text-white" strokeWidth={3} />
                </div>
              )}
              {/* Colored dot representing the payment app */}
              <div
                className="size-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: method.color }}
              >
                {method.label.charAt(0)}
              </div>
              <span className="text-xs font-semibold text-foreground">{method.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <Button
          onClick={onContinue}
          disabled={!selectedMethod || !amount}
          className="w-full h-11 text-sm font-semibold"
        >
          Continue
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeftIcon className="size-3.5" />
          Go back
        </button>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                           Step 4: Verification                              */
/* -------------------------------------------------------------------------- */

function VerificationStep({
  paymentMethod,
  amount,
  proofFile,
  onFileChange,
  onContinue,
  onBack,
}: {
  paymentMethod: PaymentMethod | null
  amount: string
  proofFile: File | null
  onFileChange: (f: File | null) => void
  onContinue: () => void
  onBack: () => void
}) {
  const method = PAYMENT_METHODS.find((m) => m.id === paymentMethod)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = React.useState(false)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) onFileChange(file)
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    onFileChange(file)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">Scan & Pay</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Scan the QR code below with your{" "}
          <span className="font-semibold" style={{ color: method?.color }}>
            {method?.label}
          </span>{" "}
          app and pay{" "}
          <span className="font-semibold text-foreground font-mono">
            K {Number(amount || 0).toLocaleString()}
          </span>
        </p>
      </div>

      {/* QR Code */}
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-2xl border border-border p-4 bg-white shadow-sm">
          <Image
            src="/aya-pay-qr.png"
            alt="Payment QR Code"
            width={180}
            height={180}
            className="rounded-lg"
          />
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: method?.color ?? "#1a1f2e" }}
        >
          <div className="size-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
            {method?.label.charAt(0)}
          </div>
          {method?.label} QR Code
        </div>
      </div>

      {/* Upload proof */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">Upload payment proof</p>
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition-all cursor-pointer",
            dragOver
              ? "border-primary bg-primary/5"
              : proofFile
                ? "border-primary/50 bg-primary/5"
                : "border-muted-foreground/30 hover:border-muted-foreground/50"
          )}
        >
          {proofFile ? (
            <>
              <CheckCircle2Icon className="size-8 text-primary" />
              <p className="text-sm font-semibold text-foreground">{proofFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(proofFile.size / 1024).toFixed(1)} KB · Click to change
              </p>
            </>
          ) : (
            <>
              <UploadCloudIcon className="size-8 text-muted-foreground/50" />
              <p className="text-sm font-medium text-foreground">
                Drop your screenshot here
              </p>
              <p className="text-xs text-muted-foreground">or click to browse · PNG, JPG up to 10MB</p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileInput}
          aria-label="Upload payment proof"
        />
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <Button
          onClick={onContinue}
          disabled={!proofFile}
          className="w-full h-11 text-sm font-semibold"
        >
          Continue
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeftIcon className="size-3.5" />
          Go back
        </button>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                            Success Screen                                   */
/* -------------------------------------------------------------------------- */

function SuccessScreen({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      {/* Animated check */}
      <div className="relative">
        <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center animate-in zoom-in-50 duration-500">
          <div className="size-14 rounded-full bg-primary/20 flex items-center justify-center">
            <CheckCircle2Icon className="size-10 text-primary" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-foreground">{"Your card is on the way! 🎉"}</h2>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          {"Your transfer is on the way. We'll review your payment proof and process your card order within 1–3 business days."}
        </p>
      </div>

      <div className="rounded-xl bg-muted/50 border border-border p-4 w-full text-sm text-left">
        <p className="text-muted-foreground">{"What's next?"}</p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {[
            "We'll verify your payment proof",
            "Your card will be processed & printed",
            "You'll receive a notification when it ships",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-foreground">
              <CheckIcon className="size-4 text-primary shrink-0 mt-0.5" strokeWidth={3} />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <Button onClick={onClose} className="w-full h-11 text-sm font-semibold">
        Done
      </Button>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                           Main OrderCardFlow                                */
/* -------------------------------------------------------------------------- */

export function OrderCardFlow({ onClose }: { onClose: () => void }) {
  const [currentStep, setCurrentStep] = React.useState<Step>("card")
  const [isDone, setIsDone] = React.useState(false)

  // Step 1 state
  const [cardStyle, setCardStyle] = React.useState<"dark" | "light">("dark")
  // Step 2 state
  const [purpose, setPurpose] = React.useState<string | null>(null)
  // Step 3 state
  const [amount, setAmount] = React.useState("")
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod | null>(null)
  // Step 4 state
  const [proofFile, setProofFile] = React.useState<File | null>(null)

  function goNext() {
    if (currentStep === "card") setCurrentStep("purpose")
    else if (currentStep === "purpose") setCurrentStep("payment")
    else if (currentStep === "payment") setCurrentStep("verification")
    else if (currentStep === "verification") setIsDone(true)
  }

  function goBack() {
    if (currentStep === "purpose") setCurrentStep("card")
    else if (currentStep === "payment") setCurrentStep("purpose")
    else if (currentStep === "verification") setCurrentStep("payment")
  }

  return (
    /* Full-screen overlay */
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background"
      role="dialog"
      aria-modal="true"
      aria-label="Order card"
    >
      {/* Stepper header — hidden when done */}
      {!isDone && (
        <StepperHeader current={currentStep} onClose={onClose} />
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg px-6 py-8">
          {isDone ? (
            <SuccessScreen onClose={onClose} />
          ) : currentStep === "card" ? (
            <CardStep
              selectedStyle={cardStyle}
              onSelect={setCardStyle}
              onContinue={goNext}
              onCancel={onClose}
            />
          ) : currentStep === "purpose" ? (
            <PurposeStep
              selected={purpose}
              onSelect={setPurpose}
              onContinue={goNext}
              onBack={goBack}
            />
          ) : currentStep === "payment" ? (
            <PaymentStep
              amount={amount}
              onAmountChange={setAmount}
              selectedMethod={paymentMethod}
              onSelectMethod={setPaymentMethod}
              onContinue={goNext}
              onBack={goBack}
            />
          ) : (
            <VerificationStep
              paymentMethod={paymentMethod}
              amount={amount}
              proofFile={proofFile}
              onFileChange={setProofFile}
              onContinue={goNext}
              onBack={goBack}
            />
          )}
        </div>
      </div>
    </div>
  )
}
