require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const helmet  = require('helmet')
const morgan  = require('morgan')
const cron    = require('node-cron')

const app = express()
app.use(helmet())
app.use(cors({ origin: process.env.ADMIN_PANEL_URL || 'http://localhost:3000' }))
app.use(morgan('dev'))

// Webhooks necesitan body RAW para validar HMAC
app.use('/api/webhooks', express.raw({ type: 'application/json' }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.use('/api/products',  require('./routes/products'))
app.use('/api/sales',     require('./routes/sales'))
app.use('/api/webhooks',  require('./routes/webhooks'))
app.use('/api/sync',      require('./routes/sync'))
app.use('/api/auth',      require('./routes/auth'))

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }))

// Sync stock Shopify cada 15 min
cron.schedule('*/15 * * * *', async () => {
  try {
    await require('./services/shopifyService').syncAllStock()
    console.log('[CRON] Stock sincronizado')
  } catch (e) { console.error('[CRON] Error stock sync:', e.message) }
})

// Snapshot inventario a Supabase 23:00
cron.schedule('0 23 * * *', async () => {
  try {
    await require('./services/supabaseService').snapshotInventario()
    console.log('[CRON] Snapshot enviado')
  } catch (e) { console.error('[CRON] Error snapshot:', e.message) }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`\u{1F331} Landbruk API en http://localhost:${PORT}`))
