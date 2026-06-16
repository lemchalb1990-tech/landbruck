import nodemailer from 'nodemailer'
import { prisma } from './prisma'

interface EmailConfig {
  host: string; port: number; secure: boolean
  user: string; pass: string; from: string
}

async function getTransporter() {
  const config = await prisma.siteConfig.findUnique({ where: { key: 'email' } })
  const c = config?.value as EmailConfig | undefined
  if (!c?.host || !c?.user) return null
  return {
    transporter: nodemailer.createTransport({
      host: c.host,
      port: c.port || 587,
      secure: c.secure || false,
      auth: { user: c.user, pass: c.pass },
    }),
    from: c.from || c.user,
  }
}

export async function sendOrderConfirmation(params: {
  to: string
  customerName: string
  orderId: number
  total: number
  items: { name: string; quantity: number; price: number }[]
  tempPassword?: string
  siteUrl: string
  siteName: string
}) {
  const result = await getTransporter()
  if (!result) return

  const { transporter, from } = result
  const { to, customerName, orderId, total, items, tempPassword, siteUrl, siteName } = params

  const itemsHtml = items.map(i =>
    `<tr>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">${i.name}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:center;">${i.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right;">$${(i.price * i.quantity).toLocaleString('es-CL')}</td>
    </tr>`
  ).join('')

  const credencialesHtml = tempPassword ? `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0;">
      <p style="margin:0 0 8px;font-weight:600;color:#166534;">Tus credenciales de acceso</p>
      <p style="margin:0 0 4px;color:#15803d;">Email: <strong>${to}</strong></p>
      <p style="margin:0 0 12px;color:#15803d;">Contraseña provisional: <strong>${tempPassword}</strong></p>
      <a href="${siteUrl}/cuenta/login"
        style="display:inline-block;background:#16a34a;color:#fff;padding:8px 20px;border-radius:6px;text-decoration:none;font-size:14px;">
        Acceder a mi cuenta
      </a>
      <p style="margin:12px 0 0;font-size:12px;color:#6b7280;">
        Te recomendamos cambiar tu contraseña después de iniciar sesión.
      </p>
    </div>` : `
    <div style="margin:20px 0;">
      <a href="${siteUrl}/cuenta/pedidos"
        style="display:inline-block;background:#16a34a;color:#fff;padding:8px 20px;border-radius:6px;text-decoration:none;font-size:14px;">
        Ver mis pedidos
      </a>
    </div>`

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:20px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background:#16a34a;padding:24px 32px;">
      <h1 style="margin:0;color:#fff;font-size:22px;">${siteName}</h1>
    </div>
    <div style="padding:32px;">
      <h2 style="margin:0 0 8px;color:#111827;font-size:18px;">¡Gracias por tu compra, ${customerName}!</h2>
      <p style="margin:0 0 20px;color:#6b7280;">Tu pedido <strong>#${orderId}</strong> ha sido recibido correctamente.</p>

      <h3 style="margin:0 0 12px;color:#374151;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;">Resumen del pedido</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#374151;">
        <thead>
          <tr style="border-bottom:2px solid #e5e7eb;">
            <th style="text-align:left;padding-bottom:8px;">Producto</th>
            <th style="text-align:center;padding-bottom:8px;">Cant.</th>
            <th style="text-align:right;padding-bottom:8px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding-top:12px;font-weight:600;color:#111827;">Total</td>
            <td style="padding-top:12px;font-weight:700;color:#111827;text-align:right;">$${total.toLocaleString('es-CL')}</td>
          </tr>
        </tfoot>
      </table>

      ${credencialesHtml}
    </div>
    <div style="background:#f9fafb;padding:16px 32px;text-align:center;font-size:12px;color:#9ca3af;">
      © ${new Date().getFullYear()} ${siteName}. Todos los derechos reservados.
    </div>
  </div>
</body>
</html>`

  await transporter.sendMail({
    from: `"${siteName}" <${from}>`,
    to,
    subject: `Confirmación de pedido #${orderId} — ${siteName}`,
    html,
  })
}
