import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const SECRET = process.env.JWT_SECRET || 'landbruck_admin_jwt_s3cr3t_32chars!!'

export function signToken(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: '8h' })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET) as { id: number; email: string }
  } catch {
    return null
  }
}

export function getAdminSession() {
  const token = cookies().get('admin_token')?.value
  if (!token) return null
  return verifyToken(token)
}
