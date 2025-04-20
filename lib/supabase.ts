import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://otjsyjqsyxalfovufxtx.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90anN5anFzeXhhbGZvdnVmeHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0NTgwNTQsImV4cCI6MjA1ODAzNDA1NH0.HOHSSKMOyIaYqUbZWh2KPhK8Vrka4MHuF561TOWK6-s"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Helper function to get the current session
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.error("Error getting session:", error)
    return null
  }
  return data.session
}

// Helper function to get the current user
export const getUser = async () => {
  const session = await getSession()
  return session?.user || null
}

