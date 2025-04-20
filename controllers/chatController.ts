import { supabase } from "@/lib/supabase-client"

/**
 * Get all chat rooms for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} - Array of chat rooms
 */
export async function getUserChatRooms(userId) {
  try {
    if (!userId) throw new Error("User ID is required")

    const { data, error } = await supabase
      .from("Chats")
      .select("*")
      .contains("members", [userId]) // ✅ Filter to chats the user is in
      .order("lastActive", { ascending: false })

    if (error) throw error
    return data || []
  } catch (err) {
    console.error("Failed to fetch user chat rooms:", err)
    throw err
  }
}

/**
 * Get a chat room by ID
 * @param {string} chatId - The chat room ID
 * @returns {Promise<Object>} - The chat room
 */
export async function getChatRoomById(chatId) {
  try {
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
      .eq("chatID", chatId)
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.error(`Failed to fetch chat room ${chatId}:`, err)
    throw err
  }
}

/**
 * Get all messages for a chat room
 * @param {string} chatId - The chat room ID
 * @returns {Promise<Array>} - Array of messages
 */
export async function getChatMessages(chatId) {
  try {
    const { data, error } = await supabase
      .from("Messages")
      .select("*")
      .eq("chatID", chatId)
      .order("timestamp", { ascending: true })

    if (error) throw error
    return data || []
  } catch (err) {
    console.error(`Failed to fetch messages for chat ${chatId}:`, err)
    throw err
  }
}

/**
 * Send a message to a chat room
 * @param {string} chatId - The chat room ID
 * @param {string} userId - The sender's ID
 * @param {string} text - The message text
 * @returns {Promise<Object>} - The sent message
 */
export async function sendMessage(chatId, userId, text) {
  try {
    if (!userId) throw new Error("User ID is required")

    const { data, error } = await supabase
      .from("Messages")
      .insert([
        {
          chatID: chatId,
          senderID: userId,
          text: text,
          timestamp: new Date().toISOString(),
        },
      ])
      .select()

    if (error) throw error

    // Update the lastActive timestamp
    await updateChatLastActive(chatId)

    return data?.[0]
  } catch (err) {
    console.error("Failed to send message:", err)
    throw err
  }
}

/**
 * Update the lastActive timestamp for a chat room
 * @param {string} chatId - The chat room ID
 * @param {string} userId - The user's ID
 */
export async function updateChatLastActive(chatId) {
  try {
    const timestamp = new Date().toISOString()
    const { data, error } = await supabase
      .from("Chats")
      .update({ lastActive: timestamp })
      .eq("chatID", chatId)
      .select()

    if (error) {
      console.error("Supabase error updating lastActive:", error)
    } else {
      console.log("✅ lastActive updated:", data)
    }
  } catch (err) {
    console.error(`❌ JS error updating lastActive for chat ${chatId}:`, err)
  }
}


/**
 * Create a chat room
 * @param {Object} chatData - The chat room data
 * @param {string} userId - The creator's ID
 * @returns {Promise<Object>} - The created chat room
 */
export async function createChatRoom(chatData, userId) {
  try {
    if (!userId) throw new Error("User ID is required")

    // Ensure the current user is the first member (admin)
    const members = [userId, ...(chatData.members || [])]

    const newChat = {
      chatRoomName: chatData.chatRoomName,
      chatRoomImage: chatData.chatRoomImage || "/placeholder.svg?height=80&width=80",
      shareableLink:
        chatData.shareableLink ||
        `${typeof window !== "undefined" ? window.location.origin : ""}/chats/join/${Date.now()}`,
      listEvent: chatData.listEvent !== undefined ? chatData.listEvent : true,
      eventID: chatData.eventID,
      status: "ACTIVE",
      lastActive: new Date().toISOString(),
      members: members,
      messageIDs: [],
    }

    const { data, error } = await supabase.from("Chats").insert([newChat]).select()

    if (error) throw error
    return data?.[0]
  } catch (err) {
    console.error("Failed to create chat room:", err)
    throw err
  }
}

/**
 * Update a chat room
 * @param {string} chatId - The chat room ID
 * @param {Object} updates - The updates to apply
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - The updated chat room
 */
export async function updateChatRoom(chatId, updates, userId) {
  try {
    if (!userId) throw new Error("User ID is required")

    // Check if user is admin of the chat
    const { data: chatRoom } = await supabase.from("Chats").select("members").eq("chatID", chatId).single()

    // Only the admin (first member) can update the chat
    if (!chatRoom?.members || chatRoom.members[0] !== userId) {
      throw new Error("Only the chat admin can update settings")
    }

    const { data, error } = await supabase.from("Chats").update(updates).eq("chatID", chatId).select()

    if (error) throw error
    return data?.[0]
  } catch (err) {
    console.error(`Failed to update chat room ${chatId}:`, err)
    throw err
  }
}

/**
 * Add a member to a chat room
 * @param {string} chatId - The chat room ID
 * @param {string} memberId - The member's ID to add
 * @param {string} adminId - The admin's ID
 * @returns {Promise<Object>} - The updated chat room
 */
