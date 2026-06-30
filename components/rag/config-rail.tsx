"use client"

import { SlidersHorizontalIcon } from "lucide-react"

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
    </section>
  )
}
