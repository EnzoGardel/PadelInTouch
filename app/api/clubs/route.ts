// ruta: app/api/clubs/route.ts
import { NextResponse } from "next/server";
import { createStaticClient } from "@/lib/supabase/server";

// ✅ Versión estática: NO usa cookies, apta para SSG/ISR
export async function GET() {
  try {
    const supabase = createStaticClient();

    const { data, error } = await supabase
      .from("branches")
      .select("id, name, address, phone, image_url, created_at")
      .order("name", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch branches" },
        { status: 500 }
      );
    }

    // Normalizamos las llaves para el front (usa image_url)
    const clubs = (data ?? []).map((b: any) => ({
      id: String(b.id),
      name: b.name,
      address: b.address ?? null,
      phone: b.phone ?? null,
      image_url: b.image_url ?? null,
      tz: "America/Argentina/Cordoba",
      created_at: b.created_at ?? new Date().toISOString(),
    }));

    // 🧠 Cache-Control para CDN: 1h + SWR
    const headers = {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=60",
    };

    return NextResponse.json({ clubs }, { headers });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
