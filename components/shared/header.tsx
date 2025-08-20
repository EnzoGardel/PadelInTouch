import { Trophy, Settings } from "lucide-react"     
import Link from "next/link"    

export default function Header() {
  return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Lavalle PadelClub</h1>
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
              <Link href="https://academiadepadel.com.ar/" target="_blank" className="text-slate-600 hover:text-emerald-600 transition-colors">
                Nuestra Academia
              </Link>
              <Link href="/admin" className="text-slate-600 hover:text-emerald-600 transition-colors">
                <Settings className="h-4 w-4 inline mr-1" />
                Admin
              </Link>
            </nav>
          </div>
        </div>
      </header>
    )
        }