"use client"

import Link from "next/link"
import {
  SparklesIcon,
  GitBranchIcon,
  ChevronDownIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Playground", href: "/playground" },
  { label: "Datasets", href: "/datasets" },
  { label: "Experiments", href: "/experiments" },
  { label: "Logs", href: "/logs" },
  { label: "Settings", href: "/settings" },
]

export function PlaygroundNav({ active }: { active: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-4 px-4 lg:px-6">
        <Link href="/playground" className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <SparklesIcon className="size-4" />
          </div>
          <span className="text-sm font-semibold">RAG Playground</span>
        </Link>

        <button
          type="button"
          className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
        >
          <GitBranchIcon className="size-3.5" />
          <span className="font-mono text-foreground">acme / support-kb</span>
          <ChevronDownIcon className="size-3.5" />
        </button>

        <nav className="hidden flex-1 items-center justify-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "text-sm transition-colors",
                item.label === active
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 md:ml-0">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-primary" />
            index live
          </span>
          <div className="size-7 rounded-full bg-primary" aria-hidden />
        </div>
      </div>
    </header>
  )
}
