"use client"

import * as React from "react"
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  CheckIcon,
  ChevronLeftIcon,
  UploadCloudIcon,
  XIcon,
} from "lucide-react"

import {
  createCardOrder,
  fetchCardOrderCatalog,
  type CardDesign,
  type CardOrder,
  type CardOrderCatalog,
  type CardPaymentMethod,
  type CardPurpose,
} from "@/components/card-order-api"
import { AppLogo } from "@/components/app-logo"
import { PaymentCardPreview } from "@/components/payment-card"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper"
import { useActiveOrganization } from "@/hooks/use-active-organization"
import { ApiError } from "@/lib/api"
import { cn } from "@/lib/utils"

type Step = "card" | "purpose" | "payment" | "verification"

const PREMIUM_STEPS: { id: Step; label: string }[] = [
  { id: "card", label: "Card" },
  { id: "purpose", label: "Purpose" },
  { id: "payment", label: "Payment" },
  { id: "verification", label: "Verification" },
]

const MIN_INITIAL_BALANCE = 10_000
const MAX_INITIAL_BALANCE = 10_000_000

function formatPrice(design: CardDesign): string {
  if (design.tier === "standard" || design.price.amount === 0) return "Free"
  return `${design.price.amount.toLocaleString()} ${design.price.currency}`
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive">
      <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
      <p>{message}</p>
    </div>
  )
}

function StepperHeader({
  current,
  steps,
  onClose,
}: {
  current: Step
  steps: { id: Step; label: string }[]
  onClose: () => void
}) {
  const definitions = React.useMemo(
    () => steps.map((step) => ({ id: step.id, title: step.label })),
    [steps]
  )

  return (
    <div className="grid grid-cols-3 items-center border-b border-border bg-background px-6 py-4">
      <div className="flex justify-start">
        <AppLogo />
      </div>
      <div className="flex w-full justify-center">
        <Stepper
          steps={definitions}
          value={current}
          indicators={{
            completed: (
              <CheckIcon
                className="size-3.5 text-primary-foreground"
                strokeWidth={3}
              />
            ),
          }}
          className="flex w-auto items-center justify-center"
        >
          <StepperNav className="flex items-center gap-0">
            {definitions.map((step, index) => (
              <StepperItem
                key={step.id}
                stepId={step.id}
                disabled
                className="flex items-center"
              >
                <StepperTrigger className="pointer-events-none cursor-default gap-2 px-1">
                  <StepperIndicator className="size-6 rounded-full text-xs font-semibold">
                    {index + 1}
                  </StepperIndicator>
                  <StepperTitle className="hidden text-xs font-medium whitespace-nowrap sm:block">
                    {step.title}
                  </StepperTitle>
                </StepperTrigger>
                {index < definitions.length - 1 && (
                  <StepperSeparator className="mx-2 h-px w-12 bg-muted transition-colors duration-300 group-data-[state=completed]/step:bg-primary" />
                )}
              </StepperItem>
            ))}
          </StepperNav>
        </Stepper>
      </div>
      <div className="flex justify-end">
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          aria-label="Close"
        >
          <XIcon data-icon="inline-start" />
        </Button>
      </div>
    </div>
  )
}

function SelectableCard({
  design,
  selected,
}: {
  design: CardDesign
  selected: boolean
}) {
  return (
    <ToggleGroupItem
      value={design.id}
      aria-label={`Select ${design.name}`}
      className={cn(
        "h-auto w-fit flex-col items-start gap-2 rounded-2xl p-2 text-left whitespace-normal",
        selected
          ? "bg-primary/5 ring-2 ring-primary"
          : "ring-1 ring-border hover:ring-primary/40"
      )}
    >
      <PaymentCardPreview theme={design.theme} />
      <span className="flex w-full items-center justify-between gap-3 px-1 pb-0.5">
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-foreground">
            {design.name}
          </span>
          <span className="block text-xs text-muted-foreground">
            {formatPrice(design)}
          </span>
        </span>
        <span
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
            selected
              ? "border-primary bg-primary"
              : "border-muted-foreground/40"
          )}
        >
          {selected && (
            <CheckIcon
              className="size-3 text-primary-foreground"
              strokeWidth={3}
            />
          )}
        </span>
      </span>
    </ToggleGroupItem>
  )
}

