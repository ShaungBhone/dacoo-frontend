"use client"

import * as React from "react"

export type RagConfig = {
  genModel: string
  embedModel: string
  topK: number
  temperature: number
  rerank: boolean
}

type RagContextValue = {
  config: RagConfig
  setGenModel: (v: string) => void
  setEmbedModel: (v: string) => void
  setTopK: (v: number) => void
  setTemperature: (v: number) => void
  setRerank: (v: boolean) => void
}

const RagContext = React.createContext<RagContextValue | null>(null)

export function useRag() {
  const ctx = React.useContext(RagContext)
  if (!ctx) {
    throw new Error("useRag must be used within a RagProvider.")
  }
  return ctx
}

export function RagProvider({ children }: { children: React.ReactNode }) {
  const [genModel, setGenModel] = React.useState("gpt-4o")
  const [embedModel, setEmbedModel] = React.useState(
    "text-embedding-3-large"
  )
  const [topK, setTopK] = React.useState(4)
  const [temperature, setTemperature] = React.useState(0.2)
  const [rerank, setRerank] = React.useState(true)

  const value = React.useMemo<RagContextValue>(
    () => ({
      config: { genModel, embedModel, topK, temperature, rerank },
      setGenModel,
      setEmbedModel,
      setTopK,
      setTemperature,
      setRerank,
    }),
    [genModel, embedModel, topK, temperature, rerank]
  )

  return <RagContext.Provider value={value}>{children}</RagContext.Provider>
}
