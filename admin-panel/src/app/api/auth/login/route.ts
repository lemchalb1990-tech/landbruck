import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
    }
    const token = signToken({ id: user.id, email: user.email, role: user.role })
    cookies().set('admin_token', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 8 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[login] error:', e)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
