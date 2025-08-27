"use client";

import React from "react";
import Image from "next/image";
import { MapPin, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Sede = {
  id: string;
  nombre: string;
  imagen: string | null;   // puede ser path ("Cancha-lavalle.webp") o URL absoluta
  direccion: string;
  telefono: string;
  horario?: string;
  canchas?: number;
  // si tu API trae otros campos, dejalos acá sin problema
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
 * Construye la URL pública a partir del path guardado en la DB.
 * - Si ya es URL absoluta o empieza con "/", la devuelve tal cual.
 * - Si es un path de Storage, arma la URL pública del bucket "canchas".
 * - Si pasás width/height/quality, usa el endpoint de render (resize por CDN).
 */
function buildImageUrl(
  pathOrUrl?: string | null,
  opts?: { bucket?: string; width?: number; height?: number; quality?: number }
) {
  if (!pathOrUrl) return "/placeholder-branch.webp";
  if (/^(https?:)?\/\//i.test(pathOrUrl) || pathOrUrl.startsWith("/")) return pathOrUrl;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL; // https://xxxxx.supabase.co
  const bucket = opts?.bucket ?? "canchas";
  const path = pathOrUrl.replace(/^\/+/, ""); // evita // en la URL

  if (!base) return `/${encodeURI(path)}`; // fallback local si faltara la env

  const { width, height, quality } = opts ?? {};
  const qs = new URLSearchParams();
  if (width) qs.set("width", String(width));
  if (height) qs.set("height", String(height));
  if (quality) qs.set("quality", String(quality));
  const hasTransform = qs.toString().length > 0;

  return hasTransform
    ? `${base}/storage/v1/render/image/public/${bucket}/${encodeURI(path)}?${qs.toString()}`
    : `${base}/storage/v1/object/public/${bucket}/${encodeURI(path)}`;
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

  // Usamos render del CDN para servir una imagen optimizada
  const imgSrc = buildImageUrl(sede.imagen, { width: 1024, height: 512, quality: 80 });

  return (
    <div
      className={[
        "border rounded-2xl shadow-md overflow-hidden transition select-none bg-white",
        clickable ? "cursor-pointer hover:shadow-lg" : "cursor-default",
        selected ? "ring-2 ring-primary" : "",
        disabled ? "opacity-60 pointer-events-none" : "",
      ].join(" ")}
      onClick={clickable ? () => onSelect?.(sede.id) : undefined}
    >
      {/* Imagen */}
      <div className="relative w-full h-48">
        <Image
          src={imgSrc}
          alt={sede.nombre}
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
            <MapPin size={16} />
            {sede.direccion}
          </p>
          <p className="flex items-center gap-2">
            <Phone size={16} />
            {/* Hace el teléfono clickeable */}
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
