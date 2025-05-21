"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase-client"

export default function MeetingNotification() {
  const { toast } = useToast()
  const [upcomingMeetings, setUpcomingMeetings] = useState([])

  useEffect(() => {
    // Check for upcoming meetings that need notifications
    const checkUpcomingMeetings = async () => {
      const now = new Date()
      const future = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours in the future

      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("status", "scheduled")
        .gte("meeting_date", now.toISOString())
        .lte("meeting_date", future.toISOString())

      if (error) {
        console.error("Error fetching upcoming meetings:", error)
        return
      }

      if (data && data.length > 0) {
        setUpcomingMeetings(data)

        // Show notifications for meetings that are about to start
        data.forEach((meeting) => {
          const meetingTime = new Date(meeting.meeting_date)
          const timeDiff = meetingTime.getTime() - now.getTime()
          const minutesDiff = Math.floor(timeDiff / (1000 * 60))

          if (meeting.reminder_minutes && minutesDiff <= meeting.reminder_minutes) {
            showNotification(meeting)
          }
        })
      }
    }

    // Initial check
    checkUpcomingMeetings()

    // Set up interval to check periodically
    const interval = setInterval(checkUpcomingMeetings, 5 * 60 * 1000) // Check every 5 minutes

    return () => clearInterval(interval)
  }, [])

  const showNotification = (meeting) => {
    const meetingTime = new Date(meeting.meeting_date)
    const formattedTime = meetingTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    toast({
      title: `Upcoming Meeting: ${meeting.title}`,
      description: `${meeting.client_name} at ${formattedTime}${meeting.location ? ` - ${meeting.location}` : ""}`,
      duration: 10000,
    })

    // If browser notifications are supported and permitted
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`Upcoming Meeting: ${meeting.title}`, {
        body: `${meeting.client_name} at ${formattedTime}${meeting.location ? ` - ${meeting.location}` : ""}`,
        icon: "/notification-icon.png",
      })
    }
  }

  // Request notification permission on component mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission()
    }
  }, [])

  return null // This is a background component, no UI needed
}
