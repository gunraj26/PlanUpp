"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import EventCard from "../components/event-card"
import { searchEvents } from "./utils/search"
import { supabase } from "@/lib/supabase"
import BottomNav from "../components/bottom-nav"

export default function EventsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true)

        // Fetch all events
        const { data: eventsData, error: eventsError } = await supabase
          .from("Events")
          .select("*")
          .order("dateOfCreation", { ascending: false })

        if (eventsError) {
          throw eventsError
        }

        // Fetch all chat rooms to check member counts
        const { data: chatRoomsData, error: chatRoomsError } = await supabase.from("Chats").select("eventID, members")

        if (chatRoomsError) {
          throw chatRoomsError
        }

        // Create a map of eventID to member count for quick lookup
        const eventMemberCounts = {}
        chatRoomsData.forEach((chat) => {
          if (chat.eventID && Array.isArray(chat.members)) {
            eventMemberCounts[chat.eventID] = chat.members.length
          }
        })

        // Add member count to each event and filter out full events
        const eventsWithMemberCounts = eventsData
          .map((event) => {
            const eventId = event.eventId || event.eventid
            // Ensure at least 1 member count (the admin)
            const memberCount = eventMemberCounts[eventId] || 1
            return {
              ...event,
              memberCount: memberCount,
            }
          })
          .filter((event) => {
            // Filter out events that have reached their participant limit
            const totalParticipants = event.total_participants || 0
            return event.memberCount < totalParticipants
          })

        setEvents(eventsWithMemberCounts || [])
        setFilteredEvents(eventsWithMemberCounts || [])
      } catch (err) {
        console.error("Error fetching events:", err)
        setError("Failed to load events. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const handleSearch = (query) => {
    setSearchQuery(query)
    const filtered = searchEvents(events, query)
    setFilteredEvents(filtered)
  }

  return (
    <div className="flex flex-col h-screen bg-[#f5efe6]">
      {/* Header - fixed height */}
      <div className="sticky top-0 z-10 bg-[#f5efe6] p-4 shadow-sm">
        <h1 className="mb-4 text-2xl font-bold text-[#5c4033]">Events</h1>

        <div className="relative">
          <div className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
          </div>
          <Input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-full border-gray-200 bg-white pl-10 pr-4"
          />
        </div>
      </div>

      {/* Events List - scrollable */}
      <div className="flex-1 overflow-y-auto pb-20">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-[#5c4033]">Loading events...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-4 text-center text-[#5c4033]">No available events found</div>
        ) : (
          <div className="p-4 space-y-4">
            {filteredEvents.map((event) => (
              <EventCard key={event.eventid} event={event} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

