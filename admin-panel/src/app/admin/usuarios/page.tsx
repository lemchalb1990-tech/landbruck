export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import UsuariosEditor from './UsuariosEditor'

export default async function UsuariosPage() {
  const session = getAdminSession()
  if (!session || session.role !== 'ADMIN') redirect('/admin')

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { id: 'asc' },
  })

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Usuarios</h1>
      <UsuariosEditor users={users} currentUserId={session.id} />
    </div>
  )
}
