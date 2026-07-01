import { apiFetch } from "@/lib/api"
import type { Retrieved, StructuredAnswer } from "@/components/rag/retrieval"

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
}

export type ModelOption = {
  id: string
  label: string
  provider: string
}

export type EmbeddingModelOption = ModelOption & {
  dimensions: number
}

export type ModelCatalog = {
  chatModels: ModelOption[]
  embeddingModels: EmbeddingModelOption[]
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
  input: { name: string; description?: string; embed_model?: string }
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
