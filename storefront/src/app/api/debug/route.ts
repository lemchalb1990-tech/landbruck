import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const productCount = await prisma.product.count()
    const products = await prisma.product.findMany({ take: 3, select: { id: true, name: true, slug: true } })
    return NextResponse.json({ productCount, sampleProducts: products, db: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@') })
  } catch (e) {
    return NextResponse.json({ error: String(e), db: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@') }, { status: 500 })
  }
}
