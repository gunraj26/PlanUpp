"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Search } from "lucide-react"
import { useCreateEvent } from "../context/create-context"
import { Input } from "@/components/ui/input"
import { FixedCalendar } from "@/components/ui/fixed-calendar"

const FACILITIES = [
  { id: "bedok-stadium", name: "Bedok Stadium", address: "1, Bedok North Street 2, Singapore 469642" },
  { id: "bishan-sports-centre", name: "Bishan Sports Centre", address: "5, Bishan Street 14, Singapore 579783" },
  {
    id: "bukit-batok-swimming-complex",
    name: "Bukit Batok Swimming Complex",
    address: "2, Bukit Batok Street 22, Singapore 659581",
  },
  {
    id: "bukit-gombak-sports-centre",
    name: "Bukit Gombak Sports Centre",
    address: "800, Bukit Batok West Avenue 5, Singapore 659081",
  },
  {
    id: "bukit-merah-swimming-complex",
    name: "Bukit Merah Swimming Complex",
    address: "314, Bukit Merah Central, Singapore 159944",
  },
  {
    id: "choa-chu-kang-sports-centre",
    name: "Choa Chu Kang Sports Centre",
    address: "1, Choa Chu Kang Street 53, Singapore 689236",
  },
  { id: "clementi-sports-centre", name: "Clementi Sports Centre", address: "518, Clementi Avenue 3, Singapore 129907" },
  { id: "clementi-stadium", name: "Clementi Stadium", address: "10, West Coast Walk, Singapore 127156" },
  { id: "delta-swimming-complex", name: "Delta Swimming Complex", address: "900, Tiong Bahru Road, Singapore 158790" },
  {
    id: "geylang-east-swimming-complex",
    name: "Geylang East Swimming Complex",
    address: "601, Aljunied Avenue 1, Singapore 389862",
  },
  {
    id: "heartbeat-bedok-activesg-gym",
    name: "Heartbeat@Bedok ActiveSG Gym",
    address: "11, Bedok North Street 1, Singapore 469662",
  },
  { id: "hougang-sports-centre", name: "Hougang Sports Centre", address: "93, Hougang Avenue 4, Singapore 538832" },
  { id: "jalan-besar-stadium", name: "Jalan Besar Stadium", address: "100, Tyrwhitt Road, Singapore 207542" },
  {
    id: "jurong-east-sports-centre",
    name: "Jurong East Sports Centre",
    address: "21, Jurong East Street 31, Singapore 609517",
  },
  {
    id: "jurong-west-sports-centre",
    name: "Jurong West Sports Centre",
    address: "20, Jurong West Street 93, Singapore 648965",
  },
  {
    id: "kallang-basin-swimming-complex",
    name: "Kallang Basin Swimming Complex",
    address: "23, Geylang Bahru Lane, Singapore 339628",
  },
  { id: "kallang-sports-centre", name: "Kallang Sports Centre", address: "52, Stadium Road, Singapore 397724" },
  { id: "katong-swimming-complex", name: "Katong Swimming Complex", address: "111, Wilkinson Road, Singapore 436752" },
  { id: "moe-evans-stadium", name: "MOE (Evans) Stadium", address: "21, Evans Road, Singapore 259366" },
  {
    id: "moe-evans-swimming-complex",
    name: "MOE (Evans) Swimming Complex",
    address: "21, Evans Road, Singapore 259366",
  },
  {
    id: "pasir-ris-sports-centre",
    name: "Pasir Ris Sports Centre",
    address: "120, Pasir Ris Central, Singapore 519640",
  },
  { id: "queenstown-sports-centre", name: "Queenstown Sports Centre", address: "473, Stirling Road, Singapore 148948" },
  {
    id: "queenstown-swimming-complex",
    name: "Queenstown Swimming Complex",
    address: "473, Stirling Road, Singapore 148948",
  },
  { id: "sengkang-sports-centre", name: "Sengkang Sports Centre", address: "57, Anchorvale Road, Singapore 544964" },
  {
    id: "serangoon-sports-centre",
    name: "Serangoon Sports Centre",
    address: "33, Yio Chu Kang Road, Singapore 545654",
  },
  { id: "singapore-sports-hub", name: "Singapore Sports Hub", address: "1, Stadium Drive, Singapore 397629" },
  { id: "tampines-sports-centre", name: "Tampines Sports Centre", address: "1, Our Tampines Hub, Singapore 529684" },
  {
    id: "toa-payoh-sports-centre",
    name: "Toa Payoh Sports Centre",
    address: "301, Toa Payoh Lorong 6, Singapore 319392",
  },
  {
    id: "toa-payoh-swimming-complex",
    name: "Toa Payoh Swimming Complex",
    address: "301, Toa Payoh Lorong 6, Singapore 319392",
  },
  {
    id: "woodlands-sports-centre",
    name: "Woodlands Sports Centre",
    address: "2, Woodlands Street 13, Singapore 738599",
  },
  {
    id: "yio-chu-kang-sports-centre",
    name: "Yio Chu Kang Sports Centre",
    address: "200, Ang Mo Kio Avenue 9, Singapore 569770",
  },
  { id: "yishun-sports-centre", name: "Yishun Sports Centre", address: "101, Yishun Avenue 1, Singapore 769130" },
  { id: "yishun-swimming-complex", name: "Yishun Swimming Complex", address: "101, Yishun Avenue 1, Singapore 769130" },
  {
    id: "zhenghua-park-activesg-gym",
    name: "Zhenghua Park ActiveSG Gym",
    address: "6, Jelapang Road, Singapore 677745",
  },
  { id: "zion-road-swimming-complex", name: "Zion Road Swimming Complex", address: "56, Zion Road, Singapore 159779" },
]

