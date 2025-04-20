"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"

export default function EventCard({ event }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const router = useRouter()
  const { user } = useAuth()
  const [participantCount, setParticipantCount] = useState(event.memberCount || 1) // Default to at least 1

  // Calculate days ago
  const getDaysAgo = (dateString) => {
    const eventDate = new Date(dateString)
    const today = new Date()
    const diffTime = Math.abs(today - eventDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return `${diffDays} days ago`
  }

  // Format the event status with appropriate styling
  const getStatusDisplay = () => {
    if (event.status === "pending") {
      return <span className="text-yellow-600 text-xs font-medium">(Pending)</span>
    } else if (event.status === "admitted") {
      return <span className="text-green-600 text-xs font-medium">(Verified)</span>
    }
    return null
  }

  // Get a default sport image based on the sport
  const getDefaultSportImage = (sport) => {
    if (!sport) return "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=500&auto=format&fit=crop"

    const sportName = sport.toLowerCase()
    const sportImages = {
      basketball: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=500&auto=format&fit=crop",
      swimming: "https://images.unsplash.com/photo-1560090995-01632a28895b?q=80&w=500&auto=format&fit=crop",
      football: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=500&auto=format&fit=crop",
      tennis: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=500&auto=format&fit=crop",
      volleyball: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=500&auto=format&fit=crop",
      badminton: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=500&auto=format&fit=crop",
    }

    return (
      sportImages[sportName] ||
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=500&auto=format&fit=crop"
    )
  }

  // Get the image URL for the event
  const getEventImage = () => {
    // If the event has a screenshot that's a full URL, use it
    if (event.screenshot && (event.screenshot.startsWith("http://") || event.screenshot.startsWith("https://"))) {
      return event.screenshot
    }

    // If the event has a screenshot that's a local path, use it
    if (event.screenshot && event.screenshot.startsWith("/")) {
      return event.screenshot
    }

    // Otherwise, use a default image based on the sport
    return getDefaultSportImage(event.sport)
  }

  // Determine if the user is the creator of this event
  const isCreator = useMemo(() => {
    if (!user) return false
    const eventCreatorId = event.eventCreatorId || event.eventCreator?.id
    return eventCreatorId === user.id
  }, [user, event])

  // Check if the user has already joined this event
  useEffect(() => {
    const checkIfJoined = async () => {
      if (!user) return

      try {
        const eventID = event.eventId // Use the correct case
        const { data: existingChats } = await supabase.from("Chats").select("members").eq("eventID", eventID)

        if (existingChats && existingChats.length > 0) {
          // Check if any of the chats have the user as a member
          const isJoined = existingChats.some(
            (chat) => chat.members && Array.isArray(chat.members) && chat.members.includes(user.id),
          )
          setHasJoined(isJoined)
        }
      } catch (err) {
        console.error("Error checking if user joined:", err)
      }
    }

    checkIfJoined()
  }, [user, event])

  useEffect(() => {
    const fetchParticipantCount = async () => {
      try {
        // If the event already has a memberCount property, use it
        if (event.memberCount !== undefined) {
          setParticipantCount(Math.max(1, event.memberCount)) // Ensure at least 1
          return
        }

        // Otherwise, fetch it from the database
        const eventID = event.eventId // Use the correct case

        if (!eventID) return

        // Fetch chat room associated with this event
        const { data: chatRooms, error } = await supabase.from("Chats").select("members").eq("eventID", eventID)

        if (error) {
          console.error("Error fetching chat rooms:", error)
          return
        }

        // If chat room exists, count members
        if (chatRooms && chatRooms.length > 0) {
          const membersArray = chatRooms[0].members
          if (Array.isArray(membersArray)) {
            setParticipantCount(Math.max(1, membersArray.length)) // Ensure at least 1
          }
        } else {
          // No chat room found, but there should be at least the creator
          setParticipantCount(1)
        }
      } catch (err) {
        console.error("Error counting participants:", err)
        // Default to 1 if there's an error
        setParticipantCount(1)
      }
    }

    fetchParticipantCount()
  }, [event])

  // Get button text based on user status
  const getButtonText = () => {
    if (isCreator) return "Created"
    if (hasJoined) return "Joined"
    return "Join"
  }

  // Update the event card to display public_participants instead of capacity
  // Format capacity for display
  const formatCapacity = () => {
    // Use the members count from the chat room instead of public_participants
    const totalCapacity = event.total_participants || 0
    return `${participantCount || 0}/${totalCapacity} joined`
  }

  // Update the event card to handle the new participant structure
  // Don't update capacity when joining events
  const handleJoinClick = async (e) => {
    e.stopPropagation()

    if (!user) {
      router.push("/login")
      return
    }

    if (isCreator) {
      alert("You are the event creator.")
      return
    }

    try {
      setIsJoining(true)

      const eventID = event.eventId
      if (!eventID) throw new Error("Event ID missing")

      // ✅ Ensure you're querying correctly
      const { data: existingChat, error: chatError } = await supabase
        .from("Chats")
        .select("*")
        .eq("eventID", eventID) // ✅ correct column name
        .single()

      console.log("Fetched chat for eventID:", eventID)
      console.log("Chat data:", existingChat)
      console.log("Chat error:", chatError)

      if (chatError || !existingChat) {
        alert("Chat room not found. Contact support.")
        return
      }

      const chatID = existingChat.chatID
      const currentMembers = existingChat.members || []

      if (currentMembers.includes(user.id)) {
        console.log("User already in chat. Redirecting...")
        router.push(`/chats/${chatID}`)
        return
      }

      const updatedMembers = [...currentMembers, user.id]

      const { error: updateError } = await supabase
        .from("Chats")
        .update({ members: updatedMembers })
        .eq("chatID", chatID)

      if (updateError) throw updateError

      // ✅ This is correct — leave as-is:
      await supabase.from("Events").update({ public_participants: updatedMembers.length }).eq("eventId", eventID) // ✅ correct column name

      setHasJoined(true)
      router.push(`/chats/${chatID}`)
    } catch (err) {
      console.error("JOIN chat failed:", err)
      alert("Failed to join chat. Please try again.")
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div
      className={`rounded-lg transition-all duration-200 ease-in-out ${
        isExpanded ? "bg-[#b3a081] shadow-md" : "bg-[#e8d5c4] hover:bg-[#d8c5b4]"
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Main content - always visible */}
      <div className="flex items-center gap-4 p-4">
        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
          <Image
            src={getEventImage() || "/placeholder.svg"}
            alt={event.sport}
            width={48}
            height={48}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-semibold truncate ${isExpanded ? "text-white" : "text-[#5c4033]"}`}>
              {event.sport} {getStatusDisplay()}
            </h3>
            <span className="text-sm text-gray-500 ml-2 flex-shrink-0">{getDaysAgo(event.dateOfCreation)}</span>
          </div>

          <p className={`text-sm truncate ${isExpanded ? "text-white/90" : "text-[#5c4033]"}`}>
            {event.location} | {new Date(event.eventDate).toLocaleDateString()} |{" "}
            {event.startTime?.substring(0, 5) || ""} - {event.endTime?.substring(0, 5) || ""}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-sm ${isExpanded ? "text-white/90" : "text-gray-600"}`}>{formatCapacity()}</span>
          <Button
            className={`rounded-full px-4 py-1 h-8 ${
              isExpanded
                ? "bg-[#8a7355] text-white hover:bg-[#776345]"
                : "bg-[#c3b091] text-[#5c4033] hover:bg-[#b3a081]"
            } ${isCreator ? "opacity-75" : ""}`}
            onClick={handleJoinClick}
            disabled={isJoining || isCreator}
          >
            {isJoining ? "..." : getButtonText()}
          </Button>
        </div>
      </div>

      {/* Description - only shown when expanded */}
      {isExpanded && event.description && (
        <div className="px-4 pb-4 pt-0">
          <p className="text-sm text-white/90">{event.description}</p>
        </div>
      )}
    </div>
  )
}

