"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Calendar, Clock, User, CreditCard, ArrowRight } from "lucide-react";
import { createReservation, type ReservationData } from "@/app/actions";
import SedeCard from "@/components/shared/SedeCard";

// Tipos esperados por los endpoints de tu API
interface Location {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  image?: string;
  courtsCount?: number;
  hours?: string;
}

interface Court {
  id: number;
  name: string;
  locationId: number;
}

interface TimeSlot {
  start_time: string;
  end_time: string;
}

export default function ReservarPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [locations, setLocations] = useState<Location[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  // Form data
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [userDetails, setUserDetails] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  // util: asigna imagen según nombre (ajusta paths si usas otras rutas)
  function imageFor(name: string) {
    const n = name.toLowerCase();
    if (n.includes("centro")) return "/images/centro.jpg";
    if (n.includes("norte")) return "/images/norte.jpg";
    if (n.includes("sur")) return "/images/sur.jpg";
    return "/images/club-default.jpg"; // opcional
  }

  // Cargar sedes
  useEffect(() => {
    loadLocations();
  }, []);

  // Cargar canchas cuando cambia la sede
  useEffect(() => {
    if (selectedLocation) {
      loadCourts(selectedLocation.id);
    } else {
      setCourts([]);
    }
  }, [selectedLocation]);

  // Cargar horarios cuando hay cancha + fecha
  useEffect(() => {
    if (selectedCourt && selectedDate) {
      loadAvailableSlots(selectedCourt.id, selectedDate);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedCourt, selectedDate]);

  async function loadLocations() {
    setLoading(true);
    try {
      // GET /api/locations  ->  [{ id, name, address?, phone? }]
      const res = await fetch("/api/locations", { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudieron cargar las ubicaciones");
      const base = (await res.json()) as Location[];

      // enriquecemos con imagen (y, si querés, horarios/canchas fijos)
      const data: Location[] = (Array.isArray(base) ? base : []).map((l) => ({
        ...l,
        image: l.image ?? imageFor(l.name),
      }));

      setLocations(data);
    } catch (error) {
      console.error("Error loading locations:", error);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadCourts(locationId: number) {
    setLoading(true);
    try {
      const res = await fetch(`/api/courts?locationId=${locationId}`, { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudieron cargar las canchas");
      const data = (await res.json()) as Court[];
      setCourts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading courts:", error);
      setCourts([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadAvailableSlots(courtId: number, date: string) {
    setLoading(true);
    try {
      // GET /api/availability?courtId=1&date=YYYY-MM-DD
      const res = await fetch(`/api/availability?courtId=${courtId}&date=${date}`, { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudo cargar la disponibilidad");
      const data = (await res.json()) as { startTime: string; endTime: string }[];
      const mapped: TimeSlot[] = (Array.isArray(data) ? data : []).map((s) => ({
        start_time: s.startTime,
        end_time: s.endTime,
      }));
      setAvailableSlots(mapped);
    } catch (error) {
      console.error("Error loading available slots:", error);
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
      const reservationData: ReservationData = {
        courtId: selectedCourt.id,
        date: selectedDate,
        startTime: selectedSlot.start_time,
        endTime: selectedSlot.end_time,
        userDetails,
        totalAmount: 15000,
      };

      const result = await createReservation(reservationData);
      if (result.success && result.reservationId) {
        const params = new URLSearchParams({
          reservationId: result.reservationId.toString(),
          location: selectedLocation.name,
          court: selectedCourt.name,
          date: selectedDate,
          time: `${formatTime(selectedSlot.start_time)} - ${formatTime(selectedSlot.end_time)}`,
          amount: "15000",
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
                {step === 1 && "Seleccionar Ubicación"}
                {step === 2 && "Elegir Fecha"}
                {step === 3 && "Seleccionar Horario"}
                {step === 4 && "Datos Personales"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Step 1: Location Selection (con SedeCard seleccionable, sin botón) */}
            {step === 1 && (
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">Cargando ubicaciones...</div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-6">
                    {locations.map((loc) => (
                      <SedeCard
                        key={loc.id}
                        seleccionable
                        selected={selectedLocation?.id === loc.id}
                        onSelect={(id: string) => {
                          const l = locations.find((x) => String(x.id) === id) || null;
                          setSelectedLocation(l);
                          setSelectedCourt(null);
                          setSelectedDate("");
                          setSelectedSlot(null);
                        }}
                        sede={{
                          id: String(loc.id),
                          nombre: loc.name,
                          imagen: loc.image ?? imageFor(loc.name), // mapeado/enriquecido
                          direccion: loc.address ?? "",
                          telefono: loc.phone ?? "",
                          horario: loc.hours,      // ✔️ nombre que usa SedeCard
                          canchas: loc.courtsCount // ✔️ nombre que usa SedeCard
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Date & Court Selection */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="mb-4">
                  <p className="text-sm text-slate-600 mb-2">
                    Ubicación seleccionada: <strong>{selectedLocation?.name ?? "—"}</strong>
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
                        const id = Number(e.target.value);
                        const court = courts.find((c) => c.id === id) || null;
                        setSelectedCourt(court);
                        setSelectedSlot(null);
                      }}
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

            {/* Step 3: Time Selection */}
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
                          selectedSlot?.start_time === slot.start_time
                            ? "border-emerald-600 bg-emerald-50"
                            : "border-slate-200 hover:border-emerald-300"
                        }`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        <div className="font-semibold text-slate-900">
                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                        </div>
                        <div className="text-sm text-slate-600">90 minutos</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-600">
                    No hay horarios disponibles para esta fecha. Probá con otra fecha.
                  </div>
                )}
              </div>
            )}

            {/* Step 4: User Details */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="mb-6 p-4 bg-emerald-50 rounded-lg">
                  <h3 className="font-semibold text-emerald-900 mb-2">Resumen de tu reserva</h3>
                  <div className="text-sm text-emerald-800 space-y-1">
                    <p>
                      <strong>Ubicación:</strong> {selectedLocation?.name ?? "—"}
                    </p>
                    <p>
                      <strong>Cancha:</strong> {selectedCourt?.name ?? "—"}
                    </p>
                    <p>
                      <strong>Fecha:</strong> {selectedDate || "—"}
                    </p>
                    <p>
                      <strong>Horario:</strong>{" "}
                      {selectedSlot ? `${formatTime(selectedSlot.start_time)} - ${formatTime(selectedSlot.end_time)}` : "—"}
                    </p>
                    <p>
                      <strong>Duración:</strong> 90 minutos
                    </p>
                    <p>
                      <strong>Precio:</strong> $15.000
                    </p>
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
              if (step === 1) router.push("/");
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
              disabled={!userDetails.fullName || !userDetails.email || !userDetails.phone || loading}
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
