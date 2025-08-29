import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { contactFormSchema } from "@/lib/validation"
import { rateLimit, getRateLimitIdentifier } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    const identifier = getRateLimitIdentifier(request)
    if (!rateLimit(identifier, 3, 300000)) {
      // 3 requests per 5 minutes
      return NextResponse.json({ error: "Demasiadas solicitudes. Intentá de nuevo en unos minutos." }, { status: 429 })
    }

    const body = await request.json()

    // Validate the request body
    const validationResult = contactFormSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Datos del formulario inválidos", details: validationResult.error.issues },
        { status: 400 },
      )
    }

    const { name, email, phone, message } = validationResult.data

    const supabase = await createClient()

    // Insert the contact message
    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        name,
        email: email || null,
        phone: phone || null,
        message,
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Error al enviar el mensaje" }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        messageId: data.id,
        message: "Mensaje enviado correctamente",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
