import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { subDays, format, startOfWeek, endOfWeek, subWeeks } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const timeRange = Number.parseInt(searchParams.get("timeRange") || "30")

    const endDate = new Date()
    const startDate = subDays(endDate, timeRange)

    // Fetch all meetings within the time range
    const { data: meetings, error } = await supabase
      .from("meetings")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())

    if (error) {
      console.error("Error fetching meetings for analytics:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate basic metrics
    const totalMeetings = meetings?.length || 0
    const completedMeetings = meetings?.filter((m) => m.status === "completed").length || 0
    const instantMeetings = meetings?.filter((m) => m.is_instant).length || 0
    const uniqueClients = new Set(meetings?.map((m) => m.client_name)).size
    const uniqueOrganizations = new Set(meetings?.map((m) => m.organization_name)).size

    // Calculate growth (compare with previous period)
    const previousStartDate = subDays(startDate, timeRange)
    const { data: previousMeetings } = await supabase
      .from("meetings")
      .select("*")
      .gte("created_at", previousStartDate.toISOString())
      .lt("created_at", startDate.toISOString())

    const previousTotal = previousMeetings?.length || 0
    const meetingGrowth = previousTotal > 0 ? Math.round(((totalMeetings - previousTotal) / previousTotal) * 100) : 0

    // Status distribution
    const statusCounts = meetings?.reduce(
      (acc, meeting) => {
        acc[meeting.status] = (acc[meeting.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const statusDistribution = Object.entries(statusCounts || {}).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }))

    // Type distribution
    const typeDistribution = [
      { name: "Scheduled", value: totalMeetings - instantMeetings },
      { name: "Instant", value: instantMeetings },
    ]

    // Daily activity
    const dailyActivity = []
    for (let i = timeRange - 1; i >= 0; i--) {
      const date = subDays(endDate, i)
      const dayMeetings =
        meetings?.filter((m) => {
          const meetingDate = new Date(m.created_at)
          return meetingDate.toDateString() === date.toDateString()
        }).length || 0

      dailyActivity.push({
        date: format(date, "MMM dd"),
        meetings: dayMeetings,
      })
    }

    // Weekly trends (last 8 weeks)
    const weeklyTrends = []
    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(endDate, i))
      const weekEnd = endOfWeek(weekStart)

      const weekMeetings =
        meetings?.filter((m) => {
          const meetingDate = new Date(m.created_at)
          return meetingDate >= weekStart && meetingDate <= weekEnd
        }) || []

      weeklyTrends.push({
        week: format(weekStart, "MMM dd"),
        total: weekMeetings.length,
        completed: weekMeetings.filter((m) => m.status === "completed").length,
        instant: weekMeetings.filter((m) => m.is_instant).length,
      })
    }

    // Completion rate trend
    const completionTrend = weeklyTrends.map((week) => ({
      period: week.week,
      rate: week.total > 0 ? Math.round((week.completed / week.total) * 100) : 0,
    }))

    // Top clients
    const clientCounts = meetings?.reduce(
      (acc, meeting) => {
        acc[meeting.client_name] = (acc[meeting.client_name] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const topClients = Object.entries(clientCounts || {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, meetings]) => ({ name, meetings }))

    // Top organizations
    const orgCounts = meetings?.reduce(
      (acc, meeting) => {
        acc[meeting.organization_name] = (acc[meeting.organization_name] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const topOrganizations = Object.entries(orgCounts || {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, meetings]) => ({ name, meetings }))

    // Top locations
    const locationCounts = meetings?.reduce(
      (acc, meeting) => {
        if (meeting.location) {
          acc[meeting.location] = (acc[meeting.location] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )

    const topLocations = Object.entries(locationCounts || {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([location, count]) => ({ location, count }))

    // Location types (simplified categorization)
    const locationTypes = [
      { name: "Office", value: meetings?.filter((m) => m.location?.toLowerCase().includes("office")).length || 0 },
      { name: "Client Site", value: meetings?.filter((m) => m.location?.toLowerCase().includes("client")).length || 0 },
      { name: "Virtual", value: meetings?.filter((m) => m.location?.toLowerCase().includes("virtual")).length || 0 },
      {
        name: "Other",
        value:
          meetings?.filter((m) => m.location && !m.location.toLowerCase().match(/(office|client|virtual)/)).length || 0,
      },
    ].filter((type) => type.value > 0)

    // Geographic distribution (simplified)
    const geographicDistribution = [
      { area: "Delhi NCR", count: meetings?.filter((m) => m.location?.toLowerCase().includes("delhi")).length || 0 },
      { area: "Mumbai", count: meetings?.filter((m) => m.location?.toLowerCase().includes("mumbai")).length || 0 },
      {
        area: "Bangalore",
        count: meetings?.filter((m) => m.location?.toLowerCase().includes("bangalore")).length || 0,
      },
      {
        area: "Other",
        count:
          meetings?.filter((m) => m.location && !m.location.toLowerCase().match(/(delhi|mumbai|bangalore)/)).length ||
          0,
      },
    ].filter((area) => area.count > 0)

    const analytics = {
      totalMeetings,
      completedMeetings,
      instantMeetings,
      uniqueClients,
      uniqueOrganizations,
      meetingGrowth,
      completionRate: totalMeetings > 0 ? Math.round((completedMeetings / totalMeetings) * 100) : 0,
      instantMeetingPercentage: totalMeetings > 0 ? Math.round((instantMeetings / totalMeetings) * 100) : 0,
      statusDistribution,
      typeDistribution,
      dailyActivity,
      weeklyTrends,
      completionTrend,
      topClients,
      topOrganizations,
      topLocations,
      locationTypes,
      geographicDistribution,
    }

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
