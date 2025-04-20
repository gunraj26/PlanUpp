"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [message, setMessage] = useState("Processing authentication...")

  useEffect(() => {
    // The route.js handler will process the authentication
    // This component just shows a loading state

    // After a short delay, redirect to events page
    const timer = setTimeout(() => {
      router.push("/events")
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5efe6]">
      <div className="w-full max-w-md p-6 text-center">
        <h1 className="mb-6 text-2xl font-bold text-[#5c4033]">Authentication</h1>
        <div className="rounded-lg bg-white p-8 shadow-md">
          <p className="text-[#5c4033]">{message}</p>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="h-full animate-pulse rounded-full bg-[#c3b091]" style={{ width: "100%" }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

