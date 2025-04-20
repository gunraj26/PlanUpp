"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import "swagger-ui-react/swagger-ui.css"

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false })

export default function ApiDocs() {
  const [spec, setSpec] = useState(null)

  useEffect(() => {
    async function fetchSpec() {
      const response = await fetch("/api/docs")
      const data = await response.json()
      setSpec(data)
    }
    fetchSpec()
  }, [])

  return (
    <div className="swagger-container">
      <div className="swagger-header p-4 bg-gray-100">
        <h1 className="text-2xl font-bold">PlanUpp API Documentation</h1>
      </div>
      {spec ? <SwaggerUI spec={spec} /> : <div className="p-4">Loading API documentation...</div>}
      <style jsx global>{`
        .swagger-ui .topbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
