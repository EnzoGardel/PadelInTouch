// app/api/reservations/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

/**
 * Cliente Supabase con Service Role (solo en servidor)
 */
function getSupabaseSR() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  return createClient(url, key);
}

/**
 * Espera el mismo body que la versión MySQL:
 * { userId, courtId, reservationDate, startTime, endTime, totalAmount, notes }
 * - reservationDate: "YYYY-MM-DD" (local)
 * - startTime/endTime: "HH:mm" (local)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId, // (si no lo usás, lo ignoramos)
      courtId,
      reservationDate,
      startTime,
      endTime,
      totalAmount,
      notes,
    } = body ?? {};

    if (!courtId || !reservationDate || !startTime || !endTime) {
      return NextResponse.json(
        { ok: false, error: "Faltan campos" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseSR();

    /**
     * RECOMENDADO: RPC que encapsula la lógica de lock + validación de solapamiento en DB.
     * Ajusta el nombre/params si tu función se llama distinto.
     *
     * Ejemplo esperado en PostgreSQL:
     *
     *  create or replace function public.create_booking_locked(
     *    p_court_id bigint,
     *    p_date date,
     *    p_start_time text, -- "HH:mm"
     *    p_end_time   text, -- "HH:mm"
     *    p_total_amount numeric,
     *    p_notes text
     *  ) returns table (reservation_id bigint) ...
     *
     */
    const { data, error } = await supabase.rpc("create_booking_locked", {
      p_court_id: Number(courtId),
      p_date: reservationDate,
      p_start_time: startTime,
      p_end_time: endTime,
      p_total_amount: totalAmount ?? null,
      p_notes: notes ?? null,
    });

    if (error) {
      const msg = error.message || "";
      // Mensajes más amigables para conflictos de agenda
      if (
        msg.includes("bookings_no_overlap") ||
        msg.includes("no_available_court") ||
        error.code === "23P01" // exclusion_violation
      ) {
        return NextResponse.json(
          { ok: false, error: "El horario se superpone con otra reserva." },
          { status: 409 }
        );
      }
      console.error("[reservations POST] RPC error:", error);
      return NextResponse.json(
        { ok: false, error: "Error al crear la reserva" },
        { status: 500 }
      );
    }

    const reservationId =
      (data as any)?.reservation_id ?? (typeof data === "number" ? data : null);

    if (!reservationId) {
      // Si tu RPC devuelve shape distinto, ajustá acá.
      return NextResponse.json(
        { ok: false, error: "No se pudo obtener el ID de la reserva" },
        { status: 500 }
      );
    }

    // Opcional: si querés persistir userId/notas extra en otra tabla, hacelo aquí.

    return NextResponse.json({ ok: true, reservationId }, { status: 201 });
  } catch (e: any) {
    console.error("[reservations POST] crash:", e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Error interno" },
      { status: 500 }
    );
  }
}
