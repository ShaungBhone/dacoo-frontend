"use client"

import * as React from "react"
import {
  DatabaseIcon,
  FileTextIcon,
  SearchIcon,
  PlusIcon,
  Loader2Icon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  LayersIcon,
  CoinsIcon,
  ClockIcon,
  HashIcon,
  UploadIcon,
  SparklesIcon,
  XIcon,
  WandSparklesIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { ApiError } from "@/lib/api"
import { useActiveOrganization } from "@/hooks/use-active-organization"
import {
  createDataset,
  fetchDatasets,
  fetchDocuments,
  generateDocumentDraft,
  uploadDocument,
  type DatasetSummary,
  type DocStatus,
  type DocumentSummary,
} from "@/components/rag/api"

const POLL_INTERVAL_MS = 2500
const ALLOWED_EXTENSIONS = ".pdf,.md,.markdown,.txt,.mdx,.csv,.json"

/* -------------------------------------------------------------------------- */
/*                                  Component                                  */
/* -------------------------------------------------------------------------- */

export function DatasetsView() {
  const organization = useActiveOrganization()

  const [datasets, setDatasets] = React.useState<DatasetSummary[]>([])
  const [isLoadingDatasets, setIsLoadingDatasets] = React.useState(true)
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [documents, setDocuments] = React.useState<DocumentSummary[]>([])
  const [filter, setFilter] = React.useState("")
  const [generateOpen, setGenerateOpen] = React.useState(false)
  const [newDatasetOpen, setNewDatasetOpen] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const active = datasets.find((d) => d.id === activeId) ?? null

  const loadDatasets = React.useCallback(async () => {
    if (!organization) return
    setIsLoadingDatasets(true)
    try {
      const list = await fetchDatasets(organization.id)
      setDatasets(list)
      setActiveId((current) =>
        current && list.some((d) => d.id === current)
          ? current
          : (list[0]?.id ?? null)
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load datasets.")
    } finally {
      setIsLoadingDatasets(false)
    }
  }, [organization])

  React.useEffect(() => {
    loadDatasets()
  }, [loadDatasets])

  const loadDocuments = React.useCallback(async () => {
    if (!organization || !activeId) {
      setDocuments([])
      return
    }
    try {
      setDocuments(await fetchDocuments(organization.id, activeId))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load documents.")
    }
  }, [organization, activeId])

  React.useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  // Ingestion runs in a queued job on the backend, so poll while any document
  // in the active dataset is still indexing rather than assuming a fixed delay.
  React.useEffect(() => {
    if (!documents.some((doc) => doc.status === "indexing")) return
    const id = setInterval(loadDocuments, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [documents, loadDocuments])

  async function handleUpload(file: File) {
    if (!organization || !activeId) return
    setIsUploading(true)
    setError(null)
    try {
      const doc = await uploadDocument(organization.id, activeId, file)
      setDocuments((prev) => [doc, ...prev])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed.")
    } finally {
      setIsUploading(false)
    }
  }

  function handleUploadClick() {
    fileInputRef.current?.click()
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (file) handleUpload(file)
  }

  async function handleCreateDataset(name: string, description: string) {
    if (!organization) return
    const created = await createDataset(organization.id, {
      name,
      description: description || undefined,
    })
    setDatasets((prev) => [created, ...prev])
    setActiveId(created.id)
    setNewDatasetOpen(false)
  }

  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(filter.trim().toLowerCase())
  )

  const totalChunks = documents.reduce((s, d) => s + d.chunks, 0)
  const totalTokens = documents.reduce((s, d) => s + d.tokens, 0)

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-6 lg:flex-row lg:gap-10 lg:px-6">
        {/* ------------------------------ Left rail ----------------------------- */}
        <aside className="flex w-full shrink-0 flex-col gap-3 lg:w-64">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <DatabaseIcon className="size-3.5" />
              Datasets
            </div>
            <button
              type="button"
              onClick={() => setNewDatasetOpen(true)}
              className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <PlusIcon className="size-3.5" />
              New
            </button>
          </div>

          {isLoadingDatasets ? (
            <p className="px-1 py-4 text-center text-xs text-muted-foreground">
              Loading datasets…
            </p>
          ) : datasets.length === 0 ? (
            <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
              No datasets yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {datasets.map((dataset) => {
                const isActive = dataset.id === active?.id
                return (
                  <li key={dataset.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveId(dataset.id)
                        setFilter("")
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md border px-3 py-2.5 text-left transition-colors",
                        isActive
                          ? "border-primary/40 bg-primary/10"
                          : "border-transparent hover:bg-muted/50"
                      )}
                    >
                      <DatabaseIcon
                        className={cn(
                          "size-4 shrink-0",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block truncate font-mono text-sm",
                            isActive
                              ? "font-medium text-foreground"
                              : "text-foreground"
                          )}
                        >
                          {dataset.name}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {dataset.documentsCount ?? 0} docs
                        </span>
                      </span>
                      {dataset.status !== "ready" && (
                        <Loader2Icon className="size-3.5 shrink-0 animate-spin text-primary" />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_EXTENSIONS}
            className="hidden"
            onChange={handleFileSelected}
          />

          <button
            type="button"
            onClick={() => setGenerateOpen(true)}
            disabled={!active}
            className="mt-2 flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SparklesIcon className="size-4" />
            Generate with AI
          </button>

          <button
            type="button"
            onClick={handleUploadClick}
            disabled={!active || isUploading}
            className="flex items-center justify-center gap-2 rounded-md border border-dashed border-border px-3 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <UploadIcon className="size-4" />
            )}
            Upload source
          </button>
        </aside>

        {/* ------------------------------- Detail ------------------------------- */}
        <main className="flex min-w-0 flex-1 flex-col gap-6">
          {error && (
            <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          {!active ? (
            <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              {isLoadingDatasets
                ? "Loading…"
                : "Create a dataset to get started."}
            </p>
          ) : (
            <>
              <header className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-mono text-xl font-semibold tracking-tight">
                    {active.name}
                  </h1>
                  <span
                    className={cn(
                      "rounded px-2 py-0.5 text-xs font-medium",
                      active.status === "ready"
                        ? "bg-primary/10 text-primary"
                        : active.status === "failed"
                          ? "bg-red-50 text-red-600"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {active.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground text-pretty">
                  {active.description || "No description."}
                </p>
              </header>

              {/* Stats strip */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat
                  icon={FileTextIcon}
                  label="Documents"
                  value={String(documents.length)}
                />
                <Stat
                  icon={LayersIcon}
                  label="Chunks"
                  value={totalChunks.toLocaleString()}
                />
                <Stat
                  icon={CoinsIcon}
                  label="Tokens"
                  value={totalTokens.toLocaleString()}
                />
                <Stat
                  icon={ClockIcon}
                  label="Last indexed"
                  value={active.lastIndexed}
                />
              </div>

              {/* Embedding model line */}
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm">
                <HashIcon className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">Embedding model</span>
                <span className="ml-auto font-mono text-foreground">
                  {active.embedModel || "default"}
                </span>
              </div>

              {/* Documents */}
              <section className="flex flex-col gap-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-sm font-semibold">Documents</h2>
                  <div className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 sm:w-64">
                    <SearchIcon className="size-3.5 shrink-0 text-muted-foreground" />
                    <input
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      placeholder="Filter documents…"
                      className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-border bg-card">
                  {/* Table header */}
                  <div className="hidden grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-border px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:grid">
                    <span>Source</span>
                    <span className="w-20 text-right">Chunks</span>
                    <span className="w-24 text-right">Tokens</span>
                    <span className="w-24 text-right">Status</span>
                  </div>

                  {filteredDocs.length === 0 ? (
                    <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                      {documents.length === 0
                        ? "No documents yet. Upload a source to get started."
                        : `No documents match "${filter}".`}
                    </p>
                  ) : (
                    <ul>
                      {filteredDocs.map((doc) => (
                        <li
                          key={doc.id}
                          className="grid grid-cols-1 gap-2 border-b border-border px-4 py-3 last:border-b-0 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center sm:gap-4"
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
                            <span className="min-w-0">
                              <span className="block truncate font-mono text-sm text-foreground">
                                {doc.name}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                {doc.type}
                                {doc.updated ? ` · updated ${doc.updated}` : ""}
                              </span>
                            </span>
                          </div>
                          <span className="font-mono text-sm text-muted-foreground sm:w-20 sm:text-right">
                            <span className="text-muted-foreground sm:hidden">
                              Chunks:{" "}
                            </span>
                            {doc.chunks.toLocaleString()}
                          </span>
                          <span className="font-mono text-sm text-muted-foreground sm:w-24 sm:text-right">
                            <span className="text-muted-foreground sm:hidden">
                              Tokens:{" "}
                            </span>
                            {doc.tokens.toLocaleString()}
                          </span>
                          <span className="sm:w-24 sm:text-right">
                            <StatusBadge status={doc.status} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      {generateOpen && active && organization && (
        <GenerateDocDialog
          datasetName={active.name}
          organizationId={organization.id}
          datasetId={active.id}
          onClose={() => setGenerateOpen(false)}
          onSaved={(doc) => {
            setDocuments((prev) => [doc, ...prev])
            setGenerateOpen(false)
          }}
        />
      )}

      {newDatasetOpen && (
        <NewDatasetDialog
          onClose={() => setNewDatasetOpen(false)}
          onCreate={handleCreateDataset}
        />
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                              New dataset dialog                             */
/* -------------------------------------------------------------------------- */

function NewDatasetDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (name: string, description: string) => Promise<void>
}) {
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const canCreate = name.trim().length > 0 && !isSaving

  async function handleCreate() {
    if (!canCreate) return
    setIsSaving(true)
    setError(null)
    try {
      await onCreate(name.trim(), description.trim())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create dataset.")
      setIsSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Create dataset"
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
      />
      <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-border bg-card shadow-lg">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <DatabaseIcon className="size-4" />
          </span>
          <h2 className="flex-1 text-sm font-semibold">New dataset</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-5 py-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ds-name" className="text-xs font-medium text-muted-foreground">
              Name
            </label>
            <input
              id="ds-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="support-kb"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary/50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ds-desc" className="text-xs font-medium text-muted-foreground">
              Description
            </label>
            <textarea
              id="ds-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What this dataset is for (optional)"
              className="resize-none rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none transition-colors focus:border-primary/50"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!canCreate}
            className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <CheckCircle2Icon className="size-4" />
            )}
            Create
          </button>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                            Generate with AI dialog                          */
/* -------------------------------------------------------------------------- */

type GenStep = "input" | "generating" | "preview"

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "untitled"
  )
}

function GenerateDocDialog({
  datasetName,
  organizationId,
  datasetId,
  onClose,
  onSaved,
}: {
  datasetName: string
  organizationId: number
  datasetId: string
  onClose: () => void
  onSaved: (doc: DocumentSummary) => void
}) {
  const [step, setStep] = React.useState<GenStep>("input")
  const [title, setTitle] = React.useState("")
  const [topic, setTopic] = React.useState("")
  const [content, setContent] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)

  const canGenerate = title.trim().length > 0 && topic.trim().length > 0

  async function handleGenerate() {
    if (!canGenerate) return
    setStep("generating")
    setError(null)
    try {
      const draft = await generateDocumentDraft(organizationId, datasetId, {
        title: title.trim(),
        topic: topic.trim(),
      })
      setContent(draft.content)
      setStep("preview")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to generate document.")
      setStep("input")
    }
  }

  async function handleSave() {
    setIsSaving(true)
    setError(null)
    try {
      const name = `${slugify(title)}.md`
      const file = new File([content], name, { type: "text/markdown" })
      const doc = await uploadDocument(organizationId, datasetId, file)
      onSaved(doc)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save document.")
      setIsSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Generate document with AI"
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
      />

      <div className="relative flex max-h-[85svh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <WandSparklesIcon className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold">Generate with AI</h2>
            <p className="truncate text-xs text-muted-foreground">
              Adds to{" "}
              <span className="font-mono text-foreground">{datasetName}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
          {step === "input" && (
            <>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="gen-title"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Title
                </label>
                <input
                  id="gen-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Cold chain handling guide"
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary/50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="gen-topic"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Topic
                </label>
                <textarea
                  id="gen-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={4}
                  placeholder="Describe what this document should cover, e.g. temperature thresholds, packaging, and escalation steps for perishable shipments."
                  className="resize-none rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none transition-colors focus:border-primary/50"
                />
                <p className="text-xs text-muted-foreground">
                  The AI drafts the markdown for you — no need to write it by hand.
                </p>
              </div>

              {error && <p className="text-xs text-destructive">{error}</p>}
            </>
          )}

          {step === "generating" && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
              <Loader2Icon className="size-7 animate-spin text-primary" />
              <p className="text-sm font-medium">Drafting your document…</p>
              <p className="max-w-xs text-xs text-muted-foreground text-pretty">
                Generating structured, chunk-friendly markdown from your topic.
              </p>
            </div>
          )}

          {step === "preview" && (
            <div className="flex min-h-0 flex-1 flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="gen-content"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Generated markdown · review &amp; edit
                </label>
                <button
                  type="button"
                  onClick={() => setStep("input")}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Regenerate
                </button>
              </div>
              <textarea
                id="gen-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-64 flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 font-mono text-xs leading-relaxed outline-none transition-colors focus:border-primary/50"
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Cancel
          </button>

          {step === "preview" ? (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <CheckCircle2Icon className="size-4" />
              )}
              Save to dataset
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate || step === "generating"}
              className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SparklesIcon className="size-4" />
              Generate
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                Small parts                                  */
/* -------------------------------------------------------------------------- */

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="font-mono text-sm font-semibold leading-tight">{value}</p>
        <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: DocStatus }) {
  if (status === "indexing") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
        <Loader2Icon className="size-3 animate-spin" />
        Indexing
      </span>
    )
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
        <AlertTriangleIcon className="size-3" />
        Failed
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      <CheckCircle2Icon className="size-3 text-primary" />
      Ready
    </span>
  )
}
