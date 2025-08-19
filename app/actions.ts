"use server";

import mysql from "mysql2/promise";

export interface ReservationData {
  courtId: number;
  date: string;       // "YYYY-MM-DD"
  startTime: string;  // "HH:mm"
  endTime: string;    // "HH:mm"
  userDetails: {
    fullName: string;
    email: string;
    phone: string;
  };
  totalAmount: number;
}

function getConnUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL no está definido");
  return new URL(url);
}

async function getConn() {
  const u = getConnUrl();
  return mysql.createConnection({
    host: u.hostname,
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),
  });
}

/**
 * Crea (o actualiza) el usuario por email y devuelve su id.
 */
async function upsertUserByEmail(conn: mysql.Connection, user: ReservationData["userDetails"]) {
  // ¿existe?
  const [rows] = await conn.query(
    "SELECT id FROM User WHERE email = ? LIMIT 1",
    [user.email]
  ) as any;

  if (rows.length) {
    const id = rows[0].id as string;
    await conn.query(
      "UPDATE User SET fullName = ?, phone = ? WHERE id = ?",
      [user.fullName, user.phone, id]
    );
    return id;
  }

  // crear (usa un id string; si usás auth propio reemplazá por ese id)
  const newId = `u_${Math.random().toString(36).slice(2, 10)}`;
  await conn.query(
    "INSERT INTO User (id, email, fullName, phone, isAdmin) VALUES (?, ?, ?, ?, 0)",
    [newId, user.email, user.fullName, user.phone]
  );
  return newId;
}

/**
 * Crea reserva con control anti-solapamiento (lock por cancha + transacción).
 */
export async function createReservation(reservationData: ReservationData) {
  const conn = await getConn();
  const { courtId, date, startTime, endTime, totalAmount, userDetails } = reservationData;
  const lockKey = `court_${courtId}`;

  try {
    // lock exclusivo por cancha (espera máx 5s)
    await conn.query("SELECT GET_LOCK(?, 5)", [lockKey]);
    await conn.beginTransaction();

    const userId = await upsertUserByEmail(conn, userDetails);

    // ¿hay solapamiento?
    const [overlap] = await conn.query(
      `
      SELECT id FROM Reservation
      WHERE courtId = ?
        AND DATE(reservationDate) = DATE(?)
        AND STR_TO_DATE(CONCAT(DATE(reservationDate), ' ', ?, ':00'), '%Y-%m-%d %H:%i:%s') < endDt
        AND STR_TO_DATE(CONCAT(DATE(reservationDate), ' ', ?, ':00'), '%Y-%m-%d %H:%i:%s') > startDt
      LIMIT 1
      FOR UPDATE
      `,
      [courtId, date, endTime, startTime]
    ) as any;

    if (overlap.length > 0) {
      await conn.rollback();
      return { success: false, error: "El horario se superpone con otra reserva." } as const;
    }

    // insertar
    const [res] = await conn.query(
      `
      INSERT INTO Reservation
        (userId, courtId, reservationDate, startTime, endTime, totalAmount, notes, status, paymentStatus)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')
      `,
      [userId, courtId, date, startTime, endTime, totalAmount ?? null, "Creada desde web"]
    ) as any;

    await conn.commit();
    return { success: true, reservationId: res.insertId as number } as const;
  } catch (error) {
    try { await conn.rollback(); } catch {}
    console.error("Error creating reservation:", error);
    // Unique de slot exacto (por si chocó por el @@unique)
    const msg = (error as any)?.message || "";
    if (msg.includes("uq_res_exact")) {
      return { success: false, error: "Ese turno ya fue tomado." } as const;
    }
    return { success: false, error: "Error al crear la reserva" } as const;
  } finally {
    try { await conn.query("SELECT RELEASE_LOCK(?)", [lockKey]); } catch {}
    await conn.end();
  }
}

/**
 * Actualiza el estado de pago de una reserva.
 * Nota: En tu esquema no hay columna payment_method en Reservation.
 * Si querés registrar método, creá una fila en Payment; por ahora solo status.
 */
export async function updatePaymentStatus(
  reservationId: number,
  _paymentMethod: string, // ignorado por ahora
  status: "paid" | "pending" | "refunded" | string
) {
  const conn = await getConn();
  try {
    const newPayment = status === "paid" ? "paid" : status; // normalizar
    const newStatus = status === "paid" ? "confirmed" : status === "refunded" ? "cancelled" : "pending";

    await conn.query(
      "UPDATE Reservation SET paymentStatus = ?, status = ? WHERE id = ?",
      [newPayment, newStatus, reservationId]
    );
    return { success: true } as const;
  } catch (error) {
    console.error("Error updating payment status:", error);
    return { success: false, error: "Error al actualizar el pago" } as const;
  } finally {
    await conn.end();
  }
}

/**
 * Actualiza el estado de la reserva (confirmed | pending | cancelled).
 */
export async function updateReservationStatus(reservationId: number, status: string) {
  const conn = await getConn();
  try {
    await conn.query("UPDATE Reservation SET status = ? WHERE id = ?", [status, reservationId]);
    return { success: true } as const;
  } catch (error) {
    console.error("Error updating reservation status:", error);
    return { success: false, error: "Error al actualizar el estado de la reserva" } as const;
  } finally {
    await conn.end();
  }
}

/**
 * Versión "admin" para tocar solo el paymentStatus y derivar estado general.
 */
export async function updateAdminPaymentStatus(
  reservationId: number,
  paymentStatus: "paid" | "pending" | "refunded" | string
) {
  const conn = await getConn();
  try {
    const newStatus = paymentStatus === "paid" ? "confirmed" : paymentStatus === "refunded" ? "cancelled" : "pending";
    await conn.query(
      "UPDATE Reservation SET paymentStatus = ?, status = ? WHERE id = ?",
      [paymentStatus, newStatus, reservationId]
    );
    return { success: true } as const;
  } catch (error) {
    console.error("Error updating payment status:", error);
    return { success: false, error: "Error al actualizar el estado del pago" } as const;
  } finally {
    await conn.end();
  }
}
