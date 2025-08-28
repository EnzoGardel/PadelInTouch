"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Slide = { src: string; alt?: string };

type HeroRotatorProps = {
  className?: string;
  slides: Slide[];
  intervalMs?: number;
  overlay?: string;       // tailwind class para el overlay
  mode?: "background" | "card"; // background = ocupa el contenedor completo sin marco
};

export default function HeroRotator({
  className = "",
  slides,
  intervalMs = 6000,
  overlay = "bg-black/40",
  mode = "background",
}: HeroRotatorProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!slides?.length) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      intervalMs
    );
    return () => clearInterval(id);
  }, [slides, intervalMs]);

  if (!slides?.length) return null;

  // === MODO BACKGROUND (lleno) ===
  if (mode === "background") {
    return (
      <div
        className={`
          absolute inset-0 w-full h-full
          ${className}
        `}
      >
        {slides.map((s, i) => (
          <Image
            key={s.src}
            src={s.src}
            alt={s.alt ?? "Hero background"}
            fill
            priority={i === 0}
            className={`
              object-cover
              transition-opacity duration-1000 ease-out
              ${i === index ? "opacity-100" : "opacity-0"}
            `}
          />
        ))}
        {/* Overlay para contraste */}
        <div className={`absolute inset-0 ${overlay}`} />
      </div>
    );
  }

  // === MODO CARD (mantengo por si lo querés usar en otra parte) ===
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        ${className}
      `}
    >
      <div className="absolute inset-0">
        {slides.map((s, i) => (
          <Image
            key={s.src}
            src={s.src}
            alt={s.alt ?? "Slide"}
            fill
            priority={i === 0}
            className={`
              object-cover rounded-2xl
              transition-opacity duration-1000 ease-out
              ${i === index ? "opacity-100" : "opacity-0"}
            `}
          />
        ))}
      </div>
      <div className={`absolute inset-0 ${overlay}`} />
      {/* si quisieras dots / textos, irían aquí */}
    </div>
  );
}
