/**
 * Supabase deshabilitado: stub de cliente en el lado del navegador.
 * Si algún componente aún lo importa/usa, va a tirar un error explícito.
 *
 * Migración recomendada:
 * - Reemplazá cualquier uso de `supabase` / `createClient()` por fetch a tus
 *   endpoints internos (p.ej. /api/reservations, /api/courts, /api/availability).
 */

export const isSupabaseConfigured = false;

// Proxy que rompe en runtime si alguien intenta usar cualquier método/propiedad.
export const supabase: any = new Proxy(
  {},
  {
    get() {
      throw new Error(
        "Supabase está desactivado en este proyecto. Usá tu API interna (MySQL/Prisma) en su lugar."
      );
    },
  }
);

// Mantengo la firma para no romper imports existentes.
export function createClient(): never {
  throw new Error(
    "Supabase está desactivado en este proyecto. Usá tu API interna (MySQL/Prisma)."
  );
}
