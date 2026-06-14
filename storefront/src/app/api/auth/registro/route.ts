import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const { name, email, password, phone } = await req.json()

  const exists = await prisma.customer.findUnique({ where: { email } })
  if (exists) {
    return NextResponse.json({ error: 'Ya existe una cuenta con ese email' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 10)
  const customer = await prisma.customer.create({
    data: { name, email, password: hashed, phone },
  })

  const token = signToken({ id: customer.id, email: customer.email })
  cookies().set('token', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 })

  return NextResponse.json({ ok: true }, { status: 201 })
}
