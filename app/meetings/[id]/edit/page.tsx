"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Check, CalendarDays, Clock, Loader2 } from "lucide-react"
import Link from "next/link"
import { useMeetings } from "@/hooks/use-meetings"
import { useToast } from "@/hooks/use-toast"
import { format, parseISO } from "date-fns"

export default function EditMeetingPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { currentMeeting, isLoading, fetchMeeting, updateMeeting } = useMeetings()
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
    reminder: false,
    reminderTime: "30",
    status: "scheduled",
  })

  useEffect(() => {
    if (params.id) {
      fetchMeeting(params.id as string)
    }
  }, [params.id])

  useEffect(() => {
    if (currentMeeting) {
      const meetingDate = parseISO(currentMeeting.meeting_date)

      setFormData({
        title: currentMeeting.title,
        clientName: currentMeeting.client_name,
        organizationName: currentMeeting.organization_name,
        mobileNumber: currentMeeting.mobile_number,
        date: format(meetingDate, "yyyy-MM-dd"),
        time: format(meetingDate, "HH:mm"),
        location: currentMeeting.location || "",
        description: currentMeeting.description || "",
        reminder: !!currentMeeting.reminder_minutes,
        reminderTime: currentMeeting.reminder_minutes?.toString() || "30",
        status: currentMeeting.status,
      })
    }
  }, [currentMeeting])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked) => {
    setFormData((prev) => ({ ...prev, reminder: checked }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!currentMeeting) return

    setIsSubmitting(true)

    try {
      const meetingDate = `${formData.date}T${formData.time}`

      const result = await updateMeeting(currentMeeting.id, {
        title: formData.title,
        clientName: formData.clientName,
        organizationName: formData.organizationName,
        mobileNumber: formData.mobileNumber,
        meetingDate: meetingDate,
        location: formData.location,
        description: formData.description,
        reminderMinutes: formData.reminder ? Number.parseInt(formData.reminderTime) : null,
        status: formData.status,
      })

      if (result) {
        toast({
          title: "Meeting updated",
          description: "The meeting has been updated successfully",
        })

        // Redirect to the meeting details page
        router.push(`/meetings/${currentMeeting.id}`)
      } else {
        throw new Error("Failed to update meeting")
      }
    } catch (error) {
      console.error("Error updating meeting:", error)
      toast({
        title: "Error",
        description: "Failed to update meeting. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
        </div>
      </div>
    )
  }

  if (!currentMeeting) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Edit Meeting</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Meeting not found</p>
          <Link href="/">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Link href={`/meetings/${currentMeeting.id}`}>
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Edit Meeting</h1>
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

          {!currentMeeting.is_instant && (
            <>
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
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="grid gap-3">
            <Label htmlFor="location">Location {currentMeeting.is_instant ? "" : "(Optional)"}</Label>
            <Input
              id="location"
              name="location"
              placeholder="Enter meeting location"
              value={formData.location}
              onChange={handleInputChange}
              required={currentMeeting.is_instant}
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="description">{currentMeeting.is_instant ? "Meeting Summary" : "Description"} *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder={`Enter meeting ${currentMeeting.is_instant ? "summary" : "description"}`}
              rows={4}
              required
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          {!currentMeeting.is_instant && (
            <>
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
                  <Select
                    value={formData.reminderTime}
                    onValueChange={(value) => handleSelectChange("reminderTime", value)}
                  >
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
            </>
          )}

          <div className="flex gap-3 justify-end">
            <Link href={`/meetings/${currentMeeting.id}`}>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center">
                  <Check className="mr-2 h-4 w-4" />
                  Save Changes
                </span>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
