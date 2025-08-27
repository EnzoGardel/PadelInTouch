"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { formatPrice } from "@/lib/time"
import { Icons } from "@/components/icons"

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  price: number
  startUtc: string
  endUtc: string
}

interface BookingDialogProps {
  slot: TimeSlot | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (bookingId: string) => void
}

export function BookingDialog({ slot, isOpen, onClose, onSuccess }: BookingDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es requerido"
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!slot || !validateForm()) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slotId: slot.id,
          ...formData,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al crear la reserva")
      }

      toast({
        title: "¡Reserva confirmada!",
        description: "Tu reserva ha sido creada exitosamente.",
      })

      onSuccess(result.bookingId)
      onClose()
      setFormData({ name: "", phone: "", email: "", notes: "" })
      setErrors({})
    } catch (error) {
      console.error("Booking error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear la reserva",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      setFormData({ name: "", phone: "", email: "", notes: "" })
      setErrors({})
    }
  }

  if (!slot) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar reserva</DialogTitle>
        </DialogHeader>

        {/* Slot Details */}
        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Icons.Clock />
              <span className="font-semibold">
                {slot.startTime} - {slot.endTime}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Icons.DollarSign />
            <span className="text-lg font-bold text-primary">{formatPrice(slot.price)}</span>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Icons.User />
              <span>Nombre completo *</span>
            </Label>
            <Input
              placeholder="Tu nombre completo"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Icons.Phone />
              <span>Teléfono *</span>
            </Label>
            <Input
              placeholder="Tu número de teléfono"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
            />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Icons.Mail />
              <span>Email (opcional)</span>
            </Label>
            <Input
              placeholder="tu@email.com"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Icons.MessageSquare />
              <span>Comentarios (opcional)</span>
            </Label>
            <Textarea
              placeholder="Comentarios adicionales..."
              rows={3}
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 bg-transparent"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Reservando..." : "Confirmar reserva"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
