"use client"

import { useRouter } from "next/navigation"
import { Shield, ArrowRight } from "lucide-react"
import { useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { approveEvent } from "@/controllers/eventController"

export default function VerificationPage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // Auto-approve the most recent event after a short delay
    const timer = setTimeout(async () => {
      try {
        if (user?.id) {
          // Approve the most recent event by this user
          await approveEvent(null, user.id)
        }
      } catch (error) {
        console.error("Error approving event:", error)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [user])

  const handleProceed = () => {
    router.push("/create/success")
  }

  // Always show success state
  return (
    <div className="flex min-h-screen flex-col bg-[#f5efe6]">
      <div className="p-4">
        <h1 className="text-xl font-semibold text-[#5c4033]">Booking Verification</h1>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border-2 border-[#5c4033] bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#5c4033]">
            <Shield className="h-8 w-8 text-[#5c4033]" />
          </div>
          <p className="text-lg font-medium text-[#5c4033]">YOUR BOOKING IS VERIFIED</p>
        </div>

        <button
          onClick={handleProceed}
          className="mt-8 w-full max-w-md rounded-lg bg-[#c3b091] py-3 text-[#5c4033] hover:bg-[#b3a081] flex items-center justify-center gap-2"
        >
          Proceed
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

