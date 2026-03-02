"use client"
import { useState } from "react"

interface AskPanelProps {
  activeNotebook: string
}

export default function AskPanel({
  activeNotebook,
}: AskPanelProps) {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")

  const ask = async () => {
    const res = await fetch(
      `http://localhost:8000/ask/?notebook_id=${activeNotebook}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      }
    )

    const data = await res.json()
    setAnswer(data.answer)
  }

  return (
    <div className="bg-neutral-900 p-6 rounded-2xl">
      <h3 className="text-lg font-medium mb-4 text-neutral-200">
        Ask a Question
      </h3>

      <textarea
        className="w-full p-3 bg-neutral-800 rounded-xl mb-4 text-neutral-100"
        rows={3}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <button
        onClick={ask}
        className="bg-white text-black px-4 py-2 rounded-xl"
      >
        Ask
      </button>

      {answer && (
        <div className="mt-4 bg-neutral-800 p-4 rounded-xl text-neutral-100">
          {answer}
        </div>
      )}
    </div>
  )
}