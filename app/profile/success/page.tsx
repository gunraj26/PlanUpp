"use client"

import { useRouter } from "next/navigation"
import { Shield, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProfile } from "../context/profile-context"

export default function ProfileSuccessPage() {
  const router = useRouter()
  const { user } = useProfile()

  const handleReturn = () => {
    router.push("/profile")
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#c3b091]">
      <div className="p-4">
        <h1 className="text-xl font-semibold text-center text-[#5c4033]">Profile</h1>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border-2 border-[#5c4033] bg-white p-8 text-center mb-8 shadow-lg">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#5c4033]">
            <Shield className="h-10 w-10 text-[#5c4033]" />
          </div>
          <p className="text-xl font-medium text-[#5c4033] mb-2">PROFILE EDITED SUCCESSFULLY</p>
          <p className="text-[#5c4033] opacity-75">Your profile has been updated with the latest information.</p>
        </div>

        <Button
          onClick={handleReturn}
          className="w-full max-w-md rounded-full bg-[#f5efe6] py-6 text-[#5c4033] hover:bg-[#d8c5b4] flex items-center justify-center gap-2 shadow-md"
        >
          Back to Profile
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

