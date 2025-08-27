import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clubId = searchParams.get("clubId")

    if (!clubId) {
      return NextResponse.json({ error: "Missing clubId parameter" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: courts, error } = await supabase
      .from("courts")
      .select("*")
      .eq("club_id", clubId)
      .order("name", { ascending: true })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch courts" }, { status: 500 })
    }

    return NextResponse.json({ courts })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
