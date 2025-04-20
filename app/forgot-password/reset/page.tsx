"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function ResetPassword() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [validatingSession, setValidatingSession] = useState(true)

  // Check if user has a valid recovery session
  useEffect(() => {
    const checkRecoverySession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Session error:", error)
          router.push("/forgot-password")
          return
        }

        // If no session or user, redirect to forgot password
        if (!data.session || !data.session.user) {
          router.push("/forgot-password")
          return
        }

        setValidatingSession(false)
      } catch (err) {
        console.error("Recovery check error:", err)
        router.push("/forgot-password")
      }
    }

    checkRecoverySession()
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Basic password validation
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      // Update password using Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
      } else {
        // Sign out after password reset
        await supabase.auth.signOut()

        // Add a small delay before redirecting to ensure signOut completes
        setTimeout(() => {
          // Navigate directly to login page
          router.push("/login?message=password-reset-success")
        }, 500)
      }
    } catch (err) {
      setError("Failed to reset password")
      console.error(err)
      setLoading(false)
    }
  }

  if (validatingSession) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#9c8170]">
        <div className="w-full max-w-md p-6 text-center">
          <h1 className="mb-6 text-3xl font-bold text-white">PlanUpp</h1>
          <div className="rounded-lg bg-white p-8 shadow-md">
            <p className="text-[#5c4033]">Validating your reset link...</p>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div className="h-full animate-pulse rounded-full bg-[#c3b091]" style={{ width: "100%" }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#9c8170]">
      <div className="w-full max-w-md rounded-xl bg-[#9c8170] p-6 text-center">
        <h1 className="mb-6 text-3xl font-bold text-[#333]">PlanUpp</h1>

        <div className="relative mt-12 rounded-t-[40px] bg-[#f5efe6] px-6 pt-12 pb-8">
          <h2 className="mb-8 text-2xl font-bold text-[#333]">Reset Password</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="password"
                placeholder="Enter New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10 rounded-full border-gray-200 bg-white"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 rounded-full border-gray-200 bg-white"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-full bg-[#c3b091] text-[#5c4033] hover:bg-[#b3a081]"
              disabled={loading}
            >
              {loading ? "Updating..." : "Reset Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

