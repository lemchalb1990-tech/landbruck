const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@landbruck.cl'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  const name = process.env.ADMIN_NAME || 'Administrador'

  const hashed = await bcrypt.hash(password, 10)
  const admin = await prisma.admin.upsert({
    where: { email },
    update: {},
    create: { name, email, password: hashed },
  })
  console.log(`Admin creado: ${admin.email}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
