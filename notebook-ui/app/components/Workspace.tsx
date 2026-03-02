"use client"

import { useEffect, useState } from "react"
import UploadPanel from "./UploadPanel"
import AskPanel from "./AskPanel"
import GeneratePanel from "./GeneratePanel"

interface WorkspaceProps {
  activeNotebook: string
}

export default function Workspace({
  activeNotebook,
}: WorkspaceProps) {
  const [sources, setSources] = useState<string[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [loadingSources, setLoadingSources] = useState(false)

  const fetchSources = async () => {
    if (!activeNotebook) {
      setSources([])
      return
    }

    try {
      setLoadingSources(true)

      const res = await fetch(
        `http://localhost:8000/sources/?notebook_id=${activeNotebook}`
      )

      const data = await res.json()
      setSources(data.sources || [])

    } catch (error) {
      console.error("Failed to fetch sources", error)
      setSources([])
    } finally {
      setLoadingSources(false)
    }
  }

  const deleteSource = async (filename: string) => {
    try {
      await fetch(
        `http://localhost:8000/source/?notebook_id=${activeNotebook}&filename=${encodeURIComponent(filename)}`,
        { method: "DELETE" }
      )

      // refresh after delete
      setRefreshKey(prev => prev + 1)

    } catch (error) {
      console.error("Delete failed", error)
    }
  }

  useEffect(() => {
    fetchSources()
  }, [activeNotebook, refreshKey])

  return (
    <div className="flex-1 p-10 overflow-y-auto space-y-8 bg-neutral-950 text-white">
      <h2 className="text-2xl font-semibold">
        Notebook Workspace
      </h2>

      <p className="text-sm text-neutral-400">
        Active Notebook: {activeNotebook || "None Selected"}
      </p>

      {/* SOURCES SECTION */}
      <div className="bg-neutral-900 p-6 rounded-2xl">
        <h3 className="text-lg font-medium mb-4">
          Sources
        </h3>

        {loadingSources ? (
          <p className="text-sm text-neutral-400">
            Loading sources...
          </p>
        ) : sources.length === 0 ? (
          <p className="text-sm text-neutral-400">
            No sources uploaded.
          </p>
        ) : (
          <div className="space-y-2">
            {sources.map((src) => (
              <div
                key={src}
                className="bg-neutral-800 p-3 rounded-lg text-sm flex justify-between items-center"
              >
                <span className="truncate">{src}</span>

                <button
                  onClick={() => deleteSource(src)}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <UploadPanel
        activeNotebook={activeNotebook}
        onUploadSuccess={() => setRefreshKey(prev => prev + 1)}
      />

      <AskPanel activeNotebook={activeNotebook} />

      <GeneratePanel activeNotebook={activeNotebook} />
    </div>
  )
}