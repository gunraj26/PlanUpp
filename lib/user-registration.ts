import { supabase } from "./supabase"

/**
 * Registers a new user in the Users table after signup
 * @param {Object} user - The user object from Supabase Auth
 * @returns {Promise<Object>} - The created user record
 */
export async function registerUserInDatabase(user) {
  try {
    if (!user || !user.id || !user.email) {
      console.error("Invalid user data for registration:", user)
      throw new Error("Invalid user data")
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
    // Using service role to bypass RLS for this operation
    const { data, error } = await supabase.from("Users").insert([userData]).select()

    if (error) {
      console.error("Error registering user in database:", error)

      // If the error is a duplicate key violation, the user might already exist
      if (error.code === "23505") {
        console.log("User already exists in database, fetching profile instead")
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

