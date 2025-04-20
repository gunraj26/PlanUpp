"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Edit, Phone, Camera, X, Plus } from "lucide-react"
import AuthLayout from "../../components/auth-layout"
import { useAuth } from "@/context/auth-context"
import { supabase } from "@/lib/supabase"

export default function EditProfilePage() {
  const router = useRouter()
  const { userProfile, refreshProfile, user } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    phoneNumber: "",
  })
  const [newHashtag, setNewHashtag] = useState("")
  const [hashtags, setHashtags] = useState([])
  const [imagePreview, setImagePreview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        bio: userProfile.bio || "",
        phoneNumber: userProfile.phoneNumber || "",
      })
      setImagePreview(userProfile.profilePic || "")

      // Parse hashtags from string or array
      if (userProfile.hashtags) {
        if (typeof userProfile.hashtags === "string") {
          // If hashtags is stored as a comma-separated string
          setHashtags(userProfile.hashtags.split(",").filter((tag) => tag.trim()))
        } else if (Array.isArray(userProfile.hashtags)) {
          // If hashtags is stored as an array
          setHashtags(userProfile.hashtags)
        }
      }
    }
  }, [userProfile])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddHashtag = (e) => {
    e.preventDefault()
    if (newHashtag.trim()) {
      const tag = newHashtag.trim().startsWith("#") ? newHashtag.trim() : `#${newHashtag.trim()}`
      setHashtags([...hashtags, tag])
      setNewHashtag("")
    }
  }

  const handleRemoveHashtag = (index) => {
    setHashtags(hashtags.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      if (!user?.id) {
        throw new Error("User not authenticated")
      }

      // Only validate the name field
      if (!formData.name || formData.name.trim() === "") {
        setError("Name is required")
        setIsSubmitting(false)
        return
      }

      // Prepare the update data
      const updateData = {
        ...formData,
        profilePic: imagePreview,
        hashtags: hashtags.join(","), // Store as comma-separated string
      }

      // Update the user profile in the database
      const { error: updateError } = await supabase.from("Users").update(updateData).eq("id", user.id)

      if (updateError) {
        throw updateError
      }

      // Refresh the profile in the auth context
      await refreshProfile()

      // Navigate to success page
      router.push("/profile/success")
    } catch (err) {
      console.error("Failed to update profile:", err)
      setError("Failed to update profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!userProfile) {
    return (
      <AuthLayout>
        <div className="flex items-center justify-center min-h-screen bg-[#f5efe6]">
          <div className="animate-pulse text-[#5c4033]">Loading profile...</div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="bg-[#f5efe6] min-h-screen p-4">
        <h1 className="text-2xl font-bold text-[#5c4033] mb-8 text-center">Edit your Profile</h1>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

        <div className="flex justify-center mb-8">
          <div className="relative">
            <div
              className="bg-white rounded-full h-24 w-24 flex items-center justify-center overflow-hidden border-2 border-[#c3b091] shadow-sm cursor-pointer"
              onClick={handleImageClick}
            >
              {imagePreview ? (
                <Image
                  src={imagePreview || "/placeholder.svg"}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="object-cover h-full w-full"
                />
              ) : (
                <Camera className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <button
              className="absolute bottom-0 right-0 bg-white rounded-full p-2 border border-[#c3b091] shadow-sm"
              onClick={handleImageClick}
            >
              <Camera className="h-4 w-4 text-[#5c4033]" />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
          <div className="relative">
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="rounded-full border-gray-200 bg-white pl-10 py-6"
              placeholder="Name"
              required
            />
            <div className="absolute inset-y-0 left-3 flex items-center">
              <Image src="/placeholder.svg?height=20&width=20" alt="User" width={20} height={20} />
            </div>
          </div>

          <div className="relative">
            <Input
              type="text"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="rounded-full border-gray-200 bg-white pl-10 py-6"
              placeholder="BIO"
            />
            <div className="absolute inset-y-0 left-3 flex items-center">
              <Edit className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="relative">
            <Input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="rounded-full border-gray-200 bg-white pl-10 py-6"
              placeholder="Phone Number"
            />
            <div className="absolute inset-y-0 left-3 flex items-center">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Hashtags section */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-[#5c4033] font-medium mb-2">Hashtags</h3>

            <div className="flex flex-wrap gap-2 mb-3">
              {hashtags.map((tag, index) => (
                <div key={index} className="bg-[#e6f0ff] text-[#3b82f6] px-3 py-1 rounded-full flex items-center">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveHashtag(index)}
                    className="ml-1.5 text-[#3b82f6] hover:text-[#1e40af]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex">
              <Input
                type="text"
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                className="rounded-l-full border-gray-200 bg-white"
                placeholder="Add hashtag"
              />
              <button
                type="button"
                onClick={handleAddHashtag}
                className="bg-[#3b82f6] text-white rounded-r-full px-3 flex items-center"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full rounded-full bg-[#c3b091] text-[#5c4033] hover:bg-[#b3a081] py-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update profile"}
          </Button>
        </form>
      </div>
    </AuthLayout>
  )
}

