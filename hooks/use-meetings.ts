"use client"

import { useState } from "react"
import type { Meeting, CreateMeetingPayload, UpdateMeetingPayload, MeetingFilters } from "@/types/meeting"
import { useToast } from "@/hooks/use-toast"

export function useMeetings() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null)

  // Initialize the database
  const initializeDatabase = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/db-init", {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to initialize database")
      }

      return true
    } catch (error) {
      console.error("Error initializing database:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initialize database",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch meetings with optional filters
  const fetchMeetings = async (filters: MeetingFilters = {}) => {
    setIsLoading(true)
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams()
      if (filters.type) queryParams.append("type", filters.type)
      if (filters.date) queryParams.append("date", filters.date)
      if (filters.clientName) queryParams.append("clientName", filters.clientName)
      if (filters.status) queryParams.append("status", filters.status)

      const response = await fetch(`/api/meetings?${queryParams.toString()}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to fetch meetings")
      }

      const data = await response.json()
      setMeetings(data.meetings || [])
      return data.meetings || []
    } catch (error) {
      console.error("Error fetching meetings:", error)

      // Don't show toast for relation does not exist error
      if (!(error instanceof Error && error.message.includes("relation") && error.message.includes("does not exist"))) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch meetings",
          variant: "destructive",
        })
      }

      throw error // Re-throw to allow the caller to handle it
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch a single meeting by ID
  const fetchMeeting = async (id: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/meetings/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch meeting")
      }

      setCurrentMeeting(data.meeting)
      return data.meeting
    } catch (error) {
      console.error("Error fetching meeting:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch meeting",
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Create a new meeting
  const createMeeting = async (payload: CreateMeetingPayload) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create meeting")
      }

      toast({
        title: "Success",
        description: data.message || "Meeting created successfully",
      })

      return data.meeting
    } catch (error) {
      console.error("Error creating meeting:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create meeting",
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Update an existing meeting
  const updateMeeting = async (id: string, payload: UpdateMeetingPayload) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/meetings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update meeting")
      }

      toast({
        title: "Success",
        description: data.message || "Meeting updated successfully",
      })

      if (currentMeeting && currentMeeting.id === id) {
        setCurrentMeeting(data.meeting)
      }

      return data.meeting
    } catch (error) {
      console.error("Error updating meeting:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update meeting",
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Delete a meeting
  const deleteMeeting = async (id: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/meetings/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete meeting")
      }

      toast({
        title: "Success",
        description: data.message || "Meeting deleted successfully",
      })

      if (currentMeeting && currentMeeting.id === id) {
        setCurrentMeeting(null)
      }

      // Remove the deleted meeting from the meetings list
      setMeetings(meetings.filter((meeting) => meeting.id !== id))

      return true
    } catch (error) {
      console.error("Error deleting meeting:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete meeting",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Mark a meeting as completed
  const completeMeeting = async (id: string) => {
    return updateMeeting(id, { status: "completed" })
  }

  // Cancel a meeting
  const cancelMeeting = async (id: string) => {
    return updateMeeting(id, { status: "cancelled" })
  }

  return {
    meetings,
    currentMeeting,
    isLoading,
    initializeDatabase,
    fetchMeetings,
    fetchMeeting,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    completeMeeting,
    cancelMeeting,
  }
}
