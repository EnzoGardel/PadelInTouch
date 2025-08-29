import { format, parseISO } from "date-fns"
import { toZonedTime } from "date-fns-tz"

const ARGENTINA_TZ = "America/Argentina/Cordoba"

export function formatTimeSlot(startUtc: string, endUtc: string): string {
  const startLocal = toZonedTime(parseISO(startUtc), ARGENTINA_TZ)
  const endLocal = toZonedTime(parseISO(endUtc), ARGENTINA_TZ)

  return `${format(startLocal, "HH:mm")} - ${format(endLocal, "HH:mm")}`
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

export function parseDate(dateString: string): Date {
  return parseISO(dateString)
}
