"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useCreateEvent } from "../context/create-context"

export default function Step4Participation() {
  const router = useRouter()
  const { prevCreateStep, nextCreateStep } = useCreateEvent()

  const handleNext = () => {
    nextCreateStep()
  }

  return (
    <div className="min-h-screen bg-[#f5efe6] p-4">
      <div className="flex items-center mb-6">
        <button onClick={prevCreateStep} className="mr-2">
          <ArrowLeft className="h-6 w-6 text-[#5c4033]" />
        </button>
        <h1 className="text-xl font-semibold text-[#5c4033]">Participation Settings</h1>
      </div>

      <div className="bg-white rounded-lg p-4 mb-6">
        <p className="text-[#5c4033]">This step is intentionally left blank. The screenshot step is now step 4.</p>
      </div>

      <Button onClick={handleNext} className="w-full bg-[#c3b091] text-[#5c4033] hover:bg-[#b3a081] rounded-lg py-3">
        Next
      </Button>
    </div>
  )
}

