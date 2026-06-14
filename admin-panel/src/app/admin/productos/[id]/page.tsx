import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import EditProductForm from './EditProductForm'

export const dynamic = 'force-dynamic'

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: Number(params.id) },
      include: { category: true },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!product) notFound()

  return (
    <EditProductForm
      product={{ ...product, price: Number(product.price) }}
      categories={categories}
    />
  )
}
