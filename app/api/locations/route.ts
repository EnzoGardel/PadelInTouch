// ruta: app/api/locations/route.ts
import { NextResponse } from "next/server";
import { createStaticClient } from "@/lib/supabase/server";

// ✅ Versión estática (no cookies) y cacheable
export async function GET() {
  try {
    const supabase = createStaticClient();

    const { data, error } = await supabase
      .from("branches")
      .select("id, name, address, phone, image_url, created_at")
      .order("name", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
    }

    const locations = (data ?? []).map((b: any) => ({
      id: String(b.id),
      name: b.name,
      address: b.address ?? null,
      phone: b.phone ?? null,
      image_url: b.image_url ?? null, // <- consistente con el front
      tz: "America/Argentina/Cordoba",
      created_at: b.created_at ?? new Date().toISOString(),
    }));

    // CDN cache: 1h con SWR
    const headers = {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=60",
    };

    return NextResponse.json({ locations }, { headers });
  } catch (e) {
    console.error("API error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
