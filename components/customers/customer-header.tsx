"use client"

import {
  ArrowLeftIcon,
  BuildingIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  BriefcaseIcon,
  CalendarIcon,
  MoreHorizontalIcon,
} from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Customer, LifecycleStage } from "@/components/customers/data"
import { formatDate } from "@/components/customers/format"

const STAGE_LABEL: Record<LifecycleStage, string> = {
  lead: "Lead",
  active: "Active",
  churned: "Churned",
}

const STAGE_STYLES: Record<LifecycleStage, string> = {
  lead: "bg-chart-3/15 text-chart-3 dark:text-chart-2",
  active:
    "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-400",
  churned: "bg-destructive/10 text-destructive",
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
}

export function CustomerHeader({ customer }: { customer: Customer }) {
  const details = [
    { icon: BuildingIcon, label: "Company", value: customer.company },
    { icon: BriefcaseIcon, label: "Job title", value: customer.jobTitle },
    { icon: MailIcon, label: "Email", value: customer.email, href: `mailto:${customer.email}` },
    { icon: PhoneIcon, label: "Phone", value: customer.phone, href: `tel:${customer.phone}` },
    { icon: MapPinIcon, label: "Location", value: customer.location },
    {
      icon: CalendarIcon,
      label: "Customer since",
      value: formatDate(customer.customerSince),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/customers"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        Back to customers
      </Link>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <Avatar size="lg" className="size-16">
              <AvatarImage src={customer.avatar} alt="" />
              <AvatarFallback className="text-base font-medium">
                {initials(customer.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex min-w-0 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-balance">
                  {customer.name}
                </h1>
                <Badge
                  className={cn(
                    "border-transparent",
                    STAGE_STYLES[customer.stage]
                  )}
                >
                  {STAGE_LABEL[customer.stage]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {customer.jobTitle} at {customer.company}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button type="button" variant="outline" size="sm" asChild>
              <a href={`mailto:${customer.email}`}>
                <MailIcon data-icon="inline-start" aria-hidden="true" />
                Email
              </a>
            </Button>
            <Button type="button" size="sm">
              Start conversation
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="More actions"
            >
              <MoreHorizontalIcon aria-hidden="true" />
            </Button>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 border-t border-border pt-5 sm:grid-cols-2 lg:grid-cols-3">
          {details.map((d) => (
            <div key={d.label} className="flex items-start gap-2.5">
              <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
                <d.icon
                  className="size-3.5 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
              <div className="flex min-w-0 flex-col">
                <dt className="text-xs text-muted-foreground">{d.label}</dt>
                {d.href ? (
                  <a
                    href={d.href}
                    className="truncate text-sm font-medium text-foreground hover:text-primary hover:underline"
                  >
                    {d.value}
                  </a>
                ) : (
                  <dd className="truncate text-sm font-medium text-foreground">
                    {d.value}
                  </dd>
                )}
              </div>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
