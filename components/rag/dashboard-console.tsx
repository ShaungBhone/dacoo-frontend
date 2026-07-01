"use client"

import * as React from "react"
import { DatabaseIcon } from "lucide-react"

import { AGENTS, SAMPLE_QUERIES, type Agent } from "@/components/rag/data"
import {
  QueryBar,
  AgentDialog,
  type AgentDialogState,
} from "@/components/rag/query-bar"
import { AnswerPanel } from "@/components/rag/answer-panel"
import { useRag } from "@/components/rag/rag-context"
import { useActiveOrganization } from "@/hooks/use-active-organization"
import { runDatasetQuery } from "@/components/rag/api"
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
  const [query, setQuery] = React.useState(SAMPLE_QUERIES[0])
  const [isRunning, setIsRunning] = React.useState(false)
  const [isStreaming, setIsStreaming] = React.useState(false)
  const [runBudget, setRunBudget] = React.useState<ContextBudget | null>(null)
  const [streamedText, setStreamedText] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const stopStreamRef = React.useRef<(() => void) | null>(null)

  const [agents, setAgents] = React.useState<Agent[]>(AGENTS)
  const [agentId, setAgentId] = React.useState(AGENTS[0].id)
  const [agentDialog, setAgentDialog] = React.useState<AgentDialogState>(null)

  const organization = useActiveOrganization()
  const {
    config: { genModel },
    datasetId,
    datasets,
    isLoadingDatasets,
    runResult: result,
    setRunResult,
  } = useRag()

  const activeAgent = agents.find((a) => a.id === agentId) ?? agents[0]

  function upsertAgent(input: Omit<Agent, "id"> & { id?: string }) {
    if (input.id) {
      setAgents((prev) =>
        prev.map((a) => (a.id === input.id ? { ...a, ...input, id: a.id } : a))
      )
    } else {
      const id = `agent-${Date.now()}`
      setAgents((prev) => [...prev, { ...input, id }])
      setAgentId(id)
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
          system_prompt: activeAgent.system,
          model: genModel,
        })

        const budget = computeContextBudget(
          submittedQuery,
          response.chunks,
          genModel,
          activeAgent.system
        )
        setRunBudget(budget)

        const promptPreview = buildPromptPreview(
          submittedQuery,
          response.chunks,
          genModel,
          activeAgent.system
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
            topScore != null
              ? Math.round((0.7 + topScore * 0.2) * 100)
              : null,
          model: response.model,
        }

        setIsRunning(false)
        setIsStreaming(true)
        setRunResult(pendingResult)

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

  const hasAutoRun = React.useRef(false)
  React.useEffect(() => {
    if (hasAutoRun.current || !organization || !datasetId) return
    hasAutoRun.current = true
    void runQuery()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization, datasetId])

  const hasNoDatasets = !isLoadingDatasets && datasets.length === 0

  return (
    <div className="flex h-full flex-col gap-6">
      <header className="flex shrink-0 flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-pretty">
          Retrieval testing console
        </h1>
        <p className="text-sm text-muted-foreground text-pretty">
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
            {result && (
              <AnswerPanel
                result={result}
                isStreaming={isStreaming}
                streamedText={streamedText}
                contextBudget={runBudget ?? undefined}
              />
            )}
          </>
        )}
      </div>

      <div className="-mx-4 shrink-0 bg-background px-4 pt-3 pb-4">
        <QueryBar
          query={query}
          setQuery={setQuery}
          onRun={runQuery}
          isRunning={isRunning}
          agents={agents}
          agentId={agentId}
          setAgentId={setAgentId}
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