function CardStep({
  catalog,
  selected,
  onSelect,
  onContinue,
  onCancel,
}: {
  catalog: CardOrderCatalog
  selected: CardDesign | null
  onSelect: (design: CardDesign) => void
  onContinue: () => void
  onCancel: () => void
}) {
  const standard = catalog.designs.filter(
    (design) => design.tier === "standard"
  )
  const premium = catalog.designs.filter((design) => design.tier === "premium")

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">Choose your card</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Standard cards are free. Premium cards are priced by design.
        </p>
      </div>

      {standard.length > 0 && (
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Standard cards
            </p>
            <p className="text-xs text-muted-foreground">No card fee</p>
          </div>
          <ToggleGroup
            type="single"
            value={selected?.tier === "standard" ? selected.id : ""}
            onValueChange={(value) => {
              const design = standard.find((item) => item.id === value)
              if (design) onSelect(design)
            }}
            className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {standard.map((design) => (
              <SelectableCard
                key={design.id}
                design={design}
                selected={selected?.id === design.id}
              />
            ))}
          </ToggleGroup>
        </div>
      )}

      {premium.length > 0 && (
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Premium cards
            </p>
            <p className="text-xs text-muted-foreground">
              Premium finish with a one-time card fee
            </p>
          </div>
          <ToggleGroup
            type="single"
            value={selected?.tier === "premium" ? selected.id : ""}
            onValueChange={(value) => {
              const design = premium.find((item) => item.id === value)
              if (design) onSelect(design)
            }}
            className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {premium.map((design) => (
              <SelectableCard
                key={design.id}
                design={design}
                selected={selected?.id === design.id}
              />
            ))}
          </ToggleGroup>
        </div>
      )}

      <div className="flex flex-col gap-3 pt-2">
        <Button
          onClick={onContinue}
          disabled={!selected}
          size="lg"
          className="w-full"
        >
          Continue
        </Button>
        <Button onClick={onCancel} variant="ghost" size="lg" className="w-full">
          <XIcon data-icon="inline-start" />
          Cancel
        </Button>
      </div>
    </div>
  )
}

