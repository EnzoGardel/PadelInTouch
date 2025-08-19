import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET() {
  const url = new URL(process.env.DATABASE_URL!);
  const conn = await mysql.createConnection({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
  });

  try {
    const [rows] = await conn.query(`
      SELECT id, name, address, NULL AS phone
      FROM Location
      ORDER BY name
    `);
    // @ts-ignore
    return NextResponse.json(rows);
  } catch (e: any) {
    console.error("[/api/locations] error:", e?.message || e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  } finally {
    await conn.end();
  }
}
