-- Add user_id column to meetings table to associate meetings with users
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create index for user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON meetings(user_id);

-- Enable Row Level Security (RLS) on meetings table
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own meetings
CREATE POLICY "Users can view their own meetings" ON meetings
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own meetings
CREATE POLICY "Users can insert their own meetings" ON meetings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own meetings
CREATE POLICY "Users can update their own meetings" ON meetings
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own meetings
CREATE POLICY "Users can delete their own meetings" ON meetings
  FOR DELETE USING (auth.uid() = user_id);
