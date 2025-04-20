import { supabase } from "@/lib/supabase"

/**
 * Get a user's profile
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - The user profile
 */
export async function getUserProfile(userId: string) {
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
 * Create a new user record after signup
 * @param {string} id - The user's UUID
 * @param {string} email - The user's email
 * @returns {Promise<Object>} - The created user
 */
export async function createUser(id: string, email: string) {
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
 * Update a user's profile
 * @param {string} userId - The user's ID
 * @param {Object} updates - The profile updates
 * @returns {Promise<Object>} - The updated user
 */
export async function updateProfile(userId: string, updates: any) {
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
 * Registers a new user in the Users table after signup
 * @param {Object} user - The user object from Supabase Auth
 * @returns {Promise<Object>} - The created user record
 */
export async function registerUserInDatabase(user: any) {
  try {
    if (!user || !user.id || !user.email) {
      console.error("Invalid user data for registration:", user)
      throw new Error("Invalid user data")
    }

    // First check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("Users")
      .select("id")
      .eq("id", user.id)
      .single()

    // If user already exists, return the existing user
    if (!checkError && existingUser) {
      console.log("User already exists in database:", existingUser.id)

      // Fetch the full user profile
      const { data: fullUser, error: fetchError } = await supabase.from("Users").select("*").eq("id", user.id).single()

      if (fetchError) {
        throw fetchError
      }

      return fullUser
    }

    // Prepare user data
    const userData = {
      id: user.id,
      email: user.email,
      name: user.email.split("@")[0], // Default name from email
      bio: "I'm new to PlanUpp!",
      hashtags: "",
      profilePic: "/placeholder.svg?height=80&width=80",
      tier: "New User",
      bans: 0,
      registeredEvents: [],
      createdEvents: [],
    }

    console.log("Registering user in database:", userData.email)

    // Insert the user into the Users table
    const { data, error } = await supabase.from("Users").insert([userData]).select()

    if (error) {
      console.error("Error registering user in database:", error)

      // If the error is a duplicate key violation, the user might already exist
      if (error.code === "23505") {
        console.log("User already exists in database (duplicate key), fetching profile instead")
        const { data: existingUser, error: fetchError } = await supabase
          .from("Users")
          .select("*")
          .eq("id", user.id)
          .single()

        if (fetchError) {
          throw fetchError
        }

        return existingUser
      }

      throw error
    }

    console.log("User registered successfully:", data)
    return data[0]
  } catch (err) {
    console.error("Failed to register user:", err)
    throw err
  }
}

/**
 * Update a user's tier based on event count
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - The updated user
 */
export async function updateUserTier(userId: string) {
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

