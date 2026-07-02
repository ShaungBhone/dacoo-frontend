"use client"

import * as React from "react"
import {
  computeContextBudget,
  type ContextBudget,
  type Doc,
  type RunResult,
} from "@/components/rag/retrieval"
import {
  fetchDatasets,
  fetchModelCatalog,
  fetchDocuments,
  fetchAgents,
  type DatasetSummary,
  type ModelCatalog,
  type DocumentSummary,
  type AgentSummary,
} from "@/components/rag/api"
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
  setTopK: (v: number) => void
  setTemperature: (v: number) => void
  setRerank: (v: boolean) => void
  contextBudget: ContextBudget
  modelCatalog: ModelCatalog
  isLoadingModels: boolean
  datasets: DatasetSummary[]
  isLoadingDatasets: boolean
  datasetId: string | null
  setDatasetId: (id: string) => void
  refreshDatasets: () => Promise<void>
  runResult: RunResult | null
  setRunResult: (result: RunResult | null) => void
  
  // Dynamic Documents state
  documents: DocumentSummary[]
  isLoadingDocuments: boolean
  refreshDocuments: () => Promise<void>
  
  // Dynamic Agents state
  agents: AgentSummary[]
  isLoadingAgents: boolean
  refreshAgents: () => Promise<void>
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
  const [genModel, setGenModel] = React.useState("")
  const [topK, setTopK] = React.useState(4)
  const [temperature, setTemperature] = React.useState(0.2)
  const [rerank, setRerank] = React.useState(true)
  const [runResult, setRunResult] = React.useState<RunResult | null>(null)

  const [modelCatalog, setModelCatalog] = React.useState<ModelCatalog>({
    chatModels: [],
    embeddingModels: [],
  })
  const [isLoadingModels, setIsLoadingModels] = React.useState(true)

  const organization = useActiveOrganization()
  const [datasets, setDatasets] = React.useState<DatasetSummary[]>([])
  const [isLoadingDatasets, setIsLoadingDatasets] = React.useState(true)
  const [datasetId, setDatasetId] = React.useState<string | null>(null)

  // Dynamic Documents & Agents state
  const [documents, setDocuments] = React.useState<DocumentSummary[]>([])
  const [isLoadingDocuments, setIsLoadingDocuments] = React.useState(false)
  const [agents, setAgents] = React.useState<AgentSummary[]>([])
  const [isLoadingAgents, setIsLoadingAgents] = React.useState(true)

  // The embedding model is fixed per dataset (it must match how the dataset's
  // documents were embedded), so it is derived from the active dataset rather
  // than being independently editable in the Playground.
  const embedModel =
    datasets.find((d) => d.id === datasetId)?.embedModel ?? ""

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

  const refreshModelCatalog = React.useCallback(async () => {
    setIsLoadingModels(true)
    try {
      const catalog = await fetchModelCatalog()
      setModelCatalog(catalog)
      // Default the generation model to the first available option, so we never
      // ship a default that a deployment's configured provider keys don't offer.
      setGenModel((current) => current || catalog.chatModels[0]?.id || "")
    } catch (error) {
      console.error("Failed to load model catalog:", error)
    } finally {
      setIsLoadingModels(false)
    }
  }, [])

  const refreshDocuments = React.useCallback(async () => {
    if (!organization || !datasetId) {
      setDocuments([])
      return
    }
    setIsLoadingDocuments(true)
    try {
      const docs = await fetchDocuments(organization.id, datasetId)
      setDocuments(docs)
    } catch (error) {
      console.error("Failed to load documents:", error)
    } finally {
      setIsLoadingDocuments(false)
    }
  }, [organization, datasetId])

  const refreshAgents = React.useCallback(async () => {
    if (!organization) return
    setIsLoadingAgents(true)
    try {
      const list = await fetchAgents(organization.id)
      setAgents(list)
    } catch (error) {
      console.error("Failed to load agents:", error)
    } finally {
      setIsLoadingAgents(false)
    }
  }, [organization])

  React.useEffect(() => {
    refreshDatasets()
  }, [refreshDatasets])

  React.useEffect(() => {
    refreshModelCatalog()
  }, [refreshModelCatalog])

  React.useEffect(() => {
    refreshDocuments()
  }, [refreshDocuments])

  React.useEffect(() => {
    refreshAgents()
  }, [refreshAgents])

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
    const defaultSystem = agents[0]?.system || "You are a helpful assistant. Answer questions strictly using the context provided below. If the context does not contain enough information, say so."
    return computeContextBudget(
      "sample query for budget estimation",
      estimatedChunks,
      genModel,
      defaultSystem
    )
  }, [genModel, topK, agents])

  const value = React.useMemo<RagContextValue>(
    () => ({
      config: { genModel, embedModel, topK, temperature, rerank },
      setGenModel,
      setTopK,
      setTemperature,
      setRerank,
      contextBudget,
      modelCatalog,
      isLoadingModels,
      datasets,
      isLoadingDatasets,
      datasetId,
      setDatasetId,
      refreshDatasets,
      runResult,
      setRunResult,
      documents,
      isLoadingDocuments,
      refreshDocuments,
      agents,
      isLoadingAgents,
      refreshAgents,
    }),
    [
      genModel,
      embedModel,
      topK,
      temperature,
      rerank,
      contextBudget,
      modelCatalog,
      isLoadingModels,
      datasets,
      isLoadingDatasets,
      datasetId,
      setDatasetId,
      refreshDatasets,
      runResult,
      setRunResult,
      documents,
      isLoadingDocuments,
      refreshDocuments,
      agents,
      isLoadingAgents,
      refreshAgents,
    ]
  )

  return <RagContext.Provider value={value}>{children}</RagContext.Provider>
}
