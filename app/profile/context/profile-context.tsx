"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  // Initialize with user data and populated events
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Try to load from localStorage first
    const savedUser = localStorage.getItem("userProfile")

    if (savedUser) {
      try {
        // Parse saved user data
        const parsedUser = JSON.parse(savedUser)

        // Fetch events from database to populate user data
        const fetchEvents = async () => {
          try {
            // Fetch all events
            const { data: allEvents, error } = await supabase
              .from("Events")
              .select("*")
              .order("dateOfCreation", { ascending: false })

            if (error) {
              console.error("Error fetching events:", error)
              return
            }

            // Convert event IDs to full event objects if they're not already
            const populatedUser = {
              ...parsedUser,
              // Convert registered events IDs to full event objects
              registeredEvents:
                Array.isArray(parsedUser.registeredEvents[0]) || typeof parsedUser.registeredEvents[0] === "object"
                  ? parsedUser.registeredEvents
                  : parsedUser.registeredEvents.map((id) => allEvents.find((e) => e.eventId === id)).filter(Boolean),

              // Convert created events IDs to full event objects
              createdEvents:
                Array.isArray(parsedUser.createdEvents[0]) || typeof parsedUser.createdEvents[0] === "object"
                  ? parsedUser.createdEvents
                  : parsedUser.createdEvents.map((id) => allEvents.find((e) => e.eventId === id)).filter(Boolean),
            }

            setUser(populatedUser)
          } catch (err) {
            console.error("Error fetching events:", err)
          }
        }

        fetchEvents()
      } catch (error) {
        console.error("Error parsing saved user:", error)
        // Fall back to fetching user data from database
        fetchUserFromDatabase()
      }
    } else {
      // No saved user, fetch from database
      fetchUserFromDatabase()
    }

    setIsLoading(false)
  }, [])

  // Function to fetch user and events from database
  const fetchUserFromDatabase = async () => {
    try {
      // Get current authenticated user
      const { data: authData } = await supabase.auth.getUser()
      if (!authData?.user?.id) {
        console.error("No authenticated user found")
        return
      }

      // Fetch user profile
      const { data: userData, error: userError } = await supabase
        .from("Users")
        .select("*")
        .eq("id", authData.user.id)
        .single()

      if (userError) {
        console.error("Error fetching user profile:", userError)
        return
      }

      // Fetch events created by user
      const { data: createdEvents, error: createdError } = await supabase
        .from("Events")
        .select("*")
        .eq("eventCreatorId", authData.user.id)
        .order("dateOfCreation", { ascending: false })

      if (createdError) {
        console.error("Error fetching created events:", createdError)
      }

      // Fetch events user has registered for
      // This would require a join or a different query based on your database structure
      // For now, we'll use an empty array
      const registeredEvents = []

      // Populate user with events
      const populatedUser = {
        ...userData,
        createdEvents: createdEvents || [],
        registeredEvents: registeredEvents,
      }

      setUser(populatedUser)
    } catch (err) {
      console.error("Error fetching user data:", err)
    }
  }

  // Save to localStorage whenever user changes
  useEffect(() => {
    if (user && !isLoading) {
      // Convert event objects back to IDs for storage
      const storageUser = {
        ...user,
        registeredEvents: user.registeredEvents.map((event) => event.eventId),
        createdEvents: user.createdEvents.map((event) => event.eventId),
      }

      localStorage.setItem("userProfile", JSON.stringify(storageUser))
    }
  }, [user, isLoading])

  const updateProfile = (updatedData) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedData }
      return updated
    })
  }

  const addHashtag = (hashtag) => {
    if (!hashtag.startsWith("#")) {
      hashtag = `#${hashtag}`
    }

    setUser((prev) => ({
      ...prev,
      hashtags: [...prev.hashtags, hashtag],
    }))
  }

  const removeHashtag = (index) => {
    setUser((prev) => ({
      ...prev,
      hashtags: prev.hashtags.filter((_, i) => i !== index),
    }))
  }

  return (
    <ProfileContext.Provider
      value={{
        user,
        updateProfile,
        addHashtag,
        removeHashtag,
        isLoading,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return context
}

