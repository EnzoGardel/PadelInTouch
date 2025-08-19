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
    const [[today]]: any = await conn.query(
      `SELECT COUNT(*) AS n FROM Reservation WHERE DATE(reservationDate)=CURDATE()`
    )
    const [[rev]]: any = await conn.query(
      `SELECT COALESCE(SUM(totalAmount),0) AS total FROM Reservation WHERE paymentStatus='completed'`
    )
    const [[pend]]: any = await conn.query(
      `SELECT COUNT(*) AS n FROM Reservation WHERE paymentStatus='pending'`
    )
    const [[active]]: any = await conn.query(
      `SELECT COUNT(DISTINCT userId) AS n FROM Reservation WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
    )

    return NextResponse.json({
      todayReservations: Number(today?.n || 0),
      totalRevenue: Number(rev?.total || 0),
      pendingPayments: Number(pend?.n || 0),
      activeUsers: Number(active?.n || 0),
    })
  } finally {
    await conn.end()
  }
}
