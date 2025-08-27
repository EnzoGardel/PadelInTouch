import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

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
      imageUrl: b.image_url ?? null,
      tz: "America/Argentina/Cordoba",
      created_at: b.created_at ?? new Date().toISOString(),
    }));

    return NextResponse.json({ locations });
  } catch (e) {
    console.error("API error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
