import { NextResponse } from 'next/server'
import { minioClient, BUCKET, getPublicUrl } from '@/lib/minio'
import { randomUUID } from 'crypto'

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const ext = file.name.split('.').pop()
  const filename = `products/${randomUUID()}.${ext}`

  await minioClient.putObject(BUCKET, filename, buffer, buffer.length, {
    'Content-Type': file.type,
  })

  return NextResponse.json({ url: getPublicUrl(filename) })
}
