import { Suspense } from "react";
import ReservaClient from "./ReservaClient";

export default function ReservarPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ReservaClient />
    </Suspense>
  );
}


