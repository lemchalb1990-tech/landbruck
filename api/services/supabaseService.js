const { createClient } = require('@supabase/supabase-js')
const { getPool, sql }  = require('../db/connection')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function replicarVenta(saleId) {
  const pool   = await getPool()
  const result = await pool.request()
    .input('id', sql.Int, saleId)
    .query('SELECT * FROM sales WHERE id = @id')
  const sale = result.recordset[0]
  if (!sale) return

  const { error } = await supabase.from('sales').upsert(sale)
  if (error) throw new Error(error.message)

  await pool.request()
    .input('id', sql.Int, saleId)
    .query('UPDATE sales SET synced_to_cloud = 1 WHERE id = @id')
}

async function snapshotInventario() {
  const pool    = await getPool()
  const result  = await pool.request().query(
    'SELECT sku, name, stock_quantity, category, status FROM products'
  )
  const snapshot = { ts: new Date().toISOString(), items: result.recordset }
  const { error } = await supabase.from('stock_snapshots').insert(snapshot)
  if (error) throw new Error(error.message)
}

module.exports = { replicarVenta, snapshotInventario }
