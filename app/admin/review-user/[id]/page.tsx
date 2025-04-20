"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"
import { banUser, ignoreReport } from "@/controllers/reportController"

export default function ReviewUserPage({ params }) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [report, setReport] = useState(null)
  const [reportedUser, setReportedUser] = useState(null)
  const [reportingUser, setReportingUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [debugInfo, setDebugInfo] = useState(null)
  const [showDebug, setShowDebug] = useState(false)

  // Hardcoded admin ID - this is the only admin user
  const ADMIN_ID = "366ffd3c-0a25-4767-8802-70a5285d9226"

  useEffect(() => {
    async function fetchReportDetails() {
      if (!user || user.id !== ADMIN_ID) return

      try {
        setIsLoading(true)

        // Fetch the report
        const { data: reportData, error: reportError } = await supabase
          .from("User_reports")
          .select("*")
          .eq("reportId", params.id)
          .single()

        if (reportError) throw reportError
        setReport(reportData)

        // Fetch the reported user
        if (reportData.profileReportedId) {
          const { data: reportedUserData, error: reportedUserError } = await supabase
            .from("Users")
            .select("*")
            .eq("id", reportData.profileReportedId)
            .single()

          if (!reportedUserError) {
            setReportedUser(reportedUserData)
          }
        }

        // Fetch the reporting user
        if (reportData.reportingProfileId) {
          const { data: reportingUserData, error: reportingUserError } = await supabase
            .from("Users")
            .select("*")
            .eq("id", reportData.reportingProfileId)
            .single()

          if (!reportingUserError) {
            setReportingUser(reportingUserData)
          }
        }
      } catch (err) {
        console.error("Error fetching report details:", err)
        setError("Failed to load report details. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (!loading) {
      fetchReportDetails()
    }
  }, [params.id, user, loading, ADMIN_ID])

  // Function to directly update ban count for debugging
  const directBanUpdate = async () => {
    if (!reportedUser) return

    try {
      setDebugInfo({
        status: "Processing direct ban update...",
        steps: [],
      })

      // Step 1: Get current ban count
      const { data: userData, error: fetchError } = await supabase
        .from("Users")
        .select("bans")
        .eq("id", reportedUser.id)
        .single()

      if (fetchError) {
        throw new Error(`Failed to fetch current ban count: ${fetchError.message}`)
      }

      const currentBans = userData.bans || 0
      const newBanCount = currentBans + 1

      setDebugInfo((prev) => ({
        ...prev,
        steps: [...(prev?.steps || []), `Current ban count: ${currentBans}`, `New ban count will be: ${newBanCount}`],
      }))

      // Step 2: Update ban count
      const { data: updateResult, error: updateError } = await supabase
        .from("Users")
        .update({ bans: newBanCount })
        .eq("id", reportedUser.id)

      if (updateError) {
        throw new Error(`Failed to update ban count: ${updateError.message}`)
      }

      setDebugInfo((prev) => ({
        ...prev,
        steps: [...(prev?.steps || []), `Ban count update executed`],
      }))

      // Step 3: Verify the update
      const { data: verifyData, error: verifyError } = await supabase
        .from("Users")
        .select("bans")
        .eq("id", reportedUser.id)
        .single()

      if (verifyError) {
        throw new Error(`Failed to verify ban count: ${verifyError.message}`)
      }

      const success = verifyData.bans === newBanCount

      setDebugInfo((prev) => ({
        ...prev,
        status: success ? "SUCCESS" : "FAILED",
        steps: [
          ...(prev?.steps || []),
          `Verification result: ${success ? "SUCCESS" : "FAILED"}`,
          `Current ban count after update: ${verifyData.bans}`,
        ],
      }))

      // Update local state to reflect the change
      setReportedUser((prev) => ({
        ...prev,
        bans: verifyData.bans,
      }))
    } catch (err) {
      console.error("Direct ban update error:", err)
      setDebugInfo((prev) => ({
        ...prev,
        status: "ERROR",
        steps: [...(prev?.steps || []), `Error: ${err.message}`],
      }))
    }
  }

  const handleBanUser = async () => {
    if (!report || !reportedUser) return

    try {
      setIsProcessing(true)
      setError("")
      setDebugInfo(null)

      console.log("Banning user:", reportedUser.id, "Report ID:", report.reportId)

      if (!report.profileReportedId) {
        throw new Error("No reported user ID found in the report")
      }

      // Get current ban count before the update
      const { data: beforeData } = await supabase.from("Users").select("bans").eq("id", reportedUser.id).single()

      const beforeCount = beforeData?.bans || 0
      console.log("Ban count BEFORE update:", beforeCount)

      // Try the banUser function from report-service
      let banResult
      try {
        banResult = await banUser(reportedUser.id, report.reportId)
        console.log("Ban result:", banResult)
      } catch (banError) {
        console.error("Error using banUser function:", banError)

        // If the main ban function fails, try a direct update
        console.log("Attempting direct update as fallback")

        // Get current ban count
        const { data: userData, error: userError } = await supabase
          .from("Users")
          .select("bans")
          .eq("id", reportedUser.id)
          .single()

        if (userError) {
          console.error("Error fetching user data:", userError)
          throw userError
        }

        // Calculate new ban count
        const currentBans = userData.bans || 0
        const newBanCount = currentBans + 1

        console.log(`Directly updating ban count from ${currentBans} to ${newBanCount} for user ${reportedUser.id}`)

        // Update the ban count
        const { error: updateError } = await supabase
          .from("Users")
          .update({ bans: newBanCount })
          .eq("id", reportedUser.id)

        if (updateError) {
          console.error("Error updating ban count:", updateError)
          throw updateError
        }

        // Update report status
        const { error: reportError } = await supabase
          .from("User_reports")
          .update({ status: "BANNED" })
          .eq("reportId", report.reportId)

        if (reportError) {
          console.error("Error updating report status:", reportError)
          throw reportError
        }

        // Get the updated ban count
        const { data: afterData } = await supabase.from("Users").select("bans").eq("id", reportedUser.id).single()

        banResult = {
          banCount: afterData?.bans || newBanCount,
        }
      }

      // Get ban count after the update for verification
      const { data: afterData } = await supabase.from("Users").select("bans").eq("id", reportedUser.id).single()

      const afterCount = afterData?.bans || 0
      console.log("Ban count AFTER update:", afterCount)

      // Check if ban count actually increased
      if (afterCount <= beforeCount) {
        console.error("Ban count did not increase! Before:", beforeCount, "After:", afterCount)
        setError("Ban count did not increase. Please try again or contact support.")
        setIsProcessing(false)
        return
      }

      // Navigate to ban confirmation page with the new ban count
      router.push(`/admin/ban-confirmation?count=${afterCount}`)
    } catch (err) {
      console.error("Error banning user:", err)
      setError("Failed to ban user. Please try again.")
      setIsProcessing(false)
    }
  }

  const handleIgnoreReport = async () => {
    if (!report) return

    try {
      setIsProcessing(true)
      setError("")

      await ignoreReport(report.reportId)

      // Navigate back to admin page
      router.push("/admin")
    } catch (err) {
      console.error("Error ignoring report:", err)
      setError("Failed to ignore report. Please try again.")
      setIsProcessing(false)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-planupp-beige">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="mr-2">
              <ArrowLeft className="h-5 w-5 text-planupp-text" />
            </button>
            <h1 className="font-semibold text-planupp-text">Review User</h1>
          </div>
          <Button
            onClick={async () => {
              // Sign out the user first
              await supabase.auth.signOut()
              router.push("/login")
            }}
            className="bg-planupp-button text-planupp-text hover:bg-planupp-button/80 rounded-md"
          >
            Back to App
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-planupp-text">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || user.id !== ADMIN_ID) {
    return (
      <div className="flex min-h-screen flex-col bg-planupp-beige">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="mr-2">
              <ArrowLeft className="h-5 w-5 text-planupp-text" />
            </button>
            <h1 className="font-semibold text-planupp-text">Review User</h1>
          </div>
          <Button
            onClick={async () => {
              // Sign out the user first
              await supabase.auth.signOut()
              router.push("/login")
            }}
            className="bg-planupp-button text-planupp-text hover:bg-planupp-button/80 rounded-md"
          >
            Back to App
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-planupp-text mb-4">You don't have permission to access this page.</p>
            <Button
              onClick={() => router.push("/events")}
              className="bg-planupp-button text-planupp-text hover:bg-planupp-button/80"
            >
              Return to Events
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex min-h-screen flex-col bg-planupp-beige">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="mr-2">
              <ArrowLeft className="h-5 w-5 text-planupp-text" />
            </button>
            <h1 className="font-semibold text-planupp-text">Review User</h1>
          </div>
          <Button
            onClick={async () => {
              // Sign out the user first
              await supabase.auth.signOut()
              router.push("/login")
            }}
            className="bg-planupp-button text-planupp-text hover:bg-planupp-button/80 rounded-md"
          >
            Back to App
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-planupp-text mb-4">Report not found or you don't have permission to view it.</p>
            <Button
              onClick={() => router.push("/admin")}
              className="bg-planupp-button text-planupp-text hover:bg-planupp-button/80"
            >
              Return to Admin
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-planupp-beige">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="mr-2">
            <ArrowLeft className="h-5 w-5 text-planupp-text" />
          </button>
          <h1 className="font-semibold text-planupp-text">Review User</h1>
        </div>
        <Button
          onClick={async () => {
            // Sign out the user first
            await supabase.auth.signOut()
            router.push("/login")
          }}
          className="bg-planupp-button text-planupp-text hover:bg-planupp-button/80 rounded-md"
        >
          Back to App
        </Button>
      </div>

      {error && <div className="mx-4 mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      <div className="p-4">
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center mr-3 overflow-hidden">
              {reportedUser?.profilePic ? (
                <Image
                  src={reportedUser.profilePic || "/placeholder.svg?height=40&width=40"}
                  alt={reportedUser.name}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <span className="text-gray-500">👤</span>
              )}
            </div>
            <div>
              <h3 className="font-medium text-planupp-text">{reportedUser?.name || "Unknown User"}</h3>
              <p className="text-xs text-gray-500">
                Reported by {reportingUser?.name || "Unknown"} on {report.dateReported}
              </p>
            </div>
          </div>

          {report.text && (
            <div className="mb-4">
              <p className="text-sm font-medium text-planupp-text mb-2">Report Details:</p>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-planupp-text">{report.text}</p>
              </div>
            </div>
          )}

          {report.image && (
            <div className="mb-4">
              <p className="text-sm text-planupp-text mb-2">Attachments</p>
              <div className="bg-planupp-button text-planupp-text px-3 py-1 rounded-full text-sm inline-flex items-center">
                📎 {report.image.split("/").pop() || "Chat.jpg"}
              </div>
              <div className="mt-3 max-h-60 overflow-hidden rounded-lg">
                <Image
                  src={report.image || "/placeholder.svg?height=200&width=200"}
                  alt="Report attachment"
                  width={300}
                  height={200}
                  className="object-contain w-full"
                />
              </div>
            </div>
          )}

          {reportedUser && (
            <div className="mb-4">
              <p className="text-sm font-medium text-planupp-text mb-2">User Information:</p>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-planupp-text">Current Ban Count: {reportedUser.bans || 0}</p>
                <p className="text-sm text-planupp-text">User ID: {reportedUser.id}</p>
                {reportedUser.bans >= 4 && (
                  <p className="text-sm text-red-500 font-medium mt-2">
                    Warning: This user will be permanently banned if banned one more time.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Debug section */}
          <div className="mt-4">
            <button onClick={() => setShowDebug(!showDebug)} className="text-xs text-blue-500 underline">
              {showDebug ? "Hide Debug Tools" : "Show Debug Tools"}
            </button>

            {showDebug && (
              <div className="mt-2 border border-gray-200 p-2 rounded-md">
                <p className="text-xs font-medium mb-2">Debug Tools</p>
                <button onClick={directBanUpdate} className="bg-gray-200 text-xs px-2 py-1 rounded">
                  Test Direct Ban Update
                </button>

                {debugInfo && (
                  <div className="mt-2 text-xs bg-gray-100 p-2 rounded">
                    <p className="font-medium">Status: {debugInfo.status}</p>
                    <ul className="mt-1 list-disc pl-4">
                      {debugInfo.steps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={handleIgnoreReport}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-md py-2"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Ignore"}
          </Button>
          <Button
            onClick={handleBanUser}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-md py-2"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Ban"}
          </Button>
        </div>
      </div>
    </div>
  )
}

