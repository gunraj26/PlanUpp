"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useCreateEvent } from "../context/create-context"
import { useAuth } from "@/context/auth-context"
import { useState } from "react"
import { supabase } from "@/lib/supabase-client"
import { createEvent } from "@/controllers/eventController"

export default function Step5Summary() {
  const router = useRouter()
  const { formData, prevCreateStep } = useCreateEvent()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError("")

      if (!user?.id) {
        throw new Error("You must be logged in to create an event")
      }

      // Get a default sport image based on the selected sport
      const getDefaultSportImage = (sport) => {
        const sportImages = {
          basketball: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=500&auto=format&fit=crop",
          swimming: "https://images.unsplash.com/photo-1560090995-01632a28895b?q=80&w=500&auto=format&fit=crop",
          football: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=500&auto=format&fit=crop",
          tennis: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=500&auto=format&fit=crop",
          volleyball: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=500&auto=format&fit=crop",
          badminton: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=500&auto=format&fit=crop",
        }

        return (
          sportImages[sport.toLowerCase()] ||
          "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=500&auto=format&fit=crop"
        )
      }

      // Map formData to match the database schema
      const eventData = {
        sport: formData.sport,
        location: formData.location || formData.facility?.name,
        date: formData.date,
        eventDate: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        description: formData.description,
        screenshot: formData.screenshot || getDefaultSportImage(formData.sport),
        totalParticipants: formData.totalParticipants,
        publicParticipants: formData.publicParticipants,
      }

      console.log("Creating event with data:", eventData)
      const createdEvent = await createEvent(eventData, user.id)
      console.log("Event created:", createdEvent)

      // Check if the event was created successfully
      if (createdEvent && createdEvent.eventId) {
        console.log("Checking for chat room for event:", createdEvent.eventId)

        // Wait a moment to ensure the chat room has time to be created
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Find the chat room associated with this event
        const { data: chatRooms, error } = await supabase
          .from("Chats")
          .select("chatID")
          .eq("eventID", createdEvent.eventId) // Match the exact case from the database schema
          .limit(1)

        console.log("Chat rooms query:", `eventID=${createdEvent.eventId}`)

        console.log("Chat rooms found:", chatRooms, "Error:", error)

        if (chatRooms && chatRooms.length > 0) {
          console.log("Navigating to chat room:", chatRooms[0].chatID)
          // Navigate to the chat room
          router.push(`/chats/${chatRooms[0].chatID}`)
          return
        } else {
          console.log("No chat room found, creating one manually")

          // If no chat room was found, create one manually
          try {
            const newChat = {
              chatRoomName: `${createdEvent.sport} Chat`,
              chatRoomImage: createdEvent.screenshot || "/placeholder.svg?height=80&width=80",
              shareableLink: `${window.location.origin}/chats/join/${Date.now()}`,
              listEvent: true,
              eventID: createdEvent.eventId, // Match the exact case from the database schema
              status: "ACTIVE",
              lastActive: new Date().toISOString(),
              members: [user.id],
              messageIDs: [],
              // Removed chatLimit, publicAccess, and friends fields as they don't exist in the schema
            }

            const { data: chatData, error: chatError } = await supabase.from("Chats").insert([newChat]).select()

            if (chatData && chatData.length > 0) {
              console.log("Manually created chat room:", chatData[0])
              router.push(`/chats/${chatData[0].chatID}`)
              return
            }
          } catch (chatErr) {
            console.error("Error creating chat room manually:", chatErr)
          }
        }
      }

      // Fallback to success page if chat room not found or created
      router.push("/create/success")
    } catch (err) {
      console.error("Error creating event:", err)
      setError("Failed to create event. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5efe6] p-4 pb-24">
      <div className="flex items-center mb-6">
        <button onClick={prevCreateStep} className="mr-2">
          <ArrowLeft className="h-6 w-6 text-[#5c4033]" />
        </button>
        <h1 className="text-xl font-semibold text-[#5c4033]">Event Summary</h1>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}

      <div className="bg-white rounded-lg p-4 mb-4">
        <h2 className="text-lg font-semibold text-[#5c4033] mb-3">Event Details</h2>

        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Sport:</span>
            <span className="text-sm font-medium text-[#5c4033]">{formData.sport}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Location:</span>
            <span className="text-sm font-medium text-[#5c4033]">{formData.facility?.name || formData.location}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Date:</span>
            <span className="text-sm font-medium text-[#5c4033]">{formatDate(formData.date)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Time:</span>
            <span className="text-sm font-medium text-[#5c4033]">
              {formData.startTime} - {formData.endTime}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Total Participants:</span>
            <span className="text-sm font-medium text-[#5c4033]">{formData.totalParticipants}</span>
          </div>

          {/* Remove the public and friends participants sections */}

          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Visibility:</span>
            <span className="text-sm font-medium text-[#5c4033]">{formData.visibility}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 mb-4">
        <h2 className="text-lg font-semibold text-[#5c4033] mb-3">Description</h2>
        <p className="text-sm text-[#5c4033]">{formData.description}</p>
      </div>

      <div className="bg-white rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-[#5c4033] mb-3">Screenshot</h2>
        <div className="flex justify-center">
          {formData.screenshot ? (
            <div className="relative h-48 w-full">
              <Image
                src={formData.screenshot || "/placeholder.svg"}
                alt="Event Screenshot"
                fill
                className="object-contain rounded-lg"
              />
            </div>
          ) : (
            <div className="bg-gray-100 h-48 w-full rounded-lg flex items-center justify-center">
              <span className="text-gray-400">No screenshot provided</span>
            </div>
          )}
        </div>
      </div>

      {/* Extra prominent Submit button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-[#f5efe6] border-t border-[#e0d0c1] z-40">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-[#c3b091] text-[#5c4033] hover:bg-[#b3a081] rounded-lg py-6 text-lg font-bold shadow-lg"
          type="button"
        >
          {isSubmitting ? "Creating Event..." : "CREATE EVENT"}
        </Button>
      </div>
    </div>
  )
}

