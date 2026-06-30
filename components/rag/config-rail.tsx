"use client"

import { SlidersHorizontalIcon, GaugeIcon, TriangleAlertIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Field,
  RailHeading,
  Slider,
  Toggle,
} from "@/components/rag/primitives"
import { useRag } from "@/components/rag/rag-context"

export function ConfigRail() {
  const {
    config: { genModel, embedModel, topK, temperature, rerank },
    setGenModel,
    setEmbedModel,
    setTopK,
    setTemperature,
    setRerank,
    contextBudget,
  } = useRag()

  return (
    <section className="flex flex-col gap-5">
      <RailHeading icon={<SlidersHorizontalIcon className="size-3.5" />}>
        Retrieval config
      </RailHeading>

      <Field label="Generation model">
        <input
          value={genModel}
          onChange={(e) => setGenModel(e.target.value)}
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
        />
      </Field>

      <Field label="Embedding model">
        <input
          value={embedModel}
          onChange={(e) => setEmbedModel(e.target.value)}
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
        />
      </Field>

      <Slider
        label="Top-K chunks"
        value={topK}
        min={1}
        max={10}
        step={1}
        display={String(topK)}
        onChange={setTopK}
      />
      <Slider
        label="Temperature"
        value={temperature}
        min={0}
        max={1}
        step={0.05}
        display={temperature.toFixed(2)}
        onChange={setTemperature}
      />

      <button
        type="button"
        onClick={() => setRerank(!rerank)}
        className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
      >
        <span className="flex flex-col">
          <span className="text-sm font-medium">Cohere rerank</span>
          <span className="text-xs text-muted-foreground">
            Re-score retrieved chunks
          </span>
        </span>
        <Toggle on={rerank} />
      </button>

      {/* Context budget meter */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 px-3 py-3">
        <div className="flex items-center gap-2">
          <GaugeIcon className="size-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Context budget
          </span>
          {contextBudget.isOver && (
            <span className="ml-auto flex items-center gap-1 rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
              <TriangleAlertIcon className="size-2.5" />
              Over limit
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
          role="meter"
          aria-label="Context window usage"
          aria-valuenow={contextBudget.usedTokens}
          aria-valuemin={0}
          aria-valuemax={contextBudget.limitTokens}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              contextBudget.isOver
                ? "bg-destructive"
                : contextBudget.pct > 0.8
                  ? "bg-amber-500"
                  : "bg-primary"
            )}
            style={{ width: `${Math.min(100, contextBudget.pct * 100).toFixed(1)}%` }}
          />
        </div>

        {/* Usage fraction */}
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-xs font-semibold text-foreground">
            {contextBudget.usedTokens.toLocaleString()}
            <span className="font-normal text-muted-foreground">
              {" "}/ {contextBudget.limitTokens.toLocaleString()} tok
            </span>
          </span>
          <span
            className={cn(
              "font-mono text-xs font-semibold",
              contextBudget.isOver
                ? "text-destructive"
                : contextBudget.pct > 0.8
                  ? "text-amber-500"
                  : "text-muted-foreground"
            )}
          >
            {(contextBudget.pct * 100).toFixed(1)}%
          </span>
        </div>

        {/* Breakdown */}
        <div className="flex flex-col gap-1">
          {[
            { label: "System prompt", value: contextBudget.systemTokens },
            { label: "Chunks (Top-K)", value: contextBudget.chunkTokens },
            { label: "Query", value: contextBudget.queryTokens },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">{row.label}</span>
              <span className="font-mono text-[11px] text-foreground/70">
                {row.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