export async function addChatMember(chatId, memberId) {
  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user?.user?.id) throw new Error("User not authenticated")

    // Get current members
    const { data: chatRoom } = await supabase.from("Chats").select("members, Events(*)").eq("chatID", chatId).single()

    if (!chatRoom?.members) throw new Error("Chat room not found")

    // Check if user is admin
    if (chatRoom.members[0] !== user.user.id) {
      throw new Error("Only the chat admin can add members")
    }

    // Add the new member if not already in the list
    if (!chatRoom.members.includes(memberId)) {
      const updatedMembers = [...chatRoom.members, memberId]

      // Update the chat room with new members
      const { data, error } = await supabase
        .from("Chats")
        .update({ members: updatedMembers })
        .eq("chatID", chatId)
        .select()

      if (error) throw error

      // If this chat is associated with an event, update the event capacity
      if (chatRoom.Events && chatRoom.Events.eventid) {
        await supabase.from("Events").update({ capacity: updatedMembers.length }).eq("eventid", chatRoom.Events.eventid)
      }

      return data?.[0]
    }

    return chatRoom
  } catch (err) {
    console.error(`Failed to add member to chat ${chatId}:`, err)
    throw err
  }
}

/**
 * Remove a member from a chat room
 * @param {string} chatId - The chat room ID
 * @param {string} memberId - The member's ID to remove
 * @param {string} adminId - The admin's ID
 * @returns {Promise<Object>} - The updated chat room
 
export async function removeChatMember(chatId, memberId) {
  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user?.user?.id) throw new Error("User not authenticated")

    // Get current members and associated event
    const { data: chatRoom } = await supabase.from("Chats").select("members, Events(*)").eq("chatID", chatId).single()

    if (!chatRoom?.members) throw new Error("Chat room not found")

    // Check if user is admin
    if (chatRoom.members[0] !== user.user.id) {
      throw new Error("Only the chat admin can remove members")
    }

    // Cannot remove the admin (first member)
    if (memberId === chatRoom.members[0]) {
      throw new Error("Cannot remove the chat admin")
    }

    // Remove the member
    const updatedMembers = chatRoom.members.filter((id) => id !== memberId)

    // Update the chat room with new members
    const { data, error } = await supabase
      .from("Chats")
      .update({ members: updatedMembers })
      .eq("chatID", chatId)
      .select()

    if (error) throw error

    // If this chat is associated with an event, update the public_participants but not capacity
    if (chatRoom.Events && chatRoom.Events.eventid) {
      await supabase
        .from("Events")
        .update({ public_participants: updatedMembers.length })
        .eq("eventid", chatRoom.Events.eventid)
    }

    console.log(`Member ${memberId} removed from chat ${chatId}. New member count: ${updatedMembers.length}`)
    return data?.[0]
  } catch (err) {
    console.error(`Failed to remove member from chat ${chatId}:`, err)
    throw err
  }
}
*/

export async function removeChatMember(chatId, userId) {
  try {
    // Get current members
    const { data: chatRoom } = await supabase.from("Chats").select("members").eq("chatID", chatId).single()

    if (!chatRoom?.members) throw new Error("Chat room not found")

    // Remove the member
    const updatedMembers = chatRoom.members.filter((id) => id !== userId)

    // Update the chat room with new members
    const { data, error } = await supabase
      .from("Chats")
      .update({ members: updatedMembers })
      .eq("chatID", chatId)
      .select()

    if (error) throw error
    return data?.[0]
  } catch (err) {
    console.error(`Failed to remove member from chat ${chatId}:`, err)
    throw err
  }
}
/**
 * Exit a chat room (remove yourself)
 * @param {string} chatId - The chat room ID
 * @param {string} userId - The user's ID
 * @returns {Promise<boolean>} - Success status
 */
export async function exitChatRoom(chatId, userId) {
  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user?.user?.id) throw new Error("User not authenticated")

    // Get current members and associated event
    const { data: chatRoom } = await supabase.from("Chats").select("members, Events(*)").eq("chatID", chatId).single()

    if (!chatRoom?.members) throw new Error("Chat room not found")

    // If user is admin (first member), they cannot exit
    if (chatRoom.members[0] === userId) {
      throw new Error("Chat admin cannot exit. Delete the chat room instead.")
    }

    // Check if user is actually a member
    if (!chatRoom.members.includes(userId)) {
      console.log("User is not a member of this chat, nothing to do")
      return true
    }

    // Remove the user from members
    const updatedMembers = chatRoom.members.filter((id) => id !== userId)

    // Try direct update without any JSON filtering
    const { error } = await supabase.from("Chats").update({ members: updatedMembers }).eq("chatID", chatId)

    if (error) {
      console.error("Error updating chat members:", error)

      // Try RPC approach as fallback
      try {
        const { error: rpcError } = await supabase.rpc("update_chat_members", {
          chat_id: chatId,
          new_members: updatedMembers,
        })

        if (rpcError) throw rpcError
      } catch (rpcErr) {
        console.error("RPC approach failed:", rpcErr)
        throw error // Throw the original error if RPC fails
      }
    }

    // If this chat is associated with an event, update the public_participants but not capacity
    if (chatRoom.Events && chatRoom.Events.eventid) {
      await supabase
        .from("Events")
        .update({ public_participants: updatedMembers.length })
        .eq("eventid", chatRoom.Events.eventid)
    }

    console.log(`User ${userId} exited chat ${chatId}. New member count: ${updatedMembers.length}`)
    return true
  } catch (err) {
    console.error(`Failed to exit chat ${chatId}:`, err)
    throw err
  }
}

