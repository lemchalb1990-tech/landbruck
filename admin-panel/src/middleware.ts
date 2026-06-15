import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const GESTOR_ALLOWED_PREFIXES = [
  '/admin/productos',
  '/admin/pedidos',
  '/admin/clientes',
]

function decodeJWT(token: string): { id: number; email: string; role: string } | null {
  try {
    const payload = token.split('.')[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('admin_token')?.value

  if (!token) return NextResponse.redirect(new URL('/login', req.url))

  const session = decodeJWT(token)
  if (!session) return NextResponse.redirect(new URL('/login', req.url))

  if (session.role === 'GESTOR') {
    const isExactAdmin = pathname === '/admin'
    const isAllowed = isExactAdmin || GESTOR_ALLOWED_PREFIXES.some(p => pathname.startsWith(p))
    if (!isAllowed) return NextResponse.redirect(new URL('/admin', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
