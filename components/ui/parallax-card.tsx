"use client";

import React from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

// Tilt solo en cliente
const Tilt = dynamic(() => import("react-parallax-tilt"), { ssr: false });

interface ParallaxCardProps {
  children: React.ReactNode;
  className?: string;
  scale?: number;
  tiltMaxAngleX?: number;
  tiltMaxAngleY?: number;
  transitionSpeed?: number;
  glareEnable?: boolean;
  glareMaxOpacity?: number;
  glareColor?: string;
  perspective?: number;
}

export function ParallaxCard({
  children,
  className,
  scale = 1.05,
  tiltMaxAngleX = 15,
  tiltMaxAngleY = 15,
  transitionSpeed = 800,
  glareEnable = true,
  glareMaxOpacity = 0.3,
  glareColor = "rgba(255, 255, 255, 0.3)",
  perspective = 1000,
}: ParallaxCardProps) {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => setMounted(true), []);
  
  if (!mounted) {
    return (
      <div className={cn("will-change-transform", className)}>
        {children}
      </div>
    );
  }

  return (
    <Tilt
      glareEnable={glareEnable}
      glareMaxOpacity={glareMaxOpacity}
      glareColor={glareColor}
      glarePosition="all"
      glareBorderRadius="16px"
      tiltEnable={mounted}
      scale={scale}
      tiltMaxAngleX={tiltMaxAngleX}
      tiltMaxAngleY={tiltMaxAngleY}
      transitionSpeed={transitionSpeed}
      gyroscope={true}
      perspective={perspective}
      reset
      className={cn("will-change-transform", className)}
    >
      {children}
    </Tilt>
  );
}

// Componente wrapper para cards con efecto 3D mejorado
export function Card3D({
  children,
  className,
  ...props
}: ParallaxCardProps) {
  return (
    <ParallaxCard
      className={cn("card-shadow-3d card-3d", className)}
      {...props}
    >
      {children}
    </ParallaxCard>
  );
}
