import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'

export async function POST() {
  cookies().delete('token')
  const host  = headers().get('host') || 'localhost:3000'
  const proto = headers().get('x-forwarded-proto') || 'https'
  return NextResponse.redirect(`${proto}://${host}/`)
}
