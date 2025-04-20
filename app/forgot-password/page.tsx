"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function ForgotPassword() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Use Supabase to send password reset email with direct redirect to reset page
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/forgot-password/reset`,
      })

      if (resetError) {
        setError(resetError.message)
      } else {
        setSuccess(true)
        // Redirect to verify page after a short delay
        setTimeout(() => {
          router.push("/forgot-password/verify")
        }, 2000)
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#9c8170]">
      <div className="w-full max-w-md rounded-xl bg-[#9c8170] p-6 text-center">
        <h1 className="mb-6 text-3xl font-bold text-[#333]">PlanUpp</h1>

        <div className="relative mt-12 rounded-t-[40px] bg-[#f5efe6] px-6 pt-12 pb-8">
          <h2 className="mb-8 text-2xl font-bold text-[#333]">Forgot Password</h2>

          {success ? (
            <div className="text-green-600 mb-4">
              Password reset link has been sent to your email. Please check your inbox.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 rounded-full border-gray-200 bg-white"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-full bg-[#c3b091] text-[#5c4033] hover:bg-[#b3a081]"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

