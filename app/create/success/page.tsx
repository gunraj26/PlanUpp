"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

// Separate component that doesn't use the context
function SuccessContent() {
  const router = useRouter()

  const handleGoToEvents = () => {
    router.push("/events")
  }

  return (
    <div className="min-h-screen bg-[#f5efe6] p-4 flex flex-col items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md text-center shadow-md">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>

        <h1 className="text-2xl font-bold text-[#5c4033] mb-2">Event Created!</h1>

        <p className="text-[#5c4033] mb-6">
          Your event has been created successfully and is verified. You can now view it in the events list.
        </p>

        <div className="space-y-3">
          <Button
            onClick={handleGoToEvents}
            className="w-full bg-[#c3b091] text-[#5c4033] hover:bg-[#b3a081] rounded-lg py-3"
          >
            View All Events
          </Button>

          <Button
            onClick={() => router.push("/profile")}
            variant="outline"
            className="w-full border-[#c3b091] text-[#5c4033] hover:bg-[#f5efe6] rounded-lg py-3"
          >
            Go to Profile
          </Button>
        </div>
      </div>
    </div>
  )
}

// Main component that doesn't need the context
export default function SuccessPage() {
  return <SuccessContent />
}

