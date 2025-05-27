"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Calendar, Users, Clock, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useAnalytics } from "@/hooks/use-analytics"

export default function AnalyticsSummary() {
  const { analytics, fetchAnalytics } = useAnalytics()

  useEffect(() => {
    fetchAnalytics("7") // Last 7 days for summary
  }, [])

  if (!analytics) {
    return null
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Quick Analytics</CardTitle>
            <CardDescription>Last 7 days overview</CardDescription>
          </div>
          <Link href="/analytics">
            <Button variant="outline" size="sm">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Full Analytics
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">{analytics.totalMeetings}</div>
            <div className="text-sm text-gray-600">Total Meetings</div>
            {analytics.meetingGrowth > 0 ? (
              <div className="text-xs text-green-600 flex items-center justify-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />+{analytics.meetingGrowth}%
              </div>
            ) : (
              <div className="text-xs text-red-600 flex items-center justify-center mt-1">
                <TrendingDown className="h-3 w-3 mr-1" />
                {analytics.meetingGrowth}%
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold">{analytics.completedMeetings}</div>
            <div className="text-sm text-gray-600">Completed</div>
            <div className="text-xs text-gray-500 mt-1">{analytics.completionRate}% rate</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold">{analytics.instantMeetings}</div>
            <div className="text-sm text-gray-600">Instant</div>
            <div className="text-xs text-gray-500 mt-1">{analytics.instantMeetingPercentage}% of total</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold">{analytics.uniqueClients}</div>
            <div className="text-sm text-gray-600">Unique Clients</div>
            <div className="text-xs text-gray-500 mt-1">{analytics.uniqueOrganizations} orgs</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
