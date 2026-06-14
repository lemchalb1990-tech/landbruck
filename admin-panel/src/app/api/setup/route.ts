import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const hashed = await bcrypt.hash('admin123', 10)
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@landbruck.cl' },
    update: { password: hashed },
    create: { name: 'Administrador', email: 'admin@landbruck.cl', password: hashed },
  })
  return NextResponse.json({ ok: true, email: admin.email })
}
