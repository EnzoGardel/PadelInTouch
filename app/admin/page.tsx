"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  LogOut, User, Calendar, DollarSign, Users, Clock, MapPin, Phone, Mail,
  MoreVertical, Pencil, Trash2
} from "lucide-react"
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Reservation {
  id: string
  user_name: string
  user_email: string
  user_phone: string
  location_name: string
  court_name: string
  date: string
  time_slot: string
  status: string
  total_amount: number
  payment_status: string
  created_at: string
  // opcionales si tu API los agrega luego:
  notes?: string | null
}

interface DashboardStats {
  todayReservations: number
  totalRevenue: number
  pendingPayments: number
  activeUsers: number
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    todayReservations: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    activeUsers: 0,
  })

  // Edición
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [selected, setSelected] = useState<Reservation | null>(null)
  const [form, setForm] = useState({
    totalAmount: "",
    status: "pending",
    paymentStatus: "pending",
    notes: "",
  })

  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAuth()
      loadDashboardData()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const checkAuth = () => {
    try {
      const cookies = document.cookie.split(";")
      const adminSessionCookie = cookies.find((cookie) => cookie.trim().startsWith("admin_session="))
      if (!adminSessionCookie) {
        router.push("/admin/login")
        return
      }
      const cookieValue = adminSessionCookie.split("=")[1]
      const decodedValue = decodeURIComponent(cookieValue)
      const sessionData = JSON.parse(decodedValue)
      const now = new Date()
      const expiresAt = new Date(sessionData.expiresAt)
      if (now > expiresAt) {
        document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        router.push("/admin/login")
        return
      }
      setUser({ full_name: sessionData.name, username: sessionData.username, role: sessionData.role })
      setLoading(false)
    } catch {
      setTimeout(() => router.push("/admin/login"), 1000)
    }
  }

  const handleLogout = () => {
    document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    router.push("/admin/login")
  }

  const loadDashboardData = async () => {
    try {
      const r1 = await fetch("/api/admin/reservations", { cache: "no-store" })
      const ct1 = r1.headers.get("content-type") || ""
      if (!ct1.includes("application/json")) {
        console.error("Admin /reservations devolvió no-JSON")
      }
      const reservationsData: Reservation[] = await r1.json()
      setReservations(Array.isArray(reservationsData) ? reservationsData : [])

      const r2 = await fetch("/api/admin/stats", { cache: "no-store" })
      const ct2 = r2.headers.get("content-type") || ""
      if (!ct2.includes("application/json")) {
        console.error("Admin /stats devolvió no-JSON")
      }
      const statsData: DashboardStats = await r2.json()
      setStats(statsData)
    } catch (error) {
      console.error("[admin] loadDashboardData error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { label: "Confirmada", variant: "default" as const },
      pending: { label: "Pendiente", variant: "secondary" as const },
      cancelled: { label: "Cancelada", variant: "destructive" as const },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "outline" as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getPaymentBadge = (status: string) => {
    const statusConfig = {
      completed: { label: "Pagado", variant: "default" as const },
      pending: { label: "Pendiente", variant: "secondary" as const },
      failed: { label: "Fallido", variant: "destructive" as const },
      refunded: { label: "Reintegrado", variant: "outline" as const },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "outline" as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(amount)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-AR", { year: "numeric", month: "short", day: "numeric" })

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  // === Acciones: Editar / Eliminar ===
  function openEdit(r: Reservation) {
    setSelected(r)
    setForm({
      totalAmount: String(r.total_amount ?? ""),
      status: r.status ?? "pending",
      paymentStatus: r.payment_status ?? "pending",
      notes: (r as any).notes ?? "",
    })
    setEditOpen(true)
  }

  async function submitEdit() {
    if (!selected) return
    setEditing(true)
    try {
      const res = await fetch(`/api/admin/reservations/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // solo campos “administrables” sin tocar horario/cancha:
          totalAmount: form.totalAmount ? Number(form.totalAmount) : null,
          status: form.status,
          paymentStatus: form.paymentStatus,
          notes: form.notes || null,

          // para que el handler no falle si espera estos campos,
          // le mandamos los actuales “derivados” del string time_slot (si tu handler PUT los requiere, sino podés quitarlos)
          // Si tu PUT exige horario/cancha, mejor editemos también esos campos en el modal.
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data?.error || "No se pudo actualizar")
        return
      }
      await loadDashboardData()
      setEditOpen(false)
    } finally {
      setEditing(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar la reserva? Esta acción no se puede deshacer.")) return
    const res = await fetch(`/api/admin/reservations/${id}`, { method: "DELETE" })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data?.error || "No se pudo eliminar")
      return
    }
    setReservations((prev) => prev.filter((r) => r.id !== id))
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Panel de Administración</h1>
              <p className="text-sm text-slate-600">Lavalle Padel - Gestión de Reservas</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <User className="h-4 w-4" />
                <span>{user.full_name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center space-x-2 bg-transparent">
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reservas Hoy</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayReservations}</div>
              <p className="text-xs text-muted-foreground">Reservas confirmadas para hoy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">Pagos completados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingPayments}</div>
              <p className="text-xs text-muted-foreground">Reservas sin pagar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">Últimos 30 días</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reservations */}
        <Card>
          <CardHeader>
            <CardTitle>Reservas Recientes</CardTitle>
            <CardDescription>Las últimas 10 reservas realizadas en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {reservations.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay reservas registradas</p>
                <p className="text-sm">Las reservas aparecerán aquí cuando se realicen</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reservations.map((reservation) => (
                  <div key={reservation.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium">{reservation.user_name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-slate-600">
                            <Mail className="h-3 w-3" />
                            <span>{reservation.user_email}</span>
                            {reservation.user_phone && (
                              <>
                                <Phone className="h-3 w-3 ml-2" />
                                <span>{reservation.user_phone}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          <span>
                            {reservation.location_name} - {reservation.court_name}
                          </span>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium">{formatDate(reservation.date)}</div>
                          <div className="text-slate-600">{reservation.time_slot}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(reservation.total_amount)}</div>
                        <div className="text-xs text-slate-500">{formatDateTime(reservation.created_at)}</div>
                      </div>
                      <div className="flex flex-col space-y-1 min-w-[110px]">
                        {getStatusBadge(reservation.status)}
                        {getPaymentBadge(reservation.payment_status)}
                      </div>

                      {/* Menú de 3 puntitos */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 rounded-full hover:bg-slate-100">
                            <MoreVertical className="h-5 w-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEdit(reservation)}>
                            <Pencil className="h-4 w-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(reservation.id)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Modal de edición */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar reserva {selected?.id}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Monto</Label>
                <Input
                  type="number"
                  value={form.totalAmount}
                  onChange={(e) => setForm((f) => ({ ...f, totalAmount: e.target.value }))}
                />
              </div>
              <div>
                <Label>Estado</Label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                >
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Pago</Label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={form.paymentStatus}
                  onChange={(e) => setForm((f) => ({ ...f, paymentStatus: e.target.value }))}
                >
                  <option value="pending">Pendiente</option>
                  <option value="completed">Pagado</option>
                  <option value="failed">Fallido</option>
                  <option value="refunded">Reintegrado</option>
                </select>
              </div>
              <div>
                <Label>Notas</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <button className="px-4 py-2 border rounded" onClick={() => setEditOpen(false)}>
              Cancelar
            </button>
            <button
              className="px-4 py-2 rounded bg-emerald-600 text-white disabled:opacity-60"
              onClick={submitEdit}
              disabled={editing}
            >
              {editing ? "Guardando..." : "Guardar"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
