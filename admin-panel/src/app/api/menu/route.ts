import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const items = await prisma.menuItem.findMany({
    where: { parentId: null },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const data = await req.json()
  const item = await prisma.menuItem.create({ data })
  return NextResponse.json(item, { status: 201 })
}
