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
import {
  buildPromptPreview,
  computeContextBudget,
  retrieve,
  streamText,
  synthesizeStructuredAnswer,
  tokenize,
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
  const stopStreamRef = React.useRef<(() => void) | null>(null)

  const [templates, setTemplates] =
    React.useState<PromptTemplate[]>(PROMPT_TEMPLATES)
  const [templateId, setTemplateId] = React.useState(PROMPT_TEMPLATES[0].id)
  const [templateDialog, setTemplateDialog] =
    React.useState<TemplateDialogState>(null)

  const {
    config: { genModel, topK, rerank },
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
    if (!query.trim() || isRunning) return

    stopStreamRef.current?.()
    setIsRunning(true)
    setIsStreaming(false)
    setStreamedText("")
    setResult(null)

    const start = performance.now()
    let chunks = retrieve(query, topK)
    if (rerank) {
      chunks = [...chunks].sort((a, b) => b.score - a.score)
    }

    await new Promise((r) => setTimeout(r, 400 + Math.random() * 300))

    const latencyMs = Math.round(performance.now() - start)
    const usedTokens = chunks.reduce((sum, c) => sum + c.tokens, 0)
    const top = chunks[0]?.score ?? 0

    const structured = synthesizeStructuredAnswer(query, chunks)
    const promptPreview = buildPromptPreview(
      query,
      chunks,
      genModel,
      activeTemplate.system
    )

    const budget = computeContextBudget(
      query,
      chunks,
      genModel,
      activeTemplate.system
    )
    setRunBudget(budget)

    const pendingResult: RunResult = {
      query,
      structured,
      promptPreview,
      chunks,
      latencyMs,
      tokens: usedTokens + 1300 + tokenize(query).length * 4,
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
    setResult(pendingResult)

    stopStreamRef.current = streamText(
      fullText,
      (partial) => setStreamedText(partial),
      () => {
        setIsStreaming(false)
        setStreamedText(fullText)
      }
    )
  }, [query, isRunning, activeTemplate, genModel, topK, rerank])

  React.useEffect(() => {
    runQuery()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
