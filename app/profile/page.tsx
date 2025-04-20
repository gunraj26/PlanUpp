"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Share2, Edit, Camera } from "lucide-react"
import ProfileEvent from "./components/profile-event"
import { useAuth } from "@/context/auth-context"
import { supabase } from "@/lib/supabase"
import BottomNav from "../components/bottom-nav"
import { updateUserTier } from "@/controllers/userController"

export default function ProfilePage() {
  const router = useRouter()
  const { userProfile, loading, signOut, user, refreshProfile } = useAuth()
  const [activeTab, setActiveTab] = useState("created")
  const [createdEvents, setCreatedEvents] = useState([])
  const [attendedEvents, setAttendedEvents] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(true)

  useEffect(() => {
    async function fetchUserEvents() {
      if (user?.id) {
        try {
          setLoadingEvents(true)

          // Fetch events created by the user
          const { data: created, error: createdError } = await supabase
            .from("Events")
            .select("*")
            .eq("eventCreatorId", user.id)
            .order("dateOfCreation", { ascending: false })

          if (createdError) throw createdError
          setCreatedEvents(created || [])

          // Fetch ALL chats and filter on client side
          const { data: allChats, error: chatsError } = await supabase
            .from("Chats")
            .select(`
              *,
              Events:eventID (*)
            `)
            .not("eventID", "is", null)

          if (chatsError) throw chatsError

          // Filter chats to only include those where user is a member
          const userChats =
            allChats?.filter((chat) => Array.isArray(chat.members) && chat.members.includes(user.id)) || []

          // Extract events from chats and filter out nulls
          const attended = userChats.map((chat) => chat.Events).filter(Boolean) || []

          setAttendedEvents(attended)
        } catch (err) {
          console.error("Error fetching user events:", err)
        } finally {
          setLoadingEvents(false)
        }
      }
    }

    if (user) {
      fetchUserEvents()
    }
  }, [user])

  useEffect(() => {
    async function updateTierBasedOnEvents() {
      if (user?.id && createdEvents) {
        try {
          // Update the user's tier based on the number of created events
          await updateUserTier(user.id)
          // Refresh the profile to get the updated tier
          await refreshProfile()
        } catch (err) {
          console.error("Error updating user tier:", err)
        }
      }
    }

    if (user && createdEvents) {
      updateTierBasedOnEvents()
    }
  }, [user, createdEvents])

  // Get days ago from dateOfCreation
  const getDaysAgo = (dateString) => {
    const eventDate = new Date(dateString)
    const today = new Date()
    const diffTime = Math.abs(today - eventDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return `${diffDays} days ago`
  }

  const navigateToEditProfile = () => {
    router.push("/profile/edit")
  }

  // Parse hashtags from string or array
  const getHashtags = () => {
    if (!userProfile?.hashtags) return []

    if (typeof userProfile.hashtags === "string") {
      return userProfile.hashtags.split(",").filter((tag) => tag.trim())
    } else if (Array.isArray(userProfile.hashtags)) {
      return userProfile.hashtags
    }

    return []
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      // The router.push is handled inside the signOut function in auth-context
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (loading || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5efe6]">
        <div className="animate-pulse text-[#5c4033]">Loading profile...</div>
      </div>
    )
  }

  const hashtags = getHashtags()

  return (
    <div className="bg-[#f5efe6] min-h-screen pb-20">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-[#e8d5c4]">
        <h1 className="text-2xl font-bold text-[#5c4033]">Profile</h1>
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#e8d5c4] transition-colors">
          <Share2 className="h-5 w-5 text-[#5c4033]" />
        </button>
      </div>

      {/* Tier Badge */}
      <div className="mx-4 my-4">
        <div className="bg-[#c3b091] rounded-full py-2.5 px-5 flex justify-between items-center shadow-sm">
          <span className="text-[#5c4033] font-medium">Current Tier</span>
          <span
            className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              userProfile.tier === "Bronze"
                ? "bg-[#cd7f32] text-white"
                : userProfile.tier === "Silver"
                  ? "bg-[#c0c0c0] text-white"
                  : userProfile.tier === "Gold"
                    ? "bg-[#ffd700] text-[#5c4033]"
                    : "bg-white text-[#5c4033]"
            }`}
          >
            <Image src="/placeholder.svg?height=16&width=16" alt="tier icon" width={16} height={16} className="mr-1" />
            {userProfile.tier}
          </span>
        </div>
      </div>

      {/* Profile Info */}
      <div className="mx-4 mb-6 flex items-start">
        <div className="relative mr-4">
          <div className="bg-white rounded-full h-20 w-20 flex items-center justify-center overflow-hidden border-2 border-[#c3b091] shadow-sm">
            <Image
              src={userProfile.profilePic || "/placeholder.svg"}
              alt={userProfile.name}
              width={80}
              height={80}
              className="object-cover"
            />
          </div>
          <button className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 border border-[#c3b091] shadow-sm">
            <Camera className="h-4 w-4 text-[#5c4033]" />
          </button>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-[#5c4033] mb-1">{userProfile.name}</h2>
          <p className="text-[#5c4033] mb-2">{userProfile.bio}</p>
          <div className="flex flex-wrap gap-1">
            {hashtags.map((tag, index) => (
              <span key={index} className="text-[#3b82f6] text-sm font-medium">
                {tag}{" "}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Profile Button */}
      <div className="mx-4 mb-6 flex justify-between items-center">
        <button
          onClick={navigateToEditProfile}
          className="bg-[#c3b091] rounded-full py-1.5 px-5 text-sm font-medium text-[#5c4033] flex items-center shadow-sm hover:bg-[#b3a081] transition-colors"
        >
          Edit Profile
          <Edit className="h-3.5 w-3.5 ml-1.5" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSignOut}
            className="bg-[#c3b091] rounded-full py-1.5 px-5 text-sm font-medium text-[#5c4033] shadow-sm hover:bg-[#b3a081] transition-colors"
          >
            Sign Out
          </button>
          <div className="text-[#5c4033] font-medium bg-[#e8d5c4] py-1.5 px-4 rounded-full shadow-sm">
            Bans: {userProfile.bans || 0}
          </div>
        </div>
      </div>

      {/* Past Events Tabs */}
      <div className="mx-4 mb-4">
        <h3 className="text-[#5c4033] font-semibold mb-3 uppercase text-sm tracking-wide">Past Events</h3>
        <div className="flex gap-2 bg-[#e8d5c4] p-1 rounded-full shadow-sm">
          <button
            className={`rounded-full py-1.5 px-6 flex-1 transition-colors ${
              activeTab === "created"
                ? `bg-[#c3b091] text-[#5c4033] font-medium shadow-sm`
                : `bg-transparent text-[#5c4033] hover:bg-[#d8c5b4]`
            }`}
            onClick={() => setActiveTab("created")}
          >
            Created
          </button>
          <button
            className={`rounded-full py-1.5 px-6 flex-1 transition-colors ${
              activeTab === "attended"
                ? `bg-[#c3b091] text-[#5c4033] font-medium shadow-sm`
                : `bg-transparent text-[#5c4033] hover:bg-[#d8c5b4]`
            }`}
            onClick={() => setActiveTab("attended")}
          >
            Attended
          </button>
        </div>
      </div>

      {/* Event List */}
      <div className="mx-4 pb-20">
        {activeTab === "created" && loadingEvents && (
          <div className="flex justify-center items-center h-40">
            <p className="text-[#5c4033]">Loading events...</p>
          </div>
        )}

        {activeTab === "created" && !loadingEvents && (!createdEvents || createdEvents.length === 0) && (
          <div className="text-center py-12 text-[#5c4033] bg-white rounded-lg shadow-sm">
            <div className="mb-2 opacity-50">
              <Image
                src="/placeholder.svg?height=48&width=48"
                alt="No events"
                width={48}
                height={48}
                className="mx-auto"
              />
            </div>
            You haven't created any events yet.
          </div>
        )}

        {activeTab === "created" && !loadingEvents && createdEvents && createdEvents.length > 0 && (
          <div className="space-y-3">
            {createdEvents.map((event) => (
              <ProfileEvent key={event.eventid} event={event} daysAgo={getDaysAgo(event.dateOfCreation)} />
            ))}
          </div>
        )}

        {activeTab === "attended" && loadingEvents && (
          <div className="flex justify-center items-center h-40">
            <p className="text-[#5c4033]">Loading events...</p>
          </div>
        )}

        {activeTab === "attended" && !loadingEvents && (!attendedEvents || attendedEvents.length === 0) && (
          <div className="text-center py-12 text-[#5c4033] bg-white rounded-lg shadow-sm">
            <div className="mb-2 opacity-50">
              <Image
                src="/placeholder.svg?height=48&width=48"
                alt="No events"
                width={48}
                height={48}
                className="mx-auto"
              />
            </div>
            You haven't attended any events yet.
          </div>
        )}

        {activeTab === "attended" && !loadingEvents && attendedEvents && attendedEvents.length > 0 && (
          <div className="space-y-3">
            {attendedEvents.map((event, index) => (
              <ProfileEvent
                key={`${event.eventid}-${index}`}
                event={event}
                daysAgo={getDaysAgo(event.dateOfCreation)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

