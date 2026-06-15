export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import MenuEditor from './MenuEditor'

const DEFAULT_ITEMS = [
  { label: 'Inicio',     url: '/',          order: 0, visible: true },
  { label: 'Productos',  url: '/productos', order: 1, visible: true },
  { label: 'Nosotros',   url: '/nosotros',  order: 2, visible: true },
  { label: 'Contacto',   url: '/contacto',  order: 3, visible: true },
]

export default async function MenuPage() {
  let items = await prisma.menuItem.findMany({
    where: { parentId: null },
    orderBy: { order: 'asc' },
  })

  if (items.length === 0) {
    await prisma.menuItem.createMany({ data: DEFAULT_ITEMS })
    items = await prisma.menuItem.findMany({
      where: { parentId: null },
      orderBy: { order: 'asc' },
    })
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editor de menú</h1>
      <MenuEditor items={items} />
    </div>
  )
}
