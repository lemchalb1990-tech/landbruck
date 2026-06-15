import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { name, slug, icon, color, active } = await req.json()
  const category = await prisma.category.update({
    where: { id: Number(params.id) },
    data: { name, slug, icon, color, active },
  })
  return NextResponse.json(category)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.category.delete({ where: { id: Number(params.id) } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'No se puede eliminar: la categoría tiene productos asociados.' }, { status: 409 })
  }
}
