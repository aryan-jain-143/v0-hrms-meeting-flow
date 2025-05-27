"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface AnalyticsData {
  totalMeetings: number
  completedMeetings: number
  instantMeetings: number
  uniqueClients: number
  uniqueOrganizations: number
  meetingGrowth: number
  completionRate: number
  instantMeetingPercentage: number
  statusDistribution: Array<{ name: string; value: number }>
  typeDistribution: Array<{ name: string; value: number }>
  dailyActivity: Array<{ date: string; meetings: number }>
  weeklyTrends: Array<{ week: string; total: number; completed: number; instant: number }>
  completionTrend: Array<{ period: string; rate: number }>
  topClients: Array<{ name: string; meetings: number }>
  topOrganizations: Array<{ name: string; meetings: number }>
  topLocations: Array<{ location: string; count: number }>
  locationTypes: Array<{ name: string; value: number }>
  geographicDistribution: Array<{ area: string; count: number }>
}

export function useAnalytics() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)

  const fetchAnalytics = async (timeRange = "30") => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/analytics?timeRange=${timeRange}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to fetch analytics")
      }

      const data = await response.json()
      setAnalytics(data.analytics)
      return data.analytics
    } catch (error) {
      console.error("Error fetching analytics:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch analytics",
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    analytics,
    isLoading,
    fetchAnalytics,
  }
}
