"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"

export default function AdminPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [reports, setReports] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Hardcoded admin ID - this is the only admin user
  const ADMIN_ID = "366ffd3c-0a25-4767-8802-70a5285d9226"

  useEffect(() => {
    async function fetchReports() {
      if (!user) return

      // Only load reports if the user is the admin
      if (user.id !== ADMIN_ID) {
        setError("You don't have permission to access this page")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        // Fetch all reports with user details
        const { data, error: fetchError } = await supabase
          .from("User_reports")
          .select(`
            *,
            reported_user:profileReportedId(id, name, profilePic),
            reporting_user:reportingProfileId(id, name, profilePic)
          `)
          .order("dateReported", { ascending: false })
          .order("timeReported", { ascending: false })

        if (fetchError) {
          console.error("Error fetching reports:", fetchError)
          throw fetchError
        }

        setReports(data || [])
      } catch (err) {
        console.error("Error fetching reports:", err)
        setError("Failed to load reports. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (!loading) {
      fetchReports()
    }
  }, [user, loading, ADMIN_ID])

  // Filter reports based on search query
  const filteredReports = reports.filter((report) => {
    if (!searchQuery.trim()) return true

    const searchLower = searchQuery.toLowerCase()
    return (
      report.reported_user?.name?.toLowerCase().includes(searchLower) ||
      report.reporting_user?.name?.toLowerCase().includes(searchLower) ||
      report.text?.toLowerCase().includes(searchLower)
    )
  })

  const handleReviewUser = (reportId) => {
    router.push(`/admin/review-user/${reportId}`)
  }

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-planupp-beige">
        <div className="p-4 border-b border-planupp-brown/20">
          <h1 className="text-xl font-bold text-planupp-text text-center">Admin Management</h1>
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
        <div className="p-4 border-b border-planupp-brown/20">
          <h1 className="text-xl font-bold text-planupp-text text-center">Admin Management</h1>
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

  return (
    <div className="flex min-h-screen flex-col bg-planupp-beige">
      <div className="p-4 border-b border-planupp-brown/20 flex items-center justify-between">
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
        <h1 className="text-xl font-bold text-planupp-text text-center flex-1">Admin Management</h1>
      </div>

      <div className="p-4">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search Users/Reports"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border-gray-200 bg-white pl-10 pr-4"
          />
        </div>

        {error && <div className="text-red-500 p-3 text-center mb-4">{error}</div>}

        {filteredReports.length === 0 ? (
          <div className="text-center py-12 text-planupp-text">
            {searchQuery ? "No reports found matching your search" : "No reports found"}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReports.map((report) => (
              <div key={report.reportId} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                      {report.reported_user?.profilePic ? (
                        <Image
                          src={report.reported_user.profilePic || "/placeholder.svg?height=40&width=40"}
                          alt={report.reported_user?.name || "User"}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-gray-500">👤</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-planupp-text">{report.reported_user?.name || "Unknown User"}</h3>
                      <p className="text-xs text-gray-500">
                        Reported by {report.reporting_user?.name || "Unknown"} on {report.dateReported}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {report.status === "PENDING" && <div className="h-6 w-6 bg-red-500 rounded-sm mr-2"></div>}
                    {report.status === "BANNED" && <div className="h-6 w-6 bg-black rounded-sm mr-2"></div>}
                    {report.status === "IGNORED" && <div className="h-6 w-6 bg-green-500 rounded-sm mr-2"></div>}
                    <Button
                      onClick={() => handleReviewUser(report.reportId)}
                      className="bg-planupp-button text-planupp-text hover:bg-planupp-button/80 rounded-md"
                    >
                      Review
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

