import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const { name, email, phone, address, city, items } = await req.json()

  if (!items?.length) {
    return NextResponse.json({ error: 'No hay productos' }, { status: 400 })
  }

  const productIds: number[] = items.map((i: { id: number }) => i.id)
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } })

  let customer = await prisma.customer.findUnique({ where: { email } })
  if (!customer) {
    const tempPassword = await bcrypt.hash(Math.random().toString(36).slice(2), 10)
    customer = await prisma.customer.create({
      data: { name, email, phone, address, city, password: tempPassword },
    })
  }

  const total = items.reduce((sum: number, item: { id: number; quantity: number }) => {
    const product = products.find(p => p.id === item.id)
    return sum + (product ? Number(product.price) * item.quantity : 0)
  }, 0)

  const order = await prisma.order.create({
    data: {
      customerId: customer.id,
      total,
      address,
      city,
      phone: phone ?? '',
      items: {
        create: items.map((item: { id: number; quantity: number }) => {
          const product = products.find(p => p.id === item.id)!
          return { productId: item.id, quantity: item.quantity, price: product.price }
        }),
      },
    },
  })

  return NextResponse.json({ id: order.id }, { status: 201 })
}
