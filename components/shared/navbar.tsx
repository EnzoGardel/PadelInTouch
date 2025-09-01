"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"


export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Inicio" },
    { href: "/ranking", label: "Ranking" },
    { href: "/torneos", label: "Torneos" },
    { href: "#ubicaciones", label: "Sedes" },
    { href: "#sobre-nosotros", label: "Nosotros" },
    { href: "#contacto", label: "Contacto" },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1E1E22]/95 backdrop-blur supports-[backdrop-filter]:bg-[#1E1E22]/80 border-b border-white/10">
      <div className="w-full px-8 lg:px-12">
        <div className="h-16 flex items-center justify-between">

          {/* Izquierda: botón/ícono */}
          <a href="/" className="text-lg font-bold text-white">
            <div className="flex items-center gap-2">
                <img src="/Logo-padel.webp" alt="Logo Lavalle PadelClub" className="h-10 w-10 rounded-full " />
                Lavalle PadelClub
            </div>
          </a>
          {/* Centro: navegación (solo desktop) */}
          <nav className="absolute left-1/2 -translate-x-1/2 hidden md:block">
            <ul className="flex items-center gap-8">
              {navItems.map((item) => {
                const active = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`text-md font-semibold nav-link-underline ${
                        active ? "text-white active" : "text-white/70 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Derecha: CTA */}
          <div className="flex items-center">
            <Button
              asChild
              className="rounded-full bg-primary hover:bg-[#0084ff] transition-all duration-300 text-white px-5 py-2"
            >
              <Link href="/reserva">¡Reservá tu cancha!</Link>
            </Button>
          </div>
        </div>

        {/* Menú móvil */}
        {isOpen && (
          <div className="md:hidden border-t border-white/10">
            <ul className="px-4 py-3 space-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="block rounded-md px-3 py-2 text-white/90 hover:bg-white/10 nav-link-underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Button
                  asChild
                  className="w-full rounded-full bg-[#E53935] hover:bg-[#d73633] text-white"
                >
                  <Link href="/reserva" onClick={() => setIsOpen(false)}>
                    ¡Reservá tu cancha!
                  </Link>
                </Button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  )
}
