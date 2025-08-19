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

// Para Next 15: params viene como Promise
type Ctx = { params: Promise<{ id: string }> };

// GET /api/admin/reservations/:id  -> detalle (útil para editar)
export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const numId = Number(id);
  if (!numId) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  let conn: mysql.Connection | null = null;
  try {
    conn = await mysql.createConnection(connFromEnv());
    const [rows] = (await conn.query(
      `SELECT r.* FROM Reservation r WHERE r.id = ? LIMIT 1`,
      [numId]
    )) as any;
    if (!rows.length) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (e: any) {
    console.error("[GET /admin/reservations/:id]", e?.message || e);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  } finally {
    try { await conn?.end(); } catch {}
  }
}

// PUT /api/admin/reservations/:id  -> editar (parcial, con validación de solapamiento si cambia horario/cancha)
export async function PUT(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const numId = Number(id);
  if (!numId) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }

  // Campos que se pueden actualizar
  const {
    courtId,            // opcional
    reservationDate,    // opcional: YYYY-MM-DD
    startTime,          // opcional: HH:mm
    endTime,            // opcional: HH:mm
    totalAmount,        // opcional: number/null
    status,             // opcional: 'pending'|'confirmed'|'cancelled'
    paymentStatus,      // opcional: 'pending'|'completed'|'failed'|'refunded'
    notes,              // opcional: string|null
  } = body ?? {};

  // Si no vino ningún campo, nada que actualizar
  const someField =
    courtId !== undefined || reservationDate !== undefined || startTime !== undefined || endTime !== undefined ||
    totalAmount !== undefined || status !== undefined || paymentStatus !== undefined || notes !== undefined;

  if (!someField) {
    return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 });
  }

  let conn: mysql.Connection | null = null;
  let lockKey: string | null = null;

  try {
    conn = await mysql.createConnection(connFromEnv());
    await conn.beginTransaction();

    // Traemos la reserva actual y bloqueamos fila
    const [rows] = (await conn.query(
      `SELECT id, courtId, reservationDate, startTime, endTime
         FROM Reservation
        WHERE id = ?
        FOR UPDATE`,
      [numId]
    )) as any;

    if (!rows.length) {
      await conn.rollback();
      return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    }

    const current = rows[0] as {
      courtId: number;
      reservationDate: string; // fecha
      startTime: string;
      endTime: string;
    };

    // Calculamos los “nuevos” valores (si no vinieron, quedan los actuales)
    const nextCourtId        = courtId        !== undefined ? Number(courtId) : current.courtId;
    const nextReservationDate= reservationDate!== undefined ? reservationDate  : current.reservationDate;
    const nextStartTime      = startTime      !== undefined ? startTime        : current.startTime;
    const nextEndTime        = endTime        !== undefined ? endTime          : current.endTime;

    // Si cambia horario/cancha/fecha, validar solapamiento
    const scheduleChanged =
      nextCourtId !== current.courtId ||
      nextReservationDate !== current.reservationDate ||
      nextStartTime !== current.startTime ||
      nextEndTime !== current.endTime;

    if (scheduleChanged) {
      lockKey = `court_${nextCourtId}`;
      await conn.query("SELECT GET_LOCK(?, 5)", [lockKey]);

      const [overlap] = (await conn.query(
        `
        SELECT id FROM Reservation
         WHERE courtId = ?
           AND DATE(reservationDate) = DATE(?)
           AND id <> ?
           AND STR_TO_DATE(CONCAT(DATE(reservationDate), ' ', ?, ':00'), '%Y-%m-%d %H:%i:%s') < endDt
           AND STR_TO_DATE(CONCAT(DATE(reservationDate), ' ', ?, ':00'), '%Y-%m-%d %H:%i:%s') > startDt
         LIMIT 1
         FOR UPDATE
        `,
        [nextCourtId, nextReservationDate, numId, nextEndTime, nextStartTime]
      )) as any;

      if (overlap.length) {
        await conn.rollback();
        try { if (lockKey) await conn.query("SELECT RELEASE_LOCK(?)", [lockKey]); } catch {}
        return NextResponse.json({ error: "El horario se superpone con otra reserva" }, { status: 409 });
      }
    }

    // Armamos UPDATE dinámico solo con los campos presentes
    const sets: string[] = [];
    const vals: any[] = [];

    // Si scheduleChanged o si el caller envió alguno de estos, actualizamos
    if (courtId !== undefined || scheduleChanged) { sets.push("courtId = ?"); vals.push(nextCourtId); }
    if (reservationDate !== undefined || scheduleChanged) { sets.push("reservationDate = ?"); vals.push(nextReservationDate); }
    if (startTime !== undefined || scheduleChanged) { sets.push("startTime = ?"); vals.push(nextStartTime); }
    if (endTime !== undefined || scheduleChanged) { sets.push("endTime = ?"); vals.push(nextEndTime); }

    if (totalAmount !== undefined) { sets.push("totalAmount = ?"); vals.push(totalAmount); }
    if (status !== undefined) { sets.push("status = ?"); vals.push(status); }
    if (paymentStatus !== undefined) { sets.push("paymentStatus = ?"); vals.push(paymentStatus); }
    if (notes !== undefined) { sets.push("notes = ?"); vals.push(notes); }

    if (!sets.length) {
      // No hubo nada realmente para actualizar
      await conn.commit();
      try { if (lockKey) await conn.query("SELECT RELEASE_LOCK(?)", [lockKey]); } catch {}
      return NextResponse.json({ ok: true });
    }

    const sql = `UPDATE Reservation SET ${sets.join(", ")} WHERE id = ?`;
    vals.push(numId);

    await conn.query(sql, vals);

    await conn.commit();
    try { if (lockKey) await conn.query("SELECT RELEASE_LOCK(?)", [lockKey]); } catch {}

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    try { await conn?.rollback(); } catch {}
    console.error("[PUT /admin/reservations/:id]", e?.message || e);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  } finally {
    try { if (lockKey) await conn?.query("SELECT RELEASE_LOCK(?)", [lockKey]); } catch {}
    try { await conn?.end(); } catch {}
  }
}

// DELETE /api/admin/reservations/:id  -> eliminar (borra de la DB)
export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const numId = Number(id);
  if (!numId) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  let conn: mysql.Connection | null = null;
  try {
    conn = await mysql.createConnection(connFromEnv());
    const [res] = (await conn.query(
      `DELETE FROM Reservation WHERE id = ?`,
      [numId]
    )) as any;

    if (res.affectedRows === 0) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[DELETE /admin/reservations/:id]", e?.message || e);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  } finally {
    try { await conn?.end(); } catch {}
  }
}
