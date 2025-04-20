"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export default function EventVerifiedPage() {
  const router = useRouter()

  const handleReturn = () => {
    router.push("/admin")
  }

  return (
    <div className="flex min-h-screen flex-col bg-planupp-beige">
      <div className="p-4 border-b border-planupp-brown/20">
        <h1 className="text-xl font-bold text-planupp-text text-center">EVENT VERIFICATION</h1>
      </div>

      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg border-2 border-planupp-text p-8 text-center mb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-planupp-text">
              <Check className="h-8 w-8 text-planupp-text" />
            </div>
            <p className="text-lg font-medium text-planupp-text">Event has been VERIFIED!</p>
          </div>

          <Button
            onClick={handleReturn}
            className="w-full bg-planupp-button text-planupp-text hover:bg-planupp-button/80 rounded-md py-3"
          >
            Return to Admin Page
          </Button>
        </div>
      </div>
    </div>
  )
}

