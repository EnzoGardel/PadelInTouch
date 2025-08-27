"use server";

import { createClient } from "@/lib/supabase/server";
import { zonedTimeToUtc } from "date-fns-tz";

export interface ReservationData {
  courtId: string;       // UUID de la cancha (table: courts.id)
  date: string;          // "YYYY-MM-DD" en hora local AR
  startTime: string;     // "HH:mm" local
  endTime: string;       // "HH:mm" local
  userDetails: {
    fullName: string;
    email?: string;
    phone: string;
  };
  totalAmount?: number;  // opcional; el precio se toma del slot
  notes?: string;
}

/** Zona horaria del proyecto (coincide con la columna tz de clubs) */
const AR_TZ = "America/Argentina/Cordoba";

/** Convierte fecha+hora local -> Date UTC */
function localToUTC(date: string, time: string) {
  // Ej: "2025-08-21" + "19:30" -> Date(UTC)
  const localIso = `${date}T${time}:00.000`;
  return zonedTimeToUtc(localIso, AR_TZ);
}

/**
 * Crea una reserva usando la función RPC `create_booking_locked`.
 * - Busca el slot exacto por court_id + start_utc + end_utc
 * - Si no existe, devuelve error
 * - Si existe, llama a la función que bloquea y crea la reserva de forma atómica
 */
export async function createReservation(data: ReservationData) {
  const supabase = createClient();

  const startUtc = localToUTC(data.date, data.startTime).toISOString();
  const endUtc   = localToUTC(data.date, data.endTime).toISOString();

  // 1) Buscar el slot exacto
  const { data: slot, error: slotErr } = await supabase
    .from("time_slots")
    .select("id, price, state")
    .eq("court_id", data.courtId)
    .eq("start_utc", startUtc)
    .eq("end_utc", endUtc)
    .limit(1)
    .maybeSingle();

  if (slotErr) {
    console.error("DB error (time_slots):", slotErr);
    return { success: false as const, error: "Error buscando disponibilidad" };
  }
  if (!slot) {
    return { success: false as const, error: "No existe ese horario (slot)." };
  }
  if (slot.state !== "available") {
    return { success: false as const, error: "Ese horario ya no está disponible." };
  }

  // 2) Crear reserva con lock transaccional vía RPC
  const { data: rpcRes, error: rpcErr } = await supabase.rpc("create_booking_locked", {
    p_slot: slot.id,
    p_name: data.userDetails.fullName,
    p_phone: data.userDetails.phone,
    p_email: data.userDetails.email ?? null,
    p_notes: data.notes ?? "Creada desde web pública",
  });

  if (rpcErr) {
    // Mensajes custom que puede tirar la función: 'slot_not_found' | 'slot_unavailable'
    const msg = String(rpcErr.message || "");
    if (msg.includes("slot_unavailable")) {
      return { success: false as const, error: "Ese turno acaba de ocuparse." };
    }
    return { success: false as const, error: "Error al crear la reserva" };
  }

  // La función retorna el UUID del booking creado
  return { success: true as const, reservationId: rpcRes as string };
}

/**
 * Actualiza el estado general de la reserva (bookings.state)
 * allowed: 'pending' | 'confirmed' | 'cancelled'
 */
export async function updateReservationStatus(bookingId: string, status: "pending" | "confirmed" | "cancelled") {
  const supabase = createClient();
  const { error } = await supabase
    .from("bookings")
    .update({ state: status })
    .eq("id", bookingId);

  if (error) {
    console.error("DB error (updateReservationStatus):", error);
    return { success: false as const, error: "Error al actualizar el estado" };
  }
  return { success: true as const };
}

/**
 * (Opcional) Si agregás una columna payment_status en bookings:
 *   alter table public.bookings add column payment_status text default 'pending';
 *
 * Entonces podemos mantener estado de pago y derivar state:
 *   - paid     -> confirmed
 *   - refunded -> cancelled
 *   - pending  -> pending
 */
export async function updatePaymentStatus(
  bookingId: string,
  status: "paid" | "pending" | "refunded" | string
) {
  const supabase = createClient();

  // Si NO tenés la columna payment_status, comentá esta línea y dejá solo el update de state.
  const payment_status: string = status;

  const state =
    status === "paid" ? "confirmed" :
    status === "refunded" ? "cancelled" :
    "pending";

  const { error } = await supabase
    .from("bookings")
    .update({ state, /* payment_status */ })
    .eq("id", bookingId);

  if (error) {
    console.error("DB error (updatePaymentStatus):", error);
    return { success: false as const, error: "Error al actualizar el pago" };
  }
  return { success: true as const };
}

/**
 * Versión "admin": igual que arriba, pero dejando explícito payment_status (si existe).
 */
export async function updateAdminPaymentStatus(
  bookingId: string,
  paymentStatus: "paid" | "pending" | "refunded" | string
) {
  const supabase = createClient();

  const state =
    paymentStatus === "paid" ? "confirmed" :
    paymentStatus === "refunded" ? "cancelled" :
    "pending";

  const { error } = await supabase
    .from("bookings")
    .update({ state, /* payment_status: paymentStatus */ })
    .eq("id", bookingId);

  if (error) {
    console.error("DB error (updateAdminPaymentStatus):", error);
    return { success: false as const, error: "Error al actualizar el estado del pago" };
  }
  return { success: true as const };
}
