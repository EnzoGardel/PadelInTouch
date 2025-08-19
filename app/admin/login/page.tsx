"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, User as UserIcon, AlertCircle } from "lucide-react"

// Credenciales de prueba basadas en USUARIO (no email)
const ADMIN_CREDENTIALS = [
  { username: "admin",      password: "admin123",      name: "Administrador", role: "admin" },
  { username: "recepcion1", password: "recepcion123",  name: "Recepcionista", role: "staff" },
]

export default function AdminLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validación local (de prueba). Más adelante podés cambiar esto por el endpoint /api/admin/auth/login
      const adminUser = ADMIN_CREDENTIALS.find(
        (cred) => cred.username === username && cred.password === password
      )

      if (!adminUser) {
        throw new Error("Usuario o contraseña inválidos")
      }

      // Armamos la sesión: ahora guardamos username, name y role
      const session = {
        username: adminUser.username,
        name: adminUser.name,
        role: adminUser.role,
        loginTime: new Date().toISOString(),
        // 24 horas
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }

      const encodedSession = encodeURIComponent(JSON.stringify(session))

      // Nota: en desarrollo (http) 'secure' puede impedir setear la cookie.
      // Si no te aparece la cookie, quitá `secure;` en dev.
      document.cookie = `admin_session=${encodedSession}; path=/; max-age=${24 * 60 * 60}; samesite=lax`

      // Redirigir al dashboard
      router.push("/admin")
      router.refresh()
    } catch (error: any) {
      setError(error.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Panel de Administración</CardTitle>
          <p className="text-slate-600">Lavalle Padel - Acceso Restringido</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="username"
                  placeholder="admin o recepcion1"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-slate-100 rounded-lg">
            <p className="text-sm text-slate-600 text-center">
              <strong>Credenciales de prueba:</strong>
              <br />
              Usuario: <code>admin</code> — Contraseña: <code>admin123</code>
              <br />
              Usuario: <code>recepcion1</code> — Contraseña: <code>recepcion123</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
