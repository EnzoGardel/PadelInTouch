import type React from "react"
import type { Metadata } from "next"
import { Work_Sans, Open_Sans } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const workSans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-work-sans",
  weight: ["400", "600", "700"],
})

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
  weight: ["400", "500"],
})

export const metadata: Metadata = {
  title: "Lavalle Padel Club - Las mejores canchas de pádel en Rosario",
  description:
    "Superficie de alto rendimiento, iluminación profesional y la historia de formar a quien hoy es el Nº1 del pádel mundial en sus inicios.",
  generator: "v0.app",
  keywords: ["padel", "rosario", "canchas", "deportes", "entrenamiento", "torneos"],
  openGraph: {
    title: "Lavalle Padel Club - Las mejores canchas de pádel en Rosario",
    description:
      "Superficie de alto rendimiento, iluminación profesional y la historia de formar a quien hoy es el Nº1 del pádel mundial en sus inicios.",
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lavalle Padel Club - Las mejores canchas de pádel en Rosario",
    description:
      "Superficie de alto rendimiento, iluminación profesional y la historia de formar a quien hoy es el Nº1 del pádel mundial en sus inicios.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export const viewport = { width: "device-width", initialScale: 1, maximumScale: 1 }

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${workSans.variable} ${openSans.variable} antialiased scroll-smooth`}
    >
      {/* Evitar cualquier fondo sólido aquí */}
      <body className="font-sans relative min-h-screen bg-transparent">
        {/* Fondo global fijo detrás de toda la app */}
        <div
          className="
            fixed inset-0 -z-10 pointer-events-none
            bg-[#000000]
            bg-[radial-gradient(#ffffff33_1px,#00091d_1px)]
            bg-[size:20px_20px]
          "
        />

        {children}
        <Toaster />
      </body>
    </html>
  )
}
