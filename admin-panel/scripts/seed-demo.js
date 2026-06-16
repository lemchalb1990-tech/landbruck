const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.customer.findUnique({ where: { email: 'maria@demo.cl' } })
  if (existing) {
    console.log('El cliente demo ya existe. Email: maria@demo.cl | Password: Demo1234!')
    return
  }

  const password = await bcrypt.hash('Demo1234!', 10)
  const customer = await prisma.customer.create({
    data: {
      name:     'María González',
      email:    'maria@demo.cl',
      phone:    '+56 9 8765 4321',
      address:  'Av. Providencia 1234, Depto 5',
      city:     'Santiago',
      password,
    },
  })

  const products = await prisma.product.findMany({ where: { active: true }, take: 3 })
  if (products.length === 0) {
    console.log('No hay productos activos. Agrega productos primero.')
    await prisma.customer.delete({ where: { id: customer.id } })
    return
  }

  const p0 = products[0]
  const p1 = products[Math.min(1, products.length - 1)]
  const p2 = products[Math.min(2, products.length - 1)]

  const now = new Date()
  const daysAgo = (d) => new Date(now.getTime() - d * 86400000)
  const hoursAgo = (h) => new Date(now.getTime() - h * 3600000)

  /* ── Pedido 1: DELIVERED (hace 3 semanas) ── */
  const d1 = daysAgo(21)
  const o1 = await prisma.order.create({
    data: {
      customerId: customer.id, total: Number(p0.price) * 2,
      status: 'DELIVERED', address: customer.address, city: customer.city,
      phone: customer.phone, paymentProvider: 'flow', paymentStatus: 'CONFIRMED',
      trackingNumber: 'STK2024001', createdAt: d1,
      items: { create: [{ productId: p0.id, quantity: 2, price: p0.price }] },
    },
  })
  await prisma.notification.createMany({ data: [
    { customerId: customer.id, type: 'ORDER_CREATED',   title: 'Pedido recibido',        body: `Tu pedido #${o1.id} fue recibido correctamente.`,               read: true,  createdAt: d1 },
    { customerId: customer.id, type: 'EMAIL_SENT',      title: 'Correo enviado',          body: `Enviamos la confirmación de tu pedido #${o1.id} a tu correo.`,  read: true,  createdAt: new Date(d1.getTime() + 60000) },
    { customerId: customer.id, type: 'PAYMENT_CONFIRMED', title: 'Pago confirmado',       body: `El pago de tu pedido #${o1.id} fue confirmado por Flow.`,        read: true,  createdAt: new Date(d1.getTime() + 3600000) },
    { customerId: customer.id, type: 'ORDER_SHIPPED',   title: 'Pedido en camino',        body: `Tu pedido #${o1.id} fue despachado. Seguimiento: STK2024001`,    read: true,  createdAt: new Date(d1.getTime() + 86400000 * 2) },
    { customerId: customer.id, type: 'ORDER_DELIVERED', title: '¡Pedido entregado!',      body: `Tu pedido #${o1.id} fue entregado. ¡Gracias por tu compra!`,     read: true,  createdAt: new Date(d1.getTime() + 86400000 * 5) },
  ] })

  /* ── Pedido 2: SHIPPED (hace 5 días) ── */
  const d2 = daysAgo(5)
  const o2 = await prisma.order.create({
    data: {
      customerId: customer.id, total: Number(p1.price),
      status: 'SHIPPED', address: customer.address, city: customer.city,
      phone: customer.phone, paymentProvider: 'mercadopago', paymentStatus: 'CONFIRMED',
      trackingNumber: 'STK2024089', createdAt: d2,
      items: { create: [{ productId: p1.id, quantity: 1, price: p1.price }] },
    },
  })
  await prisma.notification.createMany({ data: [
    { customerId: customer.id, type: 'ORDER_CREATED',     title: 'Pedido recibido',   body: `Tu pedido #${o2.id} fue recibido correctamente.`,                    read: true,  createdAt: d2 },
    { customerId: customer.id, type: 'EMAIL_SENT',        title: 'Correo enviado',    body: `Enviamos la confirmación de tu pedido #${o2.id} a tu correo.`,       read: true,  createdAt: new Date(d2.getTime() + 60000) },
    { customerId: customer.id, type: 'PAYMENT_CONFIRMED', title: 'Pago confirmado',   body: `El pago de tu pedido #${o2.id} fue confirmado por MercadoPago.`,     read: true,  createdAt: new Date(d2.getTime() + 1800000) },
    { customerId: customer.id, type: 'ORDER_SHIPPED',     title: 'Pedido en camino',  body: `Tu pedido #${o2.id} fue despachado por Starken. Nº: STK2024089`,     read: false, createdAt: new Date(d2.getTime() + 86400000) },
  ] })

  /* ── Pedido 3: CONFIRMED (hace 2 días) ── */
  const d3 = daysAgo(2)
  const o3 = await prisma.order.create({
    data: {
      customerId: customer.id, total: Number(p2.price),
      status: 'CONFIRMED', address: customer.address, city: customer.city,
      phone: customer.phone, paymentProvider: 'flow', paymentStatus: 'CONFIRMED',
      createdAt: d3,
      items: { create: [{ productId: p2.id, quantity: 1, price: p2.price }] },
    },
  })
  await prisma.notification.createMany({ data: [
    { customerId: customer.id, type: 'ORDER_CREATED',     title: 'Pedido recibido',   body: `Tu pedido #${o3.id} fue recibido correctamente.`,                    read: true,  createdAt: d3 },
    { customerId: customer.id, type: 'EMAIL_SENT',        title: 'Correo enviado',    body: `Enviamos la confirmación de tu pedido #${o3.id} a tu correo.`,       read: true,  createdAt: new Date(d3.getTime() + 60000) },
    { customerId: customer.id, type: 'PAYMENT_CONFIRMED', title: 'Pago confirmado',   body: `El pago de tu pedido #${o3.id} fue confirmado exitosamente.`,         read: false, createdAt: new Date(d3.getTime() + 3600000) },
  ] })

  /* ── Pedido 4: PENDING (hace 2 horas) ── */
  const d4 = hoursAgo(2)
  const o4 = await prisma.order.create({
    data: {
      customerId: customer.id, total: Number(p0.price),
      status: 'PENDING', address: customer.address, city: customer.city,
      phone: customer.phone, paymentProvider: 'mercadopago', paymentStatus: 'PENDING',
      createdAt: d4,
      items: { create: [{ productId: p0.id, quantity: 1, price: p0.price }] },
    },
  })
  await prisma.notification.createMany({ data: [
    { customerId: customer.id, type: 'ORDER_CREATED', title: 'Pedido recibido',  body: `Tu pedido #${o4.id} fue recibido. Estamos verificando tu pago.`,         read: false, createdAt: d4 },
    { customerId: customer.id, type: 'EMAIL_SENT',    title: 'Correo enviado',   body: `Enviamos los detalles de tu pedido #${o4.id} a tu correo electrónico.`,  read: false, createdAt: new Date(d4.getTime() + 60000) },
  ] })

  /* ── Pedido 5: CANCELLED (hace 10 días) ── */
  const d5 = daysAgo(10)
  const o5 = await prisma.order.create({
    data: {
      customerId: customer.id, total: Number(p1.price),
      status: 'CANCELLED', address: customer.address, city: customer.city,
      phone: customer.phone, paymentProvider: 'flow', paymentStatus: 'FAILED',
      createdAt: d5,
      items: { create: [{ productId: p1.id, quantity: 1, price: p1.price }] },
    },
  })
  await prisma.notification.createMany({ data: [
    { customerId: customer.id, type: 'ORDER_CREATED',   title: 'Pedido recibido',   body: `Tu pedido #${o5.id} fue recibido.`,                               read: true, createdAt: d5 },
    { customerId: customer.id, type: 'ORDER_CANCELLED', title: 'Pedido cancelado',  body: `Tu pedido #${o5.id} fue cancelado. El pago no pudo procesarse.`,   read: true, createdAt: new Date(d5.getTime() + 3600000) },
  ] })

  console.log('\n✓ Cliente demo creado exitosamente')
  console.log('  Email:    maria@demo.cl')
  console.log('  Password: Demo1234!')
  console.log(`  Pedidos:  #${o1.id} (Entregado) | #${o2.id} (En camino) | #${o3.id} (Confirmado) | #${o4.id} (Pendiente) | #${o5.id} (Cancelado)\n`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
