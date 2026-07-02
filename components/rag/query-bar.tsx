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
  CheckIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
} from "@/components/ai-elements/model-selector"
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
import { useRag } from "@/components/rag/rag-context"
import { AGENTS, type Agent, type QuerySuggestion } from "@/components/rag/data"

export type AgentDialogState =
  { mode: "add" } | { mode: "edit"; agent: Agent } | null

export function QueryBar({
  query,
  setQuery,
  onRun,
  isRunning,
  agents,
  agentId,
  setAgentId,
  suggestions,
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
  suggestions: QuerySuggestion[]
  onAddAgent: () => void
  onEditAgent: (agent: Agent) => void
  disabled?: boolean
}) {
  const [previewAgentId, setPreviewAgentId] = React.useState(agentId)
  const [modelPickerOpen, setModelPickerOpen] = React.useState(false)

  const active = agents.find((a) => a.id === agentId) ?? agents[0] ?? {
    id: "loading",
    label: "Loading...",
    description: "Please wait...",
    system: "",
  }
  const previewAgent = agents.find((a) => a.id === previewAgentId) ?? active

  React.useEffect(() => {
    if (agentId) {
      setPreviewAgentId(agentId)
    }
  }, [agentId])

  const {
    config: { genModel },
    modelCatalog,
    isLoadingModels,
  } = useRag()

  const activeModel =
    modelCatalog.chatModels.find((m) => m.id === genModel) ?? null
  const modelLabel = activeModel?.label ?? (genModel || "Select model")
  const modelDisabled =
    disabled || isLoadingModels || modelCatalog.chatModels.length === 0
  const suggestionsLabel =
    suggestions.length === 1
      ? "1 suggestion"
      : `${suggestions.length} suggestions`

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
                          className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-1.5 py-1 text-left text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
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
                          className="flex size-7 shrink-0 items-center justify-center rounded-xl text-muted-foreground opacity-70 transition-colors group-hover:opacity-100 hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
                        >
                          <PencilIcon className="size-3.5" />
                        </button>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t border-border bg-muted/30 p-3 md:border-t-0 md:border-l">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
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
              <PromptInputButton
                size="sm"
                variant="outline"
                disabled={disabled}
              >
                <SparklesIcon className="size-3.5" />
                <span>{suggestionsLabel}</span>
              </PromptInputButton>
            </PromptInputHoverCardTrigger>
            <PromptInputHoverCardContent className="w-[min(92vw,440px)] overflow-hidden p-0">
              <PromptInputCommand>
                <PromptInputCommandInput
                  className="border-none focus-visible:ring-0"
                  placeholder="Find a suggestion..."
                />
                <PromptInputCommandList>
                  <PromptInputCommandEmpty className="p-3 text-sm text-muted-foreground">
                    No suggestion found.
                  </PromptInputCommandEmpty>
                  <PromptInputCommandGroup
                    heading={`${active.label} suggestions`}
                  >
                    {suggestions.map((suggestion) => (
                      <PromptInputCommandItem
                        key={suggestion.id}
                        value={suggestion.query}
                        onSelect={() => setQuery(suggestion.query)}
                      >
                        <SparklesIcon className="text-primary" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">
                            {suggestion.label}
                          </span>
                          <span className="line-clamp-2 text-xs text-muted-foreground">
                            {suggestion.query}
                          </span>
                        </span>
                      </PromptInputCommandItem>
                    ))}
                  </PromptInputCommandGroup>
                  <PromptInputCommandSeparator />
                  <p className="px-3 pt-1 pb-2 text-xs text-muted-foreground">
                    Suggestions update with the selected agent and dataset.
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
            <PromptInputButton
              size="sm"
              variant="outline"
              disabled={modelDisabled}
              onClick={() => setModelPickerOpen(true)}
              tooltip="Generation model"
            >
              <SparklesIcon className="size-3.5" />
              <span className="max-w-32 truncate">
                {isLoadingModels ? "Loading…" : modelLabel}
              </span>
            </PromptInputButton>
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

      <ModelPicker open={modelPickerOpen} onOpenChange={setModelPickerOpen} />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                            Generation model picker                          */
/* -------------------------------------------------------------------------- */

function ModelPicker({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const {
    config: { genModel },
    setGenModel,
    modelCatalog,
  } = useRag()

  const providers = React.useMemo(() => {
    const seen = new Map<string, boolean>()
    for (const m of modelCatalog.chatModels) {
      if (!seen.has(m.provider)) seen.set(m.provider, true)
    }
    return [...seen.keys()]
  }, [modelCatalog.chatModels])

  function handleSelect(id: string) {
    setGenModel(id)
    onOpenChange(false)
  }

  return (
    <ModelSelector open={open} onOpenChange={onOpenChange}>
      <ModelSelectorContent title="Select generation model">
        <ModelSelectorInput placeholder="Search models…" />
        <ModelSelectorList>
          <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
          {providers.map((provider) => (
            <ModelSelectorGroup key={provider} heading={provider}>
              {modelCatalog.chatModels
                .filter((m) => m.provider === provider)
                .map((m) => (
                  <ModelSelectorItem
                    key={m.id}
                    value={m.id}
                    onSelect={() => handleSelect(m.id)}
                  >
                    <ModelSelectorLogo provider={m.provider.toLowerCase()} />
                    <ModelSelectorName>{m.label}</ModelSelectorName>
                    {m.id === genModel && (
                      <CheckIcon className="ml-auto size-4" />
                    )}
                  </ModelSelectorItem>
                ))}
            </ModelSelectorGroup>
          ))}
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
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
  const [description, setDescription] = React.useState(agent?.description ?? "")
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
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <SparklesIcon className="size-4" />
            </span>
            {isEdit ? "Edit agent" : "New agent"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Adjust how this agent instructs the model."
              : "Define a reusable agent persona for your answers."}
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="agent-label">Name</FieldLabel>
            <Input
              id="agent-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Technical writer"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="agent-desc">Description</FieldLabel>
            <Input
              id="agent-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short hint shown on hover (optional)"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="agent-system">System prompt</FieldLabel>
            <Textarea
              id="agent-system"
              value={system}
              onChange={(e) => setSystem(e.target.value)}
              rows={6}
              placeholder="You are a… Answer using only the context provided below."
              className="font-mono text-xs leading-relaxed"
            />
          </Field>
        </FieldGroup>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            <CheckIcon data-icon="inline-start" />
            {isEdit ? "Save changes" : "Add agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { AGENTS }
export type { Agent }
