"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import { formatPrice } from "@/lib/time"

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  price: number
  startUtc: string
  endUtc: string
}

interface SlotsListProps {
  slots: TimeSlot[]
  onBookSlot: (slot: TimeSlot) => void
  isLoading?: boolean
}

export function SlotsList({ slots, onBookSlot, isLoading }: SlotsListProps) {
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-4 bg-muted rounded w-2/3 mb-4" />
                <div className="h-10 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center py-12">
        <div className="bg-muted/50 rounded-lg p-8">
          <Icons.Clock />
          <h3 className="text-lg font-semibold text-foreground mb-2">No hay horarios disponibles</h3>
          <p className="text-muted-foreground">
            No se encontraron horarios disponibles para la fecha y cancha seleccionada. Probá con otra fecha o cancha.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold text-foreground mb-6 text-center">Horarios disponibles</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {slots.map((slot) => (
          <Card key={slot.id} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Icons.Clock />
                  <span className="font-semibold text-foreground">
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2 mb-4">
                <Icons.DollarSign />
                <span className="text-lg font-bold text-primary">{formatPrice(slot.price)}</span>
              </div>
              <Button onClick={() => onBookSlot(slot)} className="w-full" size="sm">
                Reservar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
