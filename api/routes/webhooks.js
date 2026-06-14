const router   = require('express').Router()
const crypto   = require('crypto')
const { getPool, sql }    = require('../db/connection')
const { syncQueue }       = require('../queues/syncQueue')
const { dispatchQueue }   = require('../queues/dispatchQueue')

function verifyHmac(req) {
  const hmac    = req.headers['x-shopify-hmac-sha256']
  const digest  = crypto.createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET)
                        .update(req.body).digest('base64')
  try { return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(digest)) } catch { return false }
}

router.post('/orders-paid', async (req, res) => {
  if (!verifyHmac(req)) return res.status(401).json({ error: 'HMAC inválido' })
  res.sendStatus(200) // Responder inmediatamente a Shopify

  try {
    const order = JSON.parse(req.body.toString())
    const pool  = await getPool()
    for (const item of order.line_items) {
      const product = await pool.request()
        .input('sku', sql.VarChar, item.sku)
        .query('SELECT id, stock_quantity FROM products WHERE sku = @sku')
      if (!product.recordset.length) { console.error('[WEBHOOK] SKU no encontrado:', item.sku); continue }
      const prod = product.recordset[0]

      await pool.request()
        .input('qty', sql.Int, item.quantity)
        .input('id',  sql.Int, prod.id)
        .query('UPDATE products SET stock_quantity = stock_quantity - @qty, updated_at = GETDATE() WHERE id = @id')

      const addr = order.shipping_address || {}
      const saleR = await pool.request()
        .input('oid',  sql.VarChar,  String(order.id))
        .input('onum', sql.VarChar,  String(order.order_number))
        .input('pid',  sql.Int,      prod.id)
        .input('sku',  sql.VarChar,  item.sku)
        .input('qty2', sql.Int,      item.quantity)
        .input('up',   sql.Decimal,  parseFloat(item.price))
        .input('tp',   sql.Decimal,  parseFloat(item.price) * item.quantity)
        .input('cname',sql.NVarChar, `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim())
        .input('ceml', sql.NVarChar, order.email || '')
        .input('addr', sql.NVarChar, JSON.stringify(addr))
        .query(`INSERT INTO sales (shopify_order_id,shopify_order_number,product_id,sku,quantity,unit_price,
                total_price,customer_name,customer_email,shipping_address,status)
                OUTPUT INSERTED.id
                VALUES (@oid,@onum,@pid,@sku,@qty2,@up,@tp,@cname,@ceml,@addr,'paid')`)
      const saleId = saleR.recordset[0].id
      await syncQueue.add('replicate-sale', { saleId })
      await dispatchQueue.add('create-dispatch', { saleId })
    }
  } catch (err) { console.error('[WEBHOOK] Error:', err.message) }
})

module.exports = router
