import { supabase } from "./supabase"
import { createDatabaseFunctions as createAllFunctions } from "./translate_functions"

/**
 * Create the necessary database functions for transaction handling
 * This should be run once during setup
 */
export async function createDatabaseFunctions() {
  return createAllFunctions(supabase)
}

/**
 * Ban a user by incrementing their ban counter
 * Permanently bans at threshold of 5
 * @param {string} userId - The user ID to ban
 * @returns {Promise<boolean>} - Success status
 */
export async function banUser(userId) {
  try {
    const { data, error } = await supabase.rpc("increment_user_ban_count", { user_id: userId })

    if (error) throw error
    return true
  } catch (err) {
    console.error("Error banning user:", err)
    throw err
  }
}

