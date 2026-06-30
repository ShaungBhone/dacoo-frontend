"use client"

import { FileTextIcon, LayersIcon } from "lucide-react"

import type { Retrieved } from "@/components/rag/retrieval"

export function ChunksList({ chunks }: { chunks: Retrieved[] }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayersIcon className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Retrieved chunks</h2>
        </div>
        <span className="text-xs text-muted-foreground">
          {chunks.length} {chunks.length === 1 ? "source" : "sources"}
        </span>
      </div>

      {chunks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No chunks crossed the retrieval threshold for this query.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {chunks.map((chunk, idx) => (
            <li
              key={chunk.id}
              className="rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded bg-primary/10 font-mono text-[11px] font-semibold text-primary">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <FileTextIcon className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate font-mono text-sm font-medium">
                      {chunk.source}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {chunk.path} · p.&nbsp;{chunk.page} · {chunk.tokens} tok
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-muted sm:block">
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{ width: `${Math.round(chunk.score * 100)}%` }}
                    />
                  </span>
                  <span className="font-mono text-sm font-semibold text-primary">
                    {chunk.score.toFixed(3)}
                  </span>
                </div>
              </div>
              <p className="mt-3 pl-8 text-sm leading-6 text-foreground/80">
                {chunk.text}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
