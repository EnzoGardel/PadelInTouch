/**
 * Supabase deshabilitado: stub para el lado del servidor (RSC/Route Handlers).
 * Si queda algún uso residual, preferí acceder a la DB vía Prisma o mysql2
 * desde tus rutas API.
 */

export const isSupabaseConfigured = false;

// Conservamos el nombre original para no romper imports existentes.
export function createClient(): never {
  throw new Error(
    "Supabase (server) está desactivado. Accedé a la base con Prisma/mysql2 en tus rutas API."
  );
}
