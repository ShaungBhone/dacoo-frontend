"use client"

import * as React from "react"
import { DatabaseIcon, FileTextIcon, Loader2Icon } from "lucide-react"

import { RailHeading } from "@/components/rag/primitives"
import { useRag } from "@/components/rag/rag-context"
import { useActiveOrganization } from "@/hooks/use-active-organization"
import { fetchDocuments, type DocumentSummary } from "@/components/rag/api"

const POLL_INTERVAL_MS = 2500

export function KnowledgeBase() {
  const organization = useActiveOrganization()
  const { datasets, isLoadingDatasets, datasetId, setDatasetId } = useRag()
  const [documents, setDocuments] = React.useState<DocumentSummary[]>([])

  const load = React.useCallback(async () => {
    if (!organization || !datasetId) {
      setDocuments([])
      return
    }
    try {
      setDocuments(await fetchDocuments(organization.id, datasetId))
    } catch (error) {
      console.error("Failed to load documents:", error)
    }
  }, [organization, datasetId])

  React.useEffect(() => {
    load()
  }, [load])

  // Ingestion runs in a queued job on the backend, so poll while any document
  // is still indexing rather than assuming a fixed completion delay.
  React.useEffect(() => {
    if (!documents.some((doc) => doc.status === "indexing")) return
    const id = setInterval(load, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [documents, load])

  return (
    <section className="flex flex-col gap-3">
      <RailHeading icon={<DatabaseIcon className="size-3.5" />}>
        Knowledge base
      </RailHeading>

      <select
        value={datasetId ?? ""}
        onChange={(e) => setDatasetId(e.target.value)}
        disabled={isLoadingDatasets || datasets.length === 0}
        className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs outline-none transition-colors focus:border-primary/50 disabled:opacity-50"
      >
        {datasets.length === 0 ? (
          <option value="">
            {isLoadingDatasets ? "Loading datasets…" : "No datasets yet"}
          </option>
        ) : (
          datasets.map((dataset) => (
            <option key={dataset.id} value={dataset.id}>
              {dataset.name}
            </option>
          ))
        )}
      </select>

      <ul className="flex flex-col gap-1">
        {documents.map((file) => (
          <li
            key={file.id}
            className="flex items-center gap-2 rounded-md px-1.5 py-1.5 text-sm transition-colors hover:bg-muted/50"
          >
            <FileTextIcon className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">
              {file.name}
            </span>
            {file.status === "indexing" ? (
              <Loader2Icon className="size-3.5 shrink-0 animate-spin text-primary" />
            ) : (
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                {file.tokens}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
