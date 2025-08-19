import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

function connFromEnv() {
  const u = new URL(process.env.DATABASE_URL!);
  return {
    host: u.hostname,
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),
  };
}

const COOKIE_NAME = "admin_session";
const SESSION_HOURS = 12;

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido (JSON requerido)" }, { status: 400 });
  }

  let { username, password } = body as { username?: string; password?: string };
  if (!username || !password) {
    return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 });
  }

  // normalizamos usuario
  username = String(username).trim().toLowerCase();

  let conn: mysql.Connection | null = null;
  try {
    conn = await mysql.createConnection(connFromEnv());
    const [rows] = (await conn.query(
      "SELECT id, username, password_hash, full_name, role, is_active FROM AdminUser WHERE username = ? LIMIT 1",
      [username]
    )) as any;

    if (!rows.length || !rows[0].is_active) {
      return NextResponse.json({ error: "Usuario o contraseña inválidos" }, { status: 401 });
    }

    const u = rows[0];
    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return NextResponse.json({ error: "Usuario o contraseña inválidos" }, { status: 401 });

    // Armar sesión
    const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);
    const session = {
      username: u.username,
      name: u.full_name,
      role: u.role,
      expiresAt: expiresAt.toISOString(),
    };

    const res = NextResponse.json({
      ok: true,
      user: { username: u.username, name: u.full_name, role: u.role },
    });

    res.cookies.set(COOKIE_NAME, encodeURIComponent(JSON.stringify(session)), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production", // en dev false
      expires: expiresAt,
      maxAge: SESSION_HOURS * 60 * 60, // por si el navegador ignora expires
    });

    return res;
  } catch (e: any) {
    console.error("[/api/admin/auth/login] error:", e?.message || e);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  } finally {
    try {
      await conn?.end();
    } catch {}
  }
}

/**
 * GET: devuelve la sesión actual (si existe) – útil para verificar login desde el cliente.
 */
export async function GET(req: Request) {
  // @ts-ignore - Next pasa cookies en headers
  const cookieHeader = (req.headers.get("cookie") || "").split(";").map((c) => c.trim());
  const raw = cookieHeader.find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!raw) return NextResponse.json({ loggedIn: false });

  try {
    const encoded = raw.split("=")[1];
    const session = JSON.parse(decodeURIComponent(encoded));
    const valid = session?.expiresAt && Date.now() < Date.parse(session.expiresAt);
    return NextResponse.json({ loggedIn: !!valid, session: valid ? session : null });
  } catch {
    return NextResponse.json({ loggedIn: false });
  }
}

export async function DELETE(req: Request) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    maxAge: 0,
  });
  return res;
}
