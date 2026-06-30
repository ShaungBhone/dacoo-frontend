"use client"

import * as React from "react"
import {
  SparklesIcon,
  CopyIcon,
  CheckIcon,
  ClockIcon,
  CoinsIcon,
  ShieldCheckIcon,
  TargetIcon,
  FileTextIcon,
  TerminalIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Retrieved, RunResult } from "@/components/rag/retrieval"

export function AnswerPanel({
  result,
  isStreaming,
  streamedText,
}: {
  result: RunResult
  isStreaming: boolean
  streamedText: string
}) {
  const [tab, setTab] = React.useState<"answer" | "prompt">("answer")
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    setTab("answer")
  }, [result])

  function copy() {
    const allBullets = result.structured.sections.flatMap((s) => s.bullets)
    const text = [
      result.structured.summary.text,
      ...allBullets.map((b) => b.text),
    ].join("\n")
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const metrics = [
    { label: "Latency", value: `${result.latencyMs} ms`, icon: ClockIcon },
    {
      label: "Tokens",
      value: result.tokens.toLocaleString(),
      icon: CoinsIcon,
    },
    {
      label: "Faithfulness",
      value: `${result.faithfulness}%`,
      icon: ShieldCheckIcon,
    },
    {
      label: "Answer relevance",
      value: `${result.relevance}%`,
      icon: TargetIcon,
    },
  ]

  const streamedWords = new Set(streamedText.split(" ").filter(Boolean))

  function isTextVisible(text: string): boolean {
    if (!isStreaming) return true
    const firstWord = text.split(" ")[0]
    return streamedWords.has(firstWord ?? "")
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-1">
          {(["answer", "prompt"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                tab === t
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "answer" ? (
                <SparklesIcon className="size-3.5" />
              ) : (
                <TerminalIcon className="size-3.5" />
              )}
              {t === "answer" ? "Answer" : "Prompt"}
            </button>
          ))}
          <span className="ml-2 rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
            {result.model}
          </span>
        </div>

        {tab === "answer" && (
          <button
            type="button"
            onClick={copy}
            disabled={isStreaming}
            className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
          >
            {copied ? (
              <CheckIcon className="size-3.5 text-primary" />
            ) : (
              <CopyIcon className="size-3.5" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>

      {tab === "answer" && (
        <div className="px-5 py-5">
          <TooltipProvider delayDuration={100}>
            <p className="text-sm leading-7 text-foreground">
              {result.structured.summary.text}
              {isStreaming && (
                <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse rounded-sm bg-primary" />
              )}
              {result.structured.summary.cite != null && !isStreaming && (
                <Citation
                  n={result.structured.summary.cite}
                  chunk={result.chunks[result.structured.summary.cite - 1]}
                />
              )}
            </p>

            {result.structured.sections.map((section) => (
              <div
                key={section.heading}
                className={cn(
                  "mt-5 transition-opacity duration-300",
                  isStreaming &&
                    !isTextVisible(section.bullets[0]?.text ?? "")
                    ? "opacity-0"
                    : "opacity-100"
                )}
              >
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {section.heading}
                </p>
                <ul className="flex flex-col gap-2">
                  {section.bullets.map((bullet, bi) => (
                    <li
                      key={bi}
                      className={cn(
                        "flex items-start gap-2 text-sm leading-6 text-foreground/90 transition-opacity duration-200",
                        isStreaming && !isTextVisible(bullet.text)
                          ? "opacity-0"
                          : "opacity-100"
                      )}
                    >
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/60" />
                      <span>
                        {bullet.text}
                        {bullet.cite != null && !isStreaming && (
                          <Citation
                            n={bullet.cite}
                            chunk={result.chunks[bullet.cite - 1]}
                          />
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {result.structured.sourceNote && !isStreaming && (
              <p className="mt-4 text-xs text-muted-foreground">
                {result.structured.sourceNote}
              </p>
            )}
          </TooltipProvider>

          <div
            className={cn(
              "mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 transition-opacity duration-500 md:grid-cols-4",
              isStreaming ? "opacity-0" : "opacity-100"
            )}
          >
            {metrics.map((m) => (
              <div
                key={m.label}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
              >
                <m.icon className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="font-mono text-sm font-semibold leading-tight">
                    {m.value}
                  </p>
                  <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">
                    {m.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "prompt" && (
        <div className="px-5 py-5">
          <p className="mb-3 text-xs text-muted-foreground text-pretty">
            The exact context window sent to the model — system prompt,
            retrieved chunks, and user query.
          </p>
          <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-xs leading-6 text-foreground/80 whitespace-pre-wrap break-words">
            {result.promptPreview}
          </pre>
        </div>
      )}
    </div>
  )
}

function Citation({ n, chunk }: { n: number; chunk?: Retrieved }) {
  const badge = (
    <button
      type="button"
      className="mx-0.5 inline-flex size-4 translate-y-[-1px] cursor-pointer items-center justify-center rounded bg-primary/10 align-middle font-mono text-[10px] font-semibold text-primary outline-none transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
      aria-label={chunk ? `Source ${n}: ${chunk.source}` : `Source ${n}`}
    >
      {n}
    </button>
  )

  if (!chunk) return badge

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent
        side="top"
        className="block max-w-sm rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-md [&_svg]:hidden"
      >
        <span className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
          <span className="flex min-w-0 items-center gap-1.5">
            <FileTextIcon className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate font-mono text-xs font-medium text-foreground">
              {chunk.source}
            </span>
          </span>
          <span className="shrink-0 font-mono text-xs font-semibold text-primary">
            {chunk.score.toFixed(3)}
          </span>
        </span>
        <span className="block px-3 pt-1.5 text-[11px] text-muted-foreground">
          {chunk.path} · p.&nbsp;{chunk.page} · {chunk.tokens} tok
        </span>
        <span className="block px-3 pb-3 pt-1.5 text-xs leading-5 text-foreground/80">
          {chunk.text}
        </span>
      </TooltipContent>
    </Tooltip>
  )
}
