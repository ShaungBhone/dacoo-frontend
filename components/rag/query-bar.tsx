"use client"

import * as React from "react"
import {
  SparklesIcon,
  ShieldCheckIcon,
  MessageCircleIcon,
  BarChart2Icon,
  ListChecksIcon,
  AlignLeftIcon,
  PlusIcon,
  PencilIcon,
  XIcon,
  CheckIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputCommand,
  PromptInputCommandEmpty,
  PromptInputCommandGroup,
  PromptInputCommandInput,
  PromptInputCommandItem,
  PromptInputCommandList,
  PromptInputCommandSeparator,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputHoverCard,
  PromptInputHoverCardContent,
  PromptInputHoverCardTrigger,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input"
import { AGENTS, SAMPLE_QUERIES, type Agent } from "@/components/rag/data"

export type AgentDialogState =
  | { mode: "add" }
  | { mode: "edit"; agent: Agent }
  | null

export function QueryBar({
  query,
  setQuery,
  onRun,
  isRunning,
  agents,
  agentId,
  setAgentId,
  onAddAgent,
  onEditAgent,
  disabled,
}: {
  query: string
  setQuery: (v: string) => void
  onRun: (query?: string) => void
  isRunning: boolean
  agents: Agent[]
  agentId: string
  setAgentId: (id: string) => void
  onAddAgent: () => void
  onEditAgent: (agent: Agent) => void
  disabled?: boolean
}) {
  const [previewAgentId, setPreviewAgentId] = React.useState(agentId)
  const active = agents.find((a) => a.id === agentId) ?? agents[0]
  const previewAgent =
    agents.find((a) => a.id === previewAgentId) ?? active

  function handleSubmit(message: PromptInputMessage) {
    const nextQuery = message.text.trim()
    if (!nextQuery) return
    onRun(nextQuery)
  }

  return (
    <div className="flex flex-col gap-3">
      <PromptInput onSubmit={handleSubmit}>
        <PromptInputHeader>
          <PromptInputHoverCard>
            <PromptInputHoverCardTrigger asChild>
              <PromptInputButton
                className="max-w-full"
                size="sm"
                variant="outline"
                disabled={disabled}
              >
                <AgentIcon id={active.id} />
                <span className="truncate">{active.label}</span>
              </PromptInputButton>
            </PromptInputHoverCardTrigger>
            <PromptInputHoverCardContent className="w-[min(92vw,520px)] overflow-hidden p-0">
              <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium">Agents</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {previewAgent.description}
                  </p>
                </div>
                <PromptInputButton
                  aria-label="Add Agent"
                  onClick={onAddAgent}
                  size="sm"
                  variant="outline"
                >
                  <PlusIcon className="size-3.5" />
                  <span>Add</span>
                </PromptInputButton>
              </div>

              <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                <div className="max-h-72 overflow-y-auto p-1">
                  {agents.map((agent) => {
                    const isActive = agent.id === agentId
                    return (
                      <div
                        key={agent.id}
                        className={cn(
                          "group flex items-center gap-1 rounded-2xl px-2 py-1.5 transition-colors hover:bg-muted/60",
                          isActive && "bg-muted text-foreground"
                        )}
                        onMouseEnter={() => setPreviewAgentId(agent.id)}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setAgentId(agent.id)
                            setPreviewAgentId(agent.id)
                          }}
                          className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-1.5 py-1 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/40"
                        >
                          <AgentIcon id={agent.id} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">
                              {agent.label}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {agent.description}
                            </span>
                          </span>
                          {isActive && (
                            <CheckIcon className="size-3.5 text-primary" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditAgent(agent)}
                          aria-label={`Edit ${agent.label}`}
                          className="flex size-7 shrink-0 items-center justify-center rounded-xl text-muted-foreground opacity-70 transition-colors hover:bg-background hover:text-foreground group-hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/40"
                        >
                          <PencilIcon className="size-3.5" />
                        </button>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t border-border bg-muted/30 p-3 md:border-l md:border-t-0">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <AgentIcon id={previewAgent.id} />
                    {previewAgent.label}
                  </p>
                  <p className="overflow-y-auto rounded-2xl bg-background/70 px-3 py-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
                    {previewAgent.system}
                  </p>
                </div>
              </div>
            </PromptInputHoverCardContent>
          </PromptInputHoverCard>

          <PromptInputHoverCard>
            <PromptInputHoverCardTrigger asChild>
              <PromptInputButton size="sm" variant="outline" disabled={disabled}>
                <SparklesIcon className="size-3.5" />
                <span>Suggestions</span>
              </PromptInputButton>
            </PromptInputHoverCardTrigger>
            <PromptInputHoverCardContent className="w-[min(92vw,440px)] overflow-hidden p-0">
              <PromptInputCommand>
                <PromptInputCommandInput
                  className="border-none focus-visible:ring-0"
                  placeholder="Find a sample query..."
                />
                <PromptInputCommandList>
                  <PromptInputCommandEmpty className="p-3 text-sm text-muted-foreground">
                    No sample query found.
                  </PromptInputCommandEmpty>
                  <PromptInputCommandGroup heading="Sample queries">
                    {SAMPLE_QUERIES.map((sampleQuery) => (
                      <PromptInputCommandItem
                        key={sampleQuery}
                        onSelect={() => setQuery(sampleQuery)}
                      >
                        <SparklesIcon className="text-primary" />
                        <span className="line-clamp-2">{sampleQuery}</span>
                      </PromptInputCommandItem>
                    ))}
                  </PromptInputCommandGroup>
                  <PromptInputCommandSeparator />
                  <p className="px-3 pb-2 pt-1 text-xs text-muted-foreground">
                    Selecting a suggestion fills the input so it can be edited
                    before running.
                  </p>
                </PromptInputCommandList>
              </PromptInputCommand>
            </PromptInputHoverCardContent>
          </PromptInputHoverCard>
        </PromptInputHeader>

        <PromptInputBody>
          <PromptInputTextarea
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            placeholder="Ask a question against your indexed sources…"
            className="min-h-20 pr-12"
            disabled={disabled}
          />
        </PromptInputBody>

        <PromptInputFooter>
          <PromptInputTools>
            <span className="truncate text-xs text-muted-foreground">
              Retrieval testing
            </span>
          </PromptInputTools>
          <PromptInputSubmit
            status={isRunning ? "submitted" : "ready"}
            disabled={disabled || !query.trim() || isRunning}
            className="!h-8"
          />
        </PromptInputFooter>
      </PromptInput>
    </div>
  )
}

function AgentIcon({ id }: { id: string }) {
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

export function AgentDialog({
  agent,
  onClose,
  onSave,
}: {
  agent: Agent | null
  onClose: () => void
  onSave: (input: Omit<Agent, "id"> & { id?: string }) => void
}) {
  const isEdit = agent != null
  const [label, setLabel] = React.useState(agent?.label ?? "")
  const [description, setDescription] = React.useState(
    agent?.description ?? ""
  )
  const [system, setSystem] = React.useState(agent?.system ?? "")

  const canSave = label.trim().length > 0 && system.trim().length > 0

  function handleSave() {
    if (!canSave) return
    onSave({
      id: agent?.id,
      label: label.trim(),
      description: description.trim() || "Custom agent",
      system: system.trim(),
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? "Edit agent" : "Add agent"}
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
              {isEdit ? "Edit agent" : "New agent"}
            </h2>
            <p className="truncate text-xs text-muted-foreground">
              {isEdit
                ? "Adjust how this agent instructs the model."
                : "Define a reusable agent persona for your answers."}
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
              htmlFor="agent-label"
              className="text-xs font-medium text-muted-foreground"
            >
              Name
            </label>
            <input
              id="agent-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Technical writer"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="agent-desc"
              className="text-xs font-medium text-muted-foreground"
            >
              Description
            </label>
            <input
              id="agent-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short hint shown on hover (optional)"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="agent-system"
              className="text-xs font-medium text-muted-foreground"
            >
              System prompt
            </label>
            <textarea
              id="agent-system"
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
            {isEdit ? "Save changes" : "Add agent"}
          </button>
        </div>
      </div>
    </div>
  )
}

export { AGENTS }
export type { Agent }
