"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Lock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { registerUserInDatabase } from "@/controllers/userController"

export default function Login() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  // Add a success message state and check for message parameter in URL

  const [successMessage, setSuccessMessage] = useState("")

  // Check for error or success message in URL parameters
  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }

    const messageParam = searchParams.get("message")
    if (messageParam === "password-reset-success") {
      setSuccessMessage("Your password has been reset successfully. Please log in with your new password.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Simple validation - just check if fields are not empty
      if (email && password) {
        // Use Supabase authentication
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          console.error("Login error details:", signInError)

          // Check if this is an email confirmation error
          if (signInError.message.includes("Email not confirmed") || signInError.message.includes("not confirmed")) {
            setError("Please confirm your email before logging in. Check your inbox for a verification link.")

            // Add a button to resend verification email
            const { error: resendError } = await supabase.auth.resend({
              type: "signup",
              email: email,
              options: {
                emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`,
              },
            })

            if (resendError) {
              console.error("Error resending verification email:", resendError)
            } else {
              setError("Please confirm your email before logging in. We've sent a new verification link to your email.")
            }
          } else {
            setError(signInError.message)
          }
        } else {
          // User successfully logged in, ensure they're registered in the Users table
          try {
            if (data.user) {
              await registerUserInDatabase(data.user)
            }
          } catch (registerError) {
            console.error("Error ensuring user is registered in database:", registerError)
            // Continue with login flow even if there's an error
          }

          // Check if the user is admin and redirect accordingly
          const ADMIN_ID = "366ffd3c-0a25-4767-8802-70a5285d9226"
          if (data.user.id === ADMIN_ID) {
            // Redirect admin to admin page
            router.push("/admin")
          } else {
            // Redirect regular users to events page
            router.push("/events")
          }
        }
      } else {
        setError("Please enter both email and password")
      }
    } catch (err) {
      setError("An error occurred during login")
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
          {/* Basketball illustration */}
          <div className="mb-6 flex justify-center">
            <div className="relative w-full h-[240px] flex items-center justify-center">
              <Image
                src="/images/basketball-illustration.png"
                alt="Basketball players"
                width={240}
                height={240}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>

          <h2 className="mb-8 text-2xl font-bold text-[#333]">Log In Now</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {successMessage && <div className="text-green-600 text-sm mb-4">{successMessage}</div>}
            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 rounded-full border-gray-200 bg-white"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 rounded-full border-gray-200 bg-white"
              />
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-[#5c4033]">
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full rounded-full bg-[#c3b091] text-[#5c4033] hover:bg-[#b3a081]"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-[#5c4033]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

