import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

async function createPreference(amount: number, externalRef: string) {
  const resp = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN!}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [{ title: `Reserva pádel ${externalRef}`, quantity: 1, unit_price: amount, currency_id: "ARS" }],
      external_reference: externalRef,
      auto_return: "approved",
      back_urls: {
        success: `${process.env.PUBLIC_BASE_URL}/reserva/success?b=${externalRef}`,
        failure: `${process.env.PUBLIC_BASE_URL}/reserva/failure?b=${externalRef}`,
        pending: `${process.env.PUBLIC_BASE_URL}/reserva/pending?b=${externalRef}`,
      },
      notification_url: `${process.env.PUBLIC_BASE_URL}/api/mercado-pago-webhook`,
    }),
  })
  if (!resp.ok) throw new Error(await resp.text())
  return resp.json()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { branchId, startUtc, endUtc, name, phone, email, amount = 0 } = body

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // crear booking sin elegir cancha
    const { data: bookingId, error: rpcErr } = await supabase.rpc("create_booking_auto", {
      p_branch_id: Number(branchId),
      p_start: startUtc,
      p_end: endUtc,
      p_customer_name: name,
      p_customer_phone: phone,
      p_customer_email: email ?? null,
      p_price: amount,
      p_currency: "ARS",
    })
    if (rpcErr || !bookingId) return NextResponse.json({ error: rpcErr?.message ?? "No se pudo crear" }, { status: 400 })

    // preference MP
    const pref = await createPreference(Number(amount), String(bookingId))
    await supabase.from("bookings").update({ mp_preference_id: pref.id }).eq("id", bookingId)

    return NextResponse.json({ bookingId, init_point: pref.init_point || pref.sandbox_init_point }, { status: 201 })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
