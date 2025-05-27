import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import type { UpdateMeetingPayload } from "@/types/meeting"

// GET endpoint to retrieve a specific meeting by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id

    const { data, error } = await supabase.from("meetings").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
      }
      console.error("Error fetching meeting:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ meeting: data })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT endpoint to update a meeting
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id
    const payload: UpdateMeetingPayload = await request.json()

    // Check if meeting exists
    const { data: existingMeeting, error: fetchError } = await supabase
      .from("meetings")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
      }
      console.error("Error fetching meeting:", fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
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
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Meeting updated successfully",
      meeting: updatedMeeting,
    })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE endpoint to delete a meeting
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id

    // Check if meeting exists
    const { data: existingMeeting, error: fetchError } = await supabase
      .from("meetings")
      .select("id")
      .eq("id", id)
      .single()

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
      }
      console.error("Error fetching meeting:", fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    // Delete the meeting
    const { error: deleteError } = await supabase.from("meetings").delete().eq("id", id)

    if (deleteError) {
      console.error("Error deleting meeting:", deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Meeting deleted successfully",
    })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
