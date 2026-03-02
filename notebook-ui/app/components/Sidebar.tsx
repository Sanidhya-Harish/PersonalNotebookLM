"use client"

import { useEffect, useState } from "react"

interface SidebarProps {
  activeNotebook: string
  setActiveNotebook: (value: string) => void
}

export default function Sidebar({
  activeNotebook,
  setActiveNotebook,
}: SidebarProps) {
  const [notebooks, setNotebooks] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const fetchNotebooks = async () => {
    try {
      setLoading(true)

      const res = await fetch("http://localhost:8000/notebooks/")
      const data = await res.json()

      setNotebooks(data.notebooks || [])

      // Auto-select first notebook if none selected
      if (!activeNotebook && data.notebooks?.length > 0) {
        setActiveNotebook(data.notebooks[0])
      }

    } catch (error) {
      console.error("Failed to fetch notebooks", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotebooks()
  }, [])

  const createNotebook = async () => {
    const name = prompt("Enter notebook name")
    if (!name) return

    try {
      await fetch(
        `http://localhost:8000/notebook/?name=${encodeURIComponent(name)}`,
        { method: "POST" }
      )

      await fetchNotebooks()
      setActiveNotebook(name)

    } catch (error) {
      console.error("Failed to create notebook", error)
    }
  }

  const deleteNotebook = async (name: string) => {
    const confirmDelete = confirm(
      `Are you sure you want to delete "${name}"?`
    )
    if (!confirmDelete) return

    try {
      await fetch(
        `http://localhost:8000/notebook/?notebook_id=${encodeURIComponent(name)}`,
        { method: "DELETE" }
      )

      await fetchNotebooks()

      if (activeNotebook === name) {
        setActiveNotebook("")
      }

    } catch (error) {
      console.error("Failed to delete notebook", error)
    }
  }

  return (
    <div className="w-72 bg-neutral-900 text-white border-r border-neutral-800 p-5 flex flex-col">
      <h1 className="text-xl font-semibold mb-6">
        Sanidhya's Personal Notebook
      </h1>

      <button
        onClick={createNotebook}
        className="w-full bg-white text-black py-2 rounded-xl mb-4 hover:bg-gray-200 transition"
      >
        + New Notebook
      </button>

      <div className="space-y-2 overflow-y-auto">
        {loading ? (
          <p className="text-sm text-neutral-400">
            Loading...
          </p>
        ) : notebooks.length === 0 ? (
          <p className="text-sm text-neutral-400">
            No notebooks yet.
          </p>
        ) : (
          notebooks.map((nb) => (
            <div
              key={nb}
              className={`p-2 rounded-lg flex justify-between items-center cursor-pointer ${
                activeNotebook === nb
                  ? "bg-neutral-700"
                  : "hover:bg-neutral-800"
              }`}
            >
              <span
                className="truncate"
                onClick={() => setActiveNotebook(nb)}
              >
                {nb}
              </span>

              <button
                onClick={() => deleteNotebook(nb)}
                className="text-red-400 hover:text-red-300 text-xs ml-2"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}