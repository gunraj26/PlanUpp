"use client"

import { createContext, useContext, useState } from "react"

// Create context
const CreateEventContext = createContext({
  step: 1,
  formData: {
    sport: "",
    date: "",
    startTime: "",
    endTime: "",
    facility: null,
    totalParticipants: 3,
    friendsParticipants: 1,
    publicParticipants: 2,
    visibility: "public",
    description: "",
    screenshot: null,
  },
  updateFormData: () => {},
  nextCreateStep: () => {},
  prevCreateStep: () => {},
  resetForm: () => {},
})

// Custom hook to use the context
export function useCreateEvent() {
  const context = useContext(CreateEventContext)
  if (!context) {
    throw new Error("useCreateEvent must be used within a CreateEventProvider")
  }
  return context
}

// Provider component
export function CreateEventProvider({ children }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    sport: "",
    date: "",
    startTime: "",
    endTime: "",
    facility: null,
    totalParticipants: 3,
    public_participants: 1, // Default to 1 for the admin
    visibility: "public",
    description: "",
    screenshot: null,
  })

  // Function to update form data
  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }))
  }

  // Function to go to next step
  const nextCreateStep = () => {
    setStep((prev) => prev + 1)
  }

  // Function to go to previous step
  const prevCreateStep = () => {
    setStep((prev) => (prev > 1 ? prev - 1 : prev))
  }

  // Function to reset form
  const resetForm = () => {
    setStep(1)
    setFormData({
      sport: "",
      date: "",
      startTime: "",
      endTime: "",
      facility: null,
      totalParticipants: 3,
      public_participants: 1, // Default to 1 for the admin
      visibility: "public",
      description: "",
      screenshot: null,
    })
  }

  // Context value
  const value = {
    step,
    formData,
    updateFormData,
    nextCreateStep,
    prevCreateStep,
    resetForm,
  }

  return <CreateEventContext.Provider value={value}>{children}</CreateEventContext.Provider>
}