/**
 * Get user profiles for chat members
 * @param {Array} memberIds - Array of member IDs
 * @returns {Promise<Array>} - Array of user profiles
 */
export async function getChatMemberProfiles(memberIds) {
  try {
    if (!memberIds || memberIds.length === 0) return []

    const { data, error } = await supabase.from("Users").select("id, name, profilePic").in("id", memberIds)

    if (error) throw error
    return data || []
  } catch (err) {
    console.error("Failed to fetch chat member profiles:", err)
    return []
  }
}

/**
 * Join a chat room
 * @param {string} chatId - The chat room ID
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - The updated chat room
 */
export async function joinChatRoom(chatId, userId) {
  try {
    if (!userId) throw new Error("User not authenticated")

    // Get current members and associated event
    const { data: chatRoom } = await supabase.from("Chats").select("members, Events(*)").eq("chatID", chatId).single()

    if (!chatRoom?.members) throw new Error("Chat room not found")

    // Check if user is already a member
    if (chatRoom.members.includes(userId)) {
      return chatRoom
    }

    // Add the user to members
    const updatedMembers = [...chatRoom.members, userId]

    // Update the chat room with new members
    const { data, error } = await supabase
      .from("Chats")
      .update({ members: updatedMembers })
      .eq("chatID", chatId)
      .select()

    if (error) throw error

    // If this chat is associated with an event, update the public_participants but not capacity
    if (chatRoom.Events && chatRoom.Events.eventid) {
      await supabase
        .from("Events")
        .update({ public_participants: updatedMembers.length })
        .eq("eventid", chatRoom.Events.eventid)
    }

    console.log(`User ${userId} joined chat ${chatId}. New member count: ${updatedMembers.length}`)
    return data?.[0]
  } catch (err) {
    console.error(`Failed to join chat ${chatId}:`, err)
    throw err
  }
}

/**
 * Creates a chat room for an event if one doesn't exist
 * @param {number|string} eventId - The event ID
 * @param {string} userId - The creator's user ID
 * @returns {Promise<Object>} - The created chat room
 */
export async function ensureEventChatExists(eventId, userId) {
  try {
    if (!eventId || !userId) {
      throw new Error("Invalid event ID or user ID")
    }

    // First check if a chat already exists for this event
    const { data: existingChats, error: checkError } = await supabase
      .from("Chats")
      .select("*")
      .eq("eventID", eventId)
      .single()

    if (!checkError && existingChats) {
      console.log("Chat already exists for event:", eventId)
      return existingChats
    }

    // Get the event details
    const { data: eventData, error: eventError } = await supabase
      .from("Events")
      .select("*")
      .eq("eventid", eventId)
      .single()

    if (eventError) {
      console.error("Error fetching event details:", eventError)
      throw eventError
    }

    if (!eventData) {
      throw new Error(`Event with ID ${eventId} not found`)
    }

    console.log("Creating chat room for existing event:", eventId)

    // Create a shareable link
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
      eventID: eventId,
      status: "ACTIVE",
      lastActive: new Date().toISOString(),
      members: [userId], // Add the creator as the first member (admin)
      messageIDs: [],
      chatLimit: eventData.total_participants || 10,
    }

    const { data, error } = await supabase.from("Chats").insert([newChat]).select()

    if (error) {
      console.error("Error creating chat room:", error)
      throw error
    }

    console.log("Chat room created successfully:", data)
    return data?.[0]
  } catch (err) {
    console.error("Failed to ensure event chat exists:", err)
    throw err
  }
}

/**
 * Updates a chat room's name
 * @param {string} chatId - The chat room ID
 * @param {string} newName - The new chat room name
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - The updated chat room
 */
export async function updateChatName(chatId, newName, userId) {
  try {
    if (!userId) throw new Error("User ID is required")

    // Check if user is admin of the chat
    const { data: chatRoom } = await supabase.from("Chats").select("members").eq("chatID", chatId).single()

    // Only the admin (first member) can update the chat name
    if (!chatRoom?.members || chatRoom.members[0] !== userId) {
      throw new Error("Only the chat admin can update the chat name")
    }

    const { data, error } = await supabase.from("Chats").update({ chatRoomName: newName }).eq("chatID", chatId).select()

    if (error) throw error
    return data?.[0]
  } catch (err) {
    console.error(`Failed to update chat name for chat ${chatId}:`, err)
    throw err
  }
}

