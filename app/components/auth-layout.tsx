"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"

export default function AuthLayout({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5efe6]">
        <div className="animate-pulse text-[#5c4033]">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in the useEffect
  }

  return children
}

