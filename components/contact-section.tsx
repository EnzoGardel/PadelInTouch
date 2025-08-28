"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "@/components/icons"
import { 
    Phone, 
    Mail,
    MapPin,
    MessageCircle,
    Facebook, 
    Instagram, 
} from "lucide-react";


export function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido"
    }

    if (!formData.message.trim()) {
      newErrors.message = "El mensaje es requerido"
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

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al enviar el mensaje")
      }

      toast({
        title: "¡Mensaje enviado!",
        description: "Gracias por contactarnos. Te responderemos pronto.",
      })

      setFormData({ name: "", email: "", phone: "", message: "" })
      setErrors({})
    } catch (error) {
      console.error("Contact error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al enviar el mensaje",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: Icons.MapPin,
      title: "Dirección",
      content: "Lavalle 123, Rosario, Santa Fe",
      subContent: "Argentina",
    },
    {
      icon: Icons.Phone,
      title: "Teléfono",
      content: "+54 341 555-1234",
      subContent: "Lunes a Domingo",
    },
    {
      icon: Icons.Mail,
      title: "Email",
      content: "contacto@lavallepadelclub.com",
      subContent: "Respuesta en 24hs",
    },
    {
      icon: Icons.Clock,
      title: "Horarios",
      content: "8:00 - 23:00",
      subContent: "Todos los días",
    },
  ]

  return (
    <section id="contacto" className="max-w-7xl mt-32 mb-32 p-8 mx-auto bg-white/20 rounded-3xl">
        <div className="container mx-auto px-4">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Contactanos</h2>
                <p className="text-xl text-gray-300">¿Tenés alguna consulta? Dejanos tu mensaje y te contactaremos a la brevedad.</p>
            </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                <h3 className="text-2xl text-white font-semibold mb-6">Información de Contacto</h3>
                <div className="space-y-6">
                    <div className="flex items-start">
                    <MapPin className="h-6 w-6 text-white mr-4 mt-1" />
                    <div>
                        <h4 className="font-semibold text-white">Dirección</h4>
                        <p className="text-gray-300">Av. Pellegrini 1234, Rosario, Santa Fe</p>
                    </div>
                    </div>
                    <div className="flex items-start">
                    <Phone className="h-6 w-6 text-white mr-4 mt-1" />
                    <div>
                        <h4 className="font-semibold text-white">Teléfono</h4>
                        <p className="text-gray-300">+54 341 221-1335</p>
                    </div>
                    </div>
                    <div className="flex items-start">
                    <Mail className="h-6 w-6 text-white mr-4 mt-1" />
                    <div>
                        <h4 className="font-semibold text-white">Email</h4>
                        <p className="text-gray-300">Lavallepadelclub@gmail.com</p>
                    </div>
                    </div>
                    <div className="flex items-start">
                    <MessageCircle className="h-6 w-6 text-white mr-4 mt-1" />
                    <div>
                        <h4 className="font-semibold text-white">WhatsApp</h4>
                        <p className="text-gray-300">+54 341 221-1335</p>
                    </div>
                    </div>
                </div>

                <div className="mt-8">
                    <h4 className="font-semibold text-white mb-4">Horarios :</h4>
                    <div className="text-gray-300">
                      <p>Lunes a Viernes: 8:00 - 23:00</p>
                      <p>Sábados y Domingos: 8:00 - 23:00</p>
                    </div>
                </div>

                <div className="mt-8">
                    <h4 className="font-semibold text-white mb-4">Seguinos en Redes</h4>
                    <div className="flex space-x-4">
                    <Button
                        size="sm"
                        className=" hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors bg-white/10"
                    >
                        <Facebook className="h-4 w-4" />
                    </Button>
                    <a href="#" target="_blank">  
                      <Button
                          size="sm"
                          className="hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white hover:border-transparent transition-all bg-white/10"
                            >
                          <Instagram className="h-4 w-4" />
                      </Button>
                    </a>
                    <a target="blank" href="https://wa.me/5493411234567">
                        <Button
                        size="sm"
                        className="hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors bg-white/10"
                        >
                        <MessageCircle className="h-4 w-4" />
                        </Button>
                    </a>
                    </div>
                </div>
                </div>

                <div>
                <Card className="p-6 bg-white/90">
                    <h3 className="text-2xl font-semibold mb-2">Envianos un Mensaje</h3>
                    <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium mb-2}">Nombre</label>
                        <Input type="text" minLength={3} maxLength={50} required placeholder="Tu nombre" />
                        </div>
                        <div>
                        <label className="block text-sm font-medium mb-2">Apellido</label>
                        <Input type="text" minLength={3} maxLength={50} required placeholder="Tu apellido" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <Input type="email" minLength={3} maxLength={50} required placeholder="tu@email.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Teléfono</label>
                        <Input type="number" pattern="[0-9],{7,15}" required placeholder="Tu teléfono" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Mensaje</label>
                        <Textarea rows={4} minLength={10} maxLength={500} required placeholder="Contanos en qué podemos ayudarte..." />
                    </div>
                    <Button className="w-full hover:bg-[#0084ff]" size="lg">
                        Enviar Mensaje
                    </Button>
                    </form>
                </Card>
                </div>
            </div>
      </div>
            
      <div className="mt-16 max-w-7xl mx-auto mb-16 ">
        <Card className="overflow-hidden mx-4 sm:mx-6 lg:mx-8">
          <CardContent className="p-0">
            <div className="h-96 bg-muted/50 flex items-center justify-center relative">
                <iframe
                  style={{ border: 0}}
                  id="map"
                  src="https://www.google.com/maps/d/u/0/embed?mid=1sAZWbdNbo9cbN6Pv_WGXOF-TlkGQ2vE&ehbc=2E312F"
                  width="100%"
                  height="100%"
                  loading="lazy"
                ></iframe>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
