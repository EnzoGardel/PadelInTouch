import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId");

  const url = new URL(process.env.DATABASE_URL!);
  const conn = await mysql.createConnection({
    host: url.hostname, port: Number(url.port || 3306),
    user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
  });

  try {
    if (locationId) {
      const [rows] = await conn.query(
        "SELECT id, name, locationId FROM Court WHERE locationId = ? ORDER BY name",
        [Number(locationId)]
      );
      // @ts-ignore
      return NextResponse.json(rows);
    } else {
      const [rows] = await conn.query(
        "SELECT id, name, locationId FROM Court ORDER BY name"
      );
      // @ts-ignore
      return NextResponse.json(rows);
    }
  } finally {
    await conn.end();
  }
}
