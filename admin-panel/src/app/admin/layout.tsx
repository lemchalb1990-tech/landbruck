import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = getAdminSession()
  if (!session) redirect('/login')

  const config   = await prisma.siteConfig.findUnique({ where: { key: 'siteInfo' } })
  const siteName = (config?.value as { name?: string } | null)?.name || 'Landbruck'

  return (
    <div className="flex min-h-screen">
      <Sidebar role={session.role} siteName={siteName} />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
