import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { bookingFormSchema } from "@/lib/validation"
import { rateLimit, getRateLimitIdentifier } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    const identifier = getRateLimitIdentifier(request)
    if (!rateLimit(identifier, 5, 300000)) {
      // 5 requests per 5 minutes
      return NextResponse.json({ error: "Demasiadas solicitudes. Intentá de nuevo en unos minutos." }, { status: 429 })
    }

    const body = await request.json()

    // Validate the request body
    const validationResult = bookingFormSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ error: "Invalid form data", details: validationResult.error.errors }, { status: 400 })
    }

    const { slotId, name, phone, email, notes } = validationResult.data

    const supabase = await createClient()

    // Use the transactional function to create the booking
    const { data, error } = await supabase.rpc("create_booking_locked", {
      p_slot: slotId,
      p_name: name,
      p_phone: phone,
      p_email: email || null,
      p_notes: notes || null,
    })

    if (error) {
      console.error("Booking error:", error)

      if (error.message === "slot_not_found") {
        return NextResponse.json({ error: "El horario seleccionado no existe" }, { status: 404 })
      }

      if (error.message === "slot_unavailable") {
        return NextResponse.json({ error: "El horario seleccionado ya no está disponible" }, { status: 409 })
      }

      return NextResponse.json({ error: "Error al crear la reserva" }, { status: 500 })
    }

    return NextResponse.json({ bookingId: data }, { status: 201 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
