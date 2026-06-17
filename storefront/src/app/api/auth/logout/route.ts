import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  cookies().delete('token')
  return NextResponse.redirect(new URL('/cuenta/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
}
