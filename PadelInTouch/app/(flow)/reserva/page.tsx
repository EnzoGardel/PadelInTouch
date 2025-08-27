"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Calendar, Clock, User, CreditCard, ArrowRight } from "lucide-react";
import { createReservation, type ReservationData } from "@/lib/reservations-supabase";
import SedeCard from "@/components/SedeCard";

// ==== Tipos mapeados a tu API Supabase ====
interface Club {
  id: string;        // UUID
  name: string;
  address?: string | null;
  phone?: string;    // opcional (para UI)
  image?: string;    // opcional (para UI)
  courtsCount?: number; // opcional (para UI)
  hours?: string;       // opcional (para UI)
}

interface Court {
  id: string;       // UUID
  name: string;
  club_id: string;  // UUID del club
}

interface AvailabilityItem {
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  // price?: number;  // si tu endpoint lo devuelve, lo podés mostrar
}

export default function ReservarPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Datos cargados desde API
  const [locations, setLocations] = useState<Club[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailabilityItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Form data
  const [selectedLocation, setSelectedLocation] = useState<Club | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<AvailabilityItem | null>(null);
  const [userDetails, setUserDetails] = useState({ fullName: "", email: "", phone: "" });

  // util: asigna imagen según nombre (ajusta paths si usas otras rutas)
  function imageFor(name: string) {
    const n = name.toLowerCase();
    if (n.includes("centro")) return "/branches/centro.jpg";
    if (n.includes("norte")) return "/branches/norte.jpg";
    if (n.includes("sur")) return "/branches/sur.jpg";
    return "/branches/default.jpg"; // opcional
  }

  // Cargar sedes (clubs)
  useEffect(() => {
    loadLocations();
  }, []);

  // Cargar canchas por club
  useEffect(() => {
    if (selectedLocation?.id) {
      loadCourts(selectedLocation.id);
    } else {
      setCourts([]);
    }
  }, [selectedLocation]);

  // Cargar horarios cuando hay cancha + fecha
  useEffect(() => {
    if (selectedLocation?.id && selectedCourt?.id && selectedDate) {
      loadAvailableSlots(selectedLocation.id, selectedCourt.id, selectedDate);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedLocation, selectedCourt, selectedDate]);

  async function loadLocations() {
    setLoading(true);
    try {
      // GET /api/clubs -> { clubs: [{ id, name, address, ... }] }
      const res = await fetch("/api/clubs", { cache: "no-store" });
      const data = await res.json();
      const base: Club[] = Array.isArray(data?.clubs) ? data.clubs : [];

      // enriquecemos con imagen (y opcionales para UI)
      const enriched: Club[] = base.map((l) => ({
        ...l,
        image: l.image ?? imageFor(l.name),
      }));

      setLocations(enriched);
    } catch (error) {
      console.error("Error loading clubs:", error);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadCourts(clubId: string) {
    setLoading(true);
    try {
      // GET /api/courts?clubId=UUID -> { courts: [{ id, name, club_id }] }
      const res = await fetch(`/api/courts?clubId=${clubId}`, { cache: "no-store" });
      const data = await res.json();
      const rows: Court[] = Array.isArray(data?.courts) ? data.courts : [];
      setCourts(rows);
    } catch (error) {
      console.error("Error loading courts:", error);
      setCourts([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadAvailableSlots(clubId: string, courtId: string, date: string) {
    setLoading(true);
    try {
      // GET /api/availability?clubId=...&courtId=...&date=YYYY-MM-DD
      const res = await fetch(`/api/availability?clubId=${clubId}&courtId=${courtId}&date=${date}`, { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudo cargar la disponibilidad");
      const arr = await res.json();
      const rows: AvailabilityItem[] = Array.isArray(arr) ? arr : [];
      setAvailableSlots(rows);
    } catch (error) {
      console.error("Error loading availability:", error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  }

  const nextStep = () => setStep((s) => Math.min(4, s + 1));
  const prevStep = () => setStep((s) => Math.max(1, s - 1));
  const formatTime = (time: string) => time.slice(0, 5); // "HH:mm"

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const handleProceedToPayment = async () => {
    if (!selectedLocation || !selectedCourt || !selectedDate || !selectedSlot) return;

    setLoading(true);
    try {
      // Adaptado a Supabase: courtId es UUID (string), fecha/hora local; createReservation hace la conversión y el RPC.
      const payload: ReservationData = {
        courtId: selectedCourt.id,
        date: selectedDate,                      // "YYYY-MM-DD" local
        startTime: selectedSlot.startTime,       // "HH:mm" local
        endTime: selectedSlot.endTime,           // "HH:mm" local
        userDetails,
        totalAmount: 1,                      // opcional (el precio real viene del slot en DB)
      };

      const result = await createReservation(payload);
      if (result.success && result.reservationId) {
        const params = new URLSearchParams({
          reservationId: result.reservationId,
          location: selectedLocation.name,
          court: selectedCourt.name,
          date: selectedDate,
          time: `${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}`,
          amount: "1",
        });
        router.push(`/pago?${params.toString()}`);
      } else {
        alert(result?.error ?? "Error al crear la reserva. Por favor, intentá nuevamente.");
      }
    } catch (error) {
      console.error("Error creating reservation:", error);
      alert("Error al crear la reserva. Por favor, intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Reservar Cancha</h1>
          <p className="text-slate-600">Completá los siguientes pasos para reservar tu cancha</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step >= stepNumber ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-12 h-1 mx-2 ${step > stepNumber ? "bg-emerald-600" : "bg-slate-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {step === 1 && <MapPin className="h-5 w-5 text-emerald-600" />}
              {step === 2 && <Calendar className="h-5 w-5 text-emerald-600" />}
              {step === 3 && <Clock className="h-5 w-5 text-emerald-600" />}
              {step === 4 && <User className="h-5 w-5 text-emerald-600" />}
              <span>
                {step === 1 && "Seleccionar Sucursal"}
                {step === 2 && "Elegir Fecha y Cancha"}
                {step === 3 && "Seleccionar Horario"}
                {step === 4 && "Datos Personales"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Step 1: Sucursal (Club) */}
            {step === 1 && (
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">Cargando sucursales...</div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-6">
                    {locations.map((loc) => (
                      <SedeCard
                        key={loc.id}
                        seleccionable
                        selected={selectedLocation?.id === loc.id}
                        onSelect={(id: string) => {
                          const l = locations.find((x) => x.id === id) || null;
                          setSelectedLocation(l);
                          setSelectedCourt(null);
                          setSelectedDate("");
                          setSelectedSlot(null);
                        }}
                        sede={{
                          id: loc.id,
                          nombre: loc.name,
                          imagen: loc.image ?? imageFor(loc.name),
                          direccion: loc.address ?? "",
                          telefono: loc.phone ?? "",
                          horario: loc.hours,
                          canchas: loc.courtsCount,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Fecha + Cancha */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="mb-4">
                  <p className="text-sm text-slate-600 mb-2">
                    Sucursal: <strong>{selectedLocation?.name ?? "—"}</strong>
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="date">Fecha de la reserva</Label>
                    <Input
                      id="date"
                      type="date"
                      min={getTomorrowDate()}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="court">Cancha</Label>
                    <select
                      id="court"
                      className="w-full mt-1 p-2 border border-slate-300 rounded-md"
                      value={selectedCourt?.id || ""}
                      onChange={(e) => {
                        const id = e.target.value;
                        const court = courts.find((c) => c.id === id) || null;
                        setSelectedCourt(court);
                        setSelectedSlot(null);
                      }}
                      disabled={!courts.length}
                    >
                      <option value="">Seleccionar cancha</option>
                      {courts.map((court) => (
                        <option key={court.id} value={court.id}>
                          {court.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Horario */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="mb-4">
                  <p className="text-sm text-slate-600 mb-1">
                    <strong>{selectedLocation?.name ?? "—"}</strong> - {selectedCourt?.name ?? "—"}
                  </p>
                  <p className="text-sm text-slate-600">
                    Fecha: <strong>{selectedDate || "—"}</strong>
                  </p>
                </div>
                {loading ? (
                  <div className="text-center py-8">Cargando horarios disponibles...</div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid md:grid-cols-3 gap-3">
                    {availableSlots.map((slot, index) => (
                      <div
                        key={index}
                        className={`p-3 border rounded-lg cursor-pointer text-center transition-colors ${
                          selectedSlot?.startTime === slot.startTime
                            ? "border-emerald-600 bg-emerald-50"
                            : "border-slate-200 hover:border-emerald-300"
                        }`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        <div className="font-semibold text-slate-900">
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </div>
                        <div className="text-sm text-slate-600">90 minutos</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-600">
                    No hay horarios disponibles para esta fecha.
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Datos personales */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="mb-6 p-4 bg-emerald-50 rounded-lg">
                  <h3 className="font-semibold text-emerald-900 mb-2">Resumen de tu reserva</h3>
                  <div className="text-sm text-emerald-800 space-y-1">
                    <p><strong>Sucursal:</strong> {selectedLocation?.name ?? "—"}</p>
                    <p><strong>Cancha:</strong> {selectedCourt?.name ?? "—"}</p>
                    <p><strong>Fecha:</strong> {selectedDate || "—"}</p>
                    <p>
                      <strong>Horario:</strong>{" "}
                      {selectedSlot ? `${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}` : "—"}
                    </p>
                    <p><strong>Duración:</strong> 90 minutos</p>
                    <p><strong>Precio:</strong> $15.000</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Nombre completo</Label>
                    <Input
                      id="fullName"
                      value={userDetails.fullName}
                      onChange={(e) => setUserDetails({ ...userDetails, fullName: e.target.value })}
                      placeholder="Tu nombre completo"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userDetails.email}
                      onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                      placeholder="tu@email.com"
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={userDetails.phone}
                      onChange={(e) => setUserDetails({ ...userDetails, phone: e.target.value })}
                      placeholder="+54 341 123-4567"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navegación */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              if (step === 1) router.replace("/");
              else prevStep();
            }}
          >
            {step === 1 ? "Salir" : "Anterior"}
          </Button>

          {step < 4 ? (
            <Button
              onClick={nextStep}
              disabled={
                (step === 1 && !selectedLocation) ||
                (step === 2 && (!selectedDate || !selectedCourt)) ||
                (step === 3 && !selectedSlot)
              }
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <span>Siguiente</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleProceedToPayment}
              disabled={!userDetails.fullName || !userDetails.phone || loading}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <CreditCard className="h-4 w-4" />
              <span>{loading ? "Creando reserva..." : "Proceder al Pago"}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
