import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

export const runtime = "nodejs";

function getBaseUrl(req: Request) {
  // 1) Usa la env si existe (recomendado)
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, ""); // sin barra final

  // 2) Fallback al origin de la request (dev)
  const { origin } = new URL(req.url);
  return origin.replace(/\/+$/, "");
}

function buildUrl(base: string, path: string, params?: Record<string, string>) {
  const url = new URL(path, base);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.toString();
}

export async function POST(req: Request) {
  try {
    const { reservationId, title, unitPrice, payer } = await req.json();

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) throw new Error("MP_ACCESS_TOKEN no configurado");

    const base = getBaseUrl(req);
    const successUrl = buildUrl(base, "/pago/success", { reservationId: String(reservationId) });
    const failureUrl = buildUrl(base, "/pago/failure", { reservationId: String(reservationId) });
    const pendingUrl = buildUrl(base, "/pago/pending", { reservationId: String(reservationId) });

    // Logs de sanity
    console.log("[MP] token loaded:", accessToken.slice(0, 10) + "…");
    console.log("[MP] base:", base);
    console.log("[MP] back_urls:", { successUrl, failureUrl, pendingUrl });

    const client = new MercadoPagoConfig({ accessToken });
    const pref = new Preference(client);

    const created = await pref.create({
      body: {
        items: [
          {
            id: String(reservationId),
            title,
            quantity: 1,
            unit_price: Number(unitPrice),
            currency_id: "ARS",
          },
        ],
        external_reference: String(reservationId),
        payer: { email: payer?.email, name: payer?.name },
        back_urls: {
          success: successUrl,
          failure: failureUrl,
          pending: pendingUrl,
        },
        // Solo usar auto_return si successUrl está bien definida
        auto_return: "approved",
        notification_url: buildUrl(base, "/api/mercado-pago-webhook"),
      },
    });

    return NextResponse.json({
      init_point: created.init_point ?? created.sandbox_init_point,
      preference_id: created.id,
    });
  } catch (e: any) {
    console.error("MP checkout error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Error creando preferencia" },
      { status: 500 }
    );
  }
}
