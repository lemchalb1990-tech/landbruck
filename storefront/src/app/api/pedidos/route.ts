import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { sendOrderConfirmation } from '@/lib/email'

export async function POST(req: Request) {
  const { name, email, phone, address, city, items, paymentProvider, shippingCost = 0 } = await req.json()

  if (!items?.length) {
    return NextResponse.json({ error: 'No hay productos' }, { status: 400 })
  }

  const productIds: number[] = items.map((i: { id: number }) => i.id)
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } })

  let customer = await prisma.customer.findUnique({ where: { email } })
  let tempPassword: string | undefined
  const isNewCustomer = !customer

  if (!customer) {
    tempPassword = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
    const hashed = await bcrypt.hash(tempPassword, 10)
    customer = await prisma.customer.create({
      data: { name, email, phone, address, city, password: hashed },
    })
  }

  const subtotal = items.reduce((sum: number, item: { id: number; quantity: number }) => {
    const product = products.find(p => p.id === item.id)
    return sum + (product ? Number(product.price) * item.quantity : 0)
  }, 0)
  const total = subtotal + (Number(shippingCost) || 0)

  const order = await prisma.order.create({
    data: {
      customerId:      customer.id,
      total,
      address,
      city,
      phone:           phone ?? '',
      paymentProvider: paymentProvider ?? null,
      paymentStatus:   'PENDING',
      items: {
        create: items.map((item: { id: number; quantity: number }) => {
          const product = products.find(p => p.id === item.id)!
          return { productId: item.id, quantity: item.quantity, price: product.price }
        }),
      },
    },
  })

  const siteConfig = await prisma.siteConfig.findMany({
    where: { key: { in: ['siteInfo'] } },
  })
  const siteInfo = siteConfig.find(c => c.key === 'siteInfo')?.value as { name?: string } | undefined
  const siteName = siteInfo?.name || 'Landbruck'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  sendOrderConfirmation({
    to:           email,
    customerName: name,
    orderId:      order.id,
    total,
    items: items.map((item: { id: number; quantity: number }) => {
      const product = products.find(p => p.id === item.id)!
      return { name: product.name, quantity: item.quantity, price: Number(product.price) }
    }),
    tempPassword: isNewCustomer ? tempPassword : undefined,
    siteUrl,
    siteName,
  }).catch(e => console.error('[email]', e))

  return NextResponse.json({ id: order.id }, { status: 201 })
}
