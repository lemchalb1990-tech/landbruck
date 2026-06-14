import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const customer = await prisma.customer.findUnique({ where: { email } })
  if (!customer) {
    return NextResponse.json({ error: 'Email o contraseña incorrectos' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, customer.password)
  if (!valid) {
    return NextResponse.json({ error: 'Email o contraseña incorrectos' }, { status: 401 })
  }

  const token = signToken({ id: customer.id, email: customer.email })
  cookies().set('token', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 })

  return NextResponse.json({ ok: true })
}
