"use client";

import React from "react";
import Image from "next/image";
import { MapPin, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Sede = {
  id: string;
  nombre: string;
  imagen: string | null; // puede ser path ("carpeta/archivo.webp") o URL absoluta
  direccion: string;
  telefono: string;
  horario?: string;
  canchas?: number;
};

type Props = {
  sede: Sede;
  seleccionable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  showReservarButton?: boolean;
  onReservar?: (id: string) => void;
  disabled?: boolean;
};

/**
 * Construye una URL de imagen de Supabase usando SIEMPRE el endpoint /object (sin transforms).
 * De esta forma, quien optimiza es Next/Image y evitamos 400 por doble optimización.
 * También normaliza el path si viene con "public/" o si duplica el nombre del bucket.
 */
function buildImageUrl(pathOrUrl?: string | null, opts?: { bucket?: string }) {
  if (!pathOrUrl) return "/placeholder-branch.webp";

  // Si ya es absoluta o empieza con "/", devolver tal cual (sirve también para imágenes locales en /public)
  if (/^(https?:)?\/\//i.test(pathOrUrl) || pathOrUrl.startsWith("/")) {
    return pathOrUrl;
  }

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL; // p.ej. https://xxxxx.supabase.co
  if (!base) {
    // Fallback local si faltara la env
    return `/${encodeURI(pathOrUrl)}`;
  }

  const bucket = opts?.bucket ?? "canchas";

  // Normalizar: quitar "public/" al inicio y un posible prefijo redundante del bucket
  let p = pathOrUrl.trim().replace(/^public\//, "").replace(/^\/+/, "");
  if (p.startsWith(bucket + "/")) p = p.slice(bucket.length + 1);

  return `${base}/storage/v1/object/public/${bucket}/${encodeURI(p)}`;
}

const SedeCard: React.FC<Props> = ({
  sede,
  seleccionable = false,
  selected = false,
  onSelect,
  showReservarButton = false,
  onReservar,
  disabled = false,
}) => {
  const clickable = seleccionable && !showReservarButton;

  // Usamos /object (sin transforms). Next hará la optimización.
  const imgSrc = buildImageUrl(sede.imagen, { bucket: "canchas" });

  return (
    <div
      className={[
        "border-0 rounded-2xl shadow-md overflow-hidden transition select-none bg-white",
        clickable ? "cursor-pointer hover:shadow-lg" : "cursor-default",
        selected ? "ring-5 ring-primary" : "",
        disabled ? "opacity-60 pointer-events-none" : "",
      ].join(" ")}
      onClick={clickable ? () => onSelect?.(sede.id) : undefined}
    >
      {/* Imagen */}
      <div className="relative w-full h-48">
        <Image
          src={imgSrc}
          alt={sede.nombre ?? "Sede"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
          priority={false}
        />
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{sede.nombre}</h3>
          {typeof sede.canchas === "number" && (
            <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md">
              {sede.canchas} canchas
            </span>
          )}
        </div>

        <div className="mt-2 space-y-1 text-gray-700 text-sm">
          <p className="flex items-center gap-2">
            <MapPin className="text-primary" size={22} />
            {sede.direccion}
          </p>
          <p className="flex items-center gap-2">
            <Phone className="text-primary" size={22} />
            {/* Teléfono clickeable */}
            {sede.telefono ? (
              <a href={`tel:${sede.telefono.replace(/\s+/g, "")}`} className="hover:underline">
                {sede.telefono}
              </a>
            ) : (
              <span>-</span>
            )}
          </p>
          {sede.horario && (
            <p className="flex items-center gap-2">
              <Clock size={16} />
              {sede.horario}
            </p>
          )}
        </div>

        {showReservarButton && (
          <Button
            type="button"
            className="w-full mt-4 bg-primary hover:bg-primary/80"
            onClick={(e) => {
              e.stopPropagation();
              onReservar?.(sede.id);
            }}
            disabled={disabled}
          >
            Reservar
          </Button>
        )}
      </div>
    </div>
  );
};

export default React.memo(SedeCard);
