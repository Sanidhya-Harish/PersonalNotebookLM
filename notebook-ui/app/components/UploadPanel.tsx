"use client"

import { useState } from "react"

interface UploadPanelProps {
  activeNotebook: string
  onUploadSuccess?: () => void
}

export default function UploadPanel({
  activeNotebook,
  onUploadSuccess,
}: UploadPanelProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFile = (selected: File | null) => {
    if (!selected) return
    setFile(selected)
    setSuccess(false)
  }

  const uploadFile = async () => {
    if (!file || !activeNotebook) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      setLoading(true)

      const response = await fetch(
        `http://localhost:8000/upload-pdf/?notebook_id=${activeNotebook}`,
        {
          method: "POST",
          body: formData,
        }
      )

      if (!response.ok) {
        alert("Upload failed")
        return
      }

      setSuccess(true)
      setFile(null)

      if (onUploadSuccess) {
        onUploadSuccess()
      }

    } catch (error) {
      console.error("Upload failed", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-neutral-900 text-white p-6 rounded-2xl">
      <h3 className="text-lg font-semibold mb-4">
        Upload Document
      </h3>

      {/* Drag & Drop Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition
        ${
          dragActive
            ? "border-white bg-neutral-800"
            : "border-neutral-700 hover:border-neutral-500"
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragActive(false)
          handleFile(e.dataTransfer.files?.[0] || null)
        }}
      >
        <p className="text-neutral-400 text-sm mb-2">
          Drag & drop a file here
        </p>

        <label className="inline-block bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-xl cursor-pointer transition text-sm">
          Browse Files
          <input
            type="file"
            className="hidden"
            onChange={(e) =>
              handleFile(e.target.files ? e.target.files[0] : null)
            }
          />
        </label>

        {file && (
          <p className="text-sm text-neutral-300 mt-3">
            Selected: {file.name}
          </p>
        )}
      </div>

      {/* Upload Button */}
      <button
        onClick={uploadFile}
        disabled={loading || !file}
        className="mt-5 bg-white text-black px-4 py-2 rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {success && (
        <p className="text-green-400 text-sm mt-3">
          Upload successful ✓
        </p>
      )}
    </div>
  )
}