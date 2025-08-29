"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Calendar, Clock, User, CreditCard, ArrowRight, ArrowLeft } from "lucide-react";
import { createReservationAuto } from "@/lib/reservations-supabase";
import SedeCard from "@/components/SedeCard";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { es as esLocale } from "date-fns/locale";
import { startOfToday, format as formatDate } from "date-fns";


// ==== Tipos mapeados a tu API Supabase ====
interface Club {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  image_url?: string | null;
  courtsCount?: number;
  hours?: string;
}

interface Court {
  id: string;
  name: string;
  club_id: string;
}

interface AvailabilityItem {
  startTime: string;
  endTime: string;
}

export default function ReservaClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const branchIdQP = searchParams.get("branchId");

  const [step, setStep] = useState(1);

  // Datos cargados desde API
  const [locations, setLocations] = useState<Club[]>([]);
  const [_courts, setCourts] = useState<Court[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailabilityItem[]>([]);
  const _PRICE = 1;

  // Flags de carga
  const [loadingClubs, setLoadingClubs] = useState(false);
  const [loadingCourts, setLoadingCourts] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingPay, setLoadingPay] = useState(false);

  // Form data
  const [selectedLocation, setSelectedLocation] = useState<Club | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<AvailabilityItem | null>(null);
  const [userDetails, setUserDetails] = useState({ fullName: "", email: "", phone: "" });

  // Fallback para imágenes locales si image_url está vacío
  function imageFor(name: string) {
    const n = (name || "").toLowerCase();
    if (n.includes("abasto")) return "/canchas/Cancha-abasto.webp";
    if (n.includes("nicolas")) return "/canchas/Cancha-sannicolas.webp";
    return "/canchas/Cancha-lavalle.webp";
  }

  // Cargar sedes al montar
  useEffect(() => {
    loadLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Preseleccionar sede si viene ?branchId=... y saltar al Paso 2
  useEffect(() => {
    if (!branchIdQP) return;
    if (!locations.length) return;
    if (selectedLocation) return;

    const found = locations.find(l => String(l.id) === String(branchIdQP));
    if (found) {
      setSelectedLocation(found);
      setStep(2);
    }
  }, [branchIdQP, locations, selectedLocation]);

  // Cargar canchas automáticamente al elegir sucursal
  useEffect(() => {
    if (selectedLocation?.id) {
      loadCourts(selectedLocation.id);
    } else {
      setCourts([]);
      setSelectedCourt(null);
    }
  }, [selectedLocation]);

  // Cargar horarios cuando hay sucursal + fecha
  useEffect(() => {
    if (selectedLocation?.id && selectedDate) {
      loadAvailableSlots(selectedLocation.id, selectedDate);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedLocation, selectedDate]);

  async function loadLocations() {
    setLoadingClubs(true);
    try {
      const res = await fetch("/api/clubs", { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudieron cargar las sucursales");
      const data = await res.json();
      const base: Club[] = Array.isArray(data?.clubs) ? data.clubs : [];

      const enriched: Club[] = base.map((l) => ({
        ...l,
        image_url: l.image_url ?? imageFor(l.name),
      }));

      setLocations(enriched);
    } catch (error) {
      console.error("Error loading clubs:", error);
      setLocations([]);
    } finally {
      setLoadingClubs(false);
    }
  }

  async function loadCourts(clubId: string) {
    try {
      setLoadingCourts(true);
      setCourts([]);
      setSelectedCourt(null);

      const res = await fetch(`/api/courts?clubId=${clubId}`);
      const data = await res.json();

      const rows: Court[] = Array.isArray(data?.courts) ? data.courts : [];
      setCourts(rows);

      if (rows.length > 0) setSelectedCourt(rows[0]);
    } catch (e) {
      console.error("Error loading courts:", e);
      setCourts([]);
      setSelectedCourt(null);
    } finally {
      setLoadingCourts(false);
    }
  }

  async function loadAvailableSlots(clubId: string, date: string) {
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/availability?clubId=${clubId}&date=${date}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("No se pudo cargar la disponibilidad");
      const data = await res.json();

      const rows: AvailabilityItem[] = Array.isArray(data) ? data : data?.slots ?? [];
      setAvailableSlots(rows);
    } catch (e) {
      console.error("Error loading availability:", e);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  const nextStep = () => setStep((s) => Math.min(4, s + 1));
  const prevStep = () => setStep((s) => Math.max(1, s - 1));
  const formatTime = (time: string) => time.slice(0, 5);

  const handleProceedToPayment = async () => {
    console.log("[pago] click");

    const missing: string[] = [];
    if (!selectedLocation) missing.push("Sucursal");
    if (!selectedDate)     missing.push("Fecha");
    if (!selectedSlot)     missing.push("Horario");
    if (!userDetails.fullName) missing.push("Nombre completo");
    if (!userDetails.phone)    missing.push("Teléfono");

    if (missing.length > 0) {
      alert("Faltan datos: " + missing.join(", "));
      return;
    }

    try {
      const auto = await createReservationAuto({
        branchId: selectedLocation!.id,
        date: selectedDate!,
        startTime: selectedSlot!.startTime,
        userDetails: { ...userDetails },
        totalAmount: 1,
      });

      if (!auto?.success || !auto?.reservationId) {
        alert(auto?.error ?? "No se pudo crear la reserva.");
        return;
      }

      setLoadingPay(true);
      const prefRes = await fetch("/api/mp/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId: String(auto.reservationId),
          title: `${selectedLocation!.name} - ${selectedDate!} ${selectedSlot!.startTime}`,
          unitPrice: 1,
          payer: {
            email: userDetails.email || undefined,
            name: userDetails.fullName,
            phone: userDetails.phone,
          },
        }),
      });

      const pref = await prefRes.json().catch(() => ({}));
      setLoadingPay(false);

      if (!prefRes.ok || !pref?.init_point) {
        alert(pref?.error || "No se pudo iniciar el pago.");
        return;
      }

      window.location.href = pref.init_point;
    } catch (_err) {
      setLoadingPay(false);
      alert("Error inesperado al iniciar el pago.");
    }
  };

  return (
  
    
    <div className="relative min-h-screen py-8">
      {/* Fondo radial */}
                {step >= 2 && (
            <Button className="rounded-full ml-6 mb-5 flex self-start" variant="outline" onClick={() => router.replace("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver Al Inicio
            </Button>
          )}
      <div className="absolute top-0 left-0 z-[-2] h-full w-full bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px]" />

      <div className="max-w-4xl m-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
      <div className="text-center mb-8 bg-white/20 py-6 rounded-3xl">

          <h1 className="text-3xl font-bold text-white mb-2">Reservar Cancha</h1>
          <p className="text-slate-300">Completá los siguientes pasos para reservar tu cancha</p>
      
        {/* Progress Steps */}
        <div className="flex items-center justify-center my-6 ">
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step >= stepNumber ? "bg-primary text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-12 h-1 mx-2 ${step > stepNumber ? "bg-primary" : "bg-slate-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

        {/* Step Card */}
        <Card className=" bg-white/20 mb-8 py-6 border-0">
          <CardHeader>
            <CardTitle className="flex text-white items-center space-x-2">
              {step === 1 && <MapPin className="h-5 w-5 text-primary" />}
              {step === 2 && <Calendar className="h-5 w-5 text-primary" />}
              {step === 3 && <Clock className="h-5 w-5 text-primary" />}
              {step === 4 && <User className="h-5 w-5 text-primary" />}
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
              <div className="space-y-4 ">
                {loadingClubs ? (
                  <div className="text-center py-8 text-slate-200">Cargando sucursales...</div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-6 min-h-[16rem] ">
                    {locations.map((loc) => (
                      <SedeCard
                        key={loc.id}
                        seleccionable
                        selected={selectedLocation?.id === loc.id}
                        onSelect={(id: string) => {
                          const l = locations.find((x) => x.id === id) || null;
                          setSelectedLocation(l);
                          // reset dependientes
                          setSelectedCourt(null);
                          setSelectedDate("");
                          setSelectedSlot(null);
                        }}
                        sede={{
                          id: loc.id,
                          nombre: loc.name,
                          imagen: (loc.image_url || imageFor(loc.name)) as string,
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

            {/* Step 2: Fecha  */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="mb-4">
                  <p className="text-sm text-slate-200 mb-2">
                    Sucursal: <strong>{selectedLocation?.name ?? "—"}</strong>
                  </p>
                  {loadingCourts ? (
                    <p className="text-sm text-slate-200">Cargando canchas…</p>
                  ) : selectedCourt ? (
                    <p className="text-sm text-slate-200">
                      Cancha seleccionada: <strong>{selectedCourt.name}</strong>
                    </p>
                  ) : (
                    <p className="text-sm text-slate-200">Seleccioná una sucursal para ver canchas.</p>
                  )}
                </div>

                <div>
                  <Label className="text-gray-200">Fecha de la reserva</Label>
                  <div className="flex mx-auto mt-2 p-2 rounded-lg border max-w-sm bg-white/90 border-slate-200">
                    <DayPicker
                      mode="single"
                      locale={esLocale}
                      selected={selectedDate ? new Date(selectedDate + "T00:00:00") : undefined}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDate(formatDate(date, "yyyy-MM-dd")); // YYYY-MM-DD
                        } else {
                          setSelectedDate("");
                        }
                        setSelectedSlot(null); // reset slot al cambiar fecha
                      }}
                      disabled={{ before: startOfToday() }}
                      defaultMonth={selectedDate ? new Date(selectedDate + "T00:00:00") : startOfToday()}
                      className="mx-auto"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Horario */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="mb-4">
                  <p className="text-sm text-gray-200 mb-1">
                    <strong>{selectedLocation?.name ?? "—"}</strong> - {selectedCourt?.name ?? "—"}
                  </p>
                  <p className="text-sm text-gray-200">
                    Fecha: <strong>{selectedDate || "—"}</strong>
                  </p>
                </div>

                {loadingSlots && (
                  <div className="text-sm text-gray-200">Cargando horarios…</div>
                )}

                {availableSlots.length > 0 ? (
                  <div className="grid md:grid-cols-3 gap-3">
                    {availableSlots.map((slot, index) => (
                     <div
                          key={index}
                          className={`p-3 border rounded-lg cursor-pointer text-center transition-colors duration-300
                            ${
                              selectedSlot?.startTime === slot.startTime
                                ? "bg-[#0084ff] border-[#0084ff] text-white" // seleccionado → fondo azul, texto blanco
                                : "bg-white/90 border-slate-200 hover:bg-gray-200 text-slate-900" // normal
                            }`}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          <div
                            className={`font-semibold ${
                              selectedSlot?.startTime === slot.startTime ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </div>
                          <div
                            className={`text-sm ${
                              selectedSlot?.startTime === slot.startTime ? "text-white/90" : "text-slate-600"
                            }`}
                          >
                            90 minutos
                          </div>
                        </div>
                    ))}
                  </div>
                ) : !loadingSlots ? (
                  <div className="text-center py-8 text-slate-600">
                    No hay horarios disponibles para esta fecha.
                  </div>
                ) : null}
              </div>
            )}

            {/* Step 4: Datos personales */}
            {step === 4 && (
              <div className="space-y-4 bg-white/90 rounded-xl">
                <div className="mb-6 p-4 rounded-lg">
                  <h3 className="font-semibold text-black  mb-2">Resumen de tu reserva</h3>
                  <div className="text-sm text-slate-800 space-y-1">
                    <p><strong>Sucursal:</strong> {selectedLocation?.name ?? "—"}</p>
                    <p><strong>Fecha:</strong> {selectedDate || "—"}</p>
                    <p>
                      <strong>Horario:</strong>{" "}
                      {selectedSlot ? `${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}` : "—"}
                    </p>
                    <p><strong>Duración:</strong> 90 minutos</p>
                    <p><strong>Precio de Reserva:</strong> $8.000</p>
                    <p><strong>Resta Abonar:</strong> $22.000</p>
                  </div>
                </div>
                <div className="p-4 text-slate-600 rounded-lg grid md:grid-cols-2 gap-4">
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
                    <Label htmlFor="email">Email (opcional)</Label>
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
        <div className="flex justify-between ">
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
              onClick={() => {
                // Validaciones por paso
                if (step === 1 && !selectedLocation) return;
                if (step === 2 && (!selectedDate)) return;
                if (step === 3 && !selectedSlot) return;
                nextStep();
              }}
              className="flex items-center space-x-2 bg-primary hover:bg-[#0084ff]"
            >
              <span>Siguiente</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleProceedToPayment}
              disabled={
                loadingPay ||
                !selectedLocation ||
                !selectedDate ||
                !selectedSlot ||
                !userDetails.fullName ||
                !userDetails.phone
              }
              className="flex items-center space-x-2 bg-primary hover:bg-primary/90"
            >
              <CreditCard className="h-4 w-4" />
              <span>{loadingPay ? "Redirigiendo al pago..." : "Proceder al Pago"}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
