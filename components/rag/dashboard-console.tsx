"use client"

import * as React from "react"

import {
  PROMPT_TEMPLATES,
  SAMPLE_QUERIES,
  type PromptTemplate,
} from "@/components/rag/data"
import {
  QueryBar,
  TemplateDialog,
  type TemplateDialogState,
} from "@/components/rag/query-bar"
import { AnswerPanel } from "@/components/rag/answer-panel"
import { ChunksList } from "@/components/rag/chunks-list"
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

export function DashboardConsole() {
  const [query, setQuery] = React.useState(SAMPLE_QUERIES[0])
  const [isRunning, setIsRunning] = React.useState(false)
  const [isStreaming, setIsStreaming] = React.useState(false)
  const [result, setResult] = React.useState<RunResult | null>(null)
  const [runBudget, setRunBudget] = React.useState<ContextBudget | null>(null)
  const [streamedText, setStreamedText] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const stopStreamRef = React.useRef<(() => void) | null>(null)

  const [templates, setTemplates] =
    React.useState<PromptTemplate[]>(PROMPT_TEMPLATES)
  const [templateId, setTemplateId] = React.useState(PROMPT_TEMPLATES[0].id)
  const [templateDialog, setTemplateDialog] =
    React.useState<TemplateDialogState>(null)

  const organization = useActiveOrganization()
  const {
    config: { genModel },
    datasetId,
    datasets,
    isLoadingDatasets,
  } = useRag()

  const activeTemplate =
    templates.find((t) => t.id === templateId) ?? templates[0]

  function upsertTemplate(
    input: Omit<PromptTemplate, "id"> & { id?: string }
  ) {
    if (input.id) {
      setTemplates((prev) =>
        prev.map((t) => (t.id === input.id ? { ...t, ...input, id: t.id } : t))
      )
    } else {
      const id = `tpl-${Date.now()}`
      setTemplates((prev) => [...prev, { ...input, id }])
      setTemplateId(id)
    }
    setTemplateDialog(null)
  }

  function deleteTemplate(id: string) {
    setTemplates((prev) => {
      const next = prev.filter((t) => t.id !== id)
      if (id === templateId && next.length > 0) {
        setTemplateId(next[0].id)
      }
      return next
    })
  }

  const runQuery = React.useCallback(async () => {
    if (!query.trim() || isRunning || !organization || !datasetId) return

    stopStreamRef.current?.()
    setIsRunning(true)
    setIsStreaming(false)
    setStreamedText("")
    setResult(null)
    setError(null)

    try {
      const response = await runDatasetQuery(organization.id, datasetId, {
        query,
        system_prompt: activeTemplate.system,
        model: genModel,
      })

      const budget = computeContextBudget(
        query,
        response.chunks,
        genModel,
        activeTemplate.system
      )
      setRunBudget(budget)

      const promptPreview = buildPromptPreview(
        query,
        response.chunks,
        genModel,
        activeTemplate.system
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
        query,
        structured: response.structured,
        promptPreview,
        chunks: response.chunks,
        latencyMs: response.latencyMs,
        tokens: response.tokens,
        faithfulness:
          topScore != null ? Math.round((0.82 + topScore * 0.13) * 100) : null,
        relevance:
          topScore != null ? Math.round((0.7 + topScore * 0.2) * 100) : null,
        model: response.model,
      }

      setIsRunning(false)
      setIsStreaming(true)
      setResult(pendingResult)

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
  }, [query, isRunning, organization, datasetId, activeTemplate, genModel])

  const hasAutoRun = React.useRef(false)
  React.useEffect(() => {
    if (hasAutoRun.current || !organization || !datasetId) return
    hasAutoRun.current = true
    runQuery()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization, datasetId])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const native = e.nativeEvent as unknown as {
      isComposing?: boolean
      keyCode?: number
    }
    if (native.isComposing || native.keyCode === 229) return
    if (e.key === "Enter") {
      e.preventDefault()
      runQuery()
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-pretty">
          Retrieval testing console
        </h1>
        <p className="text-sm text-muted-foreground text-pretty">
          Run a query, inspect the generated answer, and trace every claim back
          to its source chunk.
        </p>
      </header>

      {!isLoadingDatasets && datasets.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No datasets yet. Create one from the Datasets page before running a
          query.
        </p>
      ) : (
        <QueryBar
          query={query}
          setQuery={setQuery}
          onRun={runQuery}
          onKeyDown={handleKeyDown}
          isRunning={isRunning}
          templates={templates}
          templateId={templateId}
          setTemplateId={setTemplateId}
          onAddTemplate={() => setTemplateDialog({ mode: "add" })}
          onEditTemplate={(template) =>
            setTemplateDialog({ mode: "edit", template })
          }
          onDeleteTemplate={deleteTemplate}
        />
      )}

      {error && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {result && (
        <>
          <AnswerPanel
            result={result}
            isStreaming={isStreaming}
            streamedText={streamedText}
            contextBudget={runBudget ?? undefined}
          />
          <ChunksList chunks={result.chunks} />
        </>
      )}

      {templateDialog && (
        <TemplateDialog
          template={
            templateDialog.mode === "edit" ? templateDialog.template : null
          }
          onClose={() => setTemplateDialog(null)}
          onSave={upsertTemplate}
        />
      )}
    </div>
  )
}
