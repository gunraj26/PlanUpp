import * as EventModel from "@/models/eventModel"
import * as UserModel from "@/models/userModel"
import * as ChatModel from "@/models/chatModel"
import { supabase } from "@/lib/supabase-client"

/**
 * Create a new event and associated chat room
 * @param {Object} eventData - The event data
 * @param {string} userId - The creator's ID
 * @returns {Promise<Object>} - The created event with chat room
 */
export async function createEvent(eventData, userId) {
  try {
    // Create the event
    const createdEvent = await EventModel.createEvent(eventData, userId)

    // Update the user's createdEvents array
    if (createdEvent && createdEvent.eventId) {
      await EventModel.updateUserCreatedEvents(userId, createdEvent.eventId)

      // Create a chat room for this event
      try {
        console.log("Creating chat room for event:", createdEvent.eventId)
        const chatRoom = await ChatModel.createEventChatForCreator(createdEvent, userId)
        console.log("Chat room created:", chatRoom)

        // Verify the chat was created
        if (chatRoom) {
          return {
            ...createdEvent,
            chatRoom,
          }
        }
      } catch (chatError) {
        console.error("Error creating chat room:", chatError)
        // Don't throw, we still want to return the event
      }

      // Update the user's tier based on event count
      try {
        await UserModel.updateUserTier(userId)
      } catch (tierError) {
        console.error("Error updating user tier:", tierError)
        // Don't throw, we still want to return the event
      }
    }

    return createdEvent
  } catch (error) {
    console.error("Error in createEvent controller:", error)
    throw error
  }
}

/**
 * Approve an event
 * @param {string} eventId - The event ID
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - The approved event
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
 * Get all events
 * @returns {Promise<Array>} - Array of events
 */
export async function getAllEvents() {
  return await EventModel.getAllEvents()
}

/**
 * Get events created by a user
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} - Array of events
 */
export async function getUserEvents(userId) {
  return await EventModel.getUserEvents(userId)
}

/**
 * Get events with chat room member counts
 * @returns {Promise<Array>} - Array of events with member counts
 */
export async function getEventsWithMemberCounts() {
  try {
    // Fetch all events
    const events = await EventModel.getAllEvents()

    // Fetch all chat rooms to get member counts
    const { data: chatRooms } = await supabase.from("Chats").select("eventID, members")

    // Create a map of eventID to member count
    const eventMemberCounts = {}
    if (chatRooms) {
      chatRooms.forEach((chat) => {
        if (chat.eventID && Array.isArray(chat.members)) {
          eventMemberCounts[chat.eventID] = chat.members.length
        }
      })
    }

    // Add member count to each event and filter out full events
    const eventsWithMemberCounts = events
      .map((event) => {
        const eventId = event.eventId || event.eventid
        const memberCount = eventMemberCounts[eventId] || 1
        return {
          ...event,
          memberCount,
        }
      })
      .filter((event) => {
        const totalParticipants = event.total_participants || 0
        return event.memberCount < totalParticipants
      })

    return eventsWithMemberCounts
  } catch (error) {
    console.error("Error in getEventsWithMemberCounts:", error)
    throw error
  }
}

/**
 * Updates a user's tier based on the number of events they've created
 * @param {string} userId - The user's UUID
 * @returns {Promise<Object>} - The updated user profile
 */
export async function updateUserTier(userId) {
  try {
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

    // Calculate the number of created events
    let eventCount = 0
    if (userData && userData.createdEvents) {
      if (Array.isArray(userData.createdEvents)) {
        eventCount = userData.createdEvents.length
      } else if (typeof userData.createdEvents === "string") {
        try {
          const parsedEvents = JSON.parse(userData.createdEvents)
          eventCount = Array.isArray(parsedEvents) ? parsedEvents.length : 0
        } catch (e) {
          console.error("Error parsing createdEvents string:", e)
        }
      }
    }

    // Determine the tier based on event count
    let tier = "New User"
    if (eventCount >= 30) {
      tier = "Gold"
    } else if (eventCount >= 20) {
      tier = "Silver"
    } else if (eventCount >= 10) {
      tier = "Bronze"
    }

    // Update the user's tier in the database
    const { data, error } = await supabase.from("Users").update({ tier }).eq("id", userId).select()

    if (error) {
      console.error("Error updating user tier:", error)
      throw error
    }

    console.log(`User tier updated to ${tier} based on ${eventCount} created events`)
    return data?.[0]
  } catch (err) {
    console.error("Failed to update user tier:", err)
    throw err
  }
}

/**
 * Creates a chat room for an event creator
 * @param {Object} eventData - The event data
 * @param {string} userId - The creator's user ID
 * @returns {Promise<Object>} - The created chat room
 */
export async function createEventChatForCreator(eventData, userId) {
  try {
    if (!eventData || !eventData.eventId || !userId) {
      throw new Error("Invalid event data or user ID")
    }

    console.log("Creating chat room for event:", eventData.eventId, "creator:", userId)

    // First check if a chat already exists for this event
    const { data: existingChat, error: checkError } = await supabase
      .from("Chats")
      .select("*")
      .eq("eventID", eventData.eventId)
      .single()

    if (!checkError && existingChat) {
      console.log("Chat already exists for event:", eventData.eventId)
      return existingChat
    }

    // Create a shareable link that works in both client and server contexts
    let shareableLink = `/chats/join/${Date.now()}`
    // Add origin if in browser context
    if (typeof window !== "undefined") {
      shareableLink = `${window.location.origin}${shareableLink}`
    }

    // Create a new chat room for this event
    const newChat = {
      chatRoomName: `${eventData.sport} Chat`,
      chatRoomImage: eventData.screenshot || "/placeholder.svg?height=80&width=80",
      shareableLink: shareableLink,
      listEvent: true,
      eventID: eventData.eventId, // Match the exact case from the database schema
      status: "ACTIVE",
      lastActive: new Date().toISOString(),
      members: [userId], // Add the creator as the first member (admin)
      messageIDs: [],
      // Removed chatLimit, publicAccess, and friends fields as they don't exist in the schema
    }

    console.log("Inserting new chat room with data:", JSON.stringify(newChat))

    const { data, error } = await supabase.from("Chats").insert([newChat]).select()

    if (error) {
      console.error("Error creating chat room:", error)
      throw error
    }

    console.log("Chat room created successfully:", data)
    return data?.[0]
  } catch (err) {
    console.error("Failed to create event chat:", err)
    throw err
  }
}

