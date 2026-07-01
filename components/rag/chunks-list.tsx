"use client"

import { FileTextIcon, LayersIcon } from "lucide-react"

import { RailHeading } from "@/components/rag/primitives"
import type { Retrieved } from "@/components/rag/retrieval"

export function ChunksList({ chunks }: { chunks: Retrieved[] }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <RailHeading icon={<LayersIcon className="size-3.5" />}>
          Retrieved chunks
        </RailHeading>
        <span className="text-xs text-muted-foreground">
          {chunks.length} {chunks.length === 1 ? "source" : "sources"}
        </span>
      </div>

      {chunks.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
          No chunks crossed the retrieval threshold for this query.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {chunks.map((chunk, idx) => (
            <li
              id={`retrieved-${chunk.id}`}
              key={chunk.id}
              className="scroll-mt-4 rounded-lg border border-border bg-background/60 px-3 py-3"
            >
              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded bg-primary/10 font-mono text-[10px] font-semibold text-primary">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <FileTextIcon className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate font-mono text-xs font-medium">
                      {chunk.source}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                    {[
                      chunk.path,
                      chunk.page != null ? `p. ${chunk.page}` : null,
                      chunk.tokens != null ? `${chunk.tokens} tok` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-xs font-semibold text-primary">
                  {chunk.score.toFixed(3)}
                </span>
              </div>
              <p className="mt-2 line-clamp-4 text-xs leading-5 text-foreground/80">
                {chunk.text}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
