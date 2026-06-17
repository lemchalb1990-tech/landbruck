import { prisma } from '@/lib/prisma'
import LoginForm from './LoginForm'

export default async function LoginPage() {
  let siteName = 'Landbruck'
  try {
    const config = await prisma.siteConfig.findUnique({ where: { key: 'siteInfo' } })
    siteName = (config?.value as { name?: string } | null)?.name || 'Landbruck'
  } catch {
    // fallback silencioso si la DB no responde
  }
  return <LoginForm siteName={siteName} />
}
