"use client"

import * as React from "react"
import { SendIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface ReplyComposerProps {
  onSubmit: (content: string) => void
  isLoading: boolean
}

export function ReplyComposer({ onSubmit, isLoading }: ReplyComposerProps) {
  const [content, setContent] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim() && !isLoading) {
      onSubmit(content)
      setContent("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow Cmd/Ctrl+Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      if (content.trim() && !isLoading) {
        onSubmit(content)
        setContent("")
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-t border-border px-6 py-4">
      <Textarea
        placeholder="Type your reply... (Cmd/Ctrl+Enter to send)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        className="resize-none text-sm"
        rows={3}
      />
      <div className="flex items-center justify-end">
        <Button
          type="submit"
          disabled={!content.trim() || isLoading}
          size="sm"
          className="gap-2"
        >
          <SendIcon className="size-4" />
          Send Reply
        </Button>
      </div>
    </form>
  )
}
