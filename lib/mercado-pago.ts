export interface MercadoPagoPreferenceItem {
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
}

export async function createPreference(items: MercadoPagoPreferenceItem[], external_reference: string) {
  const accessToken = process.env.MP_ACCESS_TOKEN!;
  const baseUrl = process.env.PUBLIC_BASE_URL!;
  const resp = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      items,
      external_reference,
      auto_return: 'approved',
      back_urls: {
        success: `${baseUrl}/reserva/success?b=${external_reference}`,
        failure: `${baseUrl}/reserva/failure?b=${external_reference}`,
        pending: `${baseUrl}/reserva/pending?b=${external_reference}`
      },
      notification_url: `${baseUrl}/api/mercado-pago-webhook`
    })
  });

  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`MercadoPago error: ${t}`);
  }
  return resp.json();
}