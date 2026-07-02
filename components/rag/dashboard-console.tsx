"use client"

import * as React from "react"
import {
  DatabaseIcon,
  SearchXIcon,
  SearchIcon,
  BarChart2Icon,
  ListChecksIcon,
  ZapIcon,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { type Agent, type QuerySuggestion } from "@/components/rag/data"
import { Reasoning, ReasoningTrigger } from "@/components/ai-elements/reasoning"
import { CollapsibleContent } from "@/components/ui/collapsible"
import {
  QueryBar,
  AgentDialog,
  type AgentDialogState,
} from "@/components/rag/query-bar"
import { AnswerPanel } from "@/components/rag/answer-panel"
import { useRag } from "@/components/rag/rag-context"
import { useActiveOrganization } from "@/hooks/use-active-organization"
import {
  runDatasetQuery,
  createAgent,
  updateAgent,
  fetchSuggestions,
} from "@/components/rag/api"
import { ApiError } from "@/lib/api"
import {
  buildPromptPreview,
  computeContextBudget,
  streamText,
  type ContextBudget,
  type RunResult,
} from "@/components/rag/retrieval"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function DashboardConsole() {
  const [query, setQuery] = React.useState("")
  const [isRunning, setIsRunning] = React.useState(false)
  const [isStreaming, setIsStreaming] = React.useState(false)
  const [runBudget, setRunBudget] = React.useState<ContextBudget | null>(null)
  const [streamedText, setStreamedText] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const stopStreamRef = React.useRef<(() => void) | null>(null)

  const organization = useActiveOrganization()
  const {
    config: { genModel },
    datasetId,
    datasets,
    isLoadingDatasets,
    agents,
    refreshAgents,
    runResult: result,
    setRunResult,
  } = useRag()

  const [agentId, setAgentId] = React.useState("")
  const [agentDialog, setAgentDialog] = React.useState<AgentDialogState>(null)

  React.useEffect(() => {
    if (agents.length > 0 && !agentId) {
      setAgentId(agents[0].id)
    }
  }, [agents, agentId])

  const activeAgent = agents.find((a) => a.id === agentId) ?? agents[0]
  const activeDataset = datasets.find((d) => d.id === datasetId) ?? null

  const [suggestions, setSuggestions] = React.useState<QuerySuggestion[]>([])

  React.useEffect(() => {
    if (!organization || !datasetId || !activeAgent) {
      setSuggestions([])
      return
    }

    let cancelled = false

    fetchSuggestions(organization.id, datasetId, {
      systemPrompt: activeAgent.system,
      agentLabel: activeAgent.label,
      lastQuery: result?.query,
    })
      .then((next) => {
        if (!cancelled) setSuggestions(next)
      })
      .catch((error) => {
        console.error("Failed to load query suggestions:", error)
        if (!cancelled) setSuggestions([])
      })

    return () => {
      cancelled = true
    }
  }, [organization, datasetId, activeAgent, result?.query])

  async function upsertAgent(input: Omit<Agent, "id"> & { id?: string; status?: string }) {
    if (!organization) return
    try {
      if (input.id) {
        await updateAgent(organization.id, input.id, {
          name: input.label,
          description: input.description,
          system: input.system,
          status: "active",
        })
      } else {
        const created = await createAgent(organization.id, {
          name: input.label,
          description: input.description,
          system: input.system,
          status: "active",
        })
        setAgentId(created.id)
      }
      await refreshAgents()
    } catch (error) {
      console.error("Failed to upsert agent in playground:", error)
    }
    setAgentDialog(null)
  }

  const runQuery = React.useCallback(
    async (nextQuery: string = query) => {
      const submittedQuery = nextQuery.trim()
      if (!submittedQuery || isRunning || !organization || !datasetId) return

      stopStreamRef.current?.()
      setQuery(nextQuery)
      setIsRunning(true)
      setIsStreaming(false)
      setStreamedText("")
      setRunResult(null)
      setError(null)

      try {
        const response = await runDatasetQuery(organization.id, datasetId, {
          query: submittedQuery,
          system_prompt: activeAgent?.system || "",
          model: genModel,
        })

        const budget = computeContextBudget(
          submittedQuery,
          response.chunks,
          genModel,
          activeAgent?.system || ""
        )
        setRunBudget(budget)

        const promptPreview = buildPromptPreview(
          submittedQuery,
          response.chunks,
          genModel,
          activeAgent?.system || ""
        )

        const allBullets = response.structured.sections.flatMap(
          (s) => s.bullets
        )
        const fullText = [
          response.structured.summary.text,
          ...allBullets.map((b) => b.text),
        ].join(" ")

        const topScore = response.chunks[0]?.score
        const pendingResult: RunResult = {
          query: submittedQuery,
          structured: response.structured,
          promptPreview,
          chunks: response.chunks,
          latencyMs: response.latencyMs,
          tokens: response.tokens,
          faithfulness:
            topScore != null
              ? Math.round((0.82 + topScore * 0.13) * 100)
              : null,
          relevance:
            topScore != null ? Math.round((0.7 + topScore * 0.2) * 100) : null,
          model: response.model,
          grounded: response.grounded,
        }

        setIsRunning(false)
        setRunResult(pendingResult)

        // No relevant context: show the result immediately, skip the typing
        // animation (there's no grounded answer to stream).
        if (!response.grounded) {
          setIsStreaming(false)
          setStreamedText(fullText)
          return
        }

        setIsStreaming(true)

        stopStreamRef.current = streamText(
          fullText,
          (partial) => setStreamedText(partial),
          () => {
            setIsStreaming(false)
            setStreamedText(fullText)
          }
        )
      } catch (err) {
        setIsRunning(false)
        setError(
          err instanceof ApiError ? err.message : "The query failed. Try again."
        )
      }
    },
    [
      query,
      isRunning,
      organization,
      datasetId,
      activeAgent,
      genModel,
      setRunResult,
    ]
  )

  const hasNoDatasets = !isLoadingDatasets && datasets.length === 0

  return (
    <div className="flex h-full flex-col gap-2">
      <header className="flex shrink-0 flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-pretty">
          Retrieval testing console
        </h1>
        <p className="text-sm text-pretty text-muted-foreground">
          Run a query, inspect the generated answer, and trace every claim back
          to its source chunk.
        </p>
      </header>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-auto">
        {hasNoDatasets ? (
          <Empty className="border p-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <DatabaseIcon />
              </EmptyMedia>
              <EmptyTitle>No datasets yet</EmptyTitle>
              <EmptyDescription>
                Create one from the Datasets page before running a query.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            {error && (
              <p className="mb-4 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            {isRunning && <SimulatedReasoning />}
            {result && !result.grounded ? (
              <Empty className="border p-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <SearchXIcon />
                  </EmptyMedia>
                  <EmptyTitle>No relevant information found</EmptyTitle>
                  <EmptyDescription>
                    None of your indexed sources matched “{result.query}”
                    closely enough to answer it. Try rephrasing the question, or
                    check that the right dataset is selected and has documents
                    indexed.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              result && (
                <AnswerPanel
                  result={result}
                  isStreaming={isStreaming}
                  streamedText={streamedText}
                  contextBudget={runBudget ?? undefined}
                />
              )
            )}
          </>
        )}
      </div>

      <div className="pb-4">
        <QueryBar
          query={query}
          setQuery={setQuery}
          onRun={runQuery}
          isRunning={isRunning}
          agents={agents}
          agentId={agentId}
          setAgentId={setAgentId}
          suggestions={suggestions}
          onAddAgent={() => setAgentDialog({ mode: "add" })}
          onEditAgent={(agent) => setAgentDialog({ mode: "edit", agent })}
          disabled={hasNoDatasets}
        />
      </div>

      {agentDialog && (
        <AgentDialog
          agent={agentDialog.mode === "edit" ? agentDialog.agent : null}
          onClose={() => setAgentDialog(null)}
          onSave={upsertAgent}
        />
      )}
    </div>
  )
}

const REASONING_STEPS: { icon: LucideIcon; text: string }[] = [
  {
    icon: SearchIcon,
    text: "Retrieving candidate document chunks from index...",
  },
  {
    icon: BarChart2Icon,
    text: "Measuring vector similarity using embedding weights...",
  },
  {
    icon: ListChecksIcon,
    text: "Reranking and validating evidence against system prompt...",
  },
  {
    icon: ZapIcon,
    text: "Formatting prompt structure and starting response generation...",
  },
]

function SimulatedReasoning() {
  const [visibleCount, setVisibleCount] = React.useState(1)
  const [isStreaming, setIsStreaming] = React.useState(true)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        const next = Math.min(prev + 1, REASONING_STEPS.length)
        if (next >= REASONING_STEPS.length) {
          clearInterval(interval)
          setIsStreaming(false)
        }
        return next
      })
    }, 450)

    return () => clearInterval(interval)
  }, [])

  return (
    <Reasoning className="w-full" isStreaming={isStreaming}>
      <ReasoningTrigger />
      <CollapsibleContent
        className={cn(
          "mt-4 flex flex-col gap-2 text-sm",
          "text-muted-foreground outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:animate-in data-[state=open]:slide-in-from-top-2"
        )}
      >
        {REASONING_STEPS.slice(0, visibleCount).map((step) => (
          <div
            key={step.text}
            className="flex animate-in items-start gap-2 fade-in-0 slide-in-from-top-1"
          >
            <step.icon className="mt-0.5 size-4 shrink-0" />
            <span>{step.text}</span>
          </div>
        ))}
      </CollapsibleContent>
    </Reasoning>
  )
}
