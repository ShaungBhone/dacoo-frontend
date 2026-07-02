"use client"

import * as React from "react"
import {
  BotIcon,
  SearchIcon,
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  SparklesIcon,
  WandSparklesIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { useSearchParams } from "next/navigation"
import { useActiveOrganization } from "@/hooks/use-active-organization"
import {
  fetchAgents,
  createAgent,
  updateAgent,
  deleteAgent,
  fetchDatasets,
  type AgentSummary as Agent,
  type DatasetSummary,
} from "@/components/rag/api"
import { AGENTS } from "@/components/rag/data"

/* -------------------------------------------------------------------------- */
/*                                  Constants                                  */
/* -------------------------------------------------------------------------- */

type AgentStatus = "active" | "inactive" | "draft"

/* -------------------------------------------------------------------------- */
/*                              AgentsView                                      */
/* -------------------------------------------------------------------------- */

export function AgentsView() {
  const organization = useActiveOrganization()
  const searchParams = useSearchParams()

  const [agents, setAgents] = React.useState<Agent[]>([])
  const [datasets, setDatasets] = React.useState<DatasetSummary[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editTarget, setEditTarget] = React.useState<Agent | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<Agent | null>(null)

  const preselectedDatasetId = searchParams?.get("datasetId") || null

  const loadAgents = React.useCallback(async () => {
    if (!organization) return
    setIsLoading(true)
    try {
      const list = await fetchAgents(organization.id)
      setAgents(list)
    } catch (error) {
      console.error("Failed to load agents:", error)
    } finally {
      setIsLoading(false)
    }
  }, [organization])

  const loadDatasets = React.useCallback(async () => {
    if (!organization) return
    try {
      const list = await fetchDatasets(organization.id)
      setDatasets(list)
    } catch (error) {
      console.error("Failed to load datasets:", error)
    }
  }, [organization])

  React.useEffect(() => {
    loadAgents()
    loadDatasets()
  }, [loadAgents, loadDatasets])

  React.useEffect(() => {
    if (searchParams?.get("create") === "true") {
      setCreateOpen(true)
    }
  }, [searchParams])

  const filtered = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.trim().toLowerCase()) ||
      (a.description?.toLowerCase() || "").includes(search.trim().toLowerCase())
  )

  async function handleCreate(data: AgentFormData) {
    if (!organization) return
    try {
      const newAgent = await createAgent(organization.id, {
        name: data.name,
        description: data.description,
        system: data.system,
        status: data.status,
      })
      setAgents((prev) => [newAgent, ...prev])
      setCreateOpen(false)
    } catch (error) {
      console.error("Failed to create agent:", error)
    }
  }

  async function handleEdit(data: AgentFormData) {
    if (!organization || !editTarget) return
    try {
      const updated = await updateAgent(organization.id, editTarget.id, {
        name: data.name,
        description: data.description,
        system: data.system,
        status: data.status,
      })
      setAgents((prev) =>
        prev.map((a) => (a.id === editTarget.id ? updated : a))
      )
      setEditTarget(null)
    } catch (error) {
      console.error("Failed to update agent:", error)
    }
  }

  async function handleDelete() {
    if (!organization || !deleteTarget) return
    try {
      await deleteAgent(organization.id, deleteTarget.id)
      setAgents((prev) => prev.filter((a) => a.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (error) {
      console.error("Failed to delete agent:", error)
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
        {/* Header row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Agents</h1>
            <p className="text-sm text-muted-foreground text-pretty">
              Manage your AI agents — create, configure, and remove them here.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="self-start sm:self-auto" disabled={!organization}>
            <PlusIcon data-icon="inline-start" />
            New agent
          </Button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Total" value={isLoading ? "..." : String(agents.length)} />
          <StatCard label="Active" value={isLoading ? "..." : String(agents.filter((a) => a.status === "active").length)} highlight />
          <StatCard label="Draft" value={isLoading ? "..." : String(agents.filter((a) => a.status === "draft").length)} />
          <StatCard
            label="Messages"
            value={isLoading ? "..." : agents.reduce((s, a) => s + a.messageCount, 0).toLocaleString()}
          />
        </div>

        {/* Search */}
        <InputGroup className="sm:w-80">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents…"
            aria-label="Search agents"
            disabled={isLoading}
          />
          {search && (
            <InputGroupButton
              variant="ghost"
              size="icon-xs"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <XIcon />
            </InputGroupButton>
          )}
        </InputGroup>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="hidden grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-border px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:grid">
            <span>Agent</span>
            <span className="w-20 text-right">Messages</span>
            <span className="w-20 text-center">Status</span>
            <span className="w-16 text-right">Actions</span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-14 text-center">
              <Spinner className="size-8 text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Loading agents…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
              <BotIcon className="size-8 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">
                {agents.length === 0 ? "No agents yet." : `No agents match "${search}".`}
              </p>
              {agents.length === 0 && (
                <Button
                  variant="link"
                  onClick={() => setCreateOpen(true)}
                  className="mt-1 px-0 text-xs"
                >
                  Create your first agent
                </Button>
              )}
            </div>
          ) : (
            <ul>
              {filtered.map((agent) => (
                <li
                  key={agent.id}
                  className="grid grid-cols-1 gap-2 border-b border-border px-4 py-3 last:border-b-0 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center sm:gap-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <BotIcon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{agent.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{agent.description}</p>
                    </div>
                  </div>

                  <span className="font-mono text-sm text-muted-foreground sm:w-20 sm:text-right">
                    <span className="mr-1 text-muted-foreground sm:hidden">Messages: </span>
                    {agent.messageCount.toLocaleString()}
                  </span>

                  <span className="sm:w-20 sm:text-center">
                    <AgentStatusBadge status={agent.status} />
                  </span>

                  <div className="flex items-center justify-end gap-1 sm:w-16">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setEditTarget(agent)}
                      aria-label={`Edit ${agent.name}`}
                    >
                      <PencilIcon />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeleteTarget(agent)}
                      aria-label={`Delete ${agent.name}`}
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!isLoading && filtered.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {filtered.length} of {agents.length} agent{agents.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Dialogs */}
      <AgentFormDialog
        key="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        onSubmit={handleCreate}
        datasets={datasets}
        preselectedDatasetId={preselectedDatasetId}
      />

      <AgentFormDialog
        key={`edit-${editTarget?.id ?? "none"}`}
        open={!!editTarget}
        onOpenChange={(o) => !o && setEditTarget(null)}
        mode="edit"
        initial={editTarget ?? undefined}
        onSubmit={handleEdit}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        agentName={deleteTarget?.name ?? ""}
        onConfirm={handleDelete}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                              Agent form dialog                              */
/* -------------------------------------------------------------------------- */

interface AgentFormData {
  name: string
  description: string
  status: AgentStatus
  system: string
}

function AgentFormDialog({
  open,
  onOpenChange,
  mode,
  initial,
  onSubmit,
  datasets = [],
  preselectedDatasetId = null,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  initial?: Agent
  onSubmit: (data: AgentFormData) => void
  datasets?: DatasetSummary[]
  preselectedDatasetId?: string | null
}) {
  const [name, setName] = React.useState(initial?.name ?? "")
  const [description, setDescription] = React.useState(initial?.description ?? "")
  const [status, setStatus] = React.useState<AgentStatus>(initial?.status ?? "draft")
  const [system, setSystem] = React.useState(initial?.system ?? "")
  const [isSaving, setIsSaving] = React.useState(false)

  const [showRecommendation, setShowRecommendation] = React.useState(true)
  const [isUsingTemplate, setIsUsingTemplate] = React.useState(false)
  const [selectedDatasetId, setSelectedDatasetId] = React.useState("")
  const [selectedTemplateId, setSelectedTemplateId] = React.useState("support")

  const canSubmit = name.trim().length > 0 && system.trim().length > 0 && !isSaving

  const applyTemplate = React.useCallback((dsId: string, templateId: string) => {
    const ds = datasets.find((d) => d.id === dsId)
    const tmpl = AGENTS.find((a) => a.id === templateId)
    if (!ds || !tmpl) return

    const suffix = tmpl.id === "default" ? "Assistant" : tmpl.label
    setName(`${ds.name} ${suffix}`)
    setDescription(`AI Agent optimized for ${ds.name} using the ${tmpl.label.toLowerCase()} template.`)
    
    // Format system prompt to explicitly reference the dataset
    const customPrompt = `${tmpl.system}\n\nInstructions:\n- Answer queries strictly using the retrieved context from the dataset: "${ds.name}".\n- Be factual and do not make up facts outside the provided knowledge.`
    setSystem(customPrompt)
  }, [datasets])

  React.useEffect(() => {
    if (open && mode === "create" && preselectedDatasetId && datasets.length > 0) {
      const exists = datasets.some((d) => d.id === preselectedDatasetId)
      if (exists) {
        setSelectedDatasetId(preselectedDatasetId)
        setIsUsingTemplate(true)
        setShowRecommendation(false)
        applyTemplate(preselectedDatasetId, "support")
      }
    } else if (open && mode === "create" && datasets.length > 0) {
      setSelectedDatasetId(datasets[0].id)
    }
  }, [open, mode, preselectedDatasetId, datasets, applyTemplate])

  function handleSubmit() {
    if (!canSubmit) return
    setIsSaving(true)
    onSubmit({ name: name.trim(), description: description.trim(), status, system: system.trim() })
    setIsSaving(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="data-[side=right]:sm:max-w-lg"
        onPointerDownOutside={(e) => {
          // Prevent accidental overlay clicks from dismissing form if dirty
          if (name.trim() || system.trim()) {
            e.preventDefault()
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevent accidental ESC key dismissals if dirty
          if (name.trim() || system.trim()) {
            e.preventDefault()
          }
        }}
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BotIcon className="size-4" />
            </span>
            {mode === "create" ? "New agent" : "Edit agent"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Create a new AI agent. Fields marked with * are required."
              : "Update this agent's configuration."}
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable body containing recommendation section and form fields */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-5">
          {mode === "create" && datasets.length > 0 && showRecommendation && !isUsingTemplate && (
            <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-violet-500/5 to-background p-4 shadow-sm transition-all duration-300">
              <div className="absolute -right-8 -top-8 size-24 rounded-full bg-primary/10 blur-xl pointer-events-none" />
              <div className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <SparklesIcon className="size-4 animate-pulse" />
                </span>
                <div className="flex-1 space-y-1">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    Recommended Agent Template
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    We detected that you have datasets available. Would you like to use an agent template tailored to your data?
                  </p>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setShowRecommendation(false)
                        setIsUsingTemplate(true)
                        applyTemplate(selectedDatasetId || datasets[0]?.id, selectedTemplateId)
                      }}
                      className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                    >
                      Yes, recommend template
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowRecommendation(false)}
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    >
                      No, start from scratch
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {mode === "create" && datasets.length > 0 && isUsingTemplate && (
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <WandSparklesIcon className="size-3.5 text-primary" />
                  Template Generator
                </h4>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsUsingTemplate(false)
                    setShowRecommendation(true)
                    setName("")
                    setDescription("")
                    setSystem("")
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground h-6 px-2"
                >
                  Cancel template
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Dataset Select */}
                <div className="space-y-1">
                  <label htmlFor="template-dataset" className="text-xs font-medium text-muted-foreground">
                    Dataset
                  </label>
                  <select
                    id="template-dataset"
                    value={selectedDatasetId}
                    onChange={(e) => {
                      const val = e.target.value
                      setSelectedDatasetId(val)
                      applyTemplate(val, selectedTemplateId)
                    }}
                    className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {datasets.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Template Select */}
                <div className="space-y-1">
                  <label htmlFor="template-type" className="text-xs font-medium text-muted-foreground">
                    Template Style
                  </label>
                  <select
                    id="template-type"
                    value={selectedTemplateId}
                    onChange={(e) => {
                      const val = e.target.value
                      setSelectedTemplateId(val)
                      applyTemplate(selectedDatasetId, val)
                    }}
                    className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {AGENTS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <FieldGroup>
            {/* Name */}
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="agent-name">
                  Name <span className="text-destructive">*</span>
                </FieldLabel>
                {mode === "create" && datasets.length > 0 && !isUsingTemplate && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsUsingTemplate(true)
                      applyTemplate(selectedDatasetId || datasets[0]?.id, selectedTemplateId)
                    }}
                    className="text-xs text-primary hover:text-primary/80 h-7 px-2 flex items-center gap-1 font-medium"
                  >
                    <WandSparklesIcon className="size-3" />
                    Use template
                  </Button>
                )}
              </div>
              <Input
                id="agent-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Support Assistant"
                autoFocus
              />
            </Field>

            {/* Description */}
            <Field>
              <FieldLabel htmlFor="agent-desc">Description</FieldLabel>
              <Textarea
                id="agent-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="What does this agent do? (optional)"
              />
            </Field>

            {/* System Prompt */}
            <Field>
              <FieldLabel htmlFor="agent-system">
                System Prompt <span className="text-destructive">*</span>
              </FieldLabel>
              <Textarea
                id="agent-system"
                value={system}
                onChange={(e) => setSystem(e.target.value)}
                rows={7}
                placeholder="You are a helpful assistant. Answer questions strictly using the context provided below..."
                className="font-mono text-xs leading-relaxed"
              />
            </Field>

            {/* Status */}
            <Field>
              <FieldLabel>Status</FieldLabel>
              <ToggleGroup
                type="single"
                value={status}
                onValueChange={(v) => v && setStatus(v as AgentStatus)}
                variant="outline"
                className="w-full"
              >
                {(["active", "inactive", "draft"] as AgentStatus[]).map((s) => (
                  <ToggleGroupItem key={s} value={s} className="flex-1 capitalize">
                    {s}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>
          </FieldGroup>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isSaving ? <Spinner /> : <CheckCircle2Icon data-icon="inline-start" />}
            {mode === "create" ? "Create" : "Save changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

/* -------------------------------------------------------------------------- */
/*                           Delete confirm dialog                             */
/* -------------------------------------------------------------------------- */

function DeleteConfirmDialog({
  open,
  onOpenChange,
  agentName,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  agentName: string
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm" showCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertTriangleIcon className="size-4" />
            </span>
            Delete agent
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{agentName}</span>? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            <Trash2Icon data-icon="inline-start" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* -------------------------------------------------------------------------- */
/*                                 Small parts                                  */
/* -------------------------------------------------------------------------- */

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5">
      <div className="min-w-0">
        <p
          className={cn(
            "font-mono text-sm font-semibold leading-tight",
            highlight ? "text-primary" : "text-foreground"
          )}
        >
          {value}
        </p>
        <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  )
}

function AgentStatusBadge({ status }: { status: AgentStatus }) {
  if (status === "active") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      >
        <CheckCircle2Icon data-icon="inline-start" />
        Active
      </Badge>
    )
  }
  if (status === "inactive") {
    return (
      <Badge variant="secondary">
        <XIcon data-icon="inline-start" />
        Inactive
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
      <Spinner className="size-3!" />
      Draft
    </Badge>
  )
}