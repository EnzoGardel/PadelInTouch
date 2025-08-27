"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Building2, CheckCircle, Clock, Copy, ExternalLink } from "lucide-react"
import { updatePaymentStatus } from "@/lib/actions"

export default function PagoPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("")
  const [paymentStatus, setPaymentStatus] = useState<"selecting" | "processing" | "completed">("selecting")
  const [loading, setLoading] = useState(false)

  // Get reservation data from URL params
  const reservationId = searchParams.get("reservationId")
  const location = searchParams.get("location")
  const court = searchParams.get("court")
  const date = searchParams.get("date")
  const time = searchParams.get("time")
  const amount = searchParams.get("amount") || "1"

  useEffect(() => {
    if (!reservationId) {
      router.push("/reservar")
    }
  }, [reservationId, router])

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method)
  }

  const handleMercadoPagoPayment = async () => {
    setLoading(true)
    setPaymentStatus("processing")

    try {
      // Simulate Mercado Pago integration
      // In a real implementation, you would integrate with Mercado Pago SDK
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Update payment status in database
      if (reservationId) {
        await updatePaymentStatus(Number.parseInt(reservationId), "mercado_pago", "paid")
      }

      setPaymentStatus("completed")
    } catch (error) {
      console.error("Payment error:", error)
      setPaymentStatus("selecting")
    } finally {
      setLoading(false)
    }
  }

  const handleBankTransferPayment = async () => {
    setLoading(true)
    setPaymentStatus("processing")

    try {
      // Update payment status as pending for bank transfer
      if (reservationId) {
        await updatePaymentStatus(Number.parseInt(reservationId), "bank_transfer", "pending")
      }

      setPaymentStatus("completed")
    } catch (error) {
      console.error("Payment error:", error)
      setPaymentStatus("selecting")
    } finally {
      setLoading(false)
    }
  }

  const copyBankDetails = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (paymentStatus === "completed") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center">
            <CardContent className="p-8">
              <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-slate-900 mb-4">
                {selectedPaymentMethod === "mercado_pago" ? "¡Pago Confirmado!" : "¡Reserva Creada!"}
              </h1>
              <p className="text-lg text-slate-600 mb-6">
                {selectedPaymentMethod === "mercado_pago"
                  ? "Tu reserva ha sido confirmada y el pago procesado exitosamente."
                  : "Tu reserva ha sido creada. Realizá la transferencia bancaria para confirmarla."}
              </p>

              <div className="bg-slate-50 rounded-lg p-6 mb-6 text-left">
                <h3 className="font-semibold text-slate-900 mb-4">Detalles de tu reserva</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>
                    <strong>Ubicación:</strong> {location}
                  </p>
                  <p>
                    <strong>Cancha:</strong> {court}
                  </p>
                  <p>
                    <strong>Fecha:</strong> {date}
                  </p>
                  <p>
                    <strong>Horario:</strong> {time}
                  </p>
                  <p>
                    <strong>Monto:</strong> ${Number.parseInt(amount).toLocaleString()}
                  </p>
                  <p>
                    <strong>Estado:</strong>
                    <Badge
                      className={
                        selectedPaymentMethod === "mercado_pago"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {selectedPaymentMethod === "mercado_pago" ? "Confirmada" : "Pendiente de pago"}
                    </Badge>
                  </p>
                </div>
              </div>

              {selectedPaymentMethod === "bank_transfer" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-semibold text-yellow-800">Pendiente de transferencia</h4>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Realizá la transferencia bancaria y envianos el comprobante por WhatsApp para confirmar tu reserva.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => router.push("/")} className="bg-emerald-600 hover:bg-emerald-700">
                  Volver al Inicio
                </Button>
                <Button variant="outline" onClick={() => router.push("/reservar")}>
                  Nueva Reserva
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Finalizar Pago</h1>
          <p className="text-slate-600">Elegí tu método de pago preferido</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Métodos de Pago</h2>

            <div className="space-y-4">
              {/* Mercado Pago */}
              <Card
                className={`cursor-pointer transition-colors ${
                  selectedPaymentMethod === "mercado_pago"
                    ? "border-emerald-600 bg-emerald-50"
                    : "hover:border-emerald-300"
                }`}
                onClick={() => handlePaymentMethodSelect("mercado_pago")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">Mercado Pago</h3>
                      <p className="text-sm text-slate-600">Tarjeta de crédito, débito o dinero en cuenta</p>
                      <Badge className="bg-emerald-100 text-emerald-800 mt-1">Pago inmediato</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bank Transfer */}
              <Card
                className={`cursor-pointer transition-colors ${
                  selectedPaymentMethod === "bank_transfer"
                    ? "border-emerald-600 bg-emerald-50"
                    : "hover:border-emerald-300"
                }`}
                onClick={() => handlePaymentMethodSelect("bank_transfer")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">Transferencia Bancaria</h3>
                      <p className="text-sm text-slate-600">Transferí desde tu banco online o app</p>
                      <Badge className="bg-yellow-100 text-yellow-800 mt-1">Confirmación manual</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bank Transfer Details */}
            {selectedPaymentMethod === "bank_transfer" && (
              <Card className="mt-6 border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg">Datos para Transferencia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700">Banco</label>
                        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg mt-1">
                          <span className="text-slate-900">Banco Santander</span>
                          <Button variant="ghost" size="sm" onClick={() => copyBankDetails("Banco Santander")}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Titular</label>
                        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg mt-1">
                          <span className="text-slate-900">Lavalle Padel S.A.</span>
                          <Button variant="ghost" size="sm" onClick={() => copyBankDetails("Lavalle Padel S.A.")}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">CBU</label>
                        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg mt-1">
                          <span className="text-slate-900">0720123456789012345678</span>
                          <Button variant="ghost" size="sm" onClick={() => copyBankDetails("0720123456789012345678")}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Alias</label>
                        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg mt-1">
                          <span className="text-slate-900">LAVALLE.PADEL.ROSARIO</span>
                          <Button variant="ghost" size="sm" onClick={() => copyBankDetails("LAVALLE.PADEL.ROSARIO")}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Importante:</strong> Después de realizar la transferencia, envianos el comprobante por
                        WhatsApp al
                        <a
                          href="https://wa.me/5493411234567"
                          className="font-semibold underline ml-1"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          +54 9 341 123-4567
                        </a>{" "}
                        para confirmar tu reserva.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Button */}
            {selectedPaymentMethod && (
              <div className="mt-8">
                <Button
                  onClick={
                    selectedPaymentMethod === "mercado_pago" ? handleMercadoPagoPayment : handleBankTransferPayment
                  }
                  disabled={loading || paymentStatus === "processing"}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 py-4 text-lg"
                >
                  {loading ? (
                    "Procesando..."
                  ) : selectedPaymentMethod === "mercado_pago" ? (
                    <>
                      <ExternalLink className="h-5 w-5 mr-2" />
                      Pagar con Mercado Pago
                    </>
                  ) : (
                    "Confirmar Transferencia"
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumen de Reserva</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Ubicación:</span>
                    <span className="font-medium">{location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Cancha:</span>
                    <span className="font-medium">{court}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Fecha:</span>
                    <span className="font-medium">{date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Horario:</span>
                    <span className="font-medium">{time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Duración:</span>
                    <span className="font-medium">90 minutos</span>
                  </div>
                  <hr className="my-4" />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-emerald-600">${Number.parseInt(amount).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
