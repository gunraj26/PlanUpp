"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

export default function BanConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [banCount, setBanCount] = useState(null)

  // Get the ban count from URL parameters if available
  useEffect(() => {
    const count = searchParams.get("count")
    if (count) {
      setBanCount(Number.parseInt(count, 10))
    }
  }, [searchParams])

  const handleReturn = () => {
    router.push("/admin")
  }

  return (
    <div className="flex min-h-screen flex-col bg-planupp-beige">
      <div className="p-4 border-b border-planupp-brown/20 flex items-center justify-between">
        <Button
          onClick={async () => {
            // Sign out the user first
            await supabase.auth.signOut()
            router.push("/login")
          }}
          className="bg-planupp-button text-planupp-text hover:bg-planupp-button/80 rounded-md"
        >
          Back to App
        </Button>
        <h1 className="text-xl font-bold text-planupp-text text-center flex-1">Ban Users</h1>
      </div>

      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg border-2 border-planupp-text p-8 text-center mb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-planupp-text">
              <Check className="h-8 w-8 text-planupp-text" />
            </div>
            <p className="text-lg font-medium text-planupp-text">User has been BANNED!</p>
            {banCount !== null && (
              <p className="text-sm text-planupp-text mt-2">The user's ban count has been increased to {banCount}.</p>
            )}
            {banCount === null && (
              <p className="text-sm text-planupp-text mt-2">The user's ban count has been increased.</p>
            )}
            {banCount >= 5 && (
              <p className="text-sm text-red-500 font-medium mt-2">
                This user has been permanently banned from the platform.
              </p>
            )}
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

