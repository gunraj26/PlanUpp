"use client"

import { useState, useEffect } from "react"
import { AuthProvider } from "@/context/auth-context"

// This component ensures AuthProvider is only rendered on the client
export default function Providers({ children }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    // Return a placeholder with the same structure until client-side hydration completes
    return <>{children}</>
  }

  return <AuthProvider>{children}</AuthProvider>
}

