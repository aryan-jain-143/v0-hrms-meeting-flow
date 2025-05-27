import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    {
      error: "Manual database setup required. Please use the SQL script provided in the instructions.",
      needsManualSetup: true,
    },
    { status: 400 },
  )
}

export async function GET() {
  return NextResponse.json({
    message: "To initialize the database, please run the following SQL script in your Supabase SQL editor:",
    sql: `
-- Create the meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  description TEXT,
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  latitude FLOAT,
  longitude FLOAT,
  is_instant BOOLEAN DEFAULT FALSE,
  reminder_minutes INTEGER,
  selfie_url TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_client ON meetings(client_name);

-- Insert sample data
INSERT INTO meetings (
  title,
  client_name,
  organization_name,
  mobile_number,
  description,
  meeting_date,
  location,
  is_instant,
  status
) VALUES 
(
  'Sample Meeting',
  'John Doe',
  'ACME Corp',
  '+1234567890',
  'This is a sample meeting to test the application',
  NOW() + INTERVAL '2 hours',
  'Conference Room A',
  false,
  'scheduled'
),
(
  'Client Review',
  'Jane Smith',
  'Tech Solutions',
  '+1234567891',
  'Quarterly review meeting with the client',
  NOW() + INTERVAL '1 day',
  'Client Office',
  false,
  'scheduled'
),
(
  'Field Visit',
  'Mike Johnson',
  'Construction Co',
  '+1234567892',
  'On-site inspection and progress review',
  NOW() - INTERVAL '2 hours',
  'Construction Site',
  true,
  'completed'
);
`,
  })
}
