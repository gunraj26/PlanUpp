import { supabase } from "@/lib/supabase-client"

/**
 * Creates a new event in the Events table
 * @param {Object} eventData - The event data
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<Object>} - The created event
 */
export async function createEvent(eventData, userId) {
  try {
    if (!userId) {
      throw new Error("User must be authenticated to create an event")
    }

    // Get current date and time
    const now = new Date()
    const currentDate = now.toISOString().split("T")[0]
    const currentTime = now.toTimeString().split(" ")[0]

    // Prepare event data with default values - DO NOT include eventid as it's auto-generated
    const newEvent = {
      sport: eventData.sport,
      location: eventData.location || eventData.facility?.name,
      eventDate: eventData.date, // Match the field names from formData
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      description: eventData.description,
      screenshot: eventData.screenshot || "/placeholder.svg?height=200&width=200",
      eventCreatorId: userId,
      dateOfCreation: currentDate,
      timeOfCreation: currentTime,
      // Set status to admitted directly
      status: "admitted", // Always create as admitted/verified
      total_participants: eventData.totalParticipants || 0,
      public_participants: 1, // Default to 1 for the admin
      capacity: 0, // Always set capacity to 0
    }

    console.log("Creating event with data:", newEvent)

    // Insert the event into the database
    const { data, error } = await supabase.from("Events").insert([newEvent]).select()

    if (error) {
      console.error("Error creating event:", error)
      throw error
    }

    console.log("Event created successfully:", data)
    return data[0]
  } catch (err) {
    console.error("Failed to create event:", err)
    throw err
  }
}

/**
 * Updates an event's status to "admitted"
 * @param {string} eventId - The event ID (optional)
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<Object>} - The updated event
 */
export async function approveEvent(eventId, userId) {
  try {
    // If we have a specific eventId, use that
    if (eventId) {
      const { data, error } = await supabase
        .from("Events")
        .update({ status: "admitted" })
        .eq("eventId", eventId)
        .select()

      if (error) {
        console.error("Error approving specific event:", error)
        throw error
      }

      return data?.[0]
    }

    // Otherwise, get the most recent event by this user first
    const { data: recentEvents, error: fetchError } = await supabase
      .from("Events")
      .select("eventId")
      .eq("eventCreatorId", userId)
      .eq("status", "pending")
      .order("dateOfCreation", { ascending: false })
      .limit(1)

    if (fetchError) {
      console.error("Error fetching recent event:", fetchError)
      throw fetchError
    }

    if (!recentEvents || recentEvents.length === 0) {
      console.log("No pending events found to approve")
      return null
    }

    const recentEventId = recentEvents[0].eventId

    // Now update just this one event
    const { data, error } = await supabase
      .from("Events")
      .update({ status: "admitted" })
      .eq("eventId", recentEventId)
      .select()

    if (error) {
      console.error("Error approving event:", error)
      throw error
    }

    console.log("Event approved successfully:", data)
    return data?.[0]
  } catch (err) {
    console.error("Failed to approve event:", err)
    throw err
  }
}

/**
 * Gets all events
 * @returns {Promise<Array>} - Array of events
 */
export async function getAllEvents() {
  try {
    const { data, error } = await supabase.from("Events").select("*").order("dateOfCreation", { ascending: false })

    if (error) {
      throw error
    }

    return data
  } catch (err) {
    console.error("Failed to fetch events:", err)
    throw err
  }
}

/**
 * Gets events created by a specific user
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} - Array of events
 */
export async function getUserEvents(userId) {
  try {
    const { data, error } = await supabase
      .from("Events")
      .select("*")
      .eq("eventCreatorId", userId)
      .order("dateOfCreation", { ascending: false })

    if (error) {
      throw error
    }

    return data
  } catch (err) {
    console.error("Failed to fetch user events:", err)
    throw err
  }
}

/**
 * Update the user's createdEvents array with a new event ID
 * @param {string} userId - The user ID
 * @param {string|number} eventId - The event ID to add
 * @returns {Promise<Object>} - The updated user data
 */
export async function updateUserCreatedEvents(userId, eventId) {
  try {
    console.log(`Updating user ${userId} with event ${eventId}`)

    // First get the current user data
    const { data: userData, error: fetchError } = await supabase
      .from("Users")
      .select("createdEvents")
      .eq("id", userId)
      .single()

    if (fetchError) {
      console.error("Error fetching user data:", fetchError)
      throw fetchError
    }

    console.log("Current user data:", userData)

    // Initialize createdEvents array
    let createdEvents = []

    // If user has existing createdEvents, use it
    if (userData && userData.createdEvents) {
      if (Array.isArray(userData.createdEvents)) {
        createdEvents = [...userData.createdEvents]
      } else if (typeof userData.createdEvents === "string") {
        try {
          createdEvents = JSON.parse(userData.createdEvents)
        } catch (e) {
          console.error("Error parsing createdEvents string:", e)
          createdEvents = []
        }
      }
    }

    console.log("Current createdEvents before update:", createdEvents)

    // Convert eventId to number if it's a string
    const eventIdNum = typeof eventId === "string" ? Number.parseInt(eventId, 10) : eventId

    // Add the new event ID if it's not already in the array
    if (!createdEvents.includes(eventIdNum)) {
      createdEvents.push(eventIdNum)
    }

    console.log("Updated createdEvents array:", createdEvents)

    // Update the user record with the new createdEvents array
    const { data, error } = await supabase
      .from("Users")
      .update({ createdEvents: createdEvents })
      .eq("id", userId)
      .select()

    if (error) {
      console.error("Error updating user's createdEvents:", error)
      throw error
    }

    console.log("User updated successfully:", data)
    return data
  } catch (err) {
    console.error("Failed to update user's createdEvents:", err)
    console.error("Error details:", err.message, err.stack)
  }
}

