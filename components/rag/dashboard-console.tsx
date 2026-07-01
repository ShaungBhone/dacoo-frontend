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
import { useRag } from "@/components/rag/rag-context"
import { useActiveOrganization } from "@/hooks/use-active-organization"
import { runDatasetQuery } from "@/components/rag/api"
import { ApiError } from "@/lib/api"
import {
  buildPromptPreview,
  computeContextBudget,
<<<<<<< HEAD
  streamText,
=======
  retrieve,
  streamText,
  synthesizeStructuredAnswer,
  tokenize,
>>>>>>> 8769175 (submit form)
  type ContextBudget,
  type RunResult,
} from "@/components/rag/retrieval"

export function DashboardConsole() {
  const [query, setQuery] = React.useState(SAMPLE_QUERIES[0])
  const [isRunning, setIsRunning] = React.useState(false)
  const [isStreaming, setIsStreaming] = React.useState(false)
<<<<<<< HEAD
  const [result, setResult] = React.useState<RunResult | null>(null)
=======
>>>>>>> 8769175 (submit form)
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
<<<<<<< HEAD
    config: { genModel },
    datasetId,
    datasets,
    isLoadingDatasets,
=======
    config: { genModel, topK, rerank },
    runResult: result,
    setRunResult,
>>>>>>> 8769175 (submit form)
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

<<<<<<< HEAD
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
=======
  const runQuery = React.useCallback(async (nextQuery = query) => {
    const submittedQuery = nextQuery.trim()
    if (!submittedQuery || isRunning) return
>>>>>>> 8769175 (submit form)

    stopStreamRef.current?.()
    setQuery(nextQuery)
    setIsRunning(true)
    setIsStreaming(false)
    setStreamedText("")
<<<<<<< HEAD
    setResult(null)
    setError(null)

    try {
      const response = await runDatasetQuery(organization.id, datasetId, {
        query,
        system_prompt: activeTemplate.system,
        model: genModel,
      })
=======

    const start = performance.now()
    let chunks = retrieve(submittedQuery, topK)
    if (rerank) {
      chunks = [...chunks].sort((a, b) => b.score - a.score)
    }
>>>>>>> 8769175 (submit form)

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

<<<<<<< HEAD
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
=======
    const structured = synthesizeStructuredAnswer(submittedQuery, chunks)
    const promptPreview = buildPromptPreview(
      submittedQuery,
      chunks,
      genModel,
      activeTemplate.system
    )

    const budget = computeContextBudget(
      submittedQuery,
      chunks,
      genModel,
      activeTemplate.system
    )
    setRunBudget(budget)

    const pendingResult: RunResult = {
      query: submittedQuery,
      structured,
      promptPreview,
      chunks,
      latencyMs,
      tokens: usedTokens + 1300 + tokenize(submittedQuery).length * 4,
      faithfulness: chunks.length ? Math.round((0.82 + top * 0.13) * 100) : 0,
      relevance: chunks.length ? Math.round((0.7 + top * 0.2) * 100) : 0,
      model: genModel,
    }

    const allBullets = structured.sections.flatMap((s) => s.bullets)
    const fullText = [
      structured.summary.text,
      ...allBullets.map((b) => b.text),
    ].join(" ")

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
  }, [
    query,
    isRunning,
    activeTemplate,
    genModel,
    topK,
    rerank,
    setRunResult,
  ])
>>>>>>> 8769175 (submit form)

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
<<<<<<< HEAD
    if (hasAutoRun.current || !organization || !datasetId) return
    hasAutoRun.current = true
    runQuery()
=======
    const id = window.setTimeout(() => {
      void runQuery()
    }, 0)
    return () => window.clearTimeout(id)
>>>>>>> 8769175 (submit form)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization, datasetId])

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

<<<<<<< HEAD
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
=======
      <div className="scrollbar-thin min-h-0 flex-1 overflow-auto">
        {result && (
>>>>>>> 8769175 (submit form)
          <AnswerPanel
            result={result}
            isStreaming={isStreaming}
            streamedText={streamedText}
            contextBudget={runBudget ?? undefined}
          />
        )}
      </div>

      <div className="-mx-4 shrink-0 bg-background px-4 pt-3 pb-4">
        <QueryBar
          query={query}
          setQuery={setQuery}
          onRun={runQuery}
          isRunning={isRunning}
          templates={templates}
          templateId={templateId}
          setTemplateId={setTemplateId}
          onAddTemplate={() => setTemplateDialog({ mode: "add" })}
          onEditTemplate={(template) =>
            setTemplateDialog({ mode: "edit", template })
          }
        />
      </div>

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
