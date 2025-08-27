import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "canchas";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("branches")
    .select("id, name, address, phone, image_url, created_at")
    .order("name", { ascending: true });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 });
  }

  const clubs = (data ?? []).map((b: any) => {
    let imageUrl: string | null = b.image_url ?? null;

    // si viene solo el nombre del archivo, lo convierto a URL pública del CDN
    if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(imageUrl);
      imageUrl = pub.publicUrl;
    }

    return {
      id: String(b.id),
      name: b.name,
      address: b.address ?? null,
      phone: b.phone ?? null,
      imageUrl,
      tz: "America/Argentina/Cordoba",
      created_at: b.created_at ?? new Date().toISOString(),
    };
  });

  return NextResponse.json({ clubs });
}
