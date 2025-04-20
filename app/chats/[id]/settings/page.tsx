"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, AlertTriangle, Edit, Check } from "lucide-react"
//import { updateChatRoom, deleteChatRoom, removeChatMember } from "@/lib/chat-service"
import { useAuth } from "@/context/auth-context"
import ReportUserModal from "@/app/components/report-user-modal"
import { supabase } from "@/lib/supabase"
import { removeChatMember } from "@/controllers/chatController"

export default function ChatSettingsPage({ params }) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [chatRoom, setChatRoom] = useState(null)
  const [members, setMembers] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [editMode, setEditMode] = useState({
    chatLimit: false,
    public: false,
    friends: false,
  })
  const [formValues, setFormValues] = useState({
    chatLimit: 0,
    public: 0,
    friends: 0,
    listEvent: true,
  })
  const [selectedMembers, setSelectedMembers] = useState([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportingUser, setReportingUser] = useState(null)
  // First, add a state for editing the chat name
  const [isEditingName, setIsEditingName] = useState(false)
  const [chatName, setChatName] = useState("")

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

  // Add this to the useEffect where you fetch chat data, after setting the chatRoom state
  useEffect(() => {
    async function fetchChatData() {
      if (!params.id || !user) return

      try {
        setIsLoading(true)

        // Fetch chat room details with event information including public_participants
        const { data: chatData, error: chatError } = await supabase
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
           capacity,
           public_participants
         )
       `)
          .eq("chatID", params.id)
          .single()

        if (chatError) {
          console.error("Error fetching chat data:", chatError)
          throw chatError
        }

        console.log("Chat room data:", chatData)
        setChatRoom(chatData)
        // Initialize chat name state with current name
        setChatName(chatData.chatRoomName || "")

        // Check if user is admin
        const adminStatus =
          chatData?.members &&
          Array.isArray(chatData.members) &&
          chatData.members.length > 0 &&
          chatData.members[0] === user.id
        setIsAdmin(adminStatus)

        // Set form values from chat room data
        if (chatData) {
          // Get the chat limit first
          const chatLimit = chatData.chatLimit || chatData.Events?.total_participants || 10

          // Calculate appropriate public and friends values that don't exceed the chat limit
          let publicValue = chatData.publicAccess || 0
          let friendsValue = chatData.friends || 0

          // Ensure public + friends doesn't exceed chat limit
          if (publicValue + friendsValue > chatLimit) {
            // Adjust values to fit within limit
            if (publicValue > chatLimit) {
              publicValue = Math.floor(chatLimit * 0.7) // 70% of limit for public by default
              friendsValue = chatLimit - publicValue
            } else {
              friendsValue = chatLimit - publicValue
            }
          }

          setFormValues({
            chatLimit: chatLimit,
            public: publicValue,
            friends: friendsValue,
            listEvent: chatData.listEvent !== undefined ? chatData.listEvent : true,
          })

          console.log("Setting form values:", {
            chatLimit,
            public: publicValue,
            friends: friendsValue,
            listEvent: chatData.listEvent,
          })
        }

        // Fetch member profiles
        if (chatData?.members && chatData.members.length > 0) {
          const { data: memberData, error: memberError } = await supabase
            .from("Users")
            .select("id, name, profilePic")
            .in("id", chatData.members)

          if (memberError) {
            console.error("Error fetching member profiles:", memberError)
            throw memberError
          }

          setMembers(memberData || [])
        }
      } catch (err) {
        console.error("Error fetching chat data:", err)
        setError("Failed to load chat settings. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (!loading) {
      fetchChatData()
    }
  }, [params.id, user, loading])

  // Add a function to handle chat name update
  const handleUpdateChatName = async () => {
    if (!chatRoom || !isAdmin || !chatName.trim()) return

    try {
      setError("")

      // Update the chat name in the database
      const { error: updateError } = await supabase
        .from("Chats")
        .update({ chatRoomName: chatName.trim() })
        .eq("chatID", chatRoom.chatID)

      if (updateError) {
        throw updateError
      }

      // Update local state
      setChatRoom((prev) => ({
        ...prev,
        chatRoomName: chatName.trim(),
      }))

      // Exit edit mode
      setIsEditingName(false)
    } catch (err) {
      console.error("Error updating chat name:", err)
      setError("Failed to update chat name. Please try again.")
    }
  }

  const handleEditToggle = (field) => {
    setEditMode((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handleInputChange = (field, value) => {
    setFormValues((prev) => {
      const newValues = { ...prev }

      if (field === "chatLimit") {
        newValues.chatLimit = value
        // Adjust public and friends if they now exceed the new limit
        if (newValues.public + newValues.friends > value) {
          // Maintain proportions if possible
          const ratio = newValues.public / (newValues.public + newValues.friends)
          newValues.public = Math.floor(value * ratio)
          newValues.friends = value - newValues.public
        }
      } else if (field === "public") {
        // Ensure public doesn't exceed chat limit
        newValues.public = Math.min(value, newValues.chatLimit)
        // Adjust friends if public + friends would exceed limit
        if (newValues.public + newValues.friends > newValues.chatLimit) {
          newValues.friends = newValues.chatLimit - newValues.public
        }
      } else if (field === "friends") {
        // Ensure friends doesn't exceed remaining space after public
        newValues.friends = Math.min(value, newValues.chatLimit - newValues.public)
      } else {
        newValues[field] = value
      }

      return newValues
    })
  }

  const handleSaveField = async (field) => {
    try {
      if (!chatRoom || !isAdmin) return

      const updates = {
        [field]: formValues[field],
      }

      await updateChatRoom(chatRoom.chatID, updates)

      // Update local state
      setChatRoom((prev) => ({
        ...prev,
        ...updates,
      }))

      // If chatLimit is being updated, also update total_participants in the events table
      if (field === "chatLimit" && chatRoom.Events?.eventid) {
        await supabase
          .from("Events")
          .update({ total_participants: formValues.chatLimit })
          .eq("eventid", chatRoom.Events.eventid)
      }

      // Exit edit mode
      handleEditToggle(field)
    } catch (err) {
      console.error(`Error updating ${field}:`, err)
      setError(`Failed to update ${field}. Please try again.`)
    }
  }

  const handleToggleListEvent = async () => {
    try {
      if (!chatRoom || !isAdmin) return

      const newValue = !formValues.listEvent

      await updateChatRoom(chatRoom.chatID, { listEvent: newValue })

      // Update local state
      setFormValues((prev) => ({
        ...prev,
        listEvent: newValue,
      }))

      setChatRoom((prev) => ({
        ...prev,
        listEvent: newValue,
      }))
    } catch (err) {
      console.error("Error toggling list event:", err)
      setError("Failed to update event listing. Please try again.")
    }
  }

  const handleMemberSelection = (memberId) => {
    setSelectedMembers((prev) => {
      if (prev.includes(memberId)) {
        return prev.filter((id) => id !== memberId)
      } else {
        return [...prev, memberId]
      }
    })
  }

  const handleDeleteMembers = async () => {
    try {
      if (!chatRoom || !isAdmin || selectedMembers.length === 0) return

      setIsDeleting(true)
      setError("")

      // Remove each selected member
      for (const memberId of selectedMembers) {
        try {
          await removeChatMember(chatRoom.chatID, memberId)
          console.log(`Successfully removed member ${memberId} from chat ${chatRoom.chatID}`)
        } catch (err) {
          console.error(`Error removing member ${memberId}:`, err)
          setError((prev) => (prev ? `${prev}, Failed to remove some members` : "Failed to remove some members"))
        }
      }

      // Refresh chat data to get updated members list
      const { data: updatedChat } = await supabase
        .from("Chats")
        .select("members")
        .eq("chatID", chatRoom.chatID)
        .single()

      if (updatedChat) {
        // Update the chatRoom state to reflect the new members list
        setChatRoom((prev) => ({
          ...prev,
          members: updatedChat.members,
        }))

        // Fetch updated member profiles
        if (updatedChat.members && updatedChat.members.length > 0) {
          const { data: memberData } = await supabase
            .from("Users")
            .select("id, name, profilePic")
            .in("id", updatedChat.members)

          if (memberData) {
            setMembers(memberData)
          }
        } else {
          setMembers([])
        }
      }

      // Clear selection
      setSelectedMembers([])
    } catch (err) {
      console.error("Error deleting members:", err)
      setError("Failed to delete members. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExitChat = async () => {
    try {
      if (!chatRoom || !user) return

      // Show loading state
      setError("Exiting chat...")

      // Call the exit_chat_room RPC function
      const { data, error: rpcError } = await supabase.rpc("exit_chat_room", {
        chat_id: chatRoom.chatID,
        user_id: user.id,
      })

      if (rpcError) {
        console.error("Error exiting chat:", rpcError)
        setError(`Failed to exit chat: ${rpcError.message}`)
        return
      }

      // If the RPC call was successful, update the event capacity if needed
      if (data === true) {
        // Get the current chat data to get the updated members array
        const { data: currentChat } = await supabase
          .from("Chats")
          .select("members, Events(*)")
          .eq("chatID", chatRoom.chatID)
          .single()

        // If this chat is associated with an event, update the event capacity
        if (currentChat?.Events && currentChat.Events.eventid) {
          await supabase
            .from("Events")
            .update({ capacity: (currentChat.members || []).length })
            .eq("eventid", currentChat.Events.eventid)
            .then((res) => {
              if (res.error) {
                console.log("Couldn't update event capacity:", res.error)
              }
            })
        }

        console.log("Successfully exited chat")

        // Navigate back to chats page on success
        router.push("/chats")
      } else {
        setError("Failed to exit chat: Operation returned false")
      }
    } catch (err) {
      console.error("Error exiting chat:", err)
      setError(`Failed to exit chat: ${err.message || "Unknown error"}`)
    }
  }

  const handleDeleteChatroom = async () => {
    try {
      if (!chatRoom || !isAdmin) return

      await deleteChatRoom(chatRoom.chatID)
      router.push("/chats")
    } catch (err) {
      console.error("Error deleting chatroom:", err)
      setError("Failed to delete chatroom. Please try again.")
    }
  }

  const handleReport = (userId, userName) => {
    if (!userId) return

    // Find the user to report
    const userToReport = members.find((member) => member.id === userId)
    if (userToReport) {
      setReportingUser(userToReport)
      setShowReportModal(true)
    }
  }

  const handleCopyShareableLink = () => {
    if (chatRoom?.shareableLink) {
      navigator.clipboard
        .writeText(chatRoom.shareableLink)
        .then(() => {
          alert("Link copied to clipboard!")
        })
        .catch((err) => {
          console.error("Failed to copy link:", err)
        })
    }
  }

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#e8d5c4]">
        <p className="text-[#5c4033]">Loading...</p>
      </div>
    )
  }

  if (!user) {
    router.push("/login")
    return null
  }

  if (!chatRoom) {
    return (
      <div className="flex flex-col h-screen bg-[#e8d5c4]">
        <div className="p-4 flex items-center justify-center">
          <button onClick={() => router.push("/chats")} className="absolute left-4">
            <ArrowLeft className="h-5 w-5 text-[#5c4033]" />
          </button>
          <h1 className="font-semibold text-[#5c4033]">Chat Settings</h1>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-[#5c4033] text-center">
            <p>Chat room not found or you don't have access.</p>
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

  // Admin view
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#e8d5c4]">
        {/* Header */}
        <div className="p-4 bg-[#e0d0c1] flex items-center justify-center relative">
          <button onClick={() => router.back()} className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <ArrowLeft className="h-5 w-5 text-[#5c4033]" />
          </button>
          <div className="text-center">
            <div className="h-16 w-16 rounded-full overflow-hidden mx-auto mb-2">
              <Image
                src={getChatImage() || "/placeholder.svg"}
                alt={chatRoom.chatRoomName}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>

            {isEditingName ? (
              <div className="flex items-center justify-center mb-1">
                <input
                  type="text"
                  value={chatName}
                  onChange={(e) => setChatName(e.target.value)}
                  className="px-2 py-1 rounded-md border border-[#c3b091] bg-white text-[#5c4033] text-center"
                  autoFocus
                />
                <button
                  onClick={handleUpdateChatName}
                  className="ml-2 p-1 bg-[#c3b091] rounded-full"
                  disabled={!chatName.trim()}
                >
                  <Check className="h-4 w-4 text-[#5c4033]" />
                </button>
              </div>
            ) : (
              <h1 className="font-semibold text-[#5c4033] flex items-center justify-center">
                {chatRoom.chatRoomName}
                {isAdmin && (
                  <button className="ml-2" onClick={() => setIsEditingName(true)}>
                    <Edit className="h-4 w-4 text-[#5c4033]" />
                  </button>
                )}
              </h1>
            )}

            <p className="text-xs text-[#5c4033]">{members.length} members</p>
          </div>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 mx-4 mt-4 rounded-lg">{error}</div>}

        {/* Members Section */}
        <div className="bg-[#f5efe6] p-4">
          {/* Member List */}
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className={`h-6 w-6 rounded-full border border-[#5c4033] mr-3 flex items-center justify-center ${
                      selectedMembers.includes(member.id) ? "bg-[#c3b091]" : ""
                    } cursor-pointer`}
                    onClick={() => handleMemberSelection(member.id)}
                  >
                    {selectedMembers.includes(member.id) && <Check className="h-4 w-4 text-[#5c4033]" />}
                  </div>
                  <div className="flex items-center">
                    <p className="text-[#5c4033] cursor-pointer" onClick={() => router.push(`/user/${member.id}`)}>
                      {member.name}
                    </p>
                  </div>
                </div>
                {member.id === chatRoom.members[0] && <span className="text-xs text-[#5c4033]">ADMIN</span>}
              </div>
            ))}
          </div>

          {/* Admin-only options */}
          <div className="mt-4">
            <button
              className={`w-full text-red-500 font-medium text-left ${selectedMembers.length === 0 ? "opacity-50" : ""}`}
              onClick={handleDeleteMembers}
              disabled={selectedMembers.length === 0 || isDeleting}
            >
              {isDeleting ? "DELETING..." : "DELETE MEMBERS"}
            </button>
          </div>
        </div>

        {/* Chat Settings */}
        <div className="bg-[#f5efe6] p-4 border-t border-[#e0d0c1]">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[#5c4033]">Chat Limit</span>
              <span className="text-[#5c4033]">{chatRoom.chatLimit || formValues.chatLimit}</span>
            </div>

            {/* Remove the public and friends fields */}

            <div className="flex justify-between items-center">
              <span className="text-[#5c4033]">Public</span>
              <span className="text-[#5c4033]">{members.length}</span>
            </div>
          </div>
        </div>

        {/* Report Button */}
        <div className="p-4 bg-[#f5efe6] border-t border-[#e0d0c1]">
          <button
            onClick={() => {
              if (selectedMembers.length > 0) {
                const selectedMember = members.find((member) => member.id === selectedMembers[0])
                handleReport(selectedMember?.id, selectedMember?.name)
              }
            }}
            className={`flex items-center text-red-500 font-medium ${selectedMembers.length === 0 ? "opacity-50" : ""}`}
            disabled={selectedMembers.length === 0}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            REPORT
          </button>
        </div>

        {/* Report Modal */}
        {showReportModal && reportingUser && (
          <ReportUserModal
            userId={reportingUser.id}
            userName={reportingUser.name}
            onClose={() => setShowReportModal(false)}
          />
        )}
      </div>
    )
  }

  // Non-admin view
  return (
    <div className="min-h-screen bg-[#e8d5c4]">
      {/* Header */}
      <div className="p-4 bg-[#e0d0c1] flex items-center justify-center relative">
        <button onClick={() => router.back()} className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <ArrowLeft className="h-5 w-5 text-[#5c4033]" />
        </button>
        <div className="text-center">
          <div className="h-16 w-16 rounded-full overflow-hidden mx-auto mb-2">
            <Image
              src={getChatImage() || "/placeholder.svg"}
              alt={chatRoom.chatRoomName}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="font-semibold text-[#5c4033]">{chatRoom.chatRoomName}</h1>
          <p className="text-xs text-[#5c4033]">{members.length} members</p>
        </div>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 mx-4 mt-4 rounded-lg">{error}</div>}

      {/* Members Section */}
      <div className="bg-[#f5efe6] p-4">
        {/* Member List */}
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className={`h-6 w-6 rounded-full border border-[#5c4033] mr-3 flex items-center justify-center ${
                    selectedMembers.includes(member.id) ? "bg-[#c3b091]" : ""
                  } cursor-pointer`}
                  onClick={() => handleMemberSelection(member.id)}
                >
                  {selectedMembers.includes(member.id) && <Check className="h-4 w-4 text-[#5c4033]" />}
                </div>
                <div className="flex items-center">
                  <p className="text-[#5c4033] cursor-pointer" onClick={() => router.push(`/user/${member.id}`)}>
                    {member.name}
                  </p>
                </div>
              </div>
              {member.id === chatRoom.members[0] && <span className="text-xs text-[#5c4033]">ADMIN</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Settings */}
      <div className="bg-[#f5efe6] p-4 border-t border-[#e0d0c1]">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[#5c4033]">Chat Limit</span>
            <span className="text-[#5c4033]">{chatRoom.chatLimit || formValues.chatLimit}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#5c4033]">Public</span>
            <span className="text-[#5c4033]">
              {members.length}/{chatRoom.chatLimit || formValues.chatLimit}
            </span>
          </div>
        </div>
      </div>

      {/* Report Button */}
      <div className="p-4 bg-[#f5efe6] border-t border-[#e0d0c1]">
        <button
          onClick={() => {
            if (selectedMembers.length > 0) {
              const selectedMember = members.find((member) => member.id === selectedMembers[0])
              handleReport(selectedMember?.id, selectedMember?.name)
            }
          }}
          className={`flex items-center text-red-500 font-medium ${selectedMembers.length === 0 ? "opacity-50" : ""}`}
          disabled={selectedMembers.length === 0}
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          REPORT
        </button>
      </div>

      {/* Report Modal */}
      {showReportModal && reportingUser && (
        <ReportUserModal
          userId={reportingUser.id}
          userName={reportingUser.name}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  )
}

