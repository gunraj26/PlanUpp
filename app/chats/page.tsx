"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import BottomNav from "../components/bottom-nav"
import { useAuth } from "../../context/auth-context"
import { formatTimestamp } from "@/app/utils/format-time"
import { supabase } from "@/lib/supabase"

export default function ChatsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [chatRooms, setChatRooms] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

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

  // Get the image URL for the chat
  const getChatImage = (chat) => {
    // If the chat has an image that's a full URL, use it
    if (chat.chatRoomImage && (chat.chatRoomImage.startsWith("http://") || chat.chatRoomImage.startsWith("https://"))) {
      return chat.chatRoomImage
    }

    // If the chat has an image that's a local path, use it
    if (chat.chatRoomImage && chat.chatRoomImage.startsWith("/")) {
      return chat.chatRoomImage
    }

    // Otherwise, use a default image based on the sport from the event
    if (chat.Events?.sport) {
      return getDefaultSportImage(chat.Events.sport)
    }

    // Final fallback
    return "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=500&auto=format&fit=crop"
  }

  useEffect(() => {
    async function fetchChatRooms() {
      if (!user) return

      try {
        setIsLoading(true)

        // Fetch ALL chats and filter on client side
        const { data, error } = await supabase
          .from("Chats")
          .select(`
            *,
            Events:eventID (
              sport,
              location,
              eventDate,
              startTime,
              endTime,
              total_participants,
              capacity
            )
          `)
          .order("lastActive", { ascending: false })

        if (error) throw error

        // Filter chats on client side to only include those where user is a member
        const userChats =
          data?.filter((chat) => {
            // Check if members is an array and if it includes the user's ID
            return Array.isArray(chat.members) && chat.members.includes(user.id)
          }) || []

        console.log("Fetched chat rooms:", userChats)
        setChatRooms(userChats)
      } catch (err) {
        console.error("Error fetching chat rooms:", err)
        setError("Failed to load chats. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (!loading) {
      fetchChatRooms()
    }
  }, [user, loading])

  const handleChatClick = (chatId) => {
    router.push(`/chats/${chatId}`)
  }

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f5efe6]">
        <p className="text-[#5c4033]">Loading chats...</p>
      </div>
    )
  }

  if (!user) {
    router.push("/login")
    return null
  }

  return (
    <div className="flex flex-col h-screen bg-[#f5efe6]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#f5efe6] p-4 shadow-sm">
        <h1 className="text-2xl font-bold text-[#5c4033]">Chats</h1>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {error && <div className="text-red-500 p-3 text-center">{error}</div>}

        {chatRooms.length === 0 && !error ? (
          <div className="text-center py-8 text-[#5c4033]">
            <p>No chat rooms found. Join an event to start chatting!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {chatRooms.map((chat) => {
              // Format event details if available
              let eventDetails = "No event details"
              if (chat.Events) {
                const event = chat.Events
                eventDetails = `${event.location || "Unknown location"} | ${
                  new Date(event.eventDate).toLocaleDateString() || "No date"
                } | ${event.startTime?.substring(0, 5) || ""} - ${event.endTime?.substring(0, 5) || ""}`
              }

              return (
                <div
                  key={chat.chatID}
                  className="bg-[#e0d0c1] rounded-lg p-3 flex items-center cursor-pointer"
                  onClick={() => handleChatClick(chat.chatID)}
                >
                  <div className="h-12 w-12 rounded-full overflow-hidden mr-3 flex-shrink-0">
                    <Image
                      src={getChatImage(chat) || "/placeholder.svg"}
                      alt={chat.chatRoomName}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-[#5c4033]">{chat.chatRoomName}</h3>
                      <span className="text-xs text-[#5c4033]">
                        {chat.lastActive ? formatTimestamp(chat.lastActive) : "New"}
                      </span>
                    </div>
                    <p className="text-xs text-[#5c4033] truncate">{eventDetails}</p>
                    {/* Member count removed */}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

