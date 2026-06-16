export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const notifications = await prisma.notification.findMany({
    where: { customerId: session.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(notifications)
}

export async function PATCH() {
  const session = getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  await prisma.notification.updateMany({
    where: { customerId: session.id, read: false },
    data:  { read: true },
  })

  return NextResponse.json({ ok: true })
}
