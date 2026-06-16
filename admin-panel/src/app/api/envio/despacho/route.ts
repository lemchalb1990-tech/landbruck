import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface StarkenConfig {
  enabled:       boolean
  apiUrl:        string
  apiKey:        string
  accountNumber: string
  originCity:    string
  originAddress: string
  originPhone:   string
  service:       string
}

export async function POST(req: Request) {
  const session = getAdminSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { orderId } = await req.json()
  if (!orderId) return NextResponse.json({ error: 'orderId requerido' }, { status: 400 })

  const [order, config] = await Promise.all([
    prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: { customer: true },
    }),
    prisma.siteConfig.findUnique({ where: { key: 'shipping' } }),
  ])

  if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  if (order.trackingNumber) return NextResponse.json({ error: 'Este pedido ya tiene un despacho generado' }, { status: 409 })

  const cfg = config?.value as StarkenConfig | undefined
  if (!cfg?.enabled || !cfg.apiKey || !cfg.accountNumber) {
    return NextResponse.json({ error: 'Starken no está configurado o habilitado' }, { status: 422 })
  }

  const payload = {
    account: cfg.accountNumber,
    service: cfg.service || 'NORMAL',
    sender: {
      name:    'Landbruck',
      city:    cfg.originCity || 'Santiago',
      address: cfg.originAddress || '',
      phone:   cfg.originPhone || '',
    },
    receiver: {
      name:    order.customer.name,
      city:    order.city,
      address: order.address,
      phone:   order.phone || order.customer.phone || '',
    },
    package:   { weight_kg: 0.5, pieces: 1 },
    reference: `ORDEN-${order.id}`,
  }

  const baseUrl = cfg.apiUrl || 'https://api.starken.cl'
  const starkenRes = await fetch(`${baseUrl}/orders`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify(payload),
  })

  if (!starkenRes.ok) {
    const text = await starkenRes.text()
    console.error('[starken]', starkenRes.status, text)
    return NextResponse.json({ error: `Error Starken: ${starkenRes.status}` }, { status: 502 })
  }

  const { tracking_number, label_url } = await starkenRes.json()

  await prisma.order.update({
    where: { id: order.id },
    data:  { trackingNumber: tracking_number, trackingUrl: label_url, status: 'SHIPPED' },
  })

  return NextResponse.json({ trackingNumber: tracking_number, trackingUrl: label_url })
}
