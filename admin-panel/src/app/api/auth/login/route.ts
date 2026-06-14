import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const { email, password } = await req.json()
  const admin = await prisma.admin.findUnique({ where: { email } })
  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
  }
  const token = signToken({ id: admin.id, email: admin.email })
  cookies().set('admin_token', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 8 })
  return NextResponse.json({ ok: true })
}
