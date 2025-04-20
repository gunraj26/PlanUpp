import { supabase } from "@/lib/supabase-client"

/**
 * Get all chat rooms for the current user
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
 * Get a specific chat room by ID
 * @param {string} chatId - The chat room ID
 * @returns {Promise<Object>} - The chat room data
 */
export async function getChatRoomById(chatId) {
  try {
    const { data, error } = await supabase.from("Chats").select("*").eq("chatID", chatId).single()

    if (error) throw error
    return data
  } catch (err) {
    console.error(`Failed to fetch chat room ${chatId}:`, err)
    throw err
  }
}

/**
 * Get all messages for a specific chat room
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
 * @param {string} userId - The sender's user ID
 * @param {string} text - The message text
 * @returns {Promise<Object>} - The created message
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
export async function updateChatLastActive(chatId, userId) {
  try {
    if (!userId) return

    // Check if user is admin of the chat
    const { data: chatRoom } = await supabase.from("Chats").select("members").eq("chatID", chatId).single()

    // Only the admin (first member) can update the chat
    if (chatRoom?.members && chatRoom.members[0] === userId) {
      await supabase.from("Chats").update({ lastActive: new Date().toISOString() }).eq("chatID", chatId)
    }
  } catch (err) {
    console.error(`Failed to update lastActive for chat ${chatId}:`, err)
  }
}

/**
 * Create a new chat room
 * @param {Object} chatData - The chat room data
 * @param {string} userId - The creator's user ID
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
 * Creates a chat room for an event
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

/**
 * Update a chat room's settings
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
 * @param {string} userId - The user ID to add
 * @param {string} adminId - The admin's user ID
 * @returns {Promise<Object>} - The updated chat room
 */
export async function addChatMember(chatId, userId, adminId) {
  try {
    if (!adminId) throw new Error("Admin ID is required")

    // Get current members
    const { data: chatRoom } = await supabase.from("Chats").select("members, Events(*)").eq("chatID", chatId).single()

    if (!chatRoom?.members) throw new Error("Chat room not found")

    // Check if user is admin
    if (chatRoom.members[0] !== adminId) {
      throw new Error("Only the chat admin can add members")
    }

    // Add the new member if not already in the list
    if (!chatRoom.members.includes(userId)) {
      const updatedMembers = [...chatRoom.members, userId]

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
 * @param {string} userId - The user ID to remove
 * @param {string} adminId - The admin's user ID
 * @returns {Promise<Object>} - The updated chat room
 */
export async function removeChatMember(chatId, userId, adminId) {
  try {
    if (!adminId) throw new Error("Admin ID is required")

    // Get current members and associated event
    const { data: chatRoom } = await supabase.from("Chats").select("members, Events(*)").eq("chatID", chatId).single()

    if (!chatRoom?.members) throw new Error("Chat room not found")

    // Check if user is admin
    if (chatRoom.members[0] !== adminId) {
      throw new Error("Only the chat admin can remove members")
    }

    // Cannot remove the admin (first member)
    if (userId === chatRoom.members[0]) {
      throw new Error("Cannot remove the chat admin")
    }

    // Remove the member
    const updatedMembers = chatRoom.members.filter((id) => id !== userId)

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

    console.log(`Member ${userId} removed from chat ${chatId}. New member count: ${updatedMembers.length}`)
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
    if (!userId) throw new Error("User ID is required")

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
 * @param {Array} memberIds - Array of user IDs
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

