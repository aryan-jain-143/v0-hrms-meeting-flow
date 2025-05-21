"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Camera, MapPin, ArrowLeft, Check } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function InstantMeetingPage() {
  const { toast } = useToast()
  const [location, setLocation] = useState({ latitude: null, longitude: null, address: "Fetching location..." })
  const [selfieImage, setSelfieImage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    clientName: "",
    organizationName: "",
    mobileNumber: "",
    meetingSummary: "",
  })

  // Simulate getting location on component mount
  useState(() => {
    setTimeout(() => {
      setLocation({
        latitude: 28.6139,
        longitude: 77.209,
        address: "Connaught Place, New Delhi, India",
      })
    }, 1500)
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTakeSelfie = () => {
    // In a real app, this would access the camera
    // For this demo, we'll simulate taking a photo
    setSelfieImage("/placeholder.svg?height=200&width=200")
    toast({
      title: "Selfie captured",
      description: "Client photo has been saved successfully",
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Meeting saved",
      description: "Instant meeting has been recorded successfully",
    })

    setIsSubmitting(false)
    // In a real app, we would redirect to the meeting list
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Link href="/add-meeting">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Instant Meeting</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="clientName">Client Name *</Label>
            <Input
              id="clientName"
              name="clientName"
              placeholder="Enter client name"
              required
              value={formData.clientName}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="organizationName">Organization Name *</Label>
            <Input
              id="organizationName"
              name="organizationName"
              placeholder="Enter organization name"
              required
              value={formData.organizationName}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="mobileNumber">Mobile Number *</Label>
            <Input
              id="mobileNumber"
              name="mobileNumber"
              placeholder="Enter mobile number"
              type="tel"
              required
              value={formData.mobileNumber}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="meetingSummary">Meeting Summary / MOM *</Label>
            <Textarea
              id="meetingSummary"
              name="meetingSummary"
              placeholder="Enter meeting minutes"
              rows={4}
              required
              value={formData.meetingSummary}
              onChange={handleInputChange}
            />
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Current Location</p>
                  <p className="text-sm text-gray-600">{location.address}</p>
                  {location.latitude && (
                    <p className="text-xs text-gray-500 mt-1">
                      Lat: {location.latitude.toFixed(4)}, Long: {location.longitude.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-3">
            <Label>Selfie with Client *</Label>
            {selfieImage ? (
              <div className="relative">
                <img
                  src={selfieImage || "/placeholder.svg"}
                  alt="Client selfie"
                  className="w-full h-48 object-cover rounded-md"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute bottom-2 right-2"
                  onClick={handleTakeSelfie}
                >
                  Retake
                </Button>
              </div>
            ) : (
              <Button type="button" variant="outline" className="h-48 border-dashed" onClick={handleTakeSelfie}>
                <Camera className="mr-2 h-5 w-5" />
                Take Selfie with Client
              </Button>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isSubmitting || !selfieImage}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </span>
            ) : (
              <span className="flex items-center">
                <Check className="mr-2 h-5 w-5" />
                Save Meeting
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
