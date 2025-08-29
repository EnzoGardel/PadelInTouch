// ruta: app/api/availability/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { createStaticClient } from "@/lib/supabase/server";
import { parseISO, format } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";

const ARG_TZ = "America/Argentina/Cordoba";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get("clubId"); // = branch_id
    const date = searchParams.get("date");     // YYYY-MM-DD

    if (!clubId || !date) {
      return NextResponse.json(
        { error: "Missing required parameters: clubId, date" },
        { status: 400 }
      );
    }

    // ✅ Cliente ESTÁTICO: no usa cookies ni next/headers
    const supabase = createStaticClient();

    const { data, error } = await supabase.rpc("get_branch_availability", {
      p_branch_id: Number(clubId),
      p_date: date,
    });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch availability" },
        { status: 500 }
      );
    }

    // Normalizamos para el front (start/end en HH:mm)
    const slots = (data ?? []).map((slot: any) => {
      const start = format(
        utcToZonedTime(parseISO(slot.start_utc), ARG_TZ),
        "HH:mm"
      );
      const end = format(
        utcToZonedTime(parseISO(slot.end_utc), ARG_TZ),
        "HH:mm"
      );
      return {
        id: `${slot.start_utc}|${slot.end_utc}`,
        startTime: start,
        endTime: end,
        startUtc: slot.start_utc,
        endUtc: slot.end_utc,
        available: slot.available,
      };
    });

    // Cache corto en CDN, con SWR (ajustá si querés)
    const headers = {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
    };

    return NextResponse.json({ slots }, { headers });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
