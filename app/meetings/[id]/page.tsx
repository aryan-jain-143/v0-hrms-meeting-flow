"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  Building,
  FileText,
  Check,
  X,
  Edit,
  Trash,
} from "lucide-react"
import Link from "next/link"
import { useMeetings } from "@/hooks/use-meetings"
import { format, parseISO } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function MeetingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { currentMeeting, isLoading, fetchMeeting, completeMeeting, cancelMeeting, deleteMeeting } = useMeetings()
  const [isActionLoading, setIsActionLoading] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchMeeting(params.id as string)
    }
  }, [params.id])

  const handleCompleteMeeting = async () => {
    if (!currentMeeting) return

    setIsActionLoading(true)
    const result = await completeMeeting(currentMeeting.id)
    setIsActionLoading(false)

    if (result) {
      toast({
        title: "Meeting completed",
        description: "The meeting has been marked as completed",
      })
    }
  }

  const handleCancelMeeting = async () => {
    if (!currentMeeting) return

    setIsActionLoading(true)
    const result = await cancelMeeting(currentMeeting.id)
    setIsActionLoading(false)

    if (result) {
      toast({
        title: "Meeting cancelled",
        description: "The meeting has been cancelled",
      })
    }
  }

  const handleDeleteMeeting = async () => {
    if (!currentMeeting) return

    setIsActionLoading(true)
    const result = await deleteMeeting(currentMeeting.id)
    setIsActionLoading(false)

    if (result) {
      toast({
        title: "Meeting deleted",
        description: "The meeting has been deleted successfully",
      })
      router.push("/")
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (!currentMeeting) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Meeting Details</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 mb-4">Meeting not found</p>
            <Link href="/">
              <Button>Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const meetingDate = parseISO(currentMeeting.meeting_date)
  const formattedDate = format(meetingDate, "MMMM d, yyyy")
  const formattedTime = format(meetingDate, "h:mm a")
  const isUpcoming = new Date(currentMeeting.meeting_date) > new Date() && currentMeeting.status === "scheduled"
  const isPast = new Date(currentMeeting.meeting_date) < new Date()

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Meeting Details</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{currentMeeting.title}</CardTitle>
              <CardDescription>{currentMeeting.organization_name}</CardDescription>
            </div>
            <div>
              {currentMeeting.is_instant && (
                <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded">Instant</span>
              )}
              {currentMeeting.status === "completed" && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Completed</span>
              )}
              {currentMeeting.status === "cancelled" && (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Cancelled</span>
              )}
              {isUpcoming && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Upcoming</span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <User className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Client</p>
                  <p>{currentMeeting.client_name}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Building className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Organization</p>
                  <p>{currentMeeting.organization_name}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Mobile Number</p>
                  <p>{currentMeeting.mobile_number}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p>{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Time</p>
                  <p>{formattedTime}</p>
                </div>
              </div>

              {currentMeeting.location && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p>{currentMeeting.location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {currentMeeting.description && (
            <div className="pt-4">
              <div className="flex items-start mb-2">
                <FileText className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                <p className="text-sm font-medium text-gray-500">
                  {currentMeeting.is_instant ? "Meeting Summary" : "Description"}
                </p>
              </div>
              <p className="text-gray-700 whitespace-pre-line pl-7">{currentMeeting.description}</p>
            </div>
          )}

          {currentMeeting.selfie_url && (
            <div className="pt-4">
              <p className="text-sm font-medium text-gray-500 mb-2">Client Selfie</p>
              <img
                src={currentMeeting.selfie_url || "/placeholder.svg"}
                alt="Client selfie"
                className="rounded-md max-h-64 object-cover"
              />
            </div>
          )}

          {currentMeeting.latitude && currentMeeting.longitude && (
            <div className="pt-4">
              <p className="text-sm font-medium text-gray-500 mb-2">Meeting Location</p>
              <div className="bg-gray-100 p-4 rounded-md">
                <p className="text-sm">
                  Latitude: {currentMeeting.latitude.toFixed(6)}, Longitude: {currentMeeting.longitude.toFixed(6)}
                </p>
                <a
                  href={`https://maps.google.com/?q=${currentMeeting.latitude},${currentMeeting.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                >
                  View on Google Maps
                </a>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3 justify-between">
          <div className="flex flex-wrap gap-3">
            {isUpcoming && (
              <>
                <Button
                  variant="outline"
                  className="flex items-center"
                  onClick={handleCompleteMeeting}
                  disabled={isActionLoading}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Mark as Completed
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center text-red-600 border-red-200 hover:bg-red-50"
                  onClick={handleCancelMeeting}
                  disabled={isActionLoading}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel Meeting
                </Button>
              </>
            )}
            {!isUpcoming && currentMeeting.status === "scheduled" && isPast && (
              <Button
                variant="outline"
                className="flex items-center"
                onClick={handleCompleteMeeting}
                disabled={isActionLoading}
              >
                <Check className="mr-2 h-4 w-4" />
                Mark as Completed
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/meetings/${currentMeeting.id}/edit`}>
              <Button variant="outline" className="flex items-center">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="flex items-center text-red-600 border-red-200 hover:bg-red-50">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the meeting record.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteMeeting} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
