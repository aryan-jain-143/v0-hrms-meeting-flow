import { createServerSupabaseClient } from "./supabase-server"

export async function initializeDatabase() {
  const supabase = createServerSupabaseClient()

  try {
    // Check if the meetings table exists by trying to select from it
    const { error: checkError } = await supabase.from("meetings").select("id").limit(1)

    // If we get a specific error about the relation not existing, the table needs to be created
    if (checkError && checkError.message.includes("relation") && checkError.message.includes("does not exist")) {
      console.log("Meetings table does not exist. Please create it manually.")
      return {
        success: false,
        error: "Database table not found. Please run the SQL script to create the meetings table.",
        needsManualSetup: true,
      }
    }

    // If there's any other error, return it
    if (checkError) {
      console.error("Error checking meetings table:", checkError)
      return { success: false, error: checkError.message }
    }

    return { success: true, message: "Database already initialized" }
  } catch (error) {
    console.error("Error initializing database:", error)
    return { success: false, error }
  }
}
