import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json()
  const item = await prisma.menuItem.update({ where: { id: Number(params.id) }, data })
  return NextResponse.json(item)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.menuItem.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ ok: true })
}
