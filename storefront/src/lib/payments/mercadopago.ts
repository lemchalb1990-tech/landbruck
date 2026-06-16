export interface MPConfig {
  enabled: boolean
  sandbox: boolean
  publicKey: string
  accessToken: string
}

export async function createMPPreference(config: MPConfig, order: {
  id: number
  items: { name: string; quantity: number; price: number }[]
  email: string
  siteUrl: string
}) {
  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.accessToken}`,
    },
    body: JSON.stringify({
      items: order.items.map(i => ({
        title:      i.name,
        quantity:   i.quantity,
        unit_price: i.price,
        currency_id: 'CLP',
      })),
      payer: { email: order.email },
      back_urls: {
        success: `${order.siteUrl}/checkout/retorno?provider=mercadopago&status=success`,
        failure: `${order.siteUrl}/checkout/retorno?provider=mercadopago&status=failure`,
        pending: `${order.siteUrl}/checkout/retorno?provider=mercadopago&status=pending`,
      },
      auto_return: 'approved',
      notification_url: `${order.siteUrl}/api/webhooks/mercadopago`,
      external_reference: order.id.toString(),
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`MercadoPago error: ${err}`)
  }
  const data = await res.json()
  return {
    url: (config.sandbox ? data.sandbox_init_point : data.init_point) as string,
    preferenceId: data.id as string,
  }
}
