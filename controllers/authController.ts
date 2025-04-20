import { supabase } from "@/lib/supabase"

/**
 * Sign in with email and password
 * @param {string} email - The user's email
 * @param {string} password - The user's password
 * @returns {Promise<Object>} - The sign in result
 */
export async function signInWithPassword(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error signing in:", error)
    throw error
  }
}

/**
 * Sign up with email and password
 * @param {string} email - The user's email
 * @param {string} password - The user's password
 * @param {string} redirectTo - The redirect URL
 * @returns {Promise<Object>} - The sign up result
 */
export async function signUp(email: string, password: string, redirectTo: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
      },
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error signing up:", error)
    throw error
  }
}

/**
 * Resend verification email
 * @param {string} email - The user's email
 * @param {string} redirectTo - The redirect URL
 * @returns {Promise<Object>} - The result
 */
export async function resendVerificationEmail(email: string, redirectTo: string) {
  try {
    const { data, error } = await supabase.auth.resend({
      type: "signup",
      email: email,
      options: {
        emailRedirectTo: redirectTo,
      },
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error resending verification email:", error)
    throw error
  }
}

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

/**
 * Reset password
 * @param {string} email - The user's email
 * @param {string} redirectTo - The redirect URL
 * @returns {Promise<Object>} - The reset result
 */
export async function resetPassword(email: string, redirectTo: string) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error resetting password:", error)
    throw error
  }
}

/**
 * Get the current session
 * @returns {Promise<Object>} - The current session
 */
export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

