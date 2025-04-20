"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import ProfileEvent from "@/app/profile/components/profile-event"

export default function UserProfilePage({ params }) {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState(null)
  const [createdEvents, setCreatedEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchUserProfile() {
      if (!params.id) return

      try {
        setLoading(true)

        // Fetch user profile
        const { data: userData, error: userError } = await supabase
          .from("Users")
          .select("*")
          .eq("id", params.id)
          .single()

        if (userError) {
          console.error("Error fetching user profile:", userError)
          setError("Failed to load user profile")
          setLoading(false)
          return
        }

        setUserProfile(userData)

        // Fetch events created by the user
        const { data: eventsData, error: eventsError } = await supabase
          .from("Events")
          .select("*")
          .eq("eventCreatorId", params.id)
          .order("dateOfCreation", { ascending: false })

        if (eventsError) {
          console.error("Error fetching user events:", eventsError)
        } else {
          setCreatedEvents(eventsData || [])
        }
      } catch (err) {
        console.error("Error fetching user data:", err)
        setError("Failed to load user data")
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [params.id])

  // Get days ago from dateOfCreation
  const getDaysAgo = (dateString) => {
    const eventDate = new Date(dateString)
    const today = new Date()
    const diffTime = Math.abs(today - eventDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return `${diffDays} days ago`
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5efe6]">
        <div className="animate-pulse text-[#5c4033]">Loading profile...</div>
      </div>
    )
  }

  if (error || !userProfile) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f5efe6]">
        <div className="p-4 flex items-center">
          <button onClick={() => router.back()} className="mr-2">
            <ArrowLeft className="h-6 w-6 text-[#5c4033]" />
          </button>
          <h1 className="text-xl font-semibold text-[#5c4033]">User Profile</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-[#5c4033]">
            <p>{error || "User not found"}</p>
            <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-[#c3b091] text-[#5c4033] rounded-lg">
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  const hashtags = getHashtags()

  return (
    <div className="bg-[#f5efe6] min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-[#e8d5c4]">
        <button onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-6 w-6 text-[#5c4033]" />
        </button>
        <h1 className="text-xl font-semibold text-[#5c4033]">User Profile</h1>
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

      {/* User Stats */}
      <div className="mx-4 mb-6 flex justify-between items-center">
        <div className="text-[#5c4033] font-medium bg-[#e8d5c4] py-1.5 px-4 rounded-full shadow-sm">
          Bans: {userProfile.bans || 0}
        </div>
      </div>

      {/* Created Events */}
      <div className="mx-4 mb-4">
        <h3 className="text-[#5c4033] font-semibold mb-3 uppercase text-sm tracking-wide">Created</h3>
      </div>

      {/* Event List */}
      <div className="mx-4 pb-20">
        {loading && (
          <div className="flex justify-center items-center h-40">
            <p className="text-[#5c4033]">Loading events...</p>
          </div>
        )}

        {!loading && (!createdEvents || createdEvents.length === 0) && (
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
            No Events Created
          </div>
        )}

        {!loading && createdEvents && createdEvents.length > 0 && (
          <div className="space-y-3">
            {createdEvents.map((event) => (
              <ProfileEvent key={event.eventid} event={event} daysAgo={getDaysAgo(event.dateOfCreation)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

