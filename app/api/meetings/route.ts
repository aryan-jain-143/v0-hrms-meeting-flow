import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Determine if this is an instant or scheduled meeting
    const isInstant = data.type === "instant"

    // Create meeting record in Supabase
    const { data: meeting, error } = await supabase
      .from("meetings")
      .insert({
        title: data.title || "Instant Meeting",
        client_name: data.clientName,
        organization_name: data.organizationName,
        mobile_number: data.mobileNumber,
        description: data.meetingSummary || data.description,
        meeting_date: isInstant ? new Date().toISOString() : `${data.date}T${data.time}`,
        location: isInstant ? data.location : data.location || null,
        latitude: isInstant ? data.latitude : null,
        longitude: isInstant ? data.longitude : null,
        is_instant: isInstant,
        reminder_minutes: !isInstant && data.reminder ? Number.parseInt(data.reminderTime) : null,
        selfie_url: data.selfieUrl || null,
        status: isInstant ? "completed" : "scheduled",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving meeting:", error)
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "all"
    const date = searchParams.get("date")

    let query = supabase.from("meetings").select("*")

    // Filter by type
    if (type === "today") {
      const today = new Date().toISOString().split("T")[0]
      query = query.gte("meeting_date", `${today}T00:00:00`).lte("meeting_date", `${today}T23:59:59`)
    } else if (type === "upcoming") {
      query = query.gt("meeting_date", new Date().toISOString()).eq("status", "scheduled")
    } else if (type === "completed") {
      query = query.eq("status", "completed")
    } else if (type === "instant") {
      query = query.eq("is_instant", true)
    }

    // Filter by date if provided
    if (date) {
      query = query.gte("meeting_date", `${date}T00:00:00`).lte("meeting_date", `${date}T23:59:59`)
    }

    // Order by meeting date
    query = query.order("meeting_date", { ascending: type === "completed" ? false : true })

    const { data, error } = await query

    if (error) {
      console.error("Error fetching meetings:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ meetings: data })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
