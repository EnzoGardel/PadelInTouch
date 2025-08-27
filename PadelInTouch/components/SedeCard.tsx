import React from "react";
import { MapPin, Phone, Clock } from "lucide-react";

export type Sede = {
  id: string;
  nombre: string;
  imagen: string;
  direccion: string;
  telefono: string;
  horario?: string;   // opcional
  canchas?: number;   // opcional
};

type Props = {
  sede: Sede;
  seleccionable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
};

const SedeCard: React.FC<Props> = ({ sede, seleccionable = false, selected, onSelect }) => {
  return (
    <div
      className={`border rounded-2xl shadow-md overflow-hidden cursor-${
        seleccionable ? "pointer" : "default"
      } transition 
        ${seleccionable && selected ? "ring-2 ring-green-500" : "hover:shadow-lg"}`}
      onClick={seleccionable ? () => onSelect && onSelect(sede.id) : undefined}
    >
      {/* Imagen */}
      <img
        src={sede.imagen}
        alt={sede.nombre}
        className="w-full h-48 object-cover"
      />

      {/* Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold">{sede.nombre}</h3>
        {sede.canchas && (
          <span className="inline-block bg-green-100 text-green-700 text-sm px-2 py-1 rounded-md">
            {sede.canchas} canchas
          </span>
        )}

        <div className="mt-2 space-y-1 text-gray-700 text-sm">
          <p className="flex items-center gap-2">
            <MapPin size={16} /> {sede.direccion}
          </p>
          <p className="flex items-center gap-2">
            <Phone size={16} /> {sede.telefono}
          </p>
          {sede.horario && (
            <p className="flex items-center gap-2">
              <Clock size={16} /> {sede.horario}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SedeCard;
