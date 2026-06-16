export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Region { name: string; cost: number }

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const city = searchParams.get('city')?.trim().toLowerCase() ?? ''

  const config = await prisma.siteConfig.findUnique({ where: { key: 'shipping' } })
  const cfg = config?.value as {
    enabled?: boolean
    shippingCost?: number
    service?: string
    regions?: Region[]
  } | undefined

  if (!cfg?.enabled) {
    return NextResponse.json({ enabled: false, shippingCost: 0, service: 'NORMAL' })
  }

  const regions: Region[] = cfg.regions ?? []
  const defaultCost = cfg.shippingCost ?? 0

  let shippingCost = defaultCost
  if (city.length >= 3 && regions.length > 0) {
    const match = regions.find(r =>
      r.name.trim().toLowerCase().includes(city) ||
      city.includes(r.name.trim().toLowerCase())
    )
    if (match) shippingCost = match.cost
  }

  return NextResponse.json({
    enabled:      true,
    shippingCost,
    service:      cfg.service ?? 'NORMAL',
  })
}
