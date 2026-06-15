import { unstable_noStore as noStore } from 'next/cache'
import { prisma } from '@/lib/prisma'
import Navbar from './Navbar'

export default async function NavbarWrapper() {
  noStore()
  const configs = await prisma.siteConfig.findMany()
  const configMap = Object.fromEntries(configs.map(c => [c.key, c.value as unknown]))
  const logo = configMap.logo as { type: 'text' | 'image'; value: string } | undefined
  return <Navbar logo={logo} />
}
