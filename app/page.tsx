import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Clock, Users, Trophy, Star, Settings } from "lucide-react"
import Link from "next/link"
import Header from "@/components/shared/header"
import Footer from "@/components/shared/footer"  

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Tu cancha de padel
            <span className="block text-emerald-600">te está esperando</span>
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Reservá online en cualquiera de nuestras 3 sedes en Rosario. Canchas de primera calidad, horarios flexibles
            y la mejor experiencia de padel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/reservar">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg font-semibold"
              >
                Reservar Ahora
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-4 text-lg bg-transparent"
            >
              Ver Ubicaciones
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">¿Por qué elegir Lavalle Padel?</h3>
            <p className="text-lg text-slate-600">La mejor experiencia de padel en Rosario</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-emerald-600" />
              </div>
              <h4 className="text-xl font-semibold text-slate-900 mb-2">Reservas 24/7</h4>
              <p className="text-slate-600">Reservá tu cancha online las 24 horas, todos los días del año.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-emerald-600" />
              </div>
              <h4 className="text-xl font-semibold text-slate-900 mb-2">3 Sedes</h4>
              <p className="text-slate-600">Elegí la sede más conveniente: Centro, Norte o Sur de Rosario.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-emerald-600" />
              </div>
              <h4 className="text-xl font-semibold text-slate-900 mb-2">Canchas Premium</h4>
              <p className="text-slate-600">Canchas de primera calidad con mantenimiento profesional.</p>
            </div>
          </div>
        </div>
      </section>

            {/* Locations Section */}
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
                    <MapPin className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>San Nicolás 965. Rosario, Santa Fe</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-5 w-5 text-emerald-600" />
                    <span>341-5761895</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-emerald-600" />
                    <span>Todos los días | 8:00am - 12:00am</span>
                  </div>
                </div>
                <Link href="/reservar">
                  <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">
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
                    <MapPin className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Lavalle 1546. Rosario, Santa Fe</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-5 w-5 text-emerald-600" />
                    <span>341 4307366</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-emerald-600" />
                    <span>Lun-Vie: 8:00am - 00:00am | Sáb-Dom: 9:00am - 12:00am</span>
                  </div>
                </div>

                <Link href="/reservar">
                  <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">
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
                    <MapPin className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Laprida 2252. Rosario, Santa Fe</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-5 w-5 text-emerald-600" />
                    <span>341 576-1895</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-emerald-600" />
                    <span>Todos los días | 8:00am - 12:00am</span>
                  </div>
                </div>

                <Link href="/reservar">
                  <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">
                    Reservar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>


      {/* About Section */}
      <section id="nosotros" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-slate-900 mb-6">Sobre Lavalle Padel</h3>
              <p className="text-lg text-slate-600 mb-6">
                Somos el club de padel líder en Rosario, con más de 10 años de experiencia brindando la mejor
                infraestructura y servicio para los amantes de este deporte.
              </p>
              <p className="text-lg text-slate-600 mb-6">
                Nuestras 3 sedes estratégicamente ubicadas en Centro, Norte y Sur de la ciudad cuentan con canchas de
                primera calidad y horarios flexibles para que puedas jugar cuando más te convenga.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">15</div>
                  <div className="text-slate-600">Canchas totales</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">3</div>
                  <div className="text-slate-600">Sedes en Rosario</div>
                </div>
              </div>
            </div>
            <div className="bg-emerald-600 rounded-lg p-8 text-white">
              <h4 className="text-2xl font-bold mb-4">¿Listo para jugar?</h4>
              <p className="text-emerald-100 mb-6">
                Reservá tu cancha en segundos y disfrutá de la mejor experiencia de padel en Rosario.
              </p>
              <Link href="/reservar">
                <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 w-full">
                  Hacer Reserva
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
    
  )
}
