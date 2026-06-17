import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = getAdminSession()
  if (!session) redirect('/login')

  return (
    <div className="flex min-h-screen">
      <Sidebar role={session.role} />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
