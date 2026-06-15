import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = getAdminSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { id: 'asc' },
  })
  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const session = getAdminSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { name, email, password, role } = await req.json()
  if (!name || !email || !password || !role) return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { name, email, password: hashed, role } })
  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role }, { status: 201 })
}
