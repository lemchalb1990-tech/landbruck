import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = getAdminSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const id = parseInt(params.id)
  const { name, role, password } = await req.json()
  const data: Record<string, unknown> = {}
  if (name) data.name = name
  if (role) data.role = role
  if (password) data.password = await bcrypt.hash(password, 10)

  const user = await prisma.user.update({ where: { id }, data })
  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = getAdminSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const id = parseInt(params.id)
  if (id === session.id) return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta' }, { status: 400 })

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
