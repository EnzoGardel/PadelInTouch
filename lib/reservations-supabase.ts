"use server";

import { createClient } from "@supabase/supabase-js";

/** =========================
 *  Tipos
 *  ========================= */
export interface ReservationData {
  courtId: string;      // UUID de la cancha (flujo con cancha explícita)
  date: string;         // "YYYY-MM-DD" (local)
  startTime: string;    // "HH:mm" (local)
  endTime: string;      // "HH:mm" (local)
  userDetails: { fullName: string; email?: string; phone: string };
  totalAmount?: number;
  notes?: string;
}

export interface ReservationAutoData {
  branchId: string;                         // UUID de la sucursal
  date: string;                             // "YYYY-MM-DD" (local)
  startTime: string;                        // "HH:mm" (local)
  userDetails: { fullName: string; email?: string; phone: string };
  totalAmount?: number;
}

/** =========================
 *  Supabase (service role)
 *  ========================= */
function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // SOLO server
  if (!url || !key) {
    throw new Error("Faltan envs: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key);
}

/** =========================
 *  Upsert en customers
 *  ========================= */
async function upsertCustomer(user: ReservationData["userDetails"] | ReservationAutoData["userDetails"]) {
  const supabase = getClient();

  // Si no hay email, creamos igual un registro minimal (no unique)
  if (!user.email) {
    const { data, error } = await supabase
      .from("customers")
      .insert([{ full_name: user.fullName, phone: user.phone }])
      .select("id")
      .single();
    if (error) throw error;
    return data.id as string;
  }

  // Con email: upsert por email
  const { data, error } = await supabase
    .from("customers")
    .upsert(
      [{ full_name: user.fullName, email: user.email, phone: user.phone }],
      { onConflict: "email" }
    )
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

/** ==========================================================
 *  createReservation (flujo antiguo con cancha explícita)
 *  ========================================================== */
export async function createReservation(reservationData: ReservationData) {
  const supabase = getClient();
  const { courtId, date, startTime, endTime, totalAmount, userDetails } = reservationData;

  try {
    const customerId = await upsertCustomer(userDetails);

    // Si tenés un RPC que valida solapamientos por cancha, usalo aquí.
    // Ajustá el nombre/params si tu función se llama distinto.
    const { data, error } = await supabase.rpc("create_booking_locked", {
      p_customer_id: customerId,   // ← ajusta el nombre del param en tu RPC
      p_court_id: courtId,
      p_date: date,
      p_start_time: startTime,
      p_end_time: endTime,
      p_total_amount: totalAmount ?? null,
      p_notes: "Creada desde web",
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

/** ==========================================================
 *  createReservationAuto (asignación automática por sucursal)
 *  ==========================================================
 *  RPC esperado:
 *  CREATE OR REPLACE FUNCTION public.create_booking_auto(
 *    in_branch_id uuid,
 *    in_start_local timestamp,
 *    in_price numeric
 *  ) RETURNS bigint ...
 */
export async function createReservationAuto(data: ReservationAutoData) {
  try {
    const supabase = getClient();
    const { branchId, date, startTime, totalAmount, userDetails } = data;

    // Guardamos/actualizamos cliente (no detiene la reserva si falla)
    let customerId: string | null = null;
    try {
      customerId = await upsertCustomer(userDetails);
    } catch (e) {
      console.warn("[upsertCustomer] no crítico:", e);
    }

    const in_branch_id = Number(branchId); // 👈 bigint
    const startLocal = `${date} ${startTime}`;

    console.log("[RPC] create_booking_auto params:", {
      in_branch_id: branchId,
      in_start_local: startLocal,
      in_price: totalAmount ?? 0,
      customerId,
    });

    const { data: rpc, error } = await supabase.rpc("create_booking_auto", {
      in_branch_id,
      in_start_local: startLocal,
      in_price: totalAmount ?? 0,
    });

    if (error) {
      console.error("[RPC] create_booking_auto error:", error);
      const msg = error.message?.includes("no_available_court")
        ? "No hay disponibilidad para ese horario."
        : error.message || "Error al crear la reserva";
      return { success: false, error: msg } as const;
    }

    console.log("[RPC] create_booking_auto ok:", rpc);
    return { success: true, reservationId: rpc as number } as const;
  } catch (e: any) {
    console.error("[createReservationAuto] crash:", e);
    return { success: false, error: e?.message ?? "Error interno" } as const;
  }
}
