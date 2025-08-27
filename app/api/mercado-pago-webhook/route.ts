import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const MP_API = "https://api.mercadopago.com/v1/payments";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// Extrae paymentId desde query (formato viejo) o body (formato nuevo)
async function extractPaymentId(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const id = url.searchParams.get("id");

  if (type === "payment" && id) return id;

  try {
    const body = await req.json().catch(() => null);
    // Ej nuevo: { action: 'payment.created', data: { id: '...' } }
    const pid = body?.data?.id || body?.resource?.split("/").pop();
    if (pid) return String(pid);
  } catch {
    /* noop */
  }
  return null;
}

// Trae el pago a MP para conocer status y external_reference (tu reservationId)
async function fetchPayment(paymentId: string) {
  const token = process.env.MP_ACCESS_TOKEN!;
  const res = await fetch(`${MP_API}/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "MP fetch error");
  return json; // tiene: status, status_detail, external_reference, transaction_amount, currency_id, etc.
}

async function upsertPaymentAndBooking(mp: any) {
  const supabase = getSupabase();

  const statusMap: Record<string, "pending" | "completed" | "failed"> = {
    approved: "completed",
    in_process: "pending",
    pending: "pending",
    rejected: "failed",
    cancelled: "failed",
    refunded: "failed",
    charged_back: "failed",
  };

  const bookingId = Number(mp.external_reference); // lo seteaste desde la preferencia
  const mapped = statusMap[mp.status as string] ?? "pending";

  // Guarda/actualiza en payments
  await supabase.from("payments").upsert(
    [{
      booking_id: bookingId,
      amount: mp.transaction_amount,
      payment_date: new Date().toISOString(),
      method: mp.payment_method_id,
      status: mapped,
      external_ref: mp.external_reference,
      mp_payment_id: String(mp.id),
      raw: mp,
    }],
    { onConflict: "mp_payment_id" } // evita duplicados si reintenta
  );

  // Si aprobado, marca la reserva como pagada
  if (mapped === "completed") {
    await supabase
      .from("bookings")
      .update({ payment_status: "paid" })
      .eq("id", bookingId);
  }
}

export async function GET(req: Request) {
  try {
    const paymentId = await extractPaymentId(req);
    if (!paymentId) return NextResponse.json({ ok: true }, { status: 200 });
    const mp = await fetchPayment(paymentId);
    await upsertPaymentAndBooking(mp);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error("[MP webhook GET] error:", e);
    // Igual respondemos 200 para que MP no reintente sin fin.
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const paymentId = await extractPaymentId(req);
    if (!paymentId) return NextResponse.json({ ok: true }, { status: 200 });
    const mp = await fetchPayment(paymentId);
    await upsertPaymentAndBooking(mp);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error("[MP webhook POST] error:", e);
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
