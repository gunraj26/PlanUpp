"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
// Import the admin ID constant
const ADMIN_ID = "366ffd3c-0a25-4767-8802-70a5285d9226"

// Define types for the context
type User = {
  id: string
  email?: string
  [key: string]: any
}

type UserProfile = {
  id: string
  name?: string
  bio?: string
  hashtags?: string | string[]
  profilePic?: string
  tier?: string
  bans?: number
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<UserProfile | null>
}

interface AuthProviderProps {
  children: ReactNode
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType | null>(null)

// Custom hook to use the auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const router = useRouter()

  // Function to fetch user profile from the database
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase.from("Users").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error fetching user profile:", error)
        return null
      }

      return data as UserProfile
    } catch (error) {
      console.error("Error in fetchUserProfile:", error)
      return null
    }
  }

  // Function to sign out
  const signOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setUserProfile(null)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  // Effect to handle auth state changes
  useEffect(() => {
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id)

      if (session?.user) {
        setUser(session.user as User)
        const profile = await fetchUserProfile(session.user.id)
        setUserProfile(profile)

        // If we're on the login page and the user is admin, redirect to admin page
        if (session.user.id === ADMIN_ID && window.location.pathname === "/login") {
          router.push("/admin")
        }
      } else {
        setUser(null)
        setUserProfile(null)
      }

      setLoading(false)
    })

    // Initial session check
    const initializeAuth = async (): Promise<void> => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          setUser(session.user as User)
          const profile = await fetchUserProfile(session.user.id)
          setUserProfile(profile)
        }
      } catch (error) {
        console.error("Error checking initial session:", error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Clean up the listener
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe()
      }
    }
  }, [router])

  // Auth context value
  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signOut,
    refreshProfile: async () => {
      if (user?.id) {
        const profile = await fetchUserProfile(user.id)
        setUserProfile(profile)
        return profile
      }
      return null
    },
  }

  // Provide the auth context to children
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

