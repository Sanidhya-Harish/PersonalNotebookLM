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

  const uploadFile = async () => {
    if (!file || !activeNotebook) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      setLoading(true)
      setSuccess(false)

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
      <h3 className="text-lg font-medium mb-4">
        Upload Document
      </h3>

      <input
        type="file"
        className="mb-4 block"
        onChange={(e) =>
          setFile(e.target.files ? e.target.files[0] : null)
        }
      />

      <button
        onClick={uploadFile}
        disabled={loading}
        className="bg-white text-black px-4 py-2 rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
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