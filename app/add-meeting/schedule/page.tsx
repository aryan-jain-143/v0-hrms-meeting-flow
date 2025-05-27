"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Check, CalendarDays, Clock } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useMeetings } from "@/hooks/use-meetings"

export default function ScheduleMeetingPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { createMeeting } = useMeetings()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    clientName: "",
    organizationName: "",
    mobileNumber: "",
    date: "",
    time: "",
    location: "",
    description: "",
    reminder: true,
    reminderTime: "30",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked) => {
    setFormData((prev) => ({ ...prev, reminder: checked }))
  }

  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, reminderTime: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create the meeting using our hook
      const result = await createMeeting({
        title: formData.title,
        clientName: formData.clientName,
        organizationName: formData.organizationName,
        mobileNumber: formData.mobileNumber,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        description: formData.description,
        isInstant: false,
        reminderMinutes: formData.reminder ? Number.parseInt(formData.reminderTime) : null,
      })

      if (result) {
        toast({
          title: "Meeting scheduled",
          description: "Your meeting has been scheduled successfully",
        })

        // Redirect to the home page after successful submission
        router.push("/")
      } else {
        throw new Error("Failed to schedule meeting")
      }
    } catch (error) {
      console.error("Error scheduling meeting:", error)
      toast({
        title: "Error",
        description: "Failed to schedule meeting. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Link href="/add-meeting">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Schedule Meeting</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="title">Meeting Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter meeting title"
              required
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-3">
              <Label htmlFor="date">Date *</Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                <Input
                  id="date"
                  name="date"
                  type="date"
                  className="pl-10"
                  required
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="time">Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                <Input
                  id="time"
                  name="time"
                  type="time"
                  className="pl-10"
                  required
                  value={formData.time}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              name="location"
              placeholder="Enter meeting location"
              value={formData.location}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter meeting description or agenda"
              rows={4}
              required
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reminder">Set Reminder</Label>
              <p className="text-sm text-gray-500">Receive notification before meeting</p>
            </div>
            <Switch id="reminder" checked={formData.reminder} onCheckedChange={handleSwitchChange} />
          </div>

          {formData.reminder && (
            <div className="grid gap-3">
              <Label htmlFor="reminderTime">Reminder Time</Label>
              <Select value={formData.reminderTime} onValueChange={handleSelectChange}>
                <SelectTrigger id="reminderTime">
                  <SelectValue placeholder="Select reminder time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes before</SelectItem>
                  <SelectItem value="30">30 minutes before</SelectItem>
                  <SelectItem value="60">1 hour before</SelectItem>
                  <SelectItem value="120">2 hours before</SelectItem>
                  <SelectItem value="1440">1 day before</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
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
                Scheduling...
              </span>
            ) : (
              <span className="flex items-center">
                <Check className="mr-2 h-5 w-5" />
                Schedule Meeting
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
