"use client"

import { useState } from "react"

interface GeneratePanelProps {
  activeNotebook: string
}

interface PodcastResult {
  audio_file?: string
  warning?: string
}

export default function GeneratePanel({
  activeNotebook,
}: GeneratePanelProps) {
  const [loading, setLoading] = useState<"podcast" | "slides" | null>(null)
  const [podcastResult, setPodcastResult] = useState<PodcastResult | null>(null)
  const [slidesFile, setSlidesFile] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [duration, setDuration] = useState("short")

  const API = process.env.NEXT_PUBLIC_API_URL

  const generate = async (type: "podcast" | "slides") => {
    if (!activeNotebook) return

    setLoading(type)
    setError(null)
    setPodcastResult(null)
    setSlidesFile(null)

    const url =
      type === "podcast"
        ? `${API}/podcast/?notebook_id=${activeNotebook}&duration=${duration}`
        : `${API}/generate-slides/?notebook_id=${activeNotebook}`

    try {
      const response = await fetch(url, { method: "POST" })
      const data = await response.json()

      if (!response.ok) {
        setError("Generation failed.")
      } else {
        if (type === "podcast") {
          setPodcastResult(data)
        } else {
          setSlidesFile(data.file)
        }
      }
    } catch (err) {
      console.error(err)
      setError("Something went wrong.")
    }

    setLoading(null)
  }

  return (
    <div className="bg-neutral-900 text-white p-6 rounded-2xl">
      <h3 className="text-lg font-semibold mb-4">
        Generate Content
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

      {/* ERROR */}
      {error && (
        <div className="mt-6 bg-red-900 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* PODCAST RESULT */}
      {podcastResult?.audio_file && (
        <div className="mt-6 bg-neutral-800 p-5 rounded-xl space-y-4">
          <h4 className="font-semibold text-lg">
            🎙 Podcast Ready
          </h4>

          <audio controls className="w-full">
            <source
              src={`${API}/${podcastResult.audio_file}`}
              type="audio/mpeg"
            />
          </audio>

          <a
            href={`${API}/${podcastResult.audio_file}`}
            download
            className="inline-block bg-white text-black px-4 py-2 rounded-xl"
          >
            Download Podcast
          </a>

          {podcastResult.warning && (
            <p className="text-yellow-400 text-sm">
              {podcastResult.warning}
            </p>
          )}
        </div>
      )}

      {/* SLIDES RESULT */}
      {slidesFile && (
        <div className="mt-6 bg-neutral-800 p-5 rounded-xl">
          <h4 className="font-semibold text-lg mb-3">
            📊 Slides Ready
          </h4>

          <a
            href={`${API}/${slidesFile}`}
            target="_blank"
            className="inline-block bg-white text-black px-4 py-2 rounded-xl"
          >
            Download Slides
          </a>
        </div>
      )}
    </div>
  )
}