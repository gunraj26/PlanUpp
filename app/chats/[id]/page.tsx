"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Send, Settings } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { formatTime } from "@/app/utils/format-time"
import { supabase } from "@/lib/supabase"

export default function ChatDetailPage({ params }) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [chatRoom, setChatRoom] = useState(null)
  const [members, setMembers] = useState([])
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const messagesEndRef = useRef(null)

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
  const getChatImage = () => {
    if (!chatRoom) return "/placeholder.svg"

    // If the chat has an image that's a full URL, use it
    if (
      chatRoom.chatRoomImage &&
      (chatRoom.chatRoomImage.startsWith("http://") || chatRoom.chatRoomImage.startsWith("https://"))
    ) {
      return chatRoom.chatRoomImage
    }

    // If the chat has an image that's a local path, use it
    if (chatRoom.chatRoomImage && chatRoom.chatRoomImage.startsWith("/")) {
      return chatRoom.chatRoomImage
    }

    // Otherwise, use a default image based on the sport from the event
    if (chatRoom.Events?.sport) {
      return getDefaultSportImage(chatRoom.Events.sport)
    }

    // Final fallback
    return "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=500&auto=format&fit=crop"
  }

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!params.id) return

    const chatId = params.id

    // Initial data fetch
    async function fetchChatData() {
      try {
        setIsLoading(true)

        // Fetch chat room details
        const { data: room, error: roomError } = await supabase
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
          .eq("chatID", chatId)
          .single()

        if (roomError) throw roomError
        setChatRoom(room)

        // Fetch messages
        const { data: chatMessages, error: messagesError } = await supabase
          .from("Messages")
          .select("*")
          .eq("chatID", chatId)
          .order("timestamp", { ascending: true })

        if (messagesError) throw messagesError
        setMessages(chatMessages || [])

        // Fetch member profiles
        if (room?.members && room.members.length > 0) {
          const { data: memberProfiles, error: membersError } = await supabase
            .from("Users")
            .select("id, name, profilePic")
            .in("id", room.members)

          if (membersError) throw membersError
          setMembers(memberProfiles || [])
        }
      } catch (err) {
        console.error("Error fetching chat data:", err)
        setError("Failed to load chat. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (!loading && user) {
      fetchChatData()
    }

    // Set up real-time subscription for new messages
    const subscription = supabase
      .channel(`messages:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Messages",
          filter: `chatID=eq.${chatId}`,
        },
        (payload) => {
          console.log("New message received:", payload.new)
          // Add the new message to the state
          setMessages((prevMessages) => [...prevMessages, payload.new])
        },
      )
      .subscribe()

    console.log("Subscription set up for chat:", chatId)

    return () => {
      subscription.unsubscribe()
    }
  }, [params.id, user, loading])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || !chatRoom) return

    try {
      console.log("Sending message to chat:", chatRoom.chatID)

      // Insert the message directly
      const { data, error } = await supabase.from("Messages").insert([
        {
          chatID: chatRoom.chatID,
          senderId: user.id,
          text: newMessage.trim(),
          timestamp: new Date().toISOString(),
        },
      ])

      if (error) {
        console.error("Error inserting message:", error)
        throw error
      }

      console.log("Message sent successfully:", data)

      // Update the lastActive timestamp for the chat room
      // Only if user is admin (first member)
      if (chatRoom.members && chatRoom.members[0] === user.id) {
        await supabase.from("Chats").update({ lastActive: new Date().toISOString() }).eq("chatID", chatRoom.chatID)
      }

      // Manually fetch the latest messages to ensure UI is updated
      const { data: latestMessages, error: fetchError } = await supabase
        .from("Messages")
        .select("*")
        .eq("chatID", chatRoom.chatID)
        .order("timestamp", { ascending: true })

      if (!fetchError && latestMessages) {
        console.log("Updated messages:", latestMessages)
        setMessages(latestMessages)
      }

      setNewMessage("")
    } catch (err) {
      console.error("Error sending message:", err)
    }
  }

  const handleSettingsClick = () => {
    router.push(`/chats/${params.id}/settings`)
  }

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f5efe6]">
        <p className="text-[#5c4033]">Loading chat...</p>
      </div>
    )
  }

  if (!user) {
    router.push("/login")
    return null
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-[#f5efe6]">
        <div className="p-4 border-b border-[#e0d0c1] flex items-center">
          <button onClick={() => router.push("/chats")} className="mr-2">
            <ArrowLeft className="h-5 w-5 text-[#5c4033]" />
          </button>
          <h1 className="font-semibold text-[#5c4033]">Error</h1>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-[#5c4033] text-center">
            <p>{error}</p>
            <button
              onClick={() => router.push("/chats")}
              className="mt-4 px-4 py-2 bg-[#c3b091] text-[#5c4033] rounded-lg"
            >
              Back to Chats
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!chatRoom) {
    return (
      <div className="flex flex-col h-screen bg-[#f5efe6]">
        <div className="p-4 border-b border-[#e0d0c1] flex items-center">
          <button onClick={() => router.push("/chats")} className="mr-2">
            <ArrowLeft className="h-5 w-5 text-[#5c4033]" />
          </button>
          <h1 className="font-semibold text-[#5c4033]">Chat Not Found</h1>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-[#5c4033] text-center">
            <p>This chat room doesn't exist or you don't have access to it.</p>
            <button
              onClick={() => router.push("/chats")}
              className="mt-4 px-4 py-2 bg-[#c3b091] text-[#5c4033] rounded-lg"
            >
              Back to Chats
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Check if user is a member of this chat
  const isUserMember = chatRoom.members?.includes(user.id)
  if (!isUserMember) {
    router.push("/chats")
    return null
  }

  // Check if user is admin
  const isAdmin = chatRoom.members?.[0] === user.id

  return (
    <div className="flex flex-col h-screen bg-[#f5efe6]">
      {/* Header */}
      <div className="p-4 border-b border-[#e0d0c1] flex items-center bg-[#f5efe6]">
        <button onClick={() => router.push("/chats")} className="mr-2">
          <ArrowLeft className="h-5 w-5 text-[#5c4033]" />
        </button>
        <div className="h-10 w-10 rounded-full overflow-hidden mr-2 flex-shrink-0">
          <Image
            src={getChatImage() || "/placeholder.svg"}
            alt={chatRoom.chatRoomName}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h1 className="font-semibold text-[#5c4033]">{chatRoom.chatRoomName}</h1>
        </div>
        <button onClick={handleSettingsClick}>
          <Settings className="h-5 w-5 text-[#5c4033]" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#f5efe6]">
        <div className="space-y-4">
          {messages.map((message) => {
            // Find the sender in the members array
            const sender = members.find((m) => m.id === message.senderId) || { name: "Unknown", id: "unknown" }
            // Check if current user is the sender
            const isCurrentUser = user && sender.id === user.id

            console.log("Rendering message:", {
              messageId: message.messageID,
              senderId: message.senderId,
              senderName: sender.name,
              isCurrentUser,
            })

            return (
              <div
                key={message.messageID || `msg-${Date.now()}-${Math.random()}`}
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    isCurrentUser ? "bg-[#c3b091] text-[#5c4033]" : "bg-white text-[#5c4033]"
                  }`}
                >
                  {!isCurrentUser && <p className="text-xs font-semibold text-[#8a9a5b]">{sender.name}</p>}
                  <p>{message.text}</p>
                  <p className="text-xs text-right mt-1">{formatTime(message.timestamp)}</p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="p-2 border-t border-[#e0d0c1] bg-[#f5efe6]">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write your message"
            className="flex-1 p-2 rounded-full border border-[#e0d0c1] bg-white text-[#5c4033] focus:outline-none"
          />
          <button type="submit" className="p-2 text-[#5c4033]" disabled={!newMessage.trim()}>
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  )
}

