import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

export async function GET() {
  const url = new URL(process.env.DATABASE_URL!)
  const conn = await mysql.createConnection({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
  })
  try {
    const [rows] = await conn.query(`
      SELECT
        r.id,
        u.fullName  AS user_name,
        u.email     AS user_email,
        COALESCE(u.phone,'') AS user_phone,
        l.name      AS location_name,
        c.name      AS court_name,
        DATE(r.reservationDate) AS date,
        CONCAT(r.startTime,' - ',r.endTime) AS time_slot,
        r.status,
        COALESCE(r.totalAmount,0) AS total_amount,
        r.paymentStatus AS payment_status,
        r.createdAt AS created_at
      FROM Reservation r
      JOIN User u   ON r.userId = u.id
      JOIN Court c  ON r.courtId = c.id
      JOIN Location l ON c.locationId = l.id
      ORDER BY r.createdAt DESC
      LIMIT 10
    `)
    // @ts-ignore
    return NextResponse.json(rows)
  } finally {
    await conn.end()
  }
}
