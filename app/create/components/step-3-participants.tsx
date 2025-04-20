"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useCreateEvent } from "../context/create-context"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export default function Step3Participants() {
  const router = useRouter()
  const { formData, updateFormData, nextCreateStep, prevCreateStep } = useCreateEvent()

  const [totalParticipants, setTotalParticipants] = useState(formData.totalParticipants || 3)
  const [visibility, setVisibility] = useState(formData.visibility || "public")
  const [description, setDescription] = useState(formData.description || "")
  const [error, setError] = useState("")

  const handleTotalChange = (e) => {
    const value = Number.parseInt(e.target.value) || 0
    setTotalParticipants(value)
  }

  const handleNext = () => {
    if (totalParticipants < 2) {
      setError("Total participants must be at least 2")
      return
    }

    if (!description) {
      setError("Please provide a description")
      return
    }

    updateFormData({
      totalParticipants,
      public_participants: 1, // Default to 1 for the admin
      visibility,
      description,
    })

    nextCreateStep()
  }

  return (
    <div className="min-h-screen bg-[#f5efe6] p-4 pb-24">
      <div className="flex items-center mb-6">
        <button onClick={prevCreateStep} className="mr-2">
          <ArrowLeft className="h-6 w-6 text-[#5c4033]" />
        </button>
        <h1 className="text-xl font-semibold text-[#5c4033]">Participants</h1>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}

      <div className="bg-white rounded-lg p-4 mb-4">
        <h2 className="text-lg font-semibold text-[#5c4033] mb-3">Number of Participants</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#5c4033] mb-1">Total Participants</label>
            <Input
              type="number"
              min="2"
              value={totalParticipants}
              onChange={handleTotalChange}
              className="border-[#c3b091] text-[#5c4033]"
            />
            <p className="text-xs text-gray-500 mt-1">This is the maximum number of people who can join this event</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 mb-4">
        <h2 className="text-lg font-semibold text-[#5c4033] mb-3">Event Visibility</h2>

        <RadioGroup value={visibility} onValueChange={setVisibility}>
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="public" id="public" />
            <Label htmlFor="public" className="text-[#5c4033]">
              Public Event
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="bg-white rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-[#5c4033] mb-3">Description</h2>

        <Textarea
          placeholder="Tell others about your event..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border-[#c3b091] text-[#5c4033] min-h-[100px]"
        />
      </div>

      {/* Extra prominent Next button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-[#f5efe6] border-t border-[#e0d0c1] z-40">
        <Button
          onClick={handleNext}
          className="w-full bg-[#c3b091] text-[#5c4033] hover:bg-[#b3a081] rounded-lg py-6 text-lg font-bold shadow-lg"
          type="button"
        >
          NEXT
        </Button>
      </div>
    </div>
  )
}

