import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { key, value } = await req.json()
  const config = await prisma.siteConfig.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })
  return NextResponse.json(config)
}
