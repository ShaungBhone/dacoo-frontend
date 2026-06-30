"use client"

import { DatabaseIcon, FileTextIcon, Loader2Icon } from "lucide-react"

import { RailHeading } from "@/components/rag/primitives"
import { FILES } from "@/components/rag/retrieval"

export function KnowledgeBase() {
  return (
    <section className="flex flex-col gap-3">
      <RailHeading icon={<DatabaseIcon className="size-3.5" />}>
        Knowledge base
      </RailHeading>
      <ul className="flex flex-col gap-1">
        {FILES.map((file) => (
          <li
            key={file.name}
            className="flex items-center gap-2 rounded-md px-1.5 py-1.5 text-sm transition-colors hover:bg-muted/50"
          >
            <FileTextIcon className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">
              {file.name}
            </span>
            {file.status === "indexing" ? (
              <Loader2Icon className="size-3.5 shrink-0 animate-spin text-primary" />
            ) : (
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                {file.tokens}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
