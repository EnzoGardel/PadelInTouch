// app/api/reservations/route.ts
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(req: Request) {
  const body = await req.json();
  const { userId, courtId, reservationDate, startTime, endTime, totalAmount, notes } = body;

  if (!userId || !courtId || !reservationDate || !startTime || !endTime) {
    return NextResponse.json({ ok: false, error: 'Faltan campos' }, { status: 400 });
  }

  const url = new URL(process.env.DATABASE_URL!);
  const conn = await mysql.createConnection({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
  });

  const lockKey = `court_${courtId}`;
  try {
    await conn.query('SELECT GET_LOCK(?, 5);', [lockKey]);
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `
      SELECT id FROM Reservation
      WHERE courtId = ?
        AND DATE(reservationDate) = DATE(?)
        AND STR_TO_DATE(CONCAT(DATE(reservationDate), ' ', ?, ':00'), '%Y-%m-%d %H:%i:%s') < endDt
        AND STR_TO_DATE(CONCAT(DATE(reservationDate), ' ', ?, ':00'), '%Y-%m-%d %H:%i:%s') > startDt
      LIMIT 1
      FOR UPDATE
      `,
      [courtId, reservationDate, endTime, startTime]
    );

    // @ts-ignore
    if (rows.length > 0) {
      await conn.rollback();
      return NextResponse.json({ ok: false, error: 'El horario se superpone con otra reserva.' }, { status: 409 });
    }

    await conn.query(
      `
      INSERT INTO Reservation
        (userId, courtId, reservationDate, startTime, endTime, totalAmount, notes, status, paymentStatus)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')
      `,
      [userId, courtId, reservationDate, startTime, endTime, totalAmount ?? null, notes ?? null]
    );

    await conn.commit();
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: any) {
    try { await conn.rollback(); } catch {}
    const msg = e?.message || String(e);
    if (msg.includes('uq_res_exact')) {
      return NextResponse.json({ ok: false, error: 'Ese turno ya fue tomado.' }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  } finally {
    try { await conn.query('SELECT RELEASE_LOCK(?)', [lockKey]); } catch {}
    await conn.end();
  }
}
