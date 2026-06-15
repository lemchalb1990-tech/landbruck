const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@landbruck.cl'
  const password = process.env.ADMIN_PASSWORD || 'Admin2024!'
  const name = process.env.ADMIN_NAME || 'Administrador'

  const hashed = await bcrypt.hash(password, 10)
  const admin = await prisma.user.upsert({
    where: { email },
    update: { password: hashed, name },
    create: { name, email, password: hashed, role: 'ADMIN' },
  })
  console.log(`Usuario creado: ${admin.email} [${admin.role}]`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
