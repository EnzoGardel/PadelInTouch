"use server";

import { createClient } from "@supabase/supabase-js";

export interface ReservationData {
  courtId: string;      // ✅ UUID
  date: string;         // "YYYY-MM-DD" (hora local)
  startTime: string;    // "HH:mm" (local)
  endTime: string;      // "HH:mm" (local)
  userDetails: { fullName: string; email?: string; phone: string };
  totalAmount?: number;
  notes?: string;
}


function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

/**
 * Crea o actualiza usuario por email y devuelve su id
 */
async function upsertUserByEmail(user: ReservationData["userDetails"]) {
  const supabase = getClient();

  // buscar usuario
  const { data: existing, error: err1 } = await supabase
    .from("User")
    .select("id")
    .eq("email", user.email)
    .maybeSingle();

  if (err1) throw err1;

  if (existing) {
    await supabase.from("User").update({
      fullName: user.fullName,
      phone: user.phone
    }).eq("id", existing.id);
    return existing.id;
  }

  const newId = `u_${Math.random().toString(36).slice(2, 10)}`;
  const { error: err2 } = await supabase.from("User").insert([{
    id: newId,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    isAdmin: false
  }]);

  if (err2) throw err2;
  return newId;
}

/**
 * Crea una reserva (usa RPC para control anti-solapamiento si lo tenés en Postgres)
 */
export async function createReservation(reservationData: ReservationData) {
  const supabase = getClient();
  const { courtId, date, startTime, endTime, totalAmount, userDetails } = reservationData;

  try {
    const userId = await upsertUserByEmail(userDetails);

    // aquí lo ideal es tener una función RPC en Postgres que maneje lock & overlap
    // Ejemplo: create_booking_locked
    const { data, error } = await supabase.rpc("create_booking_locked", {
      p_user_id: userId,
      p_court_id: courtId,
      p_date: date,
      p_start_time: startTime,
      p_end_time: endTime,
      p_total_amount: totalAmount ?? null,
      p_notes: "Creada desde web"
    });

    if (error) {
      console.error(error);
      return { success: false, error: error.message } as const;
    }

    return { success: true, reservationId: data?.reservation_id } as const;
  } catch (e: any) {
    console.error("Error creando reserva:", e);
    return { success: false, error: e.message ?? "Error al crear la reserva" } as const;
  }
}
