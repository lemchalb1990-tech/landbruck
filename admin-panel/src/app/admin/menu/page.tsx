export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import MenuEditor from './MenuEditor'

export default async function MenuPage() {
  const items = await prisma.menuItem.findMany({
    where: { parentId: null },
    include: { children: true },
    orderBy: { order: 'asc' },
  })

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editor de menú</h1>
      <MenuEditor items={items} />
    </div>
  )
}
