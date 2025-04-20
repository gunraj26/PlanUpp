"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useCreateEvent } from "../context/create-context"

export default function Step4Screenshot() {
  const router = useRouter()
  const fileInputRef = useRef(null)
  const { formData, updateFormData, nextCreateStep, prevCreateStep } = useCreateEvent()
  const [previewUrl, setPreviewUrl] = useState(formData.screenshot || null)
  const [error, setError] = useState("")

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file")
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB")
      return
    }

    setError("")

    // Create a preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    // In a real app, you would upload the file to storage here
    // For now, we'll just store the preview URL
    updateFormData({ screenshot: url })
  }

  const handleNext = () => {
    if (!previewUrl) {
      setError("Please upload a screenshot of your booking")
      return
    }

    nextCreateStep()
  }

  return (
    <div className="min-h-screen bg-[#f5efe6] p-4 pb-24">
      <div className="flex items-center mb-6">
        <button onClick={prevCreateStep} className="mr-2">
          <ArrowLeft className="h-6 w-6 text-[#5c4033]" />
        </button>
        <h1 className="text-xl font-semibold text-[#5c4033]">Upload Booking Screenshot</h1>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}

      <div className="bg-white rounded-lg p-4 mb-6">
        <p className="text-[#5c4033] mb-4">
          Please upload a screenshot of your booking confirmation to verify your event. Go to active.sg, book and upload
          its screenshot.
        </p>

        <div className="mb-4">
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="screenshot-upload" />
          <label
            htmlFor="screenshot-upload"
            className="block w-full py-3 px-4 text-center border-2 border-dashed border-[#c3b091] rounded-lg cursor-pointer hover:bg-[#f5efe6] transition-colors"
          >
            {previewUrl ? "Change Screenshot" : "Upload Screenshot"}
          </label>
        </div>

        {previewUrl && (
          <div className="mb-4">
            <p className="text-[#5c4033] mb-2">Preview:</p>
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              <Image src={previewUrl || "/placeholder.svg"} alt="Booking screenshot" fill className="object-contain" />
            </div>
          </div>
        )}
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

