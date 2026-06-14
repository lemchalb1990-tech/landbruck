import * as Minio from 'minio'

export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT!,
  port: Number(process.env.MINIO_PORT ?? 443),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
})

export const BUCKET = process.env.MINIO_BUCKET ?? 'landbruck'

export function getPublicUrl(filename: string) {
  const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http'
  const port = process.env.MINIO_PORT
  const portStr = (port === '443' || port === '80') ? '' : `:${port}`
  return `${protocol}://${process.env.MINIO_ENDPOINT}${portStr}/${BUCKET}/${filename}`
}
