"use client"

import * as React from "react"
import {
  computeContextBudget,
  type ContextBudget,
  type Doc,
  type RunResult,
} from "@/components/rag/retrieval"
import { fetchDatasets, type DatasetSummary } from "@/components/rag/api"
import { PROMPT_TEMPLATES } from "@/components/rag/data"
import { useActiveOrganization } from "@/hooks/use-active-organization"

// Rough average tokens per retrieved chunk, used only to preview the context
// budget before a query has actually run (and returned real chunk data).
const AVERAGE_CHUNK_TOKENS = 180

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
  datasets: DatasetSummary[]
  isLoadingDatasets: boolean
  datasetId: string | null
  setDatasetId: (id: string) => void
  refreshDatasets: () => Promise<void>
  runResult: RunResult | null
  setRunResult: (result: RunResult | null) => void
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
  const [runResult, setRunResult] = React.useState<RunResult | null>(null)

  const organization = useActiveOrganization()
  const [datasets, setDatasets] = React.useState<DatasetSummary[]>([])
  const [isLoadingDatasets, setIsLoadingDatasets] = React.useState(true)
  const [datasetId, setDatasetId] = React.useState<string | null>(null)

  const refreshDatasets = React.useCallback(async () => {
    if (!organization) return
    setIsLoadingDatasets(true)
    try {
      const list = await fetchDatasets(organization.id)
      setDatasets(list)
      setDatasetId((current) =>
        current && list.some((d) => d.id === current)
          ? current
          : (list[0]?.id ?? null)
      )
    } catch (error) {
      console.error("Failed to load datasets:", error)
    } finally {
      setIsLoadingDatasets(false)
    }
  }, [organization])

  React.useEffect(() => {
    refreshDatasets()
  }, [refreshDatasets])

  // Compute a representative context budget using an average chunk-size
  // estimate and the default system prompt so the meter updates live before
  // a real query has run. Once a query returns, the answer panel shows the
  // actual token usage instead.
  const contextBudget = React.useMemo<ContextBudget>(() => {
    const estimatedChunks: Doc[] = Array.from({ length: topK }, (_, i) => ({
      id: `estimate-${i}`,
      source: "estimate",
      text: "",
      tokens: AVERAGE_CHUNK_TOKENS,
    }))
    const defaultSystem = PROMPT_TEMPLATES[0].system
    return computeContextBudget(
      "sample query for budget estimation",
      estimatedChunks,
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
      datasets,
      isLoadingDatasets,
      datasetId,
      setDatasetId,
      refreshDatasets,
      runResult,
      setRunResult,
    }),
    [
      genModel,
      embedModel,
      topK,
      temperature,
      rerank,
      contextBudget,
      datasets,
      isLoadingDatasets,
      datasetId,
      refreshDatasets,
      runResult,
    ]
  )

  return <RagContext.Provider value={value}>{children}</RagContext.Provider>
}
