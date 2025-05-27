"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, MapPin, Plus, Users, Search, AlertTriangle, Loader2, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useMeetings } from "@/hooks/use-meetings"
import type { Meeting } from "@/types/meeting"
import { Input } from "@/components/ui/input"
import { format, parseISO } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import DatabaseInitializer from "@/components/db-initializer"
import AnalyticsSummary from "@/components/analytics-summary"
import ProtectedRoute from "@/components/protected-route"
import UserProfile from "@/components/user-profile"
import { useAuth } from "@/contexts/auth-context"

export default function MeetingDashboard() {
  const { user } = useAuth()
  const { meetings, isLoading, fetchMeetings } = useMeetings()
  const [activeTab, setActiveTab] = useState("today")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([])
  const [error, setError] = useState<string | null>(null)
  const [needsManualSetup, setNeedsManualSetup] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const initializeAndFetch = async () => {
      try {
        setIsInitializing(true)
        setError(null)
        setNeedsManualSetup(false)

        // Try to fetch meetings
        await fetchMeetings({ type: activeTab as any })
        setIsInitializing(false)
      } catch (err) {
        console.error("Error initializing:", err)
        const errorMessage = err instanceof Error ? err.message : "Failed to initialize application"

        // Check if this is a manual setup requirement
        if (
          errorMessage.includes("Database table not found") ||
          (errorMessage.includes("relation") && errorMessage.includes("does not exist"))
        ) {
          setNeedsManualSetup(true)
        } else {
          setError(errorMessage)
        }

        setIsInitializing(false)
      }
    }

    if (user) {
      initializeAndFetch()
    }
  }, [activeTab, user])

  useEffect(() => {
    if (meetings) {
      setFilteredMeetings(
        meetings.filter(
          (meeting) =>
            meeting.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            meeting.organization_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            meeting.title.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )
    }
  }, [meetings, searchQuery])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const renderContent = () => {
    if (isInitializing) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-4" />
          <p className="text-gray-500">Checking database...</p>
        </div>
      )
    }

    if (needsManualSetup) {
      return <DatabaseInitializer />
    }

    if (error) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )
    }

    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      )
    }

    if (filteredMeetings.length > 0) {
      return (
        <div className="grid gap-4">
          {filteredMeetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      )
    }

    return <div className="text-center py-8 text-gray-500">No meetings found for this category</div>
  }

  return (
    <ProtectedRoute>
      {/* If manual setup is needed, show only the initializer */}
      {needsManualSetup ? (
        <DatabaseInitializer />
      ) : (
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Meeting Management</h1>
              {user && (
                <p className="text-gray-600">
                  Welcome back, {user.user_metadata?.full_name || user.email?.split("@")[0]}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Link href="/analytics">
                <Button variant="outline" className="flex items-center">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
              </Link>
              <Link href="/add-meeting">
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isInitializing || needsManualSetup || !!error}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Meeting
                </Button>
              </Link>
              <UserProfile />
            </div>
          </div>

          {!isInitializing && !needsManualSetup && !error && (
            <>
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search meetings by client, organization or title..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <AnalyticsSummary />
            </>
          )}

          <Tabs defaultValue="today" value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="today" disabled={isInitializing || needsManualSetup || !!error}>
                Today
              </TabsTrigger>
              <TabsTrigger value="upcoming" disabled={isInitializing || needsManualSetup || !!error}>
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="completed" disabled={isInitializing || needsManualSetup || !!error}>
                Completed
              </TabsTrigger>
              <TabsTrigger value="instant" disabled={isInitializing || needsManualSetup || !!error}>
                Instant
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="mt-4">
              {renderContent()}
            </TabsContent>

            <TabsContent value="upcoming" className="mt-4">
              {renderContent()}
            </TabsContent>

            <TabsContent value="completed" className="mt-4">
              {renderContent()}
            </TabsContent>

            <TabsContent value="instant" className="mt-4">
              {renderContent()}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </ProtectedRoute>
  )
}

function MeetingCard({ meeting }: { meeting: Meeting }) {
  const isToday = new Date(meeting.meeting_date).toDateString() === new Date().toDateString()
  const isCompleted = meeting.status === "completed"
  const isInstant = meeting.is_instant

  // Format the meeting date and time
  const formatMeetingDateTime = () => {
    const meetingDate = parseISO(meeting.meeting_date)

    if (isToday) {
      return format(meetingDate, "h:mm a")
    } else {
      return format(meetingDate, "MMM d, h:mm a")
    }
  }

  return (
    <Link href={`/meetings/${meeting.id}`}>
      <Card className={`${isCompleted ? "bg-gray-50" : "bg-white"} hover:shadow-md transition-shadow`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{meeting.title}</CardTitle>
            {isInstant && (
              <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded">Instant</span>
            )}
            {isToday && !isInstant && !isCompleted && (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Today</span>
            )}
            {isCompleted && (
              <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Completed</span>
            )}
            {meeting.status === "cancelled" && (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Cancelled</span>
            )}
          </div>
          <CardDescription>{meeting.organization_name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div className="flex items-center text-sm">
              <Users className="mr-2 h-4 w-4 text-gray-500" />
              <span>{meeting.client_name}</span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="mr-2 h-4 w-4 text-gray-500" />
              <span>{formatMeetingDateTime()}</span>
            </div>
            {meeting.location && (
              <div className="flex items-center text-sm">
                <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                <span>{meeting.location}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
