// ruta: lib/supabase/server.ts
import { cookies as nextCookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Adaptador mínimo de cookies que espera @supabase/ssr.
 * Solo lectura; NO escribimos cookies desde RSC/Edge.
 */
type CookieAdapter = {
  get: (name: string) => string | undefined;
  set: (name: string, value: string, options?: CookieOptions) => void;
  remove: (name: string, options?: CookieOptions) => void;
};

/**
 * Tipo compatible con lo que necesitamos de `cookies()`.
 * No dependemos de tipos internos de Next.
 */
type CookieStoreLike = {
  get: (name: string) => { value: string } | undefined;
};

function adapterFromStore(store?: CookieStoreLike): CookieAdapter {
  if (!store) {
    // ✅ Modo "estático": no hay cookies → no marca dinámico
    return { get: () => undefined, set: () => {}, remove: () => {} };
  }
  // ✅ Modo "dinámico": leemos cookies, pero no escribimos
  return {
    get: (name) => store.get(name)?.value,
    set: () => {},
    remove: () => {},
  };
}

/**
 * 🔹 Uso recomendado en páginas/route handlers DINÁMICOS:
 *    const supabase = createClient(cookies());
 */
export function createClient(store?: CookieStoreLike) {
  // Si no nos pasan store, intentamos obtenerlo de next/headers.
  // OJO: si llamás a esto durante el prerender SSG, podría marcar dinámico.
  // Para SSG/ISR preferí `createStaticClient()`.
  let resolved: CookieStoreLike | undefined = store;
  if (!resolved) {
    try {
      resolved = nextCookies();
    } catch {
      // En build/prerender no hay contexto de request → permanecemos estáticos
      resolved = undefined;
    }
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: adapterFromStore(resolved) }
  );
}

/**
 * 🔹 Uso en páginas SSG/ISR (prerender) o utilidades compartidas:
 *    const supabase = createStaticClient();
 *
 * No toca next/headers ni lee cookies → NO fuerza dinamismo.
 */
export function createStaticClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: adapterFromStore(undefined) }
  );
}

/**
 * (Opcional) Azúcar si querés pasar el store explícito.
 * Equivalente a createClient(store).
 */
export function createClientFromCookies(store: CookieStoreLike) {
  return createClient(store);
}
