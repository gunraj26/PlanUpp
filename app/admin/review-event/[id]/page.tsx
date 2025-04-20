"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

export default function ReviewEventPage({ params }) {
  const router = useRouter()
  const [review, setReview] = useState(null)

  useEffect(() => {
    // Find the event review based on the ID from the URL
    async function fetchEventReview() {
      try {
        const { data, error } = await supabase
          .from("Event_reviews")
          .select("*, event:eventID(*)")
          .eq("id", params.id)
          .single()

        if (error) throw error
        if (data) setReview(data)
        else router.push("/admin")
      } catch (err) {
        console.error("Error fetching event review:", err)
        router.push("/admin")
      }
    }

    fetchEventReview()
  }, [params.id, router])

  const handleVerify = () => {
    router.push("/admin/event-verified")
  }

  const handleReject = () => {
    router.push("/admin/event-rejected")
  }

  if (!review) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-planupp-beige">
        <p>Loading...</p>
      </div>
    )
  }

  const event = review.event

  return (
    <div className="flex min-h-screen flex-col bg-planupp-beige">
      <div className="flex items-center p-4 border-b border-planupp-brown/20">
        <button onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-6 w-6 text-planupp-text" />
        </button>
        <h1 className="text-xl font-bold text-planupp-text text-center flex-1">Review Event</h1>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <div className="mb-4">
            <h3 className="font-medium text-planupp-text">{event.sport} Booking</h3>
            <p className="text-xs text-gray-500">
              Submitted by {event.eventCreator.name} on {event.dateOfCreation}
            </p>
          </div>

          {event.attachments && event.attachments.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-planupp-text mb-2">Attachments</p>
              <div className="flex flex-wrap gap-2">
                {event.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="bg-planupp-button text-planupp-text px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    📎 {attachment.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <p className="text-sm text-planupp-text mb-2">Details to Verify:</p>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">SPORT:</span> {event.sport}
              </p>
              <p>
                <span className="font-medium">DATE:</span> {event.date}
              </p>
              <p>
                <span className="font-medium">TIME:</span> {event.time}
              </p>
              <p>
                <span className="font-medium">LOCATION:</span> {event.location}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={handleVerify} className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-md py-2">
            VERIFIED
          </Button>
          <Button onClick={handleReject} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-md py-2">
            REJECTED
          </Button>
        </div>
      </div>
    </div>
  )
}

