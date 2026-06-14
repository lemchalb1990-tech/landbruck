import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const products = await prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(products)
}

export async function POST(req: Request) {
  const data = await req.json()
  try {
    const product = await prisma.product.create({ data })
    return NextResponse.json(product, { status: 201 })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 400 })
  }
}
