export default function SuccessPage({ searchParams }: { searchParams: { reservationId?: string }}) {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold">¡Pago aprobado! ✅</h1>
      <p className="mt-2">Tu reserva #{searchParams.reservationId ?? "—"} quedó confirmada.</p>
    </div>
  );
}
