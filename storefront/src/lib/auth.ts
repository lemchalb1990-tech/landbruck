import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const SECRET = process.env.JWT_SECRET!

export function signToken(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET) as { id: number; email: string }
  } catch {
    return null
  }
}

export function getSession() {
  const token = cookies().get('token')?.value
  if (!token) return null
  return verifyToken(token)
}
