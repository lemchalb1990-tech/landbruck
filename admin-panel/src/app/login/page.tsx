import { prisma } from '@/lib/prisma'
import LoginForm from './LoginForm'

export default async function LoginPage() {
  const config   = await prisma.siteConfig.findUnique({ where: { key: 'siteInfo' } })
  const siteName = (config?.value as { name?: string } | null)?.name || 'Landbruck'
  return <LoginForm siteName={siteName} />
}
