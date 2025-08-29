"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock } from "lucide-react";

// Tilt solo en cliente
const Tilt = dynamic(() => import("react-parallax-tilt"), { ssr: false });

// Wrapper: evita glare inicial y habilita tilt tras el mount
function CardWithTilt({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div className="will-change-transform">{children}</div>;
  }

  return (
    <Tilt
      // Desactivamos glare para evitar el "velo" blanco inicial
      glareEnable={false}
      // Habilitamos el tilt solo cuando ya montó en cliente
      tiltEnable={mounted}
      scale={1.035}
      tiltMaxAngleX={8}
      tiltMaxAngleY={8}
      transitionSpeed={1400}
      gyroscope={true}   
      reset
      className="will-change-transform"
    >
      {children}
    </Tilt>
  );
}

export default function SedeSection() {
  return (
    <section id="ubicaciones" className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white/20 p-10 rounded-3xl shadow-md">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white mb-4">Nuestras Ubicaciones</h3>
          <p className="text-lg text-slate-300">3 sedes estratégicamente ubicadas en Rosario</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Centro */}
          <CardWithTilt>
            <Card className="hover:shadow-lg transition-shadow overflow-hidden border-0 bg-white/90 rounded-2xl">
              <div className="h-48 md:h-52 w-full overflow-hidden">
                <img
                  src="/canchas/cancha-sannicolas.webp"
                  alt="Lavalle Padel Center"
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent className="p-6 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-semibold text-slate-900">Lavalle Padel Center</h4>
                  <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-sm font-medium">
                    4 canchas
                  </div>
                </div>

                <div className="space-y-3 text-slate-600 flex-grow">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>San Nicolás 965. Rosario, Santa Fe</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-5 w-5 text-primary" />
                    <span>341-5761895</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>Todos los días | 8:00am - 12:00am</span>
                  </div>
                </div>

                <Link href={{ pathname: "/reserva", query: { branchId: 2 } }}>
                  <Button className="w-full mt-4 bg-primary hover:bg-[#0084ff] transition-colors duration-200">
                    Reservar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </CardWithTilt>

          {/* Lavalle */}
          <CardWithTilt>
            <Card className="hover:shadow-lg transition-shadow overflow-hidden h-full flex flex-col border-0 bg-white/90 rounded-2xl">
              <div className="h-48 md:h-52 w-full overflow-hidden">
                <img
                  src="/canchas/cancha-lavalle.webp"
                  alt="Lavalle Padel"
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent className="p-6 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-semibold text-slate-900">Lavalle Padel</h4>
                  <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-sm font-medium">
                    6 canchas
                  </div>
                </div>

                <div className="space-y-3 text-slate-600 flex-grow">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Lavalle 1546. Rosario, Santa Fe</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-5 w-5 text-primary" />
                    <span>341 4307366</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>Todos los días: 8:00am - 12:00am</span>
                  </div>
                </div>

                <Link href={{ pathname: "/reserva", query: { branchId: 1 } }}>
                  <Button className="w-full mt-4 bg-primary hover:bg-[#0084ff] transition-colors duration-200">
                    Reservar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </CardWithTilt>

          {/* Abasto */}
          <CardWithTilt>
            <Card className="group relative overflow-hidden h-full flex flex-col rounded-2xl border-0 bg-white/90 transition-shadow hover:shadow-lg">
              <div className="relative z-10 h-48 md:h-52 w-full overflow-hidden">
                <img
                  src="/canchas/cancha-abasto.webp"
                  alt="Lavalle Padel Abasto"
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <CardContent className="relative z-20 p-6 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-semibold text-slate-900">Lavalle Padel Abasto</h4>
                  <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-sm font-medium">
                    5 canchas
                  </div>
                </div>

                <div className="space-y-3 text-slate-600 flex-grow">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Laprida 2252. Rosario, Santa Fe</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-5 w-5 text-primary" />
                    <span>341 576-1895</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>Todos los días | 8:00am - 12:00am</span>
                  </div>
                </div>

                <Link href={{ pathname: "/reserva", query: { branchId: 3 } }}>
                  <Button className="w-full mt-2 bg-primary hover:bg-[#0084ff] transition-colors duration-200">
                    Reservar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </CardWithTilt>
        </div>
      </div>
    </section>
  );
}
