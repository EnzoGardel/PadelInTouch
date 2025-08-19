import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Clock, Users, Trophy, Star, Settings } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Lavalle Padel</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#ubicaciones" className="text-slate-600 hover:text-emerald-600 transition-colors">
                Ubicaciones
              </Link>
              <Link href="#nosotros" className="text-slate-600 hover:text-emerald-600 transition-colors">
                Nosotros
              </Link>
              <Link href="#contacto" className="text-slate-600 hover:text-emerald-600 transition-colors">
                Contacto
              </Link>
              <Link href="/admin" className="text-slate-600 hover:text-emerald-600 transition-colors">
                <Settings className="h-4 w-4 inline mr-1" />
                Admin
              </Link>
            </nav>
          </div>
        </div>
      </header>

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
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-semibold text-slate-900">Lavalle Padel Centro</h4>
                  <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-sm font-medium">4 canchas</div>
                </div>
                <div className="space-y-3 text-slate-600">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Av. Pellegrini 1234, Centro, Rosario</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-5 w-5 text-emerald-600" />
                    <span>+54 341 123-4567</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-emerald-600" />
                    <span>Lun-Jue: 8:00-23:00 | Vie-Sáb: 8:00-24:00</span>
                  </div>
                </div>
                <Link href="/reservar">
                  <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">Reservar en Centro</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Norte */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-semibold text-slate-900">Lavalle Padel Norte</h4>
                  <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-sm font-medium">6 canchas</div>
                </div>
                <div className="space-y-3 text-slate-600">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Bv. Oroño 2567, Barrio Norte, Rosario</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-5 w-5 text-emerald-600" />
                    <span>+54 341 234-5678</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-emerald-600" />
                    <span>Lun-Jue: 7:00-23:00 | Vie-Sáb: 7:00-24:00</span>
                  </div>
                </div>
                <Link href="/reservar">
                  <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">Reservar en Norte</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Sur */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-semibold text-slate-900">Lavalle Padel Sur</h4>
                  <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-sm font-medium">5 canchas</div>
                </div>
                <div className="space-y-3 text-slate-600">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Av. Circunvalación 3890, Zona Sur, Rosario</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-5 w-5 text-emerald-600" />
                    <span>+54 341 345-6789</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-emerald-600" />
                    <span>Lun-Jue: 8:00-22:30 | Vie-Sáb: 8:00-23:30</span>
                  </div>
                </div>
                <Link href="/reservar">
                  <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">Reservar en Sur</Button>
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

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <h5 className="text-xl font-bold">Lavalle Padel</h5>
              </div>
              <p className="text-slate-400">El mejor club de padel de Rosario con 3 sedes y reservas online.</p>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Sedes</h6>
              <ul className="space-y-2 text-slate-400">
                <li>Centro - Av. Pellegrini 1234</li>
                <li>Norte - Bv. Oroño 2567</li>
                <li>Sur - Av. Circunvalación 3890</li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Contacto</h6>
              <ul className="space-y-2 text-slate-400">
                <li>Centro: +54 341 123-4567</li>
                <li>Norte: +54 341 234-5678</li>
                <li>Sur: +54 341 345-6789</li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Horarios</h6>
              <ul className="space-y-2 text-slate-400">
                <li>Lun - Jue: 7:00 - 23:00</li>
                <li>Vie - Sáb: 7:00 - 24:00</li>
                <li>Domingo: 8:00 - 23:00</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 Lavalle Padel. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
