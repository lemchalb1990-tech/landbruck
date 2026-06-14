import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const data = await req.json()
  const item = await prisma.menuItem.create({ data })
  return NextResponse.json(item, { status: 201 })
}
