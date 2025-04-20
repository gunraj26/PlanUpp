/**
 * Search events by sport, location, or description
 * @param {Array} events - Array of events to search
 * @param {string} query - Search query
 * @returns {Array} - Filtered events
 */
export function searchEvents(events, query) {
  if (!query || query.trim() === "") {
    return events
  }

  const searchTerm = query.toLowerCase().trim()

  return events.filter((event) => {
    return (
      (event.sport && event.sport.toLowerCase().includes(searchTerm)) ||
      (event.location && event.location.toLowerCase().includes(searchTerm)) ||
      (event.description && event.description.toLowerCase().includes(searchTerm))
    )
  })
}

