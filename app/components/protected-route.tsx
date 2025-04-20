"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      }
      setIsChecking(false)
    }
  }, [user, loading, router])

  if (loading || isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5efe6]">
        <div className="text-[#5c4033]">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}

