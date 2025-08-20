import { Trophy } from "lucide-react"     


export default function Footer() {
  return (     
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
    )
        }