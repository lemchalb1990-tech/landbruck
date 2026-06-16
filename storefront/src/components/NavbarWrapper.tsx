import { unstable_noStore as noStore } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import Navbar from './Navbar'

export default async function NavbarWrapper() {
  noStore()
  const session = getSession()

  const [configs, menuItems, customer] = await Promise.all([
    prisma.siteConfig.findMany(),
    prisma.menuItem.findMany({
      where: { parentId: null, visible: true },
      orderBy: { order: 'asc' },
    }),
    session
      ? prisma.customer.findUnique({ where: { id: session.id }, select: { name: true } })
      : Promise.resolve(null),
  ])

  const configMap = Object.fromEntries(configs.map(c => [c.key, c.value as unknown]))
  const logo      = configMap.logo as { type: 'text' | 'image'; value: string } | undefined
  const navItems  = menuItems.map(i => ({ href: i.url, label: i.label }))

  return <Navbar logo={logo} navItems={navItems} customerName={customer?.name ?? null} />
}