export default function Step2DateTime() {
  const router = useRouter()
  const { formData, updateFormData, nextCreateStep, prevCreateStep } = useCreateEvent()

  // Initialize date with formData.date if it exists, otherwise null
  const [date, setDate] = useState(formData.date ? new Date(formData.date) : null)
  const [startTime, setStartTime] = useState(formData.startTime || "")
  const [endTime, setEndTime] = useState(formData.endTime || "")
  const [selectedFacility, setSelectedFacility] = useState(formData.facility?.id || "")
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState("")

  // Filter facilities based on search term
  const filteredFacilities = useMemo(() => {
    if (!searchTerm.trim()) return FACILITIES

    const term = searchTerm.toLowerCase().trim()
    return FACILITIES.filter(
      (facility) => facility.name.toLowerCase().includes(term) || facility.address.toLowerCase().includes(term),
    )
  }, [searchTerm])

  const handleDateSelect = (selectedDate) => {
    setDate(selectedDate)
    // Update form data immediately when date changes
    if (selectedDate) {
      const adjustedDate = new Date(selectedDate.getTime() + 8 * 60 * 60 * 1000);
      updateFormData({ date: adjustedDate.toISOString().split("T")[0] });
    }
  }

  const handleFacilitySelect = (facilityId) => {
    setSelectedFacility(facilityId)
    const facility = FACILITIES.find((f) => f.id === facilityId)
    updateFormData({ facility })
    setError("")
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleNext = () => {
    if (!date) {
      setError("Please select a date")
      return
    }

    if (!startTime) {
      setError("Please select a start time")
      return
    }

    if (!endTime) {
      setError("Please select an end time")
      return
    }

    if (!selectedFacility) {
      setError("Please select a facility")
      return
    }

    // Update form data
    updateFormData({
      date: new Date(date.getTime() + 8 * 60 * 60 * 1000).toISOString().split("T")[0], 
      startTime,
      endTime,
      facility: FACILITIES.find((f) => f.id === selectedFacility),
      location: FACILITIES.find((f) => f.id === selectedFacility)?.name || "",
    })

    // Move to next step
    nextCreateStep()
  }

  return (
    <div className="min-h-screen bg-[#f5efe6] p-4 pb-32">
      <div className="flex items-center mb-6">
        <button onClick={prevCreateStep} className="mr-2">
          <ArrowLeft className="h-6 w-6 text-[#5c4033]" />
        </button>
        <h1 className="text-xl font-semibold text-[#5c4033]">Date & Time</h1>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}

      <div className="bg-white rounded-lg p-4 mb-4">
        <h2 className="text-lg font-semibold text-[#5c4033] mb-3">Select Date</h2>

        {/* Use our new FixedCalendar component */}
        <FixedCalendar
          selected={date}
          onSelect={handleDateSelect}
          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
        />
      </div>

      <div className="bg-white rounded-lg p-4 mb-4">
        <h2 className="text-lg font-semibold text-[#5c4033] mb-3">Select Time</h2>

        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <label className="block text-sm text-[#5c4033] mb-1">Start Time</label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value)
                updateFormData({ startTime: e.target.value })
              }}
              className="border-[#c3b091] text-[#5c4033]"
            />
          </div>

          <div>
            <label className="block text-sm text-[#5c4033] mb-1">End Time</label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => {
                setEndTime(e.target.value)
                updateFormData({ endTime: e.target.value })
              }}
              className="border-[#c3b091] text-[#5c4033]"
            />
          </div>
        </div>
      </div>

      {/* Atlas Map */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <h2 className="text-lg font-semibold text-[#5c4033] mb-3">Location Map</h2>
        <div className="w-full h-[400px] overflow-hidden rounded-lg">
          <iframe
            src="https://app.atlas.co/embeds/rL1gUui1TXHYgjNgeRNY"
            frameBorder="0"
            width="100%"
            height="400"
            className="max-w-full border border-[#EAEAEA] rounded-lg"
            title="Location Map"
          ></iframe>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 mb-20">
        <h2 className="text-lg font-semibold text-[#5c4033] mb-3">Select Facility</h2>

        <div className="mb-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#5c4033] opacity-70" />
          </div>
          <Input
            type="text"
            placeholder="Search facilities by name or location..."
            className="border-[#c3b091] text-[#5c4033] pl-10"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {filteredFacilities.length > 0 ? (
            filteredFacilities.map((facility) => (
              <button
                key={facility.id}
                className={`w-full text-left p-3 rounded-lg ${
                  selectedFacility === facility.id
                    ? "bg-[#c3b091] text-[#5c4033]"
                    : "bg-[#f5efe6] text-[#5c4033] hover:bg-[#e8d5c4]"
                } transition-colors`}
                onClick={() => handleFacilitySelect(facility.id)}
                type="button"
              >
                <div className="font-medium">{facility.name}</div>
                <div className="text-sm opacity-80">{facility.address}</div>
              </button>
            ))
          ) : (
            <div className="text-center py-4 text-[#5c4033]">
              No facilities found matching "{searchTerm}". Try a different search term.
            </div>
          )}
        </div>
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

