import type React from "react"
import type { Metadata } from "next"
import "@/styles/globals.css"
import { AuthProvider } from "@/context/auth-context"

export const metadata: Metadata = {
  title: "PlanUpp",
  description: "Find sports buddies and plan activities together",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}



import './globals.css'