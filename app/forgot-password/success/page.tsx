"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"

export default function PasswordResetSuccess() {
  const router = useRouter()

  const handleGoToLogin = () => {
    router.push("/login")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#c3b091]">
      <div className="w-full max-w-md p-6 text-center">
        <div className="mb-6 text-xl font-bold text-[#333]">PASSWORD RESET</div>

        <div className="rounded-xl bg-[#f5efe6] p-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#5c4033]">
            <Shield className="h-8 w-8 text-[#5c4033]" />
          </div>

          <h2 className="mb-8 text-center text-lg font-semibold text-[#5c4033]">PASSWORD RESET SUCCESSFULLY.</h2>

          <Button
            onClick={handleGoToLogin}
            className="w-full rounded-full bg-[#c3b091] text-[#5c4033] hover:bg-[#b3a081]"
          >
            Go to Login
          </Button>
        </div>
      </div>
    </div>
  )
}

