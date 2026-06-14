import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { status } = await req.json()
  const order = await prisma.order.update({ where: { id: Number(params.id) }, data: { status } })
  return NextResponse.json(order)
}
