import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas que NO debemos proteger ni tocar dentro de /admin
  const isAdminLogin = pathname === "/admin/login";
  const isAdminStatic =
    pathname.startsWith("/admin/_next/") ||
    pathname.startsWith("/admin/assets/") ||
    pathname === "/favicon.ico";

  // Solo protegemos /admin/**
  if (pathname.startsWith("/admin")) {
    // Siempre permitir login y estáticos
    if (isAdminLogin || isAdminStatic) {
      return NextResponse.next();
    }

    // Buscar cookie de sesión
    const cookie = request.cookies.get("admin_session");
    if (!cookie) {
      // Sin sesión -> login
      const url = new URL("/admin/login", request.url);
      return NextResponse.redirect(url);
    }

    try {
      // La cookie está URL-encoded
      const decoded = decodeURIComponent(cookie.value);
      const session = JSON.parse(decoded) as {
        name: string;
        email: string;
        expiresAt: string;
      };

      const now = Date.now();
      const exp = Date.parse(session.expiresAt);

      if (!exp || now > exp) {
        // Expirada o inválida -> limpiar y redirigir
        const res = NextResponse.redirect(new URL("/admin/login", request.url));
        res.cookies.delete("admin_session");
        return res;
      }

      // Sesión OK -> continuar
      return NextResponse.next();
    } catch {
      // Cookie malformada -> limpiar y redirigir
      const res = NextResponse.redirect(new URL("/admin/login", request.url));
      res.cookies.delete("admin_session");
      return res;
    }
  }

  // Fuera de /admin no hacemos nada
  return NextResponse.next();
}

// Importante: NO incluir /api/** en el matcher
export const config = {
  matcher: ["/admin/:path*"],
};
