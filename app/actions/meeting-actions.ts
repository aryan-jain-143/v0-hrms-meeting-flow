"use server"

import { createServerSupabaseClient } from "@/lib/supabase-server"
import type { CreateMeetingPayload, Meeting, UpdateMeetingPayload } from "@/types/meeting"
import { revalidatePath } from "next/cache"

// Create a new meeting
export async function createMeeting(
  payload: CreateMeetingPayload,
): Promise<{ success: boolean; message: string; meeting?: Meeting; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    // Validate required fields
    if (!payload.title || !payload.clientName || !payload.organizationName || !payload.mobileNumber) {
      return {
        success: false,
        message: "Missing required fields",
        error: "Missing required fields",
      }
    }

    // Determine if this is an instant or scheduled meeting
    const isInstant = payload.isInstant || false

    // Format meeting date
    let meetingDate: string
    if (isInstant) {
      meetingDate = payload.meetingDate || new Date().toISOString()
    } else {
      if (!payload.date || !payload.time) {
        return {
          success: false,
          message: "Date and time are required for scheduled meetings",
          error: "Date and time are required for scheduled meetings",
        }
      }
      meetingDate = `${payload.date}T${payload.time}`
    }

    // Create meeting record in Supabase
    const { data: meeting, error } = await supabase
      .from("meetings")
      .insert({
        title: payload.title,
        client_name: payload.clientName,
        organization_name: payload.organizationName,
        mobile_number: payload.mobileNumber,
        description: payload.description || null,
        meeting_date: meetingDate,
        location: payload.location || null,
        latitude: payload.latitude || null,
        longitude: payload.longitude || null,
        is_instant: isInstant,
        reminder_minutes: !isInstant && payload.reminderMinutes ? payload.reminderMinutes : null,
        selfie_url: payload.selfieUrl || null,
        status: isInstant ? "completed" : "scheduled",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating meeting:", error)
      return {
        success: false,
        message: error.message,
        error: error.message,
      }
    }

    // Revalidate the meetings page to show the new meeting
    revalidatePath("/")

    return {
      success: true,
      message: isInstant ? "Instant meeting recorded" : "Meeting scheduled successfully",
      meeting: meeting as Meeting,
    }
  } catch (error) {
    console.error("Server error:", error)
    return {
      success: false,
      message: "Internal server error",
      error: "Internal server error",
    }
  }
}

// Get a meeting by ID
export async function getMeeting(id: string): Promise<{ success: boolean; meeting?: Meeting; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("meetings").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return {
          success: false,
          error: "Meeting not found",
        }
      }
      console.error("Error fetching meeting:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      meeting: data as Meeting,
    }
  } catch (error) {
    console.error("Server error:", error)
    return {
      success: false,
      error: "Internal server error",
    }
  }
}

// Update a meeting
export async function updateMeeting(
  id: string,
  payload: UpdateMeetingPayload,
): Promise<{ success: boolean; message: string; meeting?: Meeting; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    // Check if meeting exists
    const { data: existingMeeting, error: fetchError } = await supabase
      .from("meetings")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return {
          success: false,
          message: "Meeting not found",
          error: "Meeting not found",
        }
      }
      console.error("Error fetching meeting:", fetchError)
      return {
        success: false,
        message: fetchError.message,
        error: fetchError.message,
      }
    }

    // Prepare update data
    const updateData: Record<string, any> = {}

    if (payload.title) updateData.title = payload.title
    if (payload.clientName) updateData.client_name = payload.clientName
    if (payload.organizationName) updateData.organization_name = payload.organizationName
    if (payload.mobileNumber) updateData.mobile_number = payload.mobileNumber
    if (payload.description !== undefined) updateData.description = payload.description
    if (payload.meetingDate) updateData.meeting_date = payload.meetingDate
    if (payload.location !== undefined) updateData.location = payload.location
    if (payload.latitude !== undefined) updateData.latitude = payload.latitude
    if (payload.longitude !== undefined) updateData.longitude = payload.longitude
    if (payload.reminderMinutes !== undefined) updateData.reminder_minutes = payload.reminderMinutes
    if (payload.selfieUrl !== undefined) updateData.selfie_url = payload.selfieUrl
    if (payload.status) updateData.status = payload.status

    // Update the meeting
    const { data: updatedMeeting, error: updateError } = await supabase
      .from("meetings")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating meeting:", updateError)
      return {
        success: false,
        message: updateError.message,
        error: updateError.message,
      }
    }

    // Revalidate the meetings page to show the updated meeting
    revalidatePath("/")

    return {
      success: true,
      message: "Meeting updated successfully",
      meeting: updatedMeeting as Meeting,
    }
  } catch (error) {
    console.error("Server error:", error)
    return {
      success: false,
      message: "Internal server error",
      error: "Internal server error",
    }
  }
}

// Delete a meeting
export async function deleteMeeting(id: string): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    // Check if meeting exists
    const { data: existingMeeting, error: fetchError } = await supabase
      .from("meetings")
      .select("id")
      .eq("id", id)
      .single()

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return {
          success: false,
          message: "Meeting not found",
          error: "Meeting not found",
        }
      }
      console.error("Error fetching meeting:", fetchError)
      return {
        success: false,
        message: fetchError.message,
        error: fetchError.message,
      }
    }

    // Delete the meeting
    const { error: deleteError } = await supabase.from("meetings").delete().eq("id", id)

    if (deleteError) {
      console.error("Error deleting meeting:", deleteError)
      return {
        success: false,
        message: deleteError.message,
        error: deleteError.message,
      }
    }

    // Revalidate the meetings page to remove the deleted meeting
    revalidatePath("/")

    return {
      success: true,
      message: "Meeting deleted successfully",
    }
  } catch (error) {
    console.error("Server error:", error)
    return {
      success: false,
      message: "Internal server error",
      error: "Internal server error",
    }
  }
}

// Get meetings with filtering
export async function getMeetings(
  filters: {
    type?: "today" | "upcoming" | "completed" | "instant" | "all"
    date?: string
    clientName?: string
    status?: "scheduled" | "completed" | "cancelled"
  } = {},
): Promise<{ success: boolean; meetings?: Meeting[]; error?: string }> {
  try {
    const supabase = createServerSupabaseClient()

    // Start building the query
    let query = supabase.from("meetings").select("*")

    // Apply filters
    if (filters.type === "today") {
      const today = new Date().toISOString().split("T")[0]
      query = query.gte("meeting_date", `${today}T00:00:00`).lte("meeting_date", `${today}T23:59:59`)
    } else if (filters.type === "upcoming") {
      query = query.gt("meeting_date", new Date().toISOString()).eq("status", "scheduled")
    } else if (filters.type === "completed") {
      query = query.eq("status", "completed")
    } else if (filters.type === "instant") {
      query = query.eq("is_instant", true)
    }

    // Filter by date if provided
    if (filters.date) {
      query = query.gte("meeting_date", `${filters.date}T00:00:00`).lte("meeting_date", `${filters.date}T23:59:59`)
    }

    // Filter by client name if provided
    if (filters.clientName) {
      query = query.ilike("client_name", `%${filters.clientName}%`)
    }

    // Filter by status if provided
    if (filters.status) {
      query = query.eq("status", filters.status)
    }

    // Order by meeting date
    query = query.order("meeting_date", { ascending: filters.type === "completed" ? false : true })

    const { data, error } = await query

    if (error) {
      console.error("Error fetching meetings:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      meetings: data as Meeting[],
    }
  } catch (error) {
    console.error("Server error:", error)
    return {
      success: false,
      error: "Internal server error",
    }
  }
}
