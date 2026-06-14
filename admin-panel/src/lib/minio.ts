import { S3Client } from '@aws-sdk/client-s3'

const endpoint = process.env.MINIO_USE_SSL === 'true'
  ? `https://${process.env.MINIO_ENDPOINT}`
  : `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT ?? 9000}`

export const s3Client = new S3Client({
  endpoint,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: process.env.MINIO_SECRET_KEY!,
  },
  forcePathStyle: true,
})

export const BUCKET = process.env.MINIO_BUCKET ?? 'landbruck'

export function getPublicUrl(filename: string) {
  const base = process.env.MINIO_USE_SSL === 'true'
    ? `https://${process.env.MINIO_ENDPOINT}`
    : `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT ?? 9000}`
  return `${base}/${BUCKET}/${filename}`
}
