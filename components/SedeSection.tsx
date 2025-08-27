import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Clock } from 'lucide-react';

         
export default function SedeSection() {
  return (          
    <>         {/* Locations Section */}
      <section id="ubicaciones" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Nuestras Ubicaciones</h3>
            <p className="text-lg text-slate-600">3 sedes estratégicamente ubicadas en Rosario</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Centro */}
            <Card className="hover:shadow-lg transition-shadow overflow-hidden h-full flex flex-col">
              {/* Imagen */}
              <div className="h-48 md:h-52 w-full overflow-hidden">
                <img
                  src="/canchas/cancha-abasto.webp"
                  alt="Lavalle Padel Centro"
                  className="h-full w-full object-cover"
                />
              </div>
              {/* Contenido */}
              <CardContent className="p-6 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-semibold text-slate-900">Lavalle Padel Center</h4>
                  <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-sm font-medium">4 canchas</div>
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
                <Link href="/reservar">
                  <Button className="w-full mt-4 bg-primary hover:bg-primary/80 transition-colors duration-200">
                    Reservar
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Norte */}
            <Card className="hover:shadow-lg transition-shadow overflow-hidden h-full flex flex-col">
              <div className="h-48 md:h-52 w-full overflow-hidden">
                <img
                  src="/canchas/cancha-sannicolas.webp"
                  alt="Lavalle Padel Norte"
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent className="p-6 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-semibold text-slate-900">Lavalle Padel</h4>
                  <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-sm font-medium">6 canchas</div>
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
                    <span>Lun-Vie: 8:00am - 00:00am | Sáb-Dom: 9:00am - 12:00am</span>
                  </div>
                </div>

                <Link href="/reservar">
                  <Button className="w-full mt-4 bg-primary hover:bg-primary/80 transition-colors duration-200">
                    Reservar
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Sur */}
            <Card className="hover:shadow-lg transition-shadow overflow-hidden h-full flex flex-col">
              <div className="h-48 md:h-52 w-full overflow-hidden">
                <img
                  src="/canchas/cancha-lavalle.webp"
                  alt="Lavalle Padel Sur"
                  className="h-full w-full object-cover"
                />
              </div>

              <CardContent className="p-6 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-semibold text-slate-900">Lavalle Padel Abasto</h4>
                  <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-sm font-medium">5 canchas</div>
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

                <Link href="/reservar">
                  <Button className="w-full mt-4 bg-primary hover:bg-primary/80 transition-colors duration-200">
                    Reservar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

</>    
    );
}  
