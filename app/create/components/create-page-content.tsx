"use client"

import { useCreateEvent } from "../context/create-context"
import Step1Sport from "./step-1-sport"
import Step2DateTime from "./step-2-date-time"
import Step3Participants from "./step-3-participants"
import Step4Screenshot from "./step-4-screenshot"
import Step5Summary from "./step-5-summary"
import BottomNav from "../../components/bottom-nav"
import { useEffect } from "react"

export default function CreatePageContent() {
  const { step } = useCreateEvent()

  // Add error handling
  useEffect(() => {
    console.log("Current step:", step)
  }, [step])

  // Render the appropriate step with error handling
  const renderStep = () => {
    try {
      switch (step) {
        case 1:
          return <Step1Sport />
        case 2:
          return <Step2DateTime />
        case 3:
          return <Step3Participants />
        case 4:
          return <Step4Screenshot />
        case 5:
          return <Step5Summary />
        default:
          return <Step1Sport />
      }
    } catch (error) {
      console.error("Error rendering step:", error)
      return <div className="p-4">Something went wrong. Please try again.</div>
    }
  }

  return (
    <div className="pb-16">
      {renderStep()}
      <BottomNav />
    </div>
  )
}

