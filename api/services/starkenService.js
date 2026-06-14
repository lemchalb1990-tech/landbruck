const axios  = require('axios')
const { getPool, sql } = require('../db/connection')

const starken = axios.create({
  baseURL: process.env.STARKEN_API_URL,
  headers: { Authorization: `Bearer ${process.env.STARKEN_API_KEY}` },
})

async function crearOrdenDespacho(saleId) {
  const pool   = await getPool()
  const result = await pool.request()
    .input('id', sql.Int, saleId)
    .query('SELECT * FROM sales WHERE id = @id')
  const sale = result.recordset[0]
  if (!sale) throw new Error('Venta no encontrada')

  const addr = JSON.parse(sale.shipping_address || '{}')

  const payload = {
    account:  process.env.STARKEN_ACCOUNT_NUMBER,
    service:  'NORMAL',
    sender: {
      name:    'Landbruck',
      city:    process.env.STARKEN_ORIGIN_CITY || 'Santiago',
      address: 'Dirección bodega Landbruck',
      phone:   process.env.STARKEN_ORIGIN_PHONE || '',
    },
    receiver: {
      name:    sale.customer_name,
      city:    addr.city || '',
      address: addr.address1 || '',
      zip:     addr.zip || '',
      phone:   addr.phone || '',
    },
    package: { weight_kg: 0.5, pieces: 1 },
    reference: `ORDEN-${sale.shopify_order_number}`,
  }

  const res = await starken.post('/orders', payload)
  const { tracking_number, label_url } = res.data

  await pool.request()
    .input('tracking', sql.VarChar,  tracking_number)
    .input('label',    sql.NVarChar, label_url)
    .input('id',       sql.Int,      saleId)
    .query("UPDATE sales SET starken_tracking = @tracking, starken_label_url = @label, status = 'dispatched' WHERE id = @id")

  return { tracking_number, label_url }
}

module.exports = { crearOrdenDespacho }
