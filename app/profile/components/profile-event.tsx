import Image from "next/image"

export default function ProfileEvent({ event, daysAgo }) {
  // Handle database format
  const formatEvent = () => {
    // Format for database events
    return {
      sport: event.sport,
      location: event.location,
      date: new Date(event.eventDate).toLocaleDateString(),
      time: `${event.startTime?.substring(0, 5) || ""} to ${event.endTime?.substring(0, 5) || ""}`,
      screenshot: event.screenshot,
      capacity: {
        current: event.capacity || 0,
        max: event.total_participants || 0,
      },
      status: event.status,
    }
  }

  const formattedEvent = formatEvent()

  // Format capacity for display
  const formatCapacity = () => {
    if (formattedEvent.capacity && typeof formattedEvent.capacity === "object") {
      // Don't show anything if the count is 0
      if (formattedEvent.capacity.current === 0) {
        return ""
      }
      return `${typeof formattedEvent.capacity.current === "number" ? formattedEvent.capacity.current : 0} joined`
    }
    // Don't show anything if the count is 0
    if (formattedEvent.capacity === 0) {
      return ""
    }
    return `${typeof formattedEvent.capacity === "number" ? formattedEvent.capacity : 0} joined`
  }

  // Get a default sport image based on the sport
  const getDefaultSportImage = (sport) => {
    if (!sport) return "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=500&auto=format&fit=crop"

    const sportName = sport.toLowerCase()
    const sportImages = {
      basketball: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=500&auto=format&fit=crop",
      swimming: "https://images.unsplash.com/photo-1560090995-01632a28895b?q=80&w=500&auto=format&fit=crop",
      football: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=500&auto=format&fit=crop",
      tennis: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=500&auto=format&fit=crop",
      volleyball: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=500&auto=format&fit=crop",
      badminton: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=500&auto=format&fit=crop",
    }

    return (
      sportImages[sportName] ||
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=500&auto=format&fit=crop"
    )
  }

  // Get the image URL for the event
  const getEventImage = () => {
    // If the event has a screenshot that's a full URL, use it
    if (
      formattedEvent.screenshot &&
      (formattedEvent.screenshot.startsWith("http://") || formattedEvent.screenshot.startsWith("https://"))
    ) {
      return formattedEvent.screenshot
    }

    // If the event has a screenshot that's a local path, use it
    if (formattedEvent.screenshot && formattedEvent.screenshot.startsWith("/")) {
      return formattedEvent.screenshot
    }

    // Otherwise, use a default image based on the sport
    return getDefaultSportImage(formattedEvent.sport)
  }

  return (
    <div className={`flex items-center bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow`}>
      <div className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-full mr-3 border-2 border-[#e0d0c1]`}>
        <Image
          src={getEventImage() || "/placeholder.svg"}
          alt={formattedEvent.sport}
          width={56}
          height={56}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-semibold text-[#5c4033]`}>
            {formattedEvent.sport}
            {formattedEvent.status === "pending" && <span className="text-yellow-600 text-xs ml-2">(Pending)</span>}
            {formattedEvent.status === "admitted" && <span className="text-green-600 text-xs ml-2">(Verified)</span>}
          </h3>
          <span className={`text-xs text-gray-500 bg-[#f5efe6] px-2 py-0.5 rounded-full`}>{daysAgo}</span>
        </div>

        <p className={`text-xs text-[#5c4033] truncate`}>
          {formattedEvent.location} | {formattedEvent.date} | {formattedEvent.time}
        </p>
      </div>

      <div className={`ml-2 text-xs font-medium bg-[#f5efe6] px-2 py-1 rounded-full text-[#5c4033] flex-shrink-0`}>
        {formatCapacity()}
      </div>
    </div>
  )
}

