import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarClock, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AddMeetingPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Add Meeting</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/add-meeting/instant" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-green-600" />
                Instant Meeting
              </CardTitle>
              <CardDescription>Create an on-the-spot meeting or field visit</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                <li>Capture current date and time automatically</li>
                <li>Record GPS location</li>
                <li>Take selfie with client</li>
                <li>Document meeting minutes</li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        <Link href="/add-meeting/schedule" className="block">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarClock className="mr-2 h-5 w-5 text-blue-600" />
                Schedule Meeting
              </CardTitle>
              <CardDescription>Plan a future meeting with reminders</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                <li>Set date and time for the meeting</li>
                <li>Add meeting details and agenda</li>
                <li>Set reminder notifications</li>
                <li>Specify meeting location</li>
              </ul>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
