"use client"

import { useState } from "react"

interface GeneratePanelProps {
  activeNotebook: string
}

export default function GeneratePanel({
  activeNotebook,
}: GeneratePanelProps) {
  const [loading, setLoading] = useState<"podcast" | "slides" | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [duration, setDuration] = useState("short")

  const generate = async (type: "podcast" | "slides") => {
    setLoading(type)
    setResult(null)

    let url = ""

    if (type === "podcast") {
      url = `http://localhost:8000/podcast/?notebook_id=${activeNotebook}&duration=${duration}`
    } else {
      url = `http://localhost:8000/generate-slides/?notebook_id=${activeNotebook}`
    }

    try {
      const response = await fetch(url, {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        setResult("Generation failed.")
      } else {
        if (type === "podcast") {
          setResult(data.script || "Podcast generated.")
        } else {
          setResult(`Slides generated at: ${data.file}`)
        }
      }
    } catch (error) {
      console.error(error)
      setResult("Something went wrong.")
    }

    setLoading(null)
  }

  return (
    <div className="bg-neutral-900 text-white p-6 rounded-2xl">
      <h3 className="text-lg font-medium mb-4">
        Generate
      </h3>

      <p className="text-sm text-neutral-400 mb-4">
        Notebook: {activeNotebook}
      </p>

      {/* Podcast Duration */}
      <div className="mb-4">
        <label className="text-sm text-neutral-300 mr-3">
          Podcast Length:
        </label>
        <select
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="bg-neutral-800 text-white px-3 py-1 rounded-lg border border-neutral-700"
        >
          <option value="short">Short</option>
          <option value="medium">Medium</option>
          <option value="long">Long</option>
        </select>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => generate("podcast")}
          disabled={loading === "podcast"}
          className="bg-white text-black px-4 py-2 rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
        >
          {loading === "podcast" ? "Generating..." : "Generate Podcast"}
        </button>

        <button
          onClick={() => generate("slides")}
          disabled={loading === "slides"}
          className="bg-white text-black px-4 py-2 rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
        >
          {loading === "slides" ? "Generating..." : "Generate Slides"}
        </button>
      </div>

      {result && (
        <div className="mt-6 bg-neutral-800 p-4 rounded-xl text-sm whitespace-pre-wrap">
          {result}
        </div>
      )}
    </div>
  )
}