"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shield, Mail } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function SignupSuccess() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "verified" | "error">("pending")

  useEffect(() => {
    // Check if user is already signed in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()

      // Get verification status from URL
      const status = searchParams.get("verification")

      if (data.session) {
        setVerificationStatus("verified")
      } else if (status === "pending") {
        setVerificationStatus("pending")
      } else {
        // Check if coming from email confirmation
        const hash = window.location.hash
        if (hash && hash.includes("access_token")) {
          setVerificationStatus("verified")
        }
      }
    }

    checkSession()
  }, [searchParams])

  const handleGoToEvents = () => {
    // Navigate to events page
    router.push("/events")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#c3b091]">
      <div className="w-full max-w-md p-6 text-center">
        <div className="mb-6 text-xl font-bold text-[#333]">Signup Verification</div>

        <div className="rounded-xl bg-[#f5efe6] p-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#5c4033]">
            {verificationStatus === "pending" ? (
              <Mail className="h-8 w-8 text-[#5c4033]" />
            ) : (
              <Shield className="h-8 w-8 text-[#5c4033]" />
            )}
          </div>

          {verificationStatus === "pending" && (
            <>
              <h2 className="mb-4 text-center text-lg font-semibold text-[#5c4033]">
                CHECK YOUR EMAIL TO VERIFY YOUR ACCOUNT
              </h2>
              <p className="mb-4 text-sm text-[#5c4033]">
                We've sent a verification link to your email address. Please:
              </p>
              <ol className="mb-6 text-left text-sm text-[#5c4033] space-y-2 pl-4">
                <li>1. Open your email inbox</li>
                <li>2. Click on the verification link in our email</li>
                <li>3. Log in with your credentials</li>
                <li>4. Close this tab when you're done</li>
              </ol>
              <p className="mb-6 text-sm text-[#5c4033]">
                <strong>Important:</strong> You must verify your email before you can log in. If you don't see the
                email, please check your spam folder.
              </p>
              <Button
                onClick={async () => {
                  if (searchParams.get("email")) {
                    const email = searchParams.get("email") || ""
                    const { error } = await supabase.auth.resend({
                      type: "signup",
                      email: email,
                      options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`,
                      },
                    })

                    if (error) {
                      console.error("Error resending verification email:", error)
                    } else {
                      alert("Verification email resent. Please check your inbox.")
                    }
                  } else {
                    alert("Email address not available. Please try signing up again.")
                  }
                }}
                className="w-full mb-4 rounded-full bg-[#8a9a5b] text-white hover:bg-[#7d8a4e]"
              >
                Resend Verification Email
              </Button>
            </>
          )}

          {verificationStatus === "verified" && (
            <h2 className="mb-8 text-center text-lg font-semibold text-[#5c4033]">ACCOUNT CREATED SUCCESSFULLY</h2>
          )}

          {verificationStatus === "error" && (
            <>
              <h2 className="mb-8 text-center text-lg font-semibold text-red-500">VERIFICATION ERROR</h2>
              <p className="mb-4 text-sm text-[#5c4033]">
                There was an error verifying your account. Please try again or contact support.
              </p>
            </>
          )}

          <Button
            onClick={handleGoToEvents}
            className="w-full rounded-full bg-[#c3b091] text-[#5c4033] hover:bg-[#b3a081]"
            disabled={verificationStatus === "pending" || verificationStatus === "error"}
          >
            Go to Events
          </Button>
        </div>
      </div>
    </div>
  )
}

