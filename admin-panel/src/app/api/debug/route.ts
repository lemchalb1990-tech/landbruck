import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const productCount = await prisma.product.count()
    const products = await prisma.product.findMany({ take: 3, orderBy: { id: 'desc' } })
    const userCount = await prisma.user.count()
    return NextResponse.json({ productCount, userCount, sampleProducts: products, db: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@') })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
