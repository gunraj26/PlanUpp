"use client"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { format } from "date-fns"
import "./calendar.css" // Import dedicated CSS file

export function CustomCalendar({ className, selected, onSelect, disabled, ...props }) {
  return (
    <div className="calendar-container">
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        disabled={disabled}
        showOutsideDays={true}
        className="custom-calendar"
        modifiersClassNames={{
          selected: "day-selected",
          today: "day-today",
          disabled: "day-disabled",
        }}
        components={{
          IconLeft: () => <ChevronLeft className="h-4 w-4" />,
          IconRight: () => <ChevronRight className="h-4 w-4" />,
        }}
        {...props}
      />

      {selected && <div className="mt-2 text-sm text-[#5c4033]">Selected date: {format(selected, "PPP")}</div>}
    </div>
  )
}

