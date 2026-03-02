"use client"

import { useEffect, useState } from "react"
import Sidebar from "./components/Sidebar"
import Workspace from "./components/Workspace"

export default function Home() {
  const [activeNotebook, setActiveNotebook] = useState<string>("")

  // Optional: auto-select first notebook when app loads
  useEffect(() => {
    const fetchInitialNotebook = async () => {
      try {
        const res = await fetch("http://localhost:8000/notebooks/")
        const data = await res.json()

        if (data.notebooks && data.notebooks.length > 0) {
          setActiveNotebook(data.notebooks[0])
        }
      } catch (error) {
        console.error("Failed to load initial notebook", error)
      }
    }

    fetchInitialNotebook()
  }, [])

  return (
    <div className="flex h-screen">
      <Sidebar
        activeNotebook={activeNotebook}
        setActiveNotebook={setActiveNotebook}
      />
      <Workspace activeNotebook={activeNotebook} />
    </div>
  )
}