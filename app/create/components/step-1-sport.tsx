"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useCreateEvent } from "../context/create-context"

const SPORTS = [
  {
    id: "badminton",
    name: "Badminton",
    icon: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "basketball",
    name: "Basketball",
    icon: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "football",
    name: "Football",
    icon: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "tennis",
    name: "Tennis",
    icon: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "volleyball",
    name: "Volleyball",
    icon: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "swimming",
    name: "Swimming",
    icon: "https://images.unsplash.com/photo-1560090995-01632a28895b?q=80&w=500&auto=format&fit=crop",
  },
]

export default function Step1Sport() {
  const router = useRouter()
  const { formData, updateFormData, nextCreateStep } = useCreateEvent()
  const [selectedSport, setSelectedSport] = useState(formData.sport || "")
  const [error, setError] = useState("")

  const handleSportSelect = (sportId) => {
    setSelectedSport(sportId)
    // Also store the selected sport's icon
    const selectedSportObj = SPORTS.find((sport) => sport.id === sportId)
    updateFormData({
      sport: sportId,
      sportIcon: selectedSportObj?.icon, // Store the icon URL
    })
    setError("")
  }

  const handleNext = () => {
    if (!selectedSport) {
      setError("Please select a sport")
      return
    }

    nextCreateStep()
  }

  return (
    <div className="min-h-screen bg-[#f5efe6] p-4">
      <div className="flex items-center mb-6">
        <button onClick={() => router.push("/events")} className="mr-2">
          <ArrowLeft className="h-6 w-6 text-[#5c4033]" />
        </button>
        <h1 className="text-xl font-semibold text-[#5c4033]">Select Sport</h1>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}

      <div className="grid grid-cols-2 gap-4 mb-6">
        {SPORTS.map((sport) => (
          <button
            key={sport.id}
            className={`flex flex-col items-center justify-center p-4 rounded-lg ${
              selectedSport === sport.id ? "bg-[#c3b091] text-[#5c4033]" : "bg-white text-[#5c4033] hover:bg-[#e8d5c4]"
            } transition-colors`}
            onClick={() => handleSportSelect(sport.id)}
          >
            <div className="w-12 h-12 rounded-full overflow-hidden mb-2">
              <Image
                src={sport.icon || "/placeholder.svg"}
                alt={sport.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-medium">{sport.name}</span>
          </button>
        ))}
      </div>

      <Button onClick={handleNext} className="w-full bg-[#c3b091] text-[#5c4033] hover:bg-[#b3a081] rounded-lg py-3">
        Next
      </Button>
    </div>
  )
}

