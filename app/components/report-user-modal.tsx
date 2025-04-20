"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Paperclip, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"

export default function ReportUserModal({ userId, userName, onClose }) {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(1) // 1: form, 2: success
  const [reportText, setReportText] = useState("")
  const [attachedImage, setAttachedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [reportId, setReportId] = useState("")

  const handleAttachImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create a preview URL
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
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

    try {
      setIsSubmitting(true)
      setError("")

      // In a real implementation, you would upload the image to storage first
      // For now, we'll just use the preview URL or a placeholder
      const imageUrl = imagePreview || (attachedImage ? "/placeholder.svg?height=200&width=200" : null)

      // Pre-populate the report text with the username if not already included
      let finalReportText = reportText
      if (!finalReportText.includes(userName)) {
        finalReportText = `Reporting user: ${userName}\n\n${finalReportText}`
      }

      // Submit the report to Supabase
      const { data, error: submitError } = await supabase
        .from("User_reports")
        .insert([
          {
            text: finalReportText,
            image: imageUrl,
            status: "PENDING",
            profileReportedId: userId,
            reportingProfileId: user.id,
            dateReported: new Date().toISOString().split("T")[0],
            timeReported: new Date().toTimeString().split(" ")[0],
          },
        ])
        .select()

      if (submitError) {
        console.error("Error submitting report:", submitError)
        throw new Error(submitError.message || "Failed to submit report")
      }

      // Set the report ID from the response
      if (data && data[0] && data[0].reportId) {
        setReportId(data[0].reportId)
      } else {
        // Generate a simple report ID if not returned from the database
        setReportId(`${Math.floor(Math.random() * 1000)}a`)
      }

      // Move to success step
      setStep(2)
    } catch (err) {
      console.error("Error submitting report:", err)
      setError(err.message || "Failed to submit report. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoToOutcome = () => {
    // In a real app, this would navigate to a page showing the report status
    onClose()
  }

  // Step 1: Report Form
  if (step === 1) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-planupp-beige rounded-lg max-w-md w-full max-h-[90vh] overflow-auto">
          <div className="p-4 flex items-center border-b border-planupp-brown/20">
            <button onClick={onClose} className="mr-2">
              <ArrowLeft className="h-5 w-5 text-planupp-text" />
            </button>
            <h1 className="font-semibold text-planupp-text flex-1 text-center">Submit Report</h1>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-6">
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

            <div className="bg-gray-100 p-4 rounded-lg">
              <textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder={`Reporting user: ${userName || "User"}\n\nPlease provide details about why you are reporting this user.`}
                className="w-full h-24 bg-transparent border-none resize-none focus:outline-none text-planupp-text"
                required
              />
            </div>

            <div
              className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center cursor-pointer relative"
              onClick={() => document.getElementById("image-upload").click()}
            >
              <input id="image-upload" type="file" accept="image/*" onChange={handleAttachImage} className="hidden" />
              <Paperclip className="h-6 w-6 text-planupp-text mb-2" />
              <p className="text-planupp-text">ATTACH IMAGE</p>

              {imagePreview && (
                <div className="mt-4 w-full">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-32 object-contain rounded-lg"
                  />
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-planupp-button text-planupp-text hover:bg-planupp-button/80 rounded-full py-3"
              disabled={isSubmitting || !reportText.trim()}
            >
              {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  // Step 2: Success Screen
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-planupp-beige rounded-lg max-w-md w-full max-h-[90vh] overflow-auto">
        <div className="p-4 flex items-center border-b border-planupp-brown/20">
          <h1 className="font-semibold text-planupp-text flex-1 text-center">Submit Report</h1>
        </div>

        <div className="p-4 flex flex-col items-center justify-center">
          <div className="bg-white rounded-lg border-2 border-planupp-text p-8 text-center mb-6 w-full">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-planupp-text">
              <Check className="h-8 w-8 text-planupp-text" />
            </div>
            <p className="text-lg font-medium text-planupp-text">YOUR REPORT HAS BEEN SUBMITTED</p>
            <p className="text-sm text-planupp-secondaryText mt-2">REPORT ID: {reportId}</p>
          </div>

          <Button
            onClick={handleGoToOutcome}
            className="w-full bg-planupp-button text-planupp-text hover:bg-planupp-button/80 rounded-full py-3"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}

