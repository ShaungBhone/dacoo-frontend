"use client"

import * as React from "react"
import {
  SettingsIcon,
  SlidersHorizontalIcon,
  KeyIcon,
  TriangleAlertIcon,
  CopyIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/*                                  Component                                  */
/* -------------------------------------------------------------------------- */

const SECTIONS = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "retrieval", label: "Retrieval defaults", icon: SlidersHorizontalIcon },
  { id: "api-keys", label: "API keys", icon: KeyIcon },
  { id: "danger", label: "Danger zone", icon: TriangleAlertIcon },
]

export function SettingsView() {
  const [workspace, setWorkspace] = React.useState("acme")
  const [project, setProject] = React.useState("support-kb")
  const [genModel, setGenModel] = React.useState("gpt-4o")
  const [embedModel, setEmbedModel] = React.useState("text-embedding-3-large")
  const [topK, setTopK] = React.useState(6)
  const [temperature, setTemperature] = React.useState(0.2)
  const [rerank, setRerank] = React.useState(true)
  const [streaming, setStreaming] = React.useState(true)

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-background text-foreground">
      <div className="mx-auto flex w-full flex-1 flex-col gap-8 px-4 py-6 lg:flex-row lg:gap-10 lg:px-6">
        {/* Section nav */}
        <aside className="lg:w-56 lg:shrink-0">
          <nav className="flex gap-1 overflow-x-auto lg:sticky lg:top-0 lg:flex-col lg:overflow-visible">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <s.icon className="size-4" />
                {s.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Sections */}
        <main className="flex min-w-0 flex-1 flex-col gap-10">
          {/* General */}
          <Section
            id="general"
            title="General"
            description="Workspace and project identity used across the playground."
          >
            <Field label="Workspace name">
              <TextInput value={workspace} onChange={setWorkspace} />
            </Field>
            <Field
              label="Active project"
              hint="Determines which index queries run against."
            >
              <TextInput value={project} onChange={setProject} mono />
            </Field>
          </Section>

          {/* Retrieval defaults */}
          <Section
            id="retrieval"
            title="Retrieval defaults"
            description="Defaults applied to new playground sessions and experiments."
          >
            <Field label="Generation model">
              <TextInput value={genModel} onChange={setGenModel} mono />
            </Field>
            <Field label="Embedding model">
              <TextInput value={embedModel} onChange={setEmbedModel} mono />
            </Field>
            <Field label="Top-K chunks" value={String(topK)}>
              <input
                type="range"
                min={1}
                max={12}
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
              />
            </Field>
            <Field label="Temperature" value={temperature.toFixed(2)}>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
              />
            </Field>
            <ToggleRow
              label="Cohere rerank"
              description="Re-score retrieved chunks before generation."
              on={rerank}
              onToggle={() => setRerank((v) => !v)}
            />
            <ToggleRow
              label="Stream responses"
              description="Stream tokens to the console as they generate."
              on={streaming}
              onToggle={() => setStreaming((v) => !v)}
            />
          </Section>

          {/* API keys */}
          <Section
            id="api-keys"
            title="API keys"
            description="Use these keys to query the retrieval API programmatically."
          >
            <ApiKeyRow
              label="Production"
              value="rag_live_EXAMPLEKEY0000prod0000demo"
            />
            <ApiKeyRow
              label="Development"
              value="rag_test_EXAMPLEKEY0000dev00000demo"
            />
          </Section>

          {/* Danger zone */}
          <Section
            id="danger"
            title="Danger zone"
            description="Irreversible actions for this project."
            danger
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">Reset retrieval index</p>
                <p className="text-sm text-muted-foreground text-pretty">
                  Drops all embeddings and re-indexes from source documents.
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-md border border-destructive/40 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                Reset index
              </button>
            </div>
            <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">Delete project</p>
                <p className="text-sm text-muted-foreground text-pretty">
                  Permanently remove this project and all of its datasets.
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
              >
                Delete project
              </button>
            </div>
          </Section>

          {/* Save bar */}
          <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
            <button
              type="button"
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Save changes
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                Small parts                                  */
/* -------------------------------------------------------------------------- */

function Section({
  id,
  title,
  description,
  danger,
  children,
}: {
  id: string
  title: string
  description: string
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="mb-4">
        <h2
          className={cn(
            "text-base font-semibold",
            danger && "text-destructive"
          )}
        >
          {title}
        </h2>
        <p className="text-sm text-muted-foreground text-pretty">
          {description}
        </p>
      </div>
      <div
        className={cn(
          "flex flex-col gap-5 rounded-xl border bg-card p-5",
          danger ? "border-destructive/30" : "border-border"
        )}
      >
        {children}
      </div>
    </section>
  )
}

function Field({
  label,
  hint,
  value,
  children,
}: {
  label: string
  hint?: string
  value?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        {value != null && (
          <span className="font-mono text-sm text-muted-foreground">
            {value}
          </span>
        )}
      </div>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function TextInput({
  value,
  onChange,
  mono,
}: {
  value: string
  onChange: (v: string) => void
  mono?: boolean
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
        mono && "font-mono"
      )}
    />
  )
}

function ToggleRow({
  label,
  description,
  on,
  onToggle,
}: {
  label: string
  description: string
  on: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground text-pretty">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={onToggle}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
          on ? "bg-primary" : "bg-muted-foreground/30"
        )}
      >
        <span
          className={cn(
            "inline-block size-4 translate-x-0.5 rounded-full bg-background transition-transform",
            on && "translate-x-[18px]"
          )}
        />
      </button>
    </div>
  )
}

function ApiKeyRow({ label, value }: { label: string; value: string }) {
  const [revealed, setRevealed] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const masked = `${value.slice(0, 7)}${"•".repeat(18)}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
        <span className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">
          {revealed ? value : masked}
        </span>
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          aria-label={revealed ? "Hide key" : "Reveal key"}
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {revealed ? (
            <EyeOffIcon className="size-4" />
          ) : (
            <EyeIcon className="size-4" />
          )}
        </button>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy key"
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {copied ? (
            <CheckIcon className="size-4 text-primary" />
          ) : (
            <CopyIcon className="size-4" />
          )}
        </button>
      </div>
    </div>
  )
}
