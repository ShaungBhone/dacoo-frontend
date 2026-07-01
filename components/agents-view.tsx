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
  Loader2Icon,
  AlertTriangleIcon,
  CpuIcon,
  MessageSquareIcon,
  CalendarIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/*                                  Mock data                                  */
/* -------------------------------------------------------------------------- */

type AgentStatus = "active" | "inactive" | "draft"

interface Agent {
  id: string
  name: string
  description: string
  model: string
  status: AgentStatus
  messageCount: number
  createdAt: string
}

let nextId = 7

const INITIAL_AGENTS: Agent[] = [
  {
    id: "1",
    name: "Support Assistant",
    description: "Handles customer support tickets and FAQs with empathy and precision.",
    model: "gpt-4o",
    status: "active",
    messageCount: 4821,
    createdAt: "2025-01-12",
  },
  {
    id: "2",
    name: "Code Reviewer",
    description: "Reviews pull requests, spots bugs, and suggests improvements.",
    model: "gpt-4o-mini",
    status: "active",
    messageCount: 1093,
    createdAt: "2025-02-03",
  },
  {
    id: "3",
    name: "Data Analyst",
    description: "Interprets datasets and produces clear, structured summaries.",
    model: "claude-3-5-sonnet",
    status: "active",
    messageCount: 729,
    createdAt: "2025-02-20",
  },
  {
    id: "4",
    name: "Onboarding Guide",
    description: "Walks new users through setup steps and feature discovery.",
    model: "gpt-4o-mini",
    status: "draft",
    messageCount: 0,
    createdAt: "2025-03-08",
  },
  {
    id: "5",
    name: "Sales Qualifier",
    description: "Qualifies inbound leads by asking structured discovery questions.",
    model: "gpt-4o",
    status: "inactive",
    messageCount: 312,
    createdAt: "2025-03-15",
  },
  {
    id: "6",
    name: "Doc Writer",
    description: "Drafts technical documentation from code comments and tickets.",
    model: "claude-3-5-haiku",
    status: "draft",
    messageCount: 57,
    createdAt: "2025-04-01",
  },
]

const MODELS = ["gpt-4o", "gpt-4o-mini", "claude-3-5-sonnet", "claude-3-5-haiku", "llama-3.1-70b"]

/* -------------------------------------------------------------------------- */
/*                              AgentsView                                      */
/* -------------------------------------------------------------------------- */

