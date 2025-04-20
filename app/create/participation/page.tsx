"use client"

import { useRouter } from "next/navigation"
import AuthLayout from "@/app/components/auth-layout"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function ParticipationPage() {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  const handleNext = () => {
    router.push("/create/summary")
  }

  return (
    <AuthLayout>
      <div className="min-h-screen bg-[#f5efe6] p-4">
        <div className="flex items-center mb-6">
          <button onClick={handleBack} className="mr-2">
            <ArrowLeft className="h-6 w-6 text-[#5c4033]" />
          </button>
          <h1 className="text-xl font-semibold text-[#5c4033]">Participation Settings</h1>
        </div>

        <div className="bg-white rounded-lg p-4 mb-6">
          <p className="text-[#5c4033]">
            This page is no longer used in the current flow. Participation settings are now part of step 3.
          </p>
        </div>

        <Button onClick={handleNext} className="w-full bg-[#c3b091] text-[#5c4033] hover:bg-[#b3a081] rounded-lg py-3">
          Continue to Summary
        </Button>
      </div>
    </AuthLayout>
  )
}

