export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const config = await prisma.siteConfig.findUnique({ where: { key: 'shipping' } })
  const cfg = config?.value as { enabled?: boolean; shippingCost?: number; service?: string } | undefined

  return NextResponse.json({
    enabled:      cfg?.enabled ?? false,
    shippingCost: cfg?.shippingCost ?? 0,
    service:      cfg?.service ?? 'NORMAL',
  })
}
