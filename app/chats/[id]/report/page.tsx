"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ReportPage({ params }) {
  const router = useRouter()
  const [reportText, setReportText] = useState("")
  const [attachedImage, setAttachedImage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAttachImage = () => {
    // In a real app, this would open a file picker
    setAttachedImage("/placeholder.svg?height=100&width=100")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Navigate to success page
    router.push(`/chats/${params.id}/report/success`)
  }

  return (
    <div className="min-h-screen bg-planupp-beige">
      <div className="p-4 flex items-center">
        <button onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-5 w-5 text-planupp-text" />
        </button>
        <h1 className="font-semibold text-planupp-text flex-1 text-center">Submit Report</h1>
      </div>

      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-100 p-4 rounded-lg">
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="ADD USERNAME OF WHO YOU ARE REPORTING AND ANY SUPPORTING TEXT"
              className="w-full h-24 bg-transparent border-none resize-none focus:outline-none text-planupp-text"
              required
            />
          </div>

          <div
            className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center cursor-pointer"
            onClick={handleAttachImage}
          >
            <Paperclip className="h-6 w-6 text-planupp-text mb-2" />
            <p className="text-planupp-text">ATTACH IMAGE</p>

            {attachedImage && (
              <div className="mt-4 w-full">
                <img src={attachedImage || "/placeholder.svg"} alt="Attached" className="w-full h-32 object-contain" />
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-planupp-button text-planupp-text hover:bg-planupp-button/80 rounded-full py-3"
            disabled={isSubmitting || !reportText}
          >
            {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
          </Button>
        </form>
      </div>
    </div>
  )
}

