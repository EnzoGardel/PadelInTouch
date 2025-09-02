"use client"

import React from "react"
import { Navbar } from "@/components/shared/navbar"
import { Footer } from "@/components/shared/footer"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, MapPin, ArrowRight, MessageCircle } from "lucide-react"

// -----------------------------
// Tipos y utilidades
// -----------------------------

type TournamentStatus = "live" | "upcoming" | "past"

interface Tournament {
  id: string
  name: string
  location: string
  startDate: string // ISO date
  endDate: string // ISO date
  bannerUrl?: string
  registrationUrl?: string
  resultsUrl?: string
}

const formatDateRange = (startISO: string, endISO: string) => {
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" }
  const start = new Date(startISO)
  const end = new Date(endISO)
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
  const base = new Intl.DateTimeFormat("es-AR", opts)
  const withYear = new Intl.DateTimeFormat("es-AR", { ...opts, year: "numeric" })
  const fmt = (d: Date) => (d.getFullYear() === new Date().getFullYear() ? base.format(d) : withYear.format(d))
  return sameMonth
    ? `${fmt(start)} – ${end.toLocaleDateString("es-AR", { day: "2-digit" })}`
    : `${fmt(start)} – ${fmt(end)}`
}

const getStatus = (t: Tournament, now = new Date()): TournamentStatus => {
  const s = new Date(t.startDate).getTime()
  const e = new Date(t.endDate).getTime()
  const n = now.getTime()
  if (n >= s && n <= e) return "live"
  if (n < s) return "upcoming"
  return "past"
}

// WhatsApp (usá NEXT_PUBLIC_WHATSAPP_NUMBER para inyectar el número en build)
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5493790000000"
const waLink = (t: Tournament) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hola! Quisiera más información sobre el torneo ${t.name} (${formatDateRange(t.startDate, t.endDate)}) en ${t.location}.`
  )}`

// -----------------------------
// 5 torneos de ejemplo (mismo año actual)
// -----------------------------

const Y = new Date().getFullYear()
const TOURNAMENTS: Tournament[] = [
  {
    id: "t-01",
    name: "Apertura Ciudad Capital",
    location: "Rosario, Santa Fe.",
    startDate: `${Y}-02-14`,
    endDate: `${Y}-02-16`,
    bannerUrl: "/torneos/torneo-1.png",
    resultsUrl: "/torneos/t-01",
  },
  {
    id: "t-02",
    name: "Gran Prix Otoño",
    location: "Rosario, Santa Fe.",
    startDate: `${Y}-04-05`,
    endDate: `${Y}-04-07`,
    bannerUrl: "/torneos/torneo-2.png",
  },
  {
    id: "t-03",
    name: "Master Invierno",
    location: "Rosario, Santa Fe.",
    startDate: `${Y}-07-19`,
    endDate: `${Y}-07-21`,
    bannerUrl: "/torneos/torneo-3.png",
  },
  {
    id: "t-04",
    name: "Copa Primavera",
    location: "Rosario, Santa Fe.",
    startDate: `${Y}-09-13`,
    endDate: `${Y}-09-15`,
  },
  {
    id: "t-05",
    name: "Clausura Provincial",
    location: "Rosario, Santa Fe.",
    startDate: `${Y}-11-08`,
    endDate: `${Y}-11-10`,
  },
]

// -----------------------------
// UI
// -----------------------------

function TournamentCard({ t }: { t: Tournament }) {
  const status = getStatus(t)
  const statusInfo: Record<TournamentStatus, { label: string; cls: string }> = {
    live: { label: "Vigente", cls: "bg-green-600 text-white" },
    upcoming: { label: "Próximo", cls: "bg-blue-600 text-white" },
    past: { label: "Finalizado", cls: "bg-gray-300 text-gray-800" },
  }

  return (
    <Card className="overflow-hidden border-0 shadow-xl bg-white/95 py-5">
      {t.bannerUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={t.bannerUrl} alt="banner torneo" className="h-60 w-full object-containt" />
      ) : null}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-xl font-bold leading-tight">{t.name}</CardTitle>
          <Badge className={statusInfo[status].cls}>{statusInfo[status].label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span>{formatDateRange(t.startDate, t.endDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{t.location}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Estado: {statusInfo[status].label}</span>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2">
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <a href={waLink(t)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
            Consultar por WhatsApp <MessageCircle className="h-4 w-4" />
          </a>
        </Button>
        {t.resultsUrl ? (
          <Button variant="secondary" asChild>
            <a href={t.resultsUrl} className="inline-flex items-center gap-2">
              Resultados <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  )
}

export default function TournamentsPage() {
  const year = new Date().getFullYear()

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        <div className="absolute top-0 z-[-2] h-screen w-screen bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Torneos {year}</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Todos los torneos del año: vigentes, próximos y finalizados.
            </p>
          </div>

          {/* Listado simple (sin filtros) */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOURNAMENTS.map(t => (
              <TournamentCard key={t.id} t={t} />)
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
