import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { registerUserInDatabase } from "@/controllers/userController"

export async function GET(request: Request) {
  // Get the URL and extract the code/token and type
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const type = requestUrl.searchParams.get("type") || "signup"
  const next = requestUrl.searchParams.get("next") || "/events"

  console.log("Auth callback received:", { code: !!code, type })

  if (code) {
    try {
      // Exchange the code for a session
      const { data, error: resetError } = await supabase.auth.exchangeCodeForSession(code)

      if (resetError) {
        console.error("Error exchanging code for session:", resetError)
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(resetError.message)}`, requestUrl.origin),
        )
      }

      if (data?.session) {
        console.log("Session created successfully")

        // IMPORTANT: Always register the user in the database when they verify their email
        // This ensures the user is added to the Users table regardless of the type parameter
        if (data.user) {
          try {
            await registerUserInDatabase(data.user)
            console.log("User registered in database from callback")
          } catch (registerError) {
            console.error("Error registering user in database from callback:", registerError)
            // Continue with the flow even if there's an error registering in the database
          }
        }

        // For signup confirmations, redirect to events page
        if (type === "signup") {
          return NextResponse.redirect(new URL("/events", requestUrl.origin))
        }

        // For other types (like password reset), use the next parameter
        return NextResponse.redirect(new URL(next, requestUrl.origin))
      }
    } catch (err) {
      console.error("Error in auth callback:", err)
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent("Authentication failed")}`, requestUrl.origin),
      )
    }
  }

  // If no code or session creation failed, redirect to login
  return NextResponse.redirect(new URL("/login", requestUrl.origin))
}

