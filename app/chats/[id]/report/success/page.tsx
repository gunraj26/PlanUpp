"use client"

import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ReportSuccessPage({ params }) {
  const router = useRouter()

  const handleReturn = () => {
    router.push("/events")
  }

  return (
    <div className="min-h-screen bg-planupp-beige flex flex-col">
      <div className="p-4 flex items-center">
        <h1 className="font-semibold text-planupp-text flex-1 text-center">Submit Report</h1>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg border-2 border-planupp-text p-8 text-center mb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-planupp-text">
              <Check className="h-8 w-8 text-planupp-text" />
            </div>
            <p className="text-lg font-medium text-planupp-text">YOUR REPORT HAS BEEN SUBMITTED</p>
            <p className="text-sm text-planupp-secondaryText mt-2">REPORT ID:123a</p>
          </div>

          <Button
            onClick={handleReturn}
            className="w-full bg-planupp-button text-planupp-text hover:bg-planupp-button/80 rounded-full py-3"
          >
            Return to Events Listings
          </Button>
        </div>
      </div>
    </div>
  )
}

