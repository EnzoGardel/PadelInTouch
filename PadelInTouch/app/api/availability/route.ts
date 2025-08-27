import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { parseISO, format } from "date-fns"
import { utcToZonedTime } from "date-fns-tz"

const ARGENTINA_TZ = "America/Argentina/Cordoba"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clubId = searchParams.get("clubId")
    const courtId = searchParams.get("courtId")
    const date = searchParams.get("date") // YYYY-MM-DD format

    if (!clubId || !courtId || !date) {
      return NextResponse.json({ error: "Missing required parameters: clubId, courtId, date" }, { status: 400 })
    }

    // Validate date format
    try {
      parseISO(date)
    } catch {
      return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get available time slots for the specified date and court
    const startOfDay = `${date}T00:00:00-03:00` // Argentina timezone
    const endOfDay = `${date}T23:59:59-03:00`

    const { data: timeSlots, error } = await supabase
      .from("time_slots")
      .select("*")
      .eq("club_id", clubId)
      .eq("court_id", courtId)
      .eq("state", "available")
      .gte("start_utc", startOfDay)
      .lte("start_utc", endOfDay)
      .order("start_utc", { ascending: true })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 })
    }

    // Format the time slots for the frontend
    const formattedSlots = timeSlots.map((slot) => ({
      id: slot.id,
      startTime: format(utcToZonedTime(parseISO(slot.start_utc), ARGENTINA_TZ), "HH:mm"),
      endTime: format(utcToZonedTime(parseISO(slot.end_utc), ARGENTINA_TZ), "HH:mm"),
      price: slot.price,
      startUtc: slot.start_utc,
      endUtc: slot.end_utc,
    }))

    return NextResponse.json({ slots: formattedSlots })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
