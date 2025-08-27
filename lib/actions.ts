"use server";

import { createClient } from "@supabase/supabase-js";

/**
 * ===== Tipos compatibles con tu código actual =====
 * (dejamos la firma tal cual para no romper llamados existentes)
 */
export interface ReservationData {
  courtId: number;   // ID de la cancha (bigint en DB)
  date: string;      // "YYYY-MM-DD" (hora local)
  startTime: string; // "HH:mm" (hora local)
  endTime: string;   // "HH:mm" (hora local)
  userDetails: {
    fullName: string;
    email: string;
    phone: string;
  };
  totalAmount: number;
}

/**
 * ===== Supabase (Service Role - solo server) =====
 */
function getSupabaseSR() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Faltan variables de entorno de Supabase (NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY)"
    );
  }
  return createClient(url, key);
}

/**
 * Crea/actualiza un customer por email y devuelve su id (si la tabla existe).
 * Si la tabla no existe, no bloquea el flujo.
 */
async function upsertCustomer(user: ReservationData["userDetails"]) {
  const supabase = getSupabaseSR();

  // Si no hay email, no intentamos upsert.
  if (!user.email) return null;

  // Si la tabla customers no existe en tu proyecto, este upsert puede fallar:
  // lo atrapamos y seguimos (no bloquea crear la reserva).
  try {
    const { data, error } = await supabase
      .from("customers")
      .upsert(
        [{ full_name: user.fullName, email: user.email, phone: user.phone }],
        { onConflict: "email" }
      )
      .select("id")
      .single();

    if (error) throw error;
    return data?.id ?? null;
  } catch (_e) {
    // Tabla no existe o no expuesta; seguimos sin customerId.
    return null;
  }
}

/**
 * Crea reserva con cancha explícita.
 * - Opción recomendada: usar un RPC que haga el control anti-solapamiento con bloqueo.
 *   Espera una función: create_booking_locked(p_court_id bigint, p_date date, p_start_time text, p_end_time text, p_total_amount numeric, p_notes text)
 *   y retorne { reservation_id bigint } o similar.
 * - Alternativa (comentada): INSERT directo con constraint de exclusión en DB.
 */
export async function createReservation(reservationData: ReservationData) {
  const supabase = getSupabaseSR();
  const { courtId, date, startTime, endTime, totalAmount, userDetails } = reservationData;

  try {
    // No bloquea si falla
    await upsertCustomer(userDetails);

    // ====== OPCIÓN A: RPC recomendado (si ya lo tenés en tu DB) ======
    const { data, error } = await supabase.rpc("create_booking_locked", {
      p_court_id: courtId,
      p_date: date,
      p_start_time: startTime,
      p_end_time: endTime,
      p_total_amount: totalAmount ?? null,
      p_notes: "Creada desde web",
    });

    if (error) {
      // Mensajes amigables según códigos comunes
      const msg = error.message || "";
      if (
        msg.includes("no_available_court") ||
        msg.includes("bookings_no_overlap") ||
        error.code === "23P01" // exclusion_violation
      ) {
        return { success: false, error: "El horario se superpone con otra reserva." } as const;
      }
      console.error("[createReservation] RPC error:", error);
      return { success: false, error: "Error al crear la reserva" } as const;
    }

    // Si tu RPC devuelve { reservation_id: number }:
    const reservationId =
      (data as any)?.reservation_id ?? (typeof data === "number" ? data : null);

    if (!reservationId) {
      return { success: false, error: "No se pudo obtener el ID de la reserva" } as const;
    }

    return { success: true, reservationId } as const;

    // ====== OPCIÓN B: INSERT directo (si no usás RPC) ======
    // NOTA: requiere que la tabla bookings tenga un constraint de exclusión
    // para evitar solapamientos (por court_id + tstzrange(start_time, end_time)).
    //
    // const startLocal = `${date} ${startTime}`;
    // const endLocal = `${date} ${endTime}`;
    //
    // const { data: inserted, error: insErr } = await supabase
    //   .from("bookings")
    //   .insert({
    //     court_id: courtId,
    //     // convertir local a UTC en el lado de la DB con zone fija
    //     start_time: supabase.rpc(
    //       "to_utc_from_local",
    //       { in_local: startLocal, in_tz: "America/Argentina/Cordoba" }
    //     ),
    //     end_time: supabase.rpc(
    //       "to_utc_from_local",
    //       { in_local: endLocal, in_tz: "America/Argentina/Cordoba" }
    //     ),
    //     price: totalAmount ?? null,
    //     status: "booked",
    //     payment_status: "pending",
    //   })
    //   .select("id")
    //   .single();
    //
    // if (insErr) {
    //   const m = insErr.message || "";
    //   if (m.includes("bookings_no_overlap") || insErr.code === "23P01") {
    //     return { success: false, error: "El horario se superpone con otra reserva." } as const;
    //   }
    //   console.error("[createReservation] INSERT error:", insErr);
    //   return { success: false, error: "Error al crear la reserva" } as const;
    // }
    //
    // return { success: true, reservationId: inserted!.id as number } as const;
  } catch (e) {
    console.error("[createReservation] crash:", e);
    return { success: false, error: "Error al crear la reserva" } as const;
  }
}

/**
 * Actualiza el estado de pago de una reserva en bookings.
 * - status: 'paid' | 'pending' | 'refunded' | …
 * - Mapea booking.status para que quede coherente (confirmed/cancelled/pending).
 */
export async function updatePaymentStatus(
  reservationId: number,
  _paymentMethod: string, // ignorado por ahora (si necesitás, guardalo en payments)
  status: "paid" | "pending" | "refunded" | string
) {
  const supabase = getSupabaseSR();
  try {
    const newPayment = status === "paid" ? "paid" : status;
    const newStatus =
      status === "paid" ? "confirmed" : status === "refunded" ? "cancelled" : "pending";

    const { error } = await supabase
      .from("bookings")
      .update({ payment_status: newPayment, status: newStatus })
      .eq("id", reservationId);

    if (error) throw error;
    return { success: true } as const;
  } catch (e) {
    console.error("[updatePaymentStatus] error:", e);
    return { success: false, error: "Error al actualizar el pago" } as const;
  }
}

/**
 * Actualiza el estado general de la reserva (confirmed | pending | cancelled).
 */
export async function updateReservationStatus(reservationId: number, status: string) {
  const supabase = getSupabaseSR();
  try {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", reservationId);

    if (error) throw error;
    return { success: true } as const;
  } catch (e) {
    console.error("[updateReservationStatus] error:", e);
    return { success: false, error: "Error al actualizar el estado de la reserva" } as const;
  }
}

/**
 * Versión "admin" para tocar solo payment_status y derivar estado general.
 */
export async function updateAdminPaymentStatus(
  reservationId: number,
  paymentStatus: "paid" | "pending" | "refunded" | string
) {
  const supabase = getSupabaseSR();
  try {
    const newStatus =
      paymentStatus === "paid" ? "confirmed" : paymentStatus === "refunded" ? "cancelled" : "pending";

    const { error } = await supabase
      .from("bookings")
      .update({ payment_status: paymentStatus, status: newStatus })
      .eq("id", reservationId);

    if (error) throw error;
    return { success: true } as const;
  } catch (e) {
    console.error("[updateAdminPaymentStatus] error:", e);
    return { success: false, error: "Error al actualizar el estado del pago" } as const;
  }
}
