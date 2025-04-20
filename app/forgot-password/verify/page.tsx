"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function VerifyOTP() {
  const router = useRouter()
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // TODO: Replace with actual OTP verification
      // const response = await verifyOTP(otp)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Navigate to reset password page
      router.push("/forgot-password/reset")
    } catch (err) {
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="rounded-full border-gray-200 bg-white text-center"
                maxLength={6}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-full bg-[#c3b091] text-[#5c4033] hover:bg-[#b3a081]"
              disabled={loading}
            >
              {loading ? "Validating..." : "Validate"}
            </Button>

            <div className="mt-4 text-center">
              <Link href="/forgot-password" className="text-sm text-[#5c4033] hover:underline">
                Didn&apos;t get a code?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

