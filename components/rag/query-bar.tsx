"use client"

import * as React from "react"
import {
  SparklesIcon,
  Loader2Icon,
  SearchIcon,
  ShieldCheckIcon,
  CornerDownLeftIcon,
  MessageCircleIcon,
  BarChart2Icon,
  ListChecksIcon,
  AlignLeftIcon,
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
  CheckIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  PROMPT_TEMPLATES,
  SAMPLE_QUERIES,
  type PromptTemplate,
} from "@/components/rag/data"

export type TemplateDialogState =
  | { mode: "add" }
  | { mode: "edit"; template: PromptTemplate }
  | null

export function QueryBar({
  query,
  setQuery,
  onRun,
  onKeyDown,
  isRunning,
  templates,
  templateId,
  setTemplateId,
  onAddTemplate,
  onEditTemplate,
  onDeleteTemplate,
}: {
  query: string
  setQuery: (v: string) => void
  onRun: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  isRunning: boolean
  templates: PromptTemplate[]
  templateId: string
  setTemplateId: (id: string) => void
  onAddTemplate: () => void
  onEditTemplate: (template: PromptTemplate) => void
  onDeleteTemplate: (id: string) => void
}) {
  const active = templates.find((t) => t.id === templateId) ?? templates[0]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Prompt template
          </p>
          <button
            type="button"
            onClick={onAddTemplate}
            className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <PlusIcon className="size-3" />
            Add template
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {templates.map((t) => {
            const isActive = t.id === templateId
            return (
              <div
                key={t.id}
                className={cn(
                  "group flex items-center gap-1 rounded-lg border pr-1 transition-colors",
                  isActive
                    ? "border-primary/60 bg-primary/10"
                    : "border-border bg-background hover:border-primary/30"
                )}
              >
                <button
                  type="button"
                  onClick={() => setTemplateId(t.id)}
                  title={t.description}
                  className={cn(
                    "flex items-center gap-1.5 rounded-l-lg py-1.5 pl-3 pr-1 text-xs font-medium transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  <TemplateIcon id={t.id} />
                  {t.label}
                </button>
                <button
                  type="button"
                  onClick={() => onEditTemplate(t)}
                  aria-label={`Edit ${t.label}`}
                  className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <PencilIcon className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteTemplate(t.id)}
                  aria-label={`Delete ${t.label}`}
                  disabled={templates.length <= 1}
                  className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                >
                  <Trash2Icon className="size-3" />
                </button>
              </div>
            )
          })}
        </div>

        {active && (
          <p className="mt-1 rounded-md bg-muted/50 px-3 py-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
            {active.system}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-2 pl-3 shadow-sm focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
        <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask a question against your indexed sources…"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="button"
          onClick={onRun}
          disabled={!query.trim() || isRunning}
          className="flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isRunning ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <CornerDownLeftIcon className="size-4" />
          )}
          Run
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {SAMPLE_QUERIES.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setQuery(q)}
            className="rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}

function TemplateIcon({ id }: { id: string }) {
  switch (id) {
    case "support":
      return <MessageCircleIcon className="size-3" />
    case "analyst":
      return <BarChart2Icon className="size-3" />
    case "compliance":
      return <ShieldCheckIcon className="size-3" />
    case "onboarding":
      return <ListChecksIcon className="size-3" />
    case "concise":
      return <AlignLeftIcon className="size-3" />
    default:
      return <SparklesIcon className="size-3" />
  }
}

export function TemplateDialog({
  template,
  onClose,
  onSave,
}: {
  template: PromptTemplate | null
  onClose: () => void
  onSave: (input: Omit<PromptTemplate, "id"> & { id?: string }) => void
}) {
  const isEdit = template != null
  const [label, setLabel] = React.useState(template?.label ?? "")
  const [description, setDescription] = React.useState(
    template?.description ?? ""
  )
  const [system, setSystem] = React.useState(template?.system ?? "")

  const canSave = label.trim().length > 0 && system.trim().length > 0

  function handleSave() {
    if (!canSave) return
    onSave({
      id: template?.id,
      label: label.trim(),
      description: description.trim() || "Custom template",
      system: system.trim(),
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? "Edit prompt template" : "Add prompt template"}
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
      />

      <div className="relative flex max-h-[85svh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-card shadow-lg">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <SparklesIcon className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold">
              {isEdit ? "Edit template" : "New prompt template"}
            </h2>
            <p className="truncate text-xs text-muted-foreground">
              {isEdit
                ? "Adjust how this template instructs the model."
                : "Define a reusable system prompt for your answers."}
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

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="tpl-label"
              className="text-xs font-medium text-muted-foreground"
            >
              Name
            </label>
            <input
              id="tpl-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Technical writer"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="tpl-desc"
              className="text-xs font-medium text-muted-foreground"
            >
              Description
            </label>
            <input
              id="tpl-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short hint shown on hover (optional)"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="tpl-system"
              className="text-xs font-medium text-muted-foreground"
            >
              System prompt
            </label>
            <textarea
              id="tpl-system"
              value={system}
              onChange={(e) => setSystem(e.target.value)}
              rows={6}
              placeholder="You are a… Answer using only the context provided below."
              className="resize-none rounded-md border border-border bg-background px-3 py-2 font-mono text-xs leading-relaxed outline-none transition-colors focus:border-primary/50"
            />
          </div>
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
            onClick={handleSave}
            disabled={!canSave}
            className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckIcon className="size-4" />
            {isEdit ? "Save changes" : "Add template"}
          </button>
        </div>
      </div>
    </div>
  )
}

export { PROMPT_TEMPLATES }
export type { PromptTemplate }
