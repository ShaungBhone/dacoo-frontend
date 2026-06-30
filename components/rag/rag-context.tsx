"use client"

import * as React from "react"
import {
  computeContextBudget,
  KNOWLEDGE_BASE,
  type ContextBudget,
} from "@/components/rag/retrieval"
import { PROMPT_TEMPLATES } from "@/components/rag/data"

export type RagConfig = {
  genModel: string
  embedModel: string
  topK: number
  temperature: number
  rerank: boolean
}

type RagContextValue = {
  config: RagConfig
  setGenModel: (v: string) => void
  setEmbedModel: (v: string) => void
  setTopK: (v: number) => void
  setTemperature: (v: number) => void
  setRerank: (v: boolean) => void
  contextBudget: ContextBudget
}

const RagContext = React.createContext<RagContextValue | null>(null)

export function useRag() {
  const ctx = React.useContext(RagContext)
  if (!ctx) {
    throw new Error("useRag must be used within a RagProvider.")
  }
  return ctx
}

export function RagProvider({ children }: { children: React.ReactNode }) {
  const [genModel, setGenModel] = React.useState("gpt-4o")
  const [embedModel, setEmbedModel] = React.useState(
    "text-embedding-3-large"
  )
  const [topK, setTopK] = React.useState(4)
  const [temperature, setTemperature] = React.useState(0.2)
  const [rerank, setRerank] = React.useState(true)

  // Compute a representative context budget using the top-K chunks from the
  // knowledge base and the default system prompt so the meter updates live.
  const contextBudget = React.useMemo<ContextBudget>(() => {
    const topChunks = KNOWLEDGE_BASE.slice(0, topK)
    const defaultSystem = PROMPT_TEMPLATES[0].system
    return computeContextBudget(
      "sample query for budget estimation",
      topChunks,
      genModel,
      defaultSystem
    )
  }, [genModel, topK])

  const value = React.useMemo<RagContextValue>(
    () => ({
      config: { genModel, embedModel, topK, temperature, rerank },
      setGenModel,
      setEmbedModel,
      setTopK,
      setTemperature,
      setRerank,
      contextBudget,
    }),
    [genModel, embedModel, topK, temperature, rerank, contextBudget]
  )

  return <RagContext.Provider value={value}>{children}</RagContext.Provider>
}
