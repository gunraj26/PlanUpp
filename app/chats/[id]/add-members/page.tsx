"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Search, UserPlus } from "lucide-react"
import { getChatRoomById, addChatMember } from "@/controllers/chatController"
import { useAuth } from "@/context/auth-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function AddMembersPage({ params }) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [chatRoom, setChatRoom] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [addingUser, setAddingUser] = useState(null)

  useEffect(() => {
    async function fetchChatData() {
      if (!params.id || !user) return

      try {
        setIsLoading(true)

        // Fetch chat room details
        const room = await getChatRoomById(params.id)
        setChatRoom(room)

        // Check if user is admin
        const adminStatus = room?.members?.[0] === user.id
        setIsAdmin(adminStatus)
      } catch (err) {
        console.error("Error fetching chat data:", err)
        setError("Failed to load chat. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (!loading) {
      fetchChatData()
    }
  }, [params.id, user, loading])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      setIsSearching(true)
      setError("")

      // Search for users by name or email
      const { data, error: searchError } = await supabase
        .from("Users")
        .select("id, name, profilePic")
        .or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .limit(10)

      if (searchError) throw searchError

      // Filter out users who are already members
      const filteredResults = data.filter((result) => !chatRoom.members.includes(result.id))

      setSearchResults(filteredResults)
    } catch (err) {
      console.error("Error searching for users:", err)
      setError("Failed to search for users. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddMember = async (userId) => {
    try {
      setAddingUser(userId)
      setError("")

      await addChatMember(chatRoom.chatID, userId)

      // Remove user from search results
      setSearchResults((prev) => prev.filter((user) => user.id !== userId))

      // Update chat room members
      setChatRoom((prev) => ({
        ...prev,
        members: [...prev.members, userId],
      }))
    } catch (err) {
      console.error("Error adding member:", err)
      setError("Failed to add member. Please try again.")
    } finally {
      setAddingUser(null)
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
        <div className="p-4 flex items-center">
          <button onClick={() => router.back()} className="mr-2">
            <ArrowLeft className="h-5 w-5 text-[#5c4033]" />
          </button>
          <h1 className="font-semibold text-[#5c4033]">Add Members</h1>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-[#5c4033] text-center">
            <p>Chat room not found or you don't have access.</p>
            <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-[#c3b091] text-[#5c4033] rounded-lg">
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Only admin can add members
  if (!isAdmin) {
    router.push(`/chats/${params.id}/settings`)
    return null
  }

  return (
    <div className="min-h-screen bg-[#e8d5c4]">
      <div className="p-4 flex items-center">
        <button onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-5 w-5 text-[#5c4033]" />
        </button>
        <h1 className="font-semibold text-[#5c4033]">Add Members</h1>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 mx-4 mb-4 rounded-lg">{error}</div>}

      <div className="p-4">
        <div className="flex mb-4">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 rounded-l-full border-[#c3b091] bg-white text-[#5c4033]"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="rounded-r-full bg-[#c3b091] text-[#5c4033] hover:bg-[#b3a081]"
          >
            {isSearching ? "..." : <Search className="h-4 w-4" />}
          </Button>
        </div>

        <div className="bg-white rounded-lg p-4">
          <h2 className="text-[#5c4033] font-medium mb-4">Search Results</h2>

          {searchResults.length === 0 ? (
            <p className="text-[#5c4033] text-center py-4">
              {searchQuery.trim() ? "No users found" : "Search for users to add"}
            </p>
          ) : (
            <div className="space-y-4">
              {searchResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                      <Image
                        src={result.profilePic || "/placeholder.svg"}
                        alt={result.name}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                    <p className="text-[#5c4033]">{result.name}</p>
                  </div>
                  <Button
                    onClick={() => handleAddMember(result.id)}
                    disabled={addingUser === result.id}
                    className="rounded-full bg-[#c3b091] text-[#5c4033] hover:bg-[#b3a081] h-8 w-8 p-0"
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

