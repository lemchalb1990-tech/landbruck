import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getFlowStatus, FlowConfig } from '@/lib/payments/flow'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const token = form.get('token') as string
    if (!token) return new Response('', { status: 200 })

    const payConfig = await prisma.siteConfig.findUnique({ where: { key: 'payments' } })
    const flowConfig = (payConfig?.value as Record<string, unknown>)?.flow as FlowConfig | undefined
    if (!flowConfig) return new Response('', { status: 200 })

    const status = await getFlowStatus(flowConfig, token)
    const orderId = parseInt(status.commerceOrder)
    // Flow status 2 = PAID
    if (status.paymentData?.status === 2) {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID', paymentId: token, status: 'CONFIRMED' },
      })
    }
  } catch (e) {
    console.error('[webhook/flow]', e)
  }
  return new Response('', { status: 200 })
}
