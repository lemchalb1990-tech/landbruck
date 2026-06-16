export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const config = await prisma.siteConfig.findUnique({ where: { key: 'payments' } })
  const p = config?.value as Record<string, Record<string, unknown>> | undefined

  return NextResponse.json({
    mercadopago: {
      enabled:   !!(p?.mercadopago?.enabled),
      publicKey: (p?.mercadopago?.publicKey as string) ?? '',
    },
    flow: {
      enabled: !!(p?.flow?.enabled),
    },
  })
}
