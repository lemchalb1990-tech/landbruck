import crypto from 'crypto'

export interface FlowConfig {
  enabled: boolean
  sandbox: boolean
  apiKey: string
  secretKey: string
}

function sign(params: Record<string, string>, secret: string): string {
  const toSign = Object.keys(params).sort().map(k => `${k}${params[k]}`).join('')
  return crypto.createHmac('sha256', secret).update(toSign).digest('hex')
}

function baseUrl(sandbox: boolean) {
  return sandbox ? 'https://sandbox.flow.cl/app/web' : 'https://www.flow.cl/app/web'
}

export async function createFlowPayment(config: FlowConfig, order: {
  id: number; total: number; email: string; siteUrl: string
}) {
  const params: Record<string, string> = {
    apiKey:          config.apiKey,
    commerceOrder:   order.id.toString(),
    subject:         `Pedido #${order.id} - Landbruck`,
    currency:        'CLP',
    amount:          Math.round(order.total).toString(),
    email:           order.email,
    urlConfirmation: `${order.siteUrl}/api/webhooks/flow`,
    urlReturn:       `${order.siteUrl}/checkout/retorno`,
  }
  params.s = sign(params, config.secretKey)

  const res = await fetch(`${baseUrl(config.sandbox)}/payment/create`, {
    method: 'POST',
    body: new URLSearchParams(params),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  if (!res.ok) throw new Error(`Flow error ${res.status}`)
  const data = await res.json()
  return { url: `${data.url}?token=${data.token}` as string, token: data.token as string }
}

export async function getFlowStatus(config: FlowConfig, token: string) {
  const params: Record<string, string> = { apiKey: config.apiKey, token }
  params.s = sign(params, config.secretKey)
  const url = new URL(`${baseUrl(config.sandbox)}/payment/getStatus`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Flow status error ${res.status}`)
  return await res.json() as {
    commerceOrder: string
    status: number
    paymentData?: { status: number }
  }
}