export function AgentsView() {
  const [agents, setAgents] = React.useState<Agent[]>(INITIAL_AGENTS)
  const [search, setSearch] = React.useState("")
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editTarget, setEditTarget] = React.useState<Agent | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<Agent | null>(null)

  const filtered = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.trim().toLowerCase()) ||
      a.description.toLowerCase().includes(search.trim().toLowerCase())
  )

  function handleCreate(data: AgentFormData) {
    const now = new Date().toISOString().slice(0, 10)
    const agent: Agent = {
      id: String(nextId++),
      name: data.name,
      description: data.description,
      model: data.model,
      status: data.status,
      messageCount: 0,
      createdAt: now,
    }
    setAgents((prev) => [agent, ...prev])
    setCreateOpen(false)
  }

  function handleEdit(data: AgentFormData) {
    if (!editTarget) return
    setAgents((prev) =>
      prev.map((a) =>
        a.id === editTarget.id
          ? { ...a, name: data.name, description: data.description, model: data.model, status: data.status }
          : a
      )
    )
    setEditTarget(null)
  }

  function handleDelete() {
    if (!deleteTarget) return
    setAgents((prev) => prev.filter((a) => a.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
        {/* ------------------------------------------------------------------ */}
        {/* Header row                                                          */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Agents</h1>
            <p className="text-sm text-muted-foreground text-pretty">
              Manage your AI agents — create, configure, and remove them here.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 self-start rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:self-auto"
          >
            <PlusIcon className="size-4" />
            New agent
          </button>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Stats strip                                                         */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Total" value={String(agents.length)} />
          <StatCard label="Active" value={String(agents.filter((a) => a.status === "active").length)} highlight />
          <StatCard label="Draft" value={String(agents.filter((a) => a.status === "draft").length)} />
          <StatCard
            label="Messages"
            value={agents.reduce((s, a) => s + a.messageCount, 0).toLocaleString()}
          />
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Search                                                              */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 sm:w-80">
          <SearchIcon className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents…"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Clear search"
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Table                                                               */}
        {/* ------------------------------------------------------------------ */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {/* Table header */}
          <div className="hidden grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-b border-border px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:grid">
            <span>Agent</span>
            <span className="w-36">Model</span>
            <span className="w-20 text-right">Messages</span>
            <span className="w-20 text-center">Status</span>
            <span className="w-16 text-right">Actions</span>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
              <BotIcon className="size-8 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">
                {agents.length === 0 ? "No agents yet." : `No agents match "${search}".`}
              </p>
              {agents.length === 0 && (
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="mt-1 text-xs font-medium text-primary hover:underline"
                >
                  Create your first agent
                </button>
              )}
            </div>
          ) : (
            <ul>
              {filtered.map((agent) => (
                <li
                  key={agent.id}
                  className="grid grid-cols-1 gap-2 border-b border-border px-4 py-3 last:border-b-0 sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-center sm:gap-4"
                >
                  {/* Name + description */}
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <BotIcon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{agent.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{agent.description}</p>
                    </div>
                  </div>

                  {/* Model */}
                  <span className="font-mono text-xs text-muted-foreground sm:w-36">
                    <span className="mr-1 text-muted-foreground sm:hidden">Model: </span>
                    {agent.model}
                  </span>

                  {/* Message count */}
                  <span className="font-mono text-sm text-muted-foreground sm:w-20 sm:text-right">
                    <span className="mr-1 text-muted-foreground sm:hidden">Messages: </span>
                    {agent.messageCount.toLocaleString()}
                  </span>

                  {/* Status badge */}
                  <span className="sm:w-20 sm:text-center">
                    <AgentStatusBadge status={agent.status} />
                  </span>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1 sm:w-16">
                    <button
                      type="button"
                      onClick={() => setEditTarget(agent)}
                      aria-label={`Edit ${agent.name}`}
                      className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <PencilIcon className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(agent)}
                      aria-label={`Delete ${agent.name}`}
                      className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2Icon className="size-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer count */}
        {filtered.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {filtered.length} of {agents.length} agent{agents.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Dialogs                                                               */}
      {/* -------------------------------------------------------------------- */}
      {createOpen && (
        <AgentFormDialog
          mode="create"
          onClose={() => setCreateOpen(false)}
          onSubmit={handleCreate}
        />
      )}

      {editTarget && (
        <AgentFormDialog
          mode="edit"
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={handleEdit}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmDialog
          agentName={deleteTarget.name}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                              Agent form dialog                              */
/* -------------------------------------------------------------------------- */

interface AgentFormData {
  name: string
  description: string
  model: string
  status: AgentStatus
}

function AgentFormDialog({
  mode,
  initial,
  onClose,
  onSubmit,
}: {
  mode: "create" | "edit"
  initial?: Agent
  onClose: () => void
  onSubmit: (data: AgentFormData) => void
}) {
  const [name, setName] = React.useState(initial?.name ?? "")
  const [description, setDescription] = React.useState(initial?.description ?? "")
  const [model, setModel] = React.useState(initial?.model ?? MODELS[0])
  const [status, setStatus] = React.useState<AgentStatus>(initial?.status ?? "draft")
  const [isSaving, setIsSaving] = React.useState(false)

  const canSubmit = name.trim().length > 0 && !isSaving

  function handleSubmit() {
    if (!canSubmit) return
    setIsSaving(true)
    // Simulate async for UX consistency
    setTimeout(() => {
      onSubmit({ name: name.trim(), description: description.trim(), model, status })
      setIsSaving(false)
    }, 300)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "create" ? "Create agent" : "Edit agent"}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
      />

      <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-border bg-card shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <BotIcon className="size-4" />
          </span>
          <h2 className="flex-1 text-sm font-semibold">
            {mode === "create" ? "New agent" : "Edit agent"}
          </h2>
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
        <div className="flex flex-col gap-4 px-5 py-5">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="agent-name" className="text-xs font-medium text-muted-foreground">
              Name <span className="text-destructive">*</span>
            </label>
            <input
              id="agent-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Support Assistant"
              autoFocus
              className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary/50"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="agent-desc" className="text-xs font-medium text-muted-foreground">
              Description
            </label>
            <textarea
              id="agent-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What does this agent do? (optional)"
              className="resize-none rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none transition-colors focus:border-primary/50"
            />
          </div>

          {/* Model */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="agent-model" className="text-xs font-medium text-muted-foreground">
              Model
            </label>
            <div className="relative">
              <CpuIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <select
                id="agent-model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full appearance-none rounded-md border border-border bg-background py-2 pl-8 pr-3 text-sm outline-none transition-colors focus:border-primary/50"
              >
                {MODELS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Status</span>
            <div className="flex gap-2">
              {(["active", "inactive", "draft"] as AgentStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    "flex-1 rounded-md border px-2 py-1.5 text-xs font-medium capitalize transition-colors",
                    status === s
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
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
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <CheckCircle2Icon className="size-4" />
            )}
            {mode === "create" ? "Create" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                           Delete confirm dialog                             */
/* -------------------------------------------------------------------------- */

function DeleteConfirmDialog({
  agentName,
  onClose,
  onConfirm,
}: {
  agentName: string
  onClose: () => void
  onConfirm: () => void
}) {
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Confirm delete"
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
      />

      <div className="relative flex w-full max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-card shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <span className="flex size-8 items-center justify-center rounded-md bg-destructive/10 text-destructive">
            <AlertTriangleIcon className="size-4" />
          </span>
          <h2 className="flex-1 text-sm font-semibold">Delete agent</h2>
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
        <div className="px-5 py-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{agentName}</span>? This action cannot
            be undone.
          </p>
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
          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center gap-2 rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
          >
            <Trash2Icon className="size-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
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
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
        <CheckCircle2Icon className="size-3" />
        Active
      </span>
    )
  }
  if (status === "inactive") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
        <XIcon className="size-3" />
        Inactive
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
      <Loader2Icon className="size-3" />
      Draft
    </span>
  )
}
