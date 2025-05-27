import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import type { CreateMeetingPayload, MeetingFilters } from "@/types/meeting"
import { initializeDatabase } from "@/lib/db-init"

// GET endpoint to list meetings with optional filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)

    // Check if the database is initialized
    const initResult = await initializeDatabase()
    if (!initResult.success) {
      if (initResult.needsManualSetup) {
        return NextResponse.json(
          {
            error: "Database table not found. Please create the meetings table using the SQL script.",
            needsManualSetup: true,
          },
          { status: 400 },
        )
      }
      return NextResponse.json({ error: initResult.error }, { status: 500 })
    }

    // Extract filter parameters
    const filters: MeetingFilters = {
      type: (searchParams.get("type") as MeetingFilters["type"]) || "all",
      date: searchParams.get("date") || undefined,
      clientName: searchParams.get("clientName") || undefined,
      status: (searchParams.get("status") as MeetingFilters["status"]) || undefined,
    }

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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ meetings: data || [] })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST endpoint to create a new meeting
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Check if the database is initialized
    const initResult = await initializeDatabase()
    if (!initResult.success) {
      if (initResult.needsManualSetup) {
        return NextResponse.json(
          {
            error: "Database table not found. Please create the meetings table using the SQL script.",
            needsManualSetup: true,
          },
          { status: 400 },
        )
      }
      return NextResponse.json({ error: initResult.error }, { status: 500 })
    }

    const payload: CreateMeetingPayload = await request.json()

    // Validate required fields
    if (!payload.title || !payload.clientName || !payload.organizationName || !payload.mobileNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Determine if this is an instant or scheduled meeting
    const isInstant = payload.isInstant || false

    // Format meeting date
    let meetingDate: string
    if (isInstant) {
      meetingDate = payload.meetingDate || new Date().toISOString()
    } else {
      if (!payload.date || !payload.time) {
        return NextResponse.json({ error: "Date and time are required for scheduled meetings" }, { status: 400 })
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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: isInstant ? "Instant meeting recorded" : "Meeting scheduled successfully",
      meeting,
    })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
