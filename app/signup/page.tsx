"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { registerUserInDatabase } from "@/controllers/userController"

export default function SignUp() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Simple validation - just check if fields are not empty
      if (email && password) {
        if (password.length < 6) {
          setError("Password must be at least 6 characters")
          setLoading(false)
          return
        }

        // Use Supabase authentication to sign up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // Use the auth/callback route to handle the redirect
            emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`,
          },
        })

        if (signUpError) {
          setError(signUpError.message)
          console.error("Signup error:", signUpError)
        } else if (data?.user) {
          console.log("User signed up successfully:", data.user)

          // Register the user in the database
          try {
            await registerUserInDatabase(data.user)
            console.log("User registered in database successfully")
          } catch (registerError) {
            console.error("Error registering user in database:", registerError)
            // Continue with the flow even if there's an error registering in the database
            // The auth/callback will try again
          }

          // Redirect to signup success page to show verification instructions
          router.push(`/signup/success?verification=pending&email=${encodeURIComponent(email)}`)
        } else {
          setError("Something went wrong during signup")
        }
      } else {
        setError("Please enter both email and password")
      }
    } catch (err: any) {
      setError("An error occurred during registration")
      console.error("Registration error:", err)
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

          <h2 className="mb-8 text-2xl font-bold text-[#333]">Sign Up Now</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center">
                <Mail className="h-5 w-5 text-gray-400" />
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
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 rounded-full border-gray-200 bg-white"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full rounded-full bg-[#c3b091] text-[#5c4033] hover:bg-[#b3a081]"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-[#5c4033]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold">
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