function PurposeStep({
  purposes,
  selected,
  onSelect,
  onContinue,
  onBack,
  isSubmitting,
}: {
  purposes: CardPurpose[]
  selected: CardPurpose | null
  onSelect: (purpose: CardPurpose) => void
  onContinue: () => void
  onBack: () => void
  isSubmitting: boolean
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">
          What&apos;s your purpose?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us how you plan to use this card
        </p>
      </div>
      <ToggleGroup
        type="single"
        value={selected?.id ?? ""}
        onValueChange={(value) => {
          const purpose = purposes.find((item) => item.id === value)
          if (purpose) onSelect(purpose)
        }}
        className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2"
      >
        {purposes.map((purpose) => (
          <ToggleGroupItem
            key={purpose.id}
            value={purpose.id}
            aria-label={`Select ${purpose.name}`}
            className={cn(
              "h-auto flex-col items-start rounded-xl border px-4 py-3.5 text-left whitespace-normal",
              selected?.id === purpose.id
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border bg-background hover:border-muted-foreground/40"
            )}
          >
            <p className="text-sm font-semibold text-foreground">
              {purpose.name}
            </p>
            {purpose.description && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {purpose.description}
              </p>
            )}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {purposes.length === 0 && (
        <ErrorMessage message="No card purposes are available. Ask an administrator to configure one." />
      )}
      <div className="flex flex-col gap-3 pt-2">
        <Button
          onClick={onContinue}
          disabled={!selected || isSubmitting}
          size="lg"
          className="w-full"
        >
          {isSubmitting ? <Spinner /> : "Continue"}
        </Button>
        <Button
          onClick={onBack}
          disabled={isSubmitting}
          variant="ghost"
          size="lg"
          className="w-full"
        >
          <ChevronLeftIcon data-icon="inline-start" />
          Go back
        </Button>
      </div>
    </div>
  )
}

function PaymentStep({
  design,
  methods,
  selected,
  initialBalance,
  onSelect,
  onInitialBalanceChange,
  onContinue,
  onBack,
}: {
  design: CardDesign
  methods: CardPaymentMethod[]
  selected: CardPaymentMethod | null
  initialBalance: string
  onSelect: (method: CardPaymentMethod) => void
  onInitialBalanceChange: (value: string) => void
  onContinue: () => void
  onBack: () => void
}) {
  const parsedBalance = initialBalance === "" ? 0 : Number(initialBalance)
  const balanceIsRequired = design.tier === "standard"
  const balanceIsValid =
    Number.isInteger(parsedBalance) &&
    (parsedBalance === 0
      ? !balanceIsRequired
      : parsedBalance >= MIN_INITIAL_BALANCE &&
        parsedBalance <= MAX_INITIAL_BALANCE)
  const balanceError = !balanceIsValid
    ? balanceIsRequired && initialBalance === ""
      ? "Enter an initial balance."
      : `Enter 0 or an amount from ${MIN_INITIAL_BALANCE.toLocaleString()} to ${MAX_INITIAL_BALANCE.toLocaleString()} MMK.`
    : null
  const totalAmount = design.price.amount + parsedBalance

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">
          How would you like to pay?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Set the starting balance and choose a payment method
        </p>
      </div>
      <FieldGroup>
        <Field data-invalid={balanceError ? true : undefined}>
          <FieldLabel htmlFor="initial-card-balance">
            Initial card balance {balanceIsRequired ? "" : "(optional)"}
          </FieldLabel>
          <Input
            id="initial-card-balance"
            type="number"
            inputMode="numeric"
            min={balanceIsRequired ? MIN_INITIAL_BALANCE : 0}
            max={MAX_INITIAL_BALANCE}
            step="1000"
            placeholder={balanceIsRequired ? "10,000" : "0"}
            value={initialBalance}
            onChange={(event) => onInitialBalanceChange(event.target.value)}
            aria-invalid={balanceError ? true : undefined}
          />
          <FieldDescription>
            {balanceIsRequired
              ? "Required for Standard cards."
              : "Add money to your Premium card now, or leave it empty."}{" "}
            Maximum {MAX_INITIAL_BALANCE.toLocaleString()} MMK.
          </FieldDescription>
          {balanceError && <FieldError>{balanceError}</FieldError>}
        </Field>
      </FieldGroup>
      <div className="rounded-xl border border-border bg-muted/40 p-4">
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Card fee</span>
            <span className="font-mono font-medium text-foreground">
              {formatPrice(design)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Initial balance</span>
            <span className="font-mono font-medium text-foreground">
              {parsedBalance.toLocaleString()} {design.price.currency}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border pt-2">
            <span className="font-semibold text-foreground">Total to pay</span>
            <span className="font-mono font-semibold text-foreground">
              {totalAmount.toLocaleString()} {design.price.currency}
            </span>
          </div>
        </div>
      </div>
      <ToggleGroup
        type="single"
        value={selected?.id ?? ""}
        onValueChange={(value) => {
          const method = methods.find((item) => item.id === value)
          if (method) onSelect(method)
        }}
        className="grid w-full grid-cols-2 gap-2"
      >
        {methods.map((method) => (
          <ToggleGroupItem
            key={method.id}
            value={method.id}
            aria-label={`Select ${method.name}`}
            className={cn(
              "relative h-auto flex-col items-center justify-center gap-2 rounded-xl border p-4",
              selected?.id === method.id
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border hover:border-muted-foreground/40"
            )}
          >
            {selected?.id === method.id && (
              <span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary">
                <CheckIcon
                  className="size-3 text-primary-foreground"
                  strokeWidth={3}
                />
              </span>
            )}
            {method.logo_url ? (
              // The API controls the media host, so this cannot use a fixed Next.js image allowlist.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={method.logo_url}
                alt=""
                className="size-9 object-contain"
              />
            ) : (
              <span
                className="flex size-9 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: method.brand_color }}
              >
                {method.name.charAt(0)}
              </span>
            )}
            <span className="text-xs font-semibold text-foreground">
              {method.name}
            </span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {methods.length === 0 && (
        <ErrorMessage message="No card payment methods are available." />
      )}
      <div className="flex flex-col gap-3 pt-2">
        <Button
          onClick={onContinue}
          disabled={!selected || !balanceIsValid}
          size="lg"
          className="w-full"
        >
          Continue
        </Button>
        <Button onClick={onBack} variant="ghost" size="lg" className="w-full">
          <ChevronLeftIcon data-icon="inline-start" />
          Go back
        </Button>
      </div>
    </div>
  )
}

function VerificationStep({
  design,
  method,
  initialBalanceAmount,
  proofFile,
  onFileChange,
  onContinue,
  onBack,
  isSubmitting,
}: {
  design: CardDesign
  method: CardPaymentMethod
  initialBalanceAmount: number
  proofFile: File | null
  onFileChange: (file: File | null) => void
  onContinue: () => void
  onBack: () => void
  isSubmitting: boolean
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = React.useState(false)
  const totalAmount = design.price.amount + initialBalanceAmount

  function acceptFile(file: File | undefined) {
    if (file) onFileChange(file)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">Scan &amp; pay</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pay{" "}
          <span className="font-mono font-semibold text-foreground">
            {totalAmount.toLocaleString()} {design.price.currency}
          </span>{" "}
          with {method.name}
        </p>
      </div>
      <div className="flex flex-col items-center gap-3">
        {method.qr_code_url ? (
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            {/* The API controls the media host, so this cannot use a fixed Next.js image allowlist. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={method.qr_code_url}
              alt={`${method.name} payment QR code`}
              className="size-[180px] rounded-lg object-contain"
            />
          </div>
        ) : (
          <ErrorMessage
            message={`${method.name} does not have a QR code configured yet.`}
          />
        )}
        {(method.account_name || method.account_number) && (
          <div className="text-center text-xs text-muted-foreground">
            {method.account_name && <p>{method.account_name}</p>}
            {method.account_number && (
              <p className="font-mono text-foreground">
                {method.account_number}
              </p>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">
          Upload payment proof
        </p>
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(event) =>
            event.key === "Enter" && fileInputRef.current?.click()
          }
          onDragOver={(event) => {
            event.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragOver(false)
            acceptFile(event.dataTransfer.files[0])
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition-all",
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
              <p className="text-sm font-semibold text-foreground">
                {proofFile.name}
              </p>
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
              <p className="text-xs text-muted-foreground">
                or click to browse · PNG, JPG or WebP up to 10MB
              </p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => acceptFile(event.target.files?.[0])}
          aria-label="Upload payment proof"
        />
      </div>
      <div className="flex flex-col gap-3 pt-2">
        <Button
          onClick={onContinue}
          disabled={!proofFile || !method.qr_code_url || isSubmitting}
          size="lg"
          className="w-full"
        >
          {isSubmitting ? <Spinner /> : "Submit card order"}
        </Button>
        <Button
          onClick={onBack}
          disabled={isSubmitting}
          variant="ghost"
          size="lg"
          className="w-full"
        >
          <ChevronLeftIcon data-icon="inline-start" />
          Go back
        </Button>
      </div>
    </div>
  )
}

function SuccessScreen({
  order,
  onClose,
}: {
  order: CardOrder
  onClose: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/20">
          <CheckCircle2Icon className="size-10 text-primary" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-foreground">
          Card order submitted
        </h2>
        <p className="mx-auto max-w-xs text-sm text-muted-foreground">
          We&apos;ll review order {order.number} and notify your organization
          when its status changes.
        </p>
      </div>
      <div className="w-full rounded-xl border border-border bg-muted/50 p-4 text-left text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Selected card</span>
          <span className="font-semibold text-foreground">
            {order.design.name}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Status</span>
          <span className="font-semibold text-foreground">Pending review</span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Total paid</span>
          <span className="font-mono font-semibold text-foreground">
            {order.total.amount.toLocaleString()} {order.total.currency}
          </span>
        </div>
      </div>
      <Button onClick={onClose} size="lg" className="w-full">
        Done
      </Button>
    </div>
  )
}

export function OrderCardFlow({ onClose }: { onClose: () => void }) {
  const organization = useActiveOrganization()
  const [catalog, setCatalog] = React.useState<CardOrderCatalog | null>(null)
  const [catalogError, setCatalogError] = React.useState<string | null>(null)
  const [isLoadingCatalog, setIsLoadingCatalog] = React.useState(true)
  const [currentStep, setCurrentStep] = React.useState<Step>("card")
  const [selectedDesign, setSelectedDesign] = React.useState<CardDesign | null>(
    null
  )
  const [selectedPurpose, setSelectedPurpose] =
    React.useState<CardPurpose | null>(null)
  const [selectedMethod, setSelectedMethod] =
    React.useState<CardPaymentMethod | null>(null)
  const [proofFile, setProofFile] = React.useState<File | null>(null)
  const [initialBalance, setInitialBalance] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [completedOrder, setCompletedOrder] = React.useState<CardOrder | null>(
    null
  )
  const [idempotencyKey] = React.useState(() => crypto.randomUUID())

  const loadCatalog = React.useCallback(async () => {
    if (!organization) {
      throw new Error("Choose an organization before ordering a card.")
    }
    return fetchCardOrderCatalog(organization.id)
  }, [organization])

  React.useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        const result = await loadCatalog()
        if (!cancelled) setCatalog(result)
      } catch (error) {
        if (!cancelled) {
          setCatalogError(
            error instanceof ApiError
              ? error.message
              : error instanceof Error
                ? error.message
                : "Failed to load available cards."
          )
        }
      } finally {
        if (!cancelled) setIsLoadingCatalog(false)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [loadCatalog])

  async function retryCatalog() {
    setIsLoadingCatalog(true)
    setCatalogError(null)
    try {
      setCatalog(await loadCatalog())
    } catch (error) {
      setCatalogError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Failed to load available cards."
      )
    } finally {
      setIsLoadingCatalog(false)
    }
  }

  const steps = PREMIUM_STEPS

  async function submitOrder() {
    if (!organization || !selectedDesign || !selectedPurpose) return
    const initialBalanceAmount =
      initialBalance === "" ? 0 : Number(initialBalance)
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const order = await createCardOrder(organization.id, {
        cardDesignId: selectedDesign.id,
        cardPurposeId: selectedPurpose.id,
        idempotencyKey,
        initialBalanceAmount,
        cardPaymentMethodId: selectedMethod?.id,
        paymentProof: proofFile ?? undefined,
      })
      setCompletedOrder(order)
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : "Failed to submit your card order."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function goBack() {
    setSubmitError(null)
    if (currentStep === "purpose") setCurrentStep("card")
    else if (currentStep === "payment") setCurrentStep("purpose")
    else if (currentStep === "verification") setCurrentStep("payment")
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background"
      role="dialog"
      aria-modal="true"
      aria-label="Order card"
    >
      {!completedOrder && (
        <StepperHeader current={currentStep} steps={steps} onClose={onClose} />
      )}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-xl px-6 py-8">
          {completedOrder ? (
            <SuccessScreen order={completedOrder} onClose={onClose} />
          ) : isLoadingCatalog ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
              <Spinner />
              Loading available cards…
            </div>
          ) : catalogError ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4">
              <ErrorMessage message={catalogError} />
              <Button onClick={() => void retryCatalog()} variant="outline">
                Try again
              </Button>
            </div>
          ) : !catalog || catalog.designs.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
              <h2 className="text-lg font-semibold text-foreground">
                No cards available
              </h2>
              <p className="text-sm text-muted-foreground">
                Card ordering is temporarily unavailable.
              </p>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {submitError && <ErrorMessage message={submitError} />}
              {currentStep === "card" ? (
                <CardStep
                  catalog={catalog}
                  selected={selectedDesign}
                  onSelect={(design) => {
                    setSelectedDesign(design)
                    setSelectedMethod(null)
                    setProofFile(null)
                    setInitialBalance("")
                  }}
                  onContinue={() => setCurrentStep("purpose")}
                  onCancel={onClose}
                />
              ) : currentStep === "purpose" ? (
                <PurposeStep
                  purposes={catalog.purposes}
                  selected={selectedPurpose}
                  onSelect={setSelectedPurpose}
                  onContinue={() => setCurrentStep("payment")}
                  onBack={goBack}
                  isSubmitting={isSubmitting}
                />
              ) : currentStep === "payment" && selectedDesign ? (
                <PaymentStep
                  design={selectedDesign}
                  methods={catalog.payment_methods}
                  selected={selectedMethod}
                  initialBalance={initialBalance}
                  onSelect={setSelectedMethod}
                  onInitialBalanceChange={setInitialBalance}
                  onContinue={() => setCurrentStep("verification")}
                  onBack={goBack}
                />
              ) : currentStep === "verification" &&
                selectedDesign &&
                selectedMethod ? (
                <VerificationStep
                  design={selectedDesign}
                  method={selectedMethod}
                  initialBalanceAmount={
                    initialBalance === "" ? 0 : Number(initialBalance)
                  }
                  proofFile={proofFile}
                  onFileChange={setProofFile}
                  onContinue={() => void submitOrder()}
                  onBack={goBack}
                  isSubmitting={isSubmitting}
                />
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
