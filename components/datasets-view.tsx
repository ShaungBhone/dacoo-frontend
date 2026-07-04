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
  UploadIcon,
  SparklesIcon,
  WandSparklesIcon,
  RotateCwIcon,
  BotIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { ApiError } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useActiveOrganization } from "@/hooks/use-active-organization"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  createDataset,
  fetchDatasets,
  fetchDocuments,
  generateDocumentDraft,
  uploadDocument,
  retryDocumentIngestion,
  type DatasetSummary,
  type DocStatus,
  type DocumentSummary,
} from "@/components/rag/api"

const POLL_INTERVAL_MS = 2500
const ALLOWED_EXTENSIONS = ".md,.markdown,.txt,.mdx,.csv,.json,.xlsx"

/* -------------------------------------------------------------------------- */
/*                                  Component                                  */
/* -------------------------------------------------------------------------- */

export function DatasetsView() {
  const organization = useActiveOrganization()
  const router = useRouter()

  const [datasets, setDatasets] = React.useState<DatasetSummary[]>([])
  const [isLoadingDatasets, setIsLoadingDatasets] = React.useState(true)
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [documents, setDocuments] = React.useState<DocumentSummary[]>([])
  const [filter, setFilter] = React.useState("")
  const [generateOpen, setGenerateOpen] = React.useState(false)
  const [newDatasetOpen, setNewDatasetOpen] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [retryingId, setRetryingId] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [newDatasetForAgent, setNewDatasetForAgent] = React.useState<DatasetSummary | null>(null)
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
      setError(
        err instanceof ApiError ? err.message : "Failed to load datasets."
      )
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
      setError(
        err instanceof ApiError ? err.message : "Failed to load documents."
      )
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

  async function handleRetry(documentId: string) {
    if (!organization || !activeId) return
    setRetryingId(documentId)
    setError(null)
    try {
      const updatedDoc = await retryDocumentIngestion(
        organization.id,
        activeId,
        documentId
      )
      setDocuments((prev) =>
        prev.map((d) => (d.id === documentId ? updatedDoc : d))
      )
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to retry ingestion."
      )
    } finally {
      setRetryingId(null)
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
    setNewDatasetForAgent(created)
  }

  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(filter.trim().toLowerCase())
  )

  const totalChunks = documents.reduce((s, d) => s + d.chunks, 0)
  const totalTokens = documents.reduce((s, d) => s + d.tokens, 0)

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-background text-foreground">
      <div className="mx-auto flex w-full flex-1 flex-col gap-8 px-4 py-6 lg:flex-row lg:gap-10 lg:px-6">
        {/* ------------------------------ Left rail ----------------------------- */}
        <aside className="flex w-full shrink-0 flex-col gap-3 lg:w-64">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
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
            <Empty className="flex-none border p-6">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <DatabaseIcon />
                </EmptyMedia>
                <EmptyTitle>No datasets yet</EmptyTitle>
              </EmptyHeader>
            </Empty>
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

          {/* <button
            type="button"
            onClick={() => setGenerateOpen(true)}
            disabled={!active}
            className="mt-2 flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SparklesIcon className="size-4" />
            Generate with AI
          </button> */}


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
            isLoadingDatasets ? (
              <div className="flex flex-1 items-center justify-center p-10 text-sm text-muted-foreground">
                Loading…
              </div>
            ) : (
              <Empty className="border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <DatabaseIcon />
                  </EmptyMedia>
                  <EmptyTitle>Create a dataset to get started</EmptyTitle>
                </EmptyHeader>
                <EmptyContent>
                  <Button onClick={() => setNewDatasetOpen(true)}>
                    <PlusIcon data-icon="inline-start" />
                    New dataset
                  </Button>
                </EmptyContent>
              </Empty>
            )
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
                <p className="text-sm text-pretty text-muted-foreground">
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
                  <div className="hidden grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-border px-4 py-2.5 text-xs font-medium tracking-wide text-muted-foreground uppercase sm:grid">
                    <span>Source</span>
                    <span className="w-20 text-right">Chunks</span>
                    <span className="w-24 text-right">Tokens</span>
                    <span className="w-36 text-right">Status</span>
                  </div>

                  {filteredDocs.length === 0 ? (
                    documents.length === 0 ? (
                      <Empty className="p-8">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <FileTextIcon />
                          </EmptyMedia>
                          <EmptyTitle>No documents yet</EmptyTitle>
                          <EmptyDescription>
                            Upload a source to get started.
                          </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                          <Button
                            variant="outline"
                            onClick={handleUploadClick}
                            disabled={isUploading}
                          >
                            {isUploading ? (
                              <Loader2Icon data-icon="inline-start" />
                            ) : (
                              <UploadIcon data-icon="inline-start" />
                            )}
                            Upload source
                          </Button>
                        </EmptyContent>
                      </Empty>
                    ) : (
                      <Empty className="p-8">
                        <EmptyHeader>
                          <EmptyTitle>
                            No documents match &ldquo;{filter}&rdquo;
                          </EmptyTitle>
                          <EmptyDescription>
                            Try a different search term.
                          </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                          <Button
                            variant="outline"
                            onClick={() => setFilter("")}
                          >
                            Clear filter
                          </Button>
                        </EmptyContent>
                      </Empty>
                    )
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
                          <span className="sm:w-36 sm:text-right flex items-center justify-end gap-2">
                            {doc.status === "failed" && (
                              <Button
                                variant="outline"
                                className="h-7 px-2 text-xs flex items-center gap-1.5"
                                onClick={() => handleRetry(doc.id)}
                                disabled={retryingId === doc.id}
                              >
                                {retryingId === doc.id ? (
                                  <Loader2Icon className="size-3 animate-spin text-muted-foreground" />
                                ) : (
                                  <RotateCwIcon className="size-3 text-muted-foreground" />
                                )}
                                Retry
                              </Button>
                            )}
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

      {newDatasetForAgent && (
        <Dialog open={!!newDatasetForAgent} onOpenChange={(o) => !o && setNewDatasetForAgent(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <SparklesIcon className="size-4 animate-bounce" />
                </span>
                Recommend Agent Template
              </DialogTitle>
              <DialogDescription className="text-pretty mt-1.5">
                We detected the new dataset <span className="font-semibold text-foreground">"{newDatasetForAgent.name}"</span>. 
                Would you like to set up an AI agent using a recommended template optimized for this dataset?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex sm:justify-between gap-2 mt-2">
              <Button
                variant="ghost"
                onClick={() => setNewDatasetForAgent(null)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                Maybe later
              </Button>
              <Button
                onClick={() => {
                  router.push(`/agents?create=true&datasetId=${newDatasetForAgent.id}`)
                  setNewDatasetForAgent(null)
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
              >
                <BotIcon data-icon="inline-start" />
                Create Agent
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
      setError(
        err instanceof ApiError ? err.message : "Failed to create dataset."
      )
      setIsSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <DatabaseIcon className="size-4" />
            </span>
            New dataset
          </DialogTitle>
          <DialogDescription>
            Create a new dataset to organize your source documents.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="ds-name">Name</FieldLabel>
            <Input
              id="ds-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Product manuals"
              autoFocus
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="ds-desc">Description</FieldLabel>
            <Textarea
              id="ds-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="e.g. Manuals and spec sheets for our products"
            />
          </Field>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </FieldGroup>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!canCreate}>
            {isSaving ? (
              <Spinner />
            ) : (
              <CheckCircle2Icon data-icon="inline-start" />
            )}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
      setError(
        err instanceof ApiError ? err.message : "Failed to generate document."
      )
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
      setError(
        err instanceof ApiError ? err.message : "Failed to save document."
      )
      setIsSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[85svh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center gap-2 border-b border-border px-5 py-4">
          <span className="flex size-8 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <WandSparklesIcon className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-sm font-semibold">
              Generate with AI
            </DialogTitle>
            <DialogDescription className="truncate text-xs">
              Adds to{" "}
              <span className="font-mono text-foreground">{datasetName}</span>
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
          {step === "input" && (
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="gen-title">Title</FieldLabel>
                <Input
                  id="gen-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. How to set up your device"
                  autoFocus
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="gen-topic">Topic</FieldLabel>
                <Textarea
                  id="gen-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={4}
                  placeholder="Describe what this document should cover — e.g. what's in the box, setup steps, and common troubleshooting tips."
                />
                <FieldDescription>
                  The AI writes the document for you — no need to write it by
                  hand.
                </FieldDescription>
              </Field>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </FieldGroup>
          )}

          {step === "generating" && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
              <Spinner className="size-7 text-primary" />
              <p className="text-sm font-medium">Drafting your document…</p>
              <p className="max-w-xs text-xs text-pretty text-muted-foreground">
                Turning your topic into a ready-to-use document.
              </p>
            </div>
          )}

          {step === "preview" && (
            <div className="flex min-h-0 flex-1 flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="gen-content" className="text-xs">
                  Generated document · review &amp; edit
                </FieldLabel>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => setStep("input")}
                >
                  Regenerate
                </Button>
              </div>
              <Textarea
                id="gen-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-64 flex-1 resize-none font-mono text-xs leading-relaxed"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="flex flex-row items-center justify-end gap-2 border-t border-border px-5 py-4">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>

          {step === "preview" ? (
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Spinner />
              ) : (
                <CheckCircle2Icon data-icon="inline-start" />
              )}
              Save to dataset
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate || step === "generating"}
            >
              <SparklesIcon data-icon="inline-start" />
              Generate
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
        <p className="font-mono text-sm leading-tight font-semibold">{value}</p>
        <p className="truncate text-[11px] tracking-wide text-muted-foreground uppercase">
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
