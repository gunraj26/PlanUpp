"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Paperclip } from "lucide-react"
import { createUserReport } from "@/lib/report-service"
import { useAuth } from "@/context/auth-context"

export default function ReportUserForm({ userId, onSuccess, onCancel }) {
  const router = useRouter()
  const { user } = useAuth()
  const [reportText, setReportText] = useState("")
  const [attachedImage, setAttachedImage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleAttachImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // In a real app, you would upload this to storage
    // For now, we'll just store the file object
    setAttachedImage(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user) {
      router.push("/login")
      return
    }

    if (!reportText.trim()) {
      setError("Please provide details about the report")
      return
    }

    if (user.id === userId) {
      setError("You cannot report yourself")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")

      // In a real app, you would upload the image to storage first
      // and then use the URL in the report
      const imageUrl = attachedImage ? "/placeholder.svg?height=200&width=200" : null

      await createUserReport({
        text: reportText,
        image: imageUrl,
        profileReportedId: userId,
      })

      if (onSuccess) {
        onSuccess()
      } else {
        // Navigate to success page
        router.push("/report-success")
      }
    } catch (err) {
      console.error("Error submitting report:", err)
      setError("Failed to submit report. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

        <div className="bg-gray-100 p-4 rounded-lg">
          <textarea
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder="ADD USERNAME OF WHO YOU ARE REPORTING AND ANY SUPPORTING TEXT"
            className="w-full h-24 bg-transparent border-none resize-none focus:outline-none text-planupp-text"
            required
          />
        </div>

        <div className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center cursor-pointer relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleAttachImage}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Paperclip className="h-6 w-6 text-planupp-text mb-2" />
          <p className="text-planupp-text">ATTACH IMAGE</p>

          {attachedImage && (
            <div className="mt-4 w-full">
              <p className="text-sm text-planupp-text">{attachedImage.name}</p>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-planupp-text hover:bg-gray-400 rounded-full py-3"
            >
              CANCEL
            </Button>
          )}
          <Button
            type="submit"
            className="flex-1 bg-planupp-button text-planupp-text hover:bg-planupp-button/80 rounded-full py-3"
            disabled={isSubmitting || !reportText.trim()}
          >
            {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
          </Button>
        </div>
      </form>
    </div>
  )
}

