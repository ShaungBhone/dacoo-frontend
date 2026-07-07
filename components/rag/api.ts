import { apiFetch } from "@/lib/api"
import type { Retrieved, StructuredAnswer } from "@/components/rag/retrieval"
import type { QuerySuggestion } from "./data"

export type DocStatus = "ready" | "indexing" | "failed"

export type DocumentSummary = {
  id: string
  name: string
  type: string
  chunks: number
  tokens: number
  updated: string | null
  status: DocStatus
}

export type DatasetSummary = {
  id: string
  name: string
  description: string | null
  embedModel: string | null
  status: "pending" | "ready" | "failed"
  lastIndexed: string
  documentsCount?: number
  // Only present when the dataset was fetched with its documents eager
  // loaded (not the case for the list endpoint) — fetch separately via
  // fetchDocuments() instead of relying on this being populated.
  documents?: DocumentSummary[]
}

export type QueryResponse = {
  query: string
  structured: StructuredAnswer
  chunks: Retrieved[]
  latencyMs: number
  tokens: number
  model: string
  // false when no indexed chunk was relevant enough to answer from.
  grounded: boolean
}

export type ModelOption = {
  id: string
  label: string
  provider: string
}

export type EmbeddingProviderOption = {
  id: string
  label: string
}

export type ModelCatalog = {
  chatModels: ModelOption[]
  embeddingProviders: EmbeddingProviderOption[]
}

export async function fetchModelCatalog(): Promise<ModelCatalog> {
  return apiFetch<ModelCatalog>("/api/v1/ai/models")
}

export async function fetchDatasets(
  organizationId: number
): Promise<DatasetSummary[]> {
  const res = await apiFetch<{ data: DatasetSummary[] }>(
    `/api/v1/organizations/${organizationId}/datasets`
  )
  return res.data
}

export async function createDataset(
  organizationId: number,
  input: { name: string; description?: string; embed_provider?: string }
): Promise<DatasetSummary> {
  const res = await apiFetch<{ data: DatasetSummary }>(
    `/api/v1/organizations/${organizationId}/datasets`,
    { method: "POST", body: input }
  )
  return res.data
}

export async function fetchDocuments(
  organizationId: number,
  datasetId: string
): Promise<DocumentSummary[]> {
  const res = await apiFetch<{ data: DocumentSummary[] }>(
    `/api/v1/organizations/${organizationId}/datasets/${datasetId}/documents`
  )
  return res.data
}

export async function uploadDocument(
  organizationId: number,
  datasetId: string,
  file: File
): Promise<DocumentSummary> {
  const formData = new FormData()
  formData.append("file", file)
  const res = await apiFetch<{ data: DocumentSummary }>(
    `/api/v1/organizations/${organizationId}/datasets/${datasetId}/documents`,
    { method: "POST", body: formData }
  )
  return res.data
}

export async function retryDocumentIngestion(
  organizationId: number,
  datasetId: string,
  documentId: string
): Promise<DocumentSummary> {
  const res = await apiFetch<{ data: DocumentSummary }>(
    `/api/v1/organizations/${organizationId}/datasets/${datasetId}/documents/${documentId}/retry`,
    { method: "POST" }
  )
  return res.data
}

export async function generateDocumentDraft(
  organizationId: number,
  datasetId: string,
  input: { title: string; topic: string }
): Promise<{ title: string; content: string }> {
  return apiFetch(
    `/api/v1/organizations/${organizationId}/datasets/${datasetId}/documents/generate`,
    { method: "POST", body: input }
  )
}

export async function runDatasetQuery(
  organizationId: number,
  datasetId: string,
  input: { query: string; system_prompt?: string; model?: string }
): Promise<QueryResponse> {
  return apiFetch(
    `/api/v1/organizations/${organizationId}/datasets/${datasetId}/query`,
    { method: "POST", body: input }
  )
}

export async function fetchSuggestions(
  organizationId: number,
  datasetId: string,
  input: {
    systemPrompt: string
    agentLabel?: string
    lastQuery?: string | null
  },
  signal?: AbortSignal
): Promise<QuerySuggestion[]> {
  const res = await apiFetch<{ suggestions: QuerySuggestion[] }>(
    `/api/v1/organizations/${organizationId}/datasets/${datasetId}/suggestions`,
    {
      method: "POST",
      body: {
        system_prompt: input.systemPrompt,
        agent_label: input.agentLabel,
        last_query: input.lastQuery || undefined,
      },
      signal,
    }
  )
  return res.suggestions
}

export type AgentSummary = {
  id: string
  name: string
  label: string // Required alias for compatibility
  description: string
  system: string
  status: "active" | "inactive" | "draft"
  messageCount: number
  createdAt: string
}

export async function fetchAgents(
  organizationId: number
): Promise<AgentSummary[]> {
  const res = await apiFetch<{ data: AgentSummary[] }>(
    `/api/v1/organizations/${organizationId}/agents`
  )
  return res.data.map((agent) => ({
    ...agent,
    description: agent.description || "",
    label: agent.name, // Map name to label for compatibility
  }))
}

export async function createAgent(
  organizationId: number,
  input: { name: string; description?: string; system: string; status: string }
): Promise<AgentSummary> {
  const res = await apiFetch<{ data: AgentSummary }>(
    `/api/v1/organizations/${organizationId}/agents`,
    { method: "POST", body: input }
  )
  return {
    ...res.data,
    description: res.data.description || "",
    label: res.data.name,
  }
}

export async function updateAgent(
  organizationId: number,
  agentId: string,
  input: { name: string; description?: string; system: string; status: string }
): Promise<AgentSummary> {
  const res = await apiFetch<{ data: AgentSummary }>(
    `/api/v1/organizations/${organizationId}/agents/${agentId}`,
    { method: "PUT", body: input }
  )
  return {
    ...res.data,
    description: res.data.description || "",
    label: res.data.name,
  }
}

export async function deleteAgent(
  organizationId: number,
  agentId: string
): Promise<void> {
  await apiFetch(`/api/v1/organizations/${organizationId}/agents/${agentId}`, {
    method: "DELETE",
  })
}

export type AiSettings = {
  auto_reply: boolean
  auto_assign: boolean
  default_model: string | null
}

export async function fetchAiSettings(
  organizationId: number
): Promise<AiSettings> {
  const res = await apiFetch<{ data: AiSettings }>(
    `/api/v1/organizations/${organizationId}/ai-settings`
  )
  return res.data
}

export async function updateAiSettings(
  organizationId: number,
  input: AiSettings
): Promise<AiSettings> {
  const res = await apiFetch<{ data: AiSettings }>(
    `/api/v1/organizations/${organizationId}/ai-settings`,
    { method: "PUT", body: input }
  )
  return res.data
}

export type ActivityStatus = "success" | "warning" | "error"

export type ActivityLogEntry = {
  id: string
  time: string
  query: string
  dataset: string
  model: string
  status: ActivityStatus
  latencyMs: number
  tokens: number
  chunks: number
  faithfulness: number | null
  note?: string
}

export type ActivityLogPage = {
  data: ActivityLogEntry[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export async function fetchActivityLogs(
  organizationId: number,
  params?: { status?: ActivityStatus; datasetId?: string; search?: string }
): Promise<ActivityLogPage> {
  const query = new URLSearchParams()
  if (params?.status) query.set("status", params.status)
  if (params?.datasetId) query.set("dataset_id", params.datasetId)
  if (params?.search) query.set("search", params.search)
  const qs = query.toString()
  return apiFetch<ActivityLogPage>(
    `/api/v1/organizations/${organizationId}/query-logs${qs ? `?${qs}` : ""}`
  )
}
