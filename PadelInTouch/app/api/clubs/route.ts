import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: clubs, error } = await supabase.from("clubs").select("*").order("name", { ascending: true })

    if (error) {
      console.error("Database error:", error)
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        return NextResponse.json(
          {
            error: "Database not set up",
            message: "Please run the database setup scripts first",
            setupRequired: true,
          },
          { status: 503 },
        )
      }
      return NextResponse.json({ error: "Failed to fetch clubs" }, { status: 500 })
    }

    return NextResponse.json({ clubs })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
