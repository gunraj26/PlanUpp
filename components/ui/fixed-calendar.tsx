"use client"
import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns"

type CalendarProps = {
  selected?: Date | null
  onSelect?: (date: Date) => void
  disabled?: (date: Date) => boolean
}

export function FixedCalendar({ selected, onSelect, disabled }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())

  // Get days for the current month view
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get day names
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  // Navigation functions
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  // Check if a date is disabled
  const isDateDisabled = (date: Date) => {
    return disabled ? disabled(date) : false
  }

  // Handle date selection
  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return
    onSelect && onSelect(date)
  }

  // Generate calendar grid
  const generateCalendarGrid = () => {
    // Get the first day of the month
    const firstDayOfMonth = monthStart.getDay()

    // Create an array for all cells in the calendar grid
    const calendarCells = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarCells.push(null)
    }

    // Add cells for each day of the month
    monthDays.forEach((day) => {
      calendarCells.push(day)
    })

    // Create rows with 7 cells each
    const rows = []
    let cells = []

    calendarCells.forEach((cell, i) => {
      if (i % 7 !== 0) {
        cells.push(cell)
      } else {
        if (cells.length > 0) {
          rows.push(cells)
        }
        cells = [cell]
      }
    })

    // Add the last row
    if (cells.length > 0) {
      rows.push(cells)
    }

    return rows
  }

  const calendarRows = generateCalendarGrid()

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        fontFamily: "inherit",
        backgroundColor: "white",
        borderRadius: "0.5rem",
        padding: "1rem",
      }}
    >
      {/* Header with month and navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <button
          onClick={prevMonth}
          style={{
            background: "transparent",
            border: "1px solid #e0d0c1",
            borderRadius: "9999px",
            width: "2rem",
            height: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <ChevronLeft size={16} />
        </button>

        <div
          style={{
            fontWeight: 600,
            fontSize: "1rem",
            color: "#5c4033",
          }}
        >
          {format(currentMonth, "MMMM yyyy")}
        </div>

        <button
          onClick={nextMonth}
          style={{
            background: "transparent",
            border: "1px solid #e0d0c1",
            borderRadius: "9999px",
            width: "2rem",
            height: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day names row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          textAlign: "center",
          marginBottom: "0.5rem",
          width: "100%",
        }}
      >
        {dayNames.map((day, i) => (
          <div
            key={i}
            style={{
              padding: "0.5rem 0",
              fontWeight: 500,
              fontSize: "0.875rem",
              color: "#5c4033",
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ width: "100%" }}>
        {calendarRows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              width: "100%",
            }}
          >
            {row.map((day, dayIndex) => {
              // Empty cell
              if (!day) {
                return (
                  <div
                    key={dayIndex}
                    style={{
                      height: "2.5rem",
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  />
                )
              }

              // Determine if this day is selected, today, or disabled
              const isSelected = selected ? isSameDay(day, selected) : false
              const isDayToday = isToday(day)
              const isDisabled = isDateDisabled(day)
              const isOutsideMonth = !isSameMonth(day, currentMonth)

              return (
                <div
                  key={dayIndex}
                  style={{
                    height: "2.5rem",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <button
                    onClick={() => handleDateClick(day)}
                    disabled={isDisabled}
                    style={{
                      width: "2rem",
                      height: "2rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "9999px",
                      border: isDayToday ? "1px solid #c3b091" : "none",
                      backgroundColor: isSelected ? "#c3b091" : "transparent",
                      color: isSelected ? "#5c4033" : isOutsideMonth ? "#a8a8a8" : "#5c4033",
                      fontWeight: isDayToday ? 700 : 400,
                      opacity: isDisabled ? 0.3 : 1,
                      cursor: isDisabled ? "not-allowed" : "pointer",
                    }}
                  >
                    {format(day, "d")}
                  </button>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Selected date display */}
      {selected && (
        <div
          style={{
            marginTop: "0.5rem",
            fontSize: "0.875rem",
            color: "#5c4033",
          }}
        >
          Selected date: {format(selected, "PPP")}
        </div>
      )}
    </div>
  )
}

