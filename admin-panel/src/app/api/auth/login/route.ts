import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    console.log('[login] intent:', email)
    const user = await prisma.user.findUnique({ where: { email } })
    console.log('[login] user found:', !!user)
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 })
    }
    const match = await bcrypt.compare(password, user.password)
    console.log('[login] password match:', match)
    if (!match) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
    }
    const token = signToken({ id: user.id, email: user.email, role: user.role })
    cookies().set('admin_token', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 8 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[login] error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
