"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Menu, X, Plus, Instagram, Facebook } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"

/* ========== Tipos/Helpers ========== */

type MobileLink = { label: string; href: string; target?: "_blank" }
type ContactInfo = {
  phone?: string
  email?: string
  address?: string
  instagram?: string
  facebook?: string
}

function useIsClient() {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  return mounted
}

/* ========== Mobile Hamburger (overlay via Portal + Motion) ========== */

function MobileHamburgerMenu({
  items,
  contact,
  className,
}: {
  items: MobileLink[]
  contact?: ContactInfo
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const mounted = useIsClient()

  // Esc para cerrar
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  // Lock scroll mientras está abierto
  React.useEffect(() => {
    if (!mounted) return
    const el = document.documentElement
    if (open) {
      const prev = el.style.overflow
      el.style.overflow = "hidden"
      return () => {
        el.style.overflow = prev
      }
    }
  }, [open, mounted])

  return (
    <div className={cn("md:hidden", className)}>
      {/* Trigger */}
      <button
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center rounded-md p-2 text-white/90 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay en Portal al <body> con animación */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[1000] grid grid-rows-[auto_1fr] bg-black/90 backdrop-blur-sm"
              >
                {/* Fondo con pattern */}
                <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Top bar */}
                <div className="flex items-center justify-between px-4 py-3 pt-[calc(env(safe-area-inset-top,0px)+12px)]">
                  <span className="text-white/80 text-sm">Menú</span>
                  <button
                    aria-label="Cerrar"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center rounded-md p-2 text-white/90 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Contenido */}
                <motion.div
                  key="content"
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 8, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="grid grid-cols-1 gap-8 overflow-y-auto px-5 pb-10 md:grid-cols-[1fr_340px] md:gap-12 md:px-10"
                >
                  {/* Links grandes con + */}
                  <nav className="flex flex-col gap-3 pt-2">
                    {items.map((item, i) => (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.18, delay: 0.04 * i }}
                      >
                        <Link
                          href={item.href}
                          target={item.target}
                          rel={item.target === "_blank" ? "noreferrer" : undefined}
                          onClick={() => setOpen(false)}
                          className="group inline-flex items-center gap-3 text-4xl font-semibold leading-[1.1] text-white hover:text-white/90 sm:text-5xl"
                        >
                          <span className="tracking-tight">{item.label}</span>
                          <Plus className="h-5 w-5 text-white/50 transition-transform group-hover:rotate-90" />
                        </Link>
                      </motion.div>
                    ))}

                    {/* CTA dentro del overlay */}
                    <div className="mt-6">
                      <Button
                        asChild
                        className="w-full rounded-full bg-primary hover:bg-[#0084ff] text-white text-base py-6"
                        onClick={() => setOpen(false)}
                      >
                        <Link href="/reserva">¡Reservá tu cancha!</Link>
                      </Button>
                    </div>
                  </nav>

                  {/* Columna derecha: contacto y redes */}
                  <aside className="flex flex-col gap-4 text-white/80">
                    {(contact?.phone || contact?.email) && (
                      <div className="space-y-1">
                        <p className="text-sm text-white/60">Atención e informes</p>
                        {contact.phone && (
                          <a href={`tel:${contact.phone}`} className="block text-white hover:underline">
                            {contact.phone}
                          </a>
                        )}
                        {contact.email && (
                          <a href={`mailto:${contact.email}`} className="block text-white hover:underline">
                            {contact.email}
                          </a>
                        )}
                      </div>
                    )}

                    {contact?.address && (
                      <div className="space-y-1">
                        <p className="text-sm text-white/60">Dirección</p>
                        <p className="text-white">{contact.address}</p>
                      </div>
                    )}

                    {(contact?.instagram || contact?.facebook) && (
                      <div className="mt-2 flex items-center gap-4">
                        {contact.instagram && (
                          <a
                            href={contact.instagram}
                            target="_blank"
                            rel="noreferrer"
                            className="text-white/80 hover:text-white"
                          >
                            <Instagram className="h-5 w-5" />
                          </a>
                        )}
                        {contact.facebook && (
                          <a
                            href={contact.facebook}
                            target="_blank"
                            rel="noreferrer"
                            className="text-white/80 hover:text-white"
                          >
                            <Facebook className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    )}
                  </aside>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  )
}

/* ======================= NAVBAR ======================= */

export function Navbar() {
  const pathname = usePathname()

  const navItems: MobileLink[] = [
    { href: "/", label: "Inicio" },
    { href: "/ranking", label: "Ranking" },
    { href: "/torneos", label: "Torneos" },
    { href: "#ubicaciones", label: "Sedes" },
    { href: "#sobre-nosotros", label: "Nosotros" },
    { href: "#contacto", label: "Contacto" },
    { href: "https://academiadepadel.com.ar/", label: "Nuestra Academia", target: "_blank" },
  ]

  const contact: ContactInfo = {
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
    address: process.env.NEXT_PUBLIC_CONTACT_ADDRESS || "",
    instagram: process.env.NEXT_PUBLIC_CONTACT_IG || "",
    facebook: process.env.NEXT_PUBLIC_CONTACT_FB || "",
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1E1E22]/95 backdrop-blur supports-[backdrop-filter]:bg-[#1E1E22]/80 border-b border-white/10">
      <div className="w-full px-8 lg:px-12">
        <div className="h-16 flex items-center justify-between">
          {/* Brand */}
          <a href="/" className="text-lg font-bold text-white">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Logo-padel.webp" alt="Logo Lavalle PadelClub" className="h-10 w-10 rounded-full" />
              Lavalle PadelClub
            </div>
          </a>

          {/* Navegación de escritorio */}
          <nav className="absolute left-1/2 -translate-x-1/2 hidden md:block">
            <ul className="flex items-center gap-8">
              {navItems.map((item) => {
                const active = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      target={item.target}
                      rel={item.target === "_blank" ? "noreferrer" : undefined}
                      className={cn(
                        "text-md font-semibold nav-link-underline",
                        active ? "text-white active" : "text-white/70 hover:text-white"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* CTA escritorio + menú mobile */}
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <Button
                asChild
                className="rounded-full bg-primary hover:bg-[#0084ff] transition-all duration-300 text-white px-5 py-2"
              >
                <Link href="/reserva">¡Reservá tu cancha!</Link>
              </Button>
            </div>

            {/* Menú mobile */}
            <MobileHamburgerMenu items={navItems} contact={contact} />
          </div>
        </div>
      </div>
    </nav>
  )
}
