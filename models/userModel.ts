import { supabase } from "@/lib/supabase-client"

/**
 * Fetches a user's profile from the Users table
 * @param {string} userId - The user's UUID
 */
export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase.from("Users").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error fetching user profile:", error)
      throw error
    }

    return data
  } catch (err) {
    console.error("Failed to fetch user profile:", err)
    throw err
  }
}

/**
 * Creates a new user record in the Users table after signup
 * @param {string} id - The user's UUID from auth
 * @param {string} email - The user's email
 */
export async function createUserRecord(id, email) {
  try {
    // Set default values for new users
    const newUser = {
      id,
      email,
      name: email.split("@")[0], // Default name from email
      bio: "I'm new to PlanUpp!",
      hashtags: "", // Store as empty string initially
      phoneNumber: null,
      profilePic: "/placeholder.svg?height=80&width=80",
      tier: "New User",
      bans: 0,
      registeredEvents: [], // Empty array for jsonb
      createdEvents: [], // Empty array for jsonb
    }

    console.log("Attempting to create user with data:", JSON.stringify(newUser))

    const { data, error } = await supabase.from("Users").insert([newUser]).select()

    if (error) {
      console.error("Error creating user record:", error.message, error.details, error.hint)
      throw error
    }

    console.log("User record created successfully:", data)
    return data?.[0]
  } catch (err) {
    console.error("Failed to create user record:", err.message, err)
    throw err
  }
}

/**
 * Updates a user's profile in the Users table
 * @param {string} userId - The user's UUID
 * @param {Object} updates - Object containing fields to update
 */
export async function updateUserProfile(userId, updates) {
  try {
    // Remove any fields that shouldn't be updated
    const { id, email, ...updateData } = updates

    const { data, error } = await supabase.from("Users").update(updateData).eq("id", userId).select()

    if (error) {
      console.error("Error updating user profile:", error)
      throw error
    }

    return data?.[0]
  } catch (err) {
    console.error("Failed to update user profile:", err)
    throw err
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
 * Ban a user by incrementing their ban counter - simplified direct approach
 * @param {string} userId - The user ID to ban
 * @returns {Promise<Object>} - The updated user
 */
export async function banUser(userId) {
  try {
    console.log("DIRECT BAN: Starting ban process for user:", userId)

    // STEP 1: Get current user data to check current ban count
    console.log("DIRECT BAN: Fetching current user data")
    const { data: userData, error: userError } = await supabase.from("Users").select("*").eq("id", userId).single()

    if (userError) {
      console.error("DIRECT BAN: Error fetching user data:", userError)
      throw userError
    }

    console.log("DIRECT BAN: Current user data:", userData)
    const currentBans = userData.bans || 0
    const newBanCount = currentBans + 1

    console.log(`DIRECT BAN: Will update ban count from ${currentBans} to ${newBanCount}`)

    // STEP 2: Update the user's ban count
    console.log("DIRECT BAN: Updating user ban count")
    const { data: updateResult, error: updateError } = await supabase
      .from("Users")
      .update({ bans: newBanCount })
      .eq("id", userId)
      .select()

    if (updateError) {
      console.error("DIRECT BAN: Error updating user ban count:", updateError)
      throw updateError
    }

    console.log("DIRECT BAN: Ban count update result:", updateResult)

    // STEP 3: Verify the update was successful
    console.log("DIRECT BAN: Verifying ban count update")
    const { data: verifyData, error: verifyError } = await supabase
      .from("Users")
      .select("bans")
      .eq("id", userId)
      .single()

    if (verifyError) {
      console.error("DIRECT BAN: Error verifying ban count update:", verifyError)
    } else {
      console.log("DIRECT BAN: Verified ban count after update:", verifyData)

      if (verifyData.bans !== newBanCount) {
        console.error(`DIRECT BAN: Ban count verification failed! Expected ${newBanCount}, got ${verifyData.bans}`)
      } else {
        console.log("DIRECT BAN: Ban count verification successful!")
      }
    }

    return {
      user: verifyData || updateResult?.[0] || { id: userId, bans: newBanCount },
      isPermanentlyBanned: newBanCount >= 5,
      banCount: newBanCount,
    }
  } catch (err) {
    console.error("DIRECT BAN: Failed to ban user:", err)
    throw err
  }
}

