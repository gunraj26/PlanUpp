"use client"

import { CreateEventProvider } from "./context/create-context"
import CreatePageContent from "./components/create-page-content"

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-white">
      <CreateEventProvider>
        <CreatePageContent />
      </CreateEventProvider>
    </div>
  )
}

