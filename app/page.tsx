import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, MapPin, Plus, Users } from "lucide-react"
import Link from "next/link"

export default function MeetingDashboard() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Meeting Management</h1>
        <Link href="/add-meeting">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" /> Add Meeting
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="instant">Instant</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-4">
          <div className="grid gap-4">
            <MeetingCard
              title="Client Review Meeting"
              client="John Smith"
              organization="ABC Corp"
              time="10:30 AM - 11:30 AM"
              location="Conference Room A"
              isToday={true}
            />
            <MeetingCard
              title="Project Status Update"
              client="Sarah Johnson"
              organization="XYZ Industries"
              time="2:00 PM - 3:00 PM"
              location="Virtual Meeting"
              isToday={true}
            />
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-4">
          <div className="grid gap-4">
            <MeetingCard
              title="Quarterly Planning"
              client="Michael Brown"
              organization="Global Solutions"
              time="Tomorrow, 9:00 AM"
              location="Main Office"
              isToday={false}
            />
            <MeetingCard
              title="Contract Negotiation"
              client="Emily Davis"
              organization="Tech Innovations"
              time="May 23, 11:00 AM"
              location="Client Office"
              isToday={false}
            />
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <div className="grid gap-4">
            <MeetingCard
              title="Initial Consultation"
              client="Robert Wilson"
              organization="Smart Systems"
              time="Yesterday, 3:30 PM"
              location="Coffee Shop"
              isToday={false}
              isCompleted={true}
            />
          </div>
        </TabsContent>

        <TabsContent value="instant" className="mt-4">
          <div className="grid gap-4">
            <MeetingCard
              title="Field Visit"
              client="Jennifer Lee"
              organization="Quick Solutions"
              time="Today, 9:15 AM"
              location="Client Site"
              isToday={true}
              isInstant={true}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MeetingCard({
  title,
  client,
  organization,
  time,
  location,
  isToday = false,
  isCompleted = false,
  isInstant = false,
}) {
  return (
    <Card className={`${isCompleted ? "bg-gray-50" : "bg-white"}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          {isInstant && (
            <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded">Instant</span>
          )}
          {isToday && !isInstant && !isCompleted && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Today</span>
          )}
          {isCompleted && (
            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Completed</span>
          )}
        </div>
        <CardDescription>{organization}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="flex items-center text-sm">
            <Users className="mr-2 h-4 w-4 text-gray-500" />
            <span>{client}</span>
          </div>
          <div className="flex items-center text-sm">
            <Clock className="mr-2 h-4 w-4 text-gray-500" />
            <span>{time}</span>
          </div>
          <div className="flex items-center text-sm">
            <MapPin className="mr-2 h-4 w-4 text-gray-500" />
            <span>{location}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
