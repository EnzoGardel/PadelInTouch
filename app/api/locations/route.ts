import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

function connFromEnv() {
  const u = new URL(process.env.DATABASE_URL!);
  return {
    host: u.hostname,
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),
  };
}

export async function GET() {
  let conn: mysql.Connection | null = null;
  try {
    conn = await mysql.createConnection(connFromEnv());

    const [rows] = await conn.query(
      `
      SELECT 
        l.id,
        l.name,
        l.address,
        l.phone,
        l.image,
        l.opening,              -- lo usamos como "hours"
        COUNT(c.id) AS courtsCount
      FROM Location l
      LEFT JOIN Court c ON c.locationId = l.id
      GROUP BY l.id, l.name, l.address, l.phone, l.image, l.opening
      ORDER BY l.id ASC
      `
    ) as any;

    const out = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      address: r.address ?? "",
      phone: r.phone ?? "",
      image: r.image ?? "",
      hours: r.opening ?? "",            // mapeamos opening -> hours
      courtsCount: Number(r.courtsCount) || 0,
    }));

    return NextResponse.json(out);
  } catch (e: any) {
    console.error("[GET /api/locations] error:", e?.message || e);
    return NextResponse.json({ error: "Error al cargar sedes" }, { status: 500 });
  } finally {
    try { await conn?.end(); } catch {}
  }
}