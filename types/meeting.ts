export interface Meeting {
  id: string
  title: string
  client_name: string
  organization_name: string
  mobile_number: string
  description: string | null
  meeting_date: string
  location: string | null
  latitude: number | null
  longitude: number | null
  is_instant: boolean
  reminder_minutes: number | null
  selfie_url: string | null
  status: "scheduled" | "completed" | "cancelled"
  created_at: string
  updated_at: string
}

export interface CreateMeetingPayload {
  title: string
  clientName: string
  organizationName: string
  mobileNumber: string
  description?: string
  meetingDate?: string
  date?: string
  time?: string
  location?: string
  latitude?: number
  longitude?: number
  isInstant?: boolean
  reminderMinutes?: number | null
  selfieUrl?: string
  status?: "scheduled" | "completed" | "cancelled"
}

export interface UpdateMeetingPayload {
  title?: string
  clientName?: string
  organizationName?: string
  mobileNumber?: string
  description?: string
  meetingDate?: string
  location?: string
  latitude?: number
  longitude?: number
  reminderMinutes?: number | null
  selfieUrl?: string
  status?: "scheduled" | "completed" | "cancelled"
}

export interface MeetingFilters {
  type?: "today" | "upcoming" | "completed" | "instant" | "all"
  date?: string
  clientName?: string
  status?: "scheduled" | "completed" | "cancelled"
}
