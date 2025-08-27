import { z } from "zod"

export const bookingFormSchema = z.object({
  slotId: z.string().uuid("ID de slot inválido"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  notes: z.string().optional(),
})

export const contactFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos").optional().or(z.literal("")),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
})

export type BookingFormData = z.infer<typeof bookingFormSchema>
export type ContactFormData = z.infer<typeof contactFormSchema>
