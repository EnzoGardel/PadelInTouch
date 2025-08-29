import { Suspense } from "react";
import PagoClient from "./PagoClient";

export default function PagoPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <PagoClient />
    </Suspense>
  );
}



