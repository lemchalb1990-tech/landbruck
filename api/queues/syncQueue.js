const { Queue, Worker } = require('bullmq')
const IORedis = require('ioredis')
const supabaseService = require('../services/supabaseService')
const invoiceService  = require('../services/invoiceService')
const { getPool, sql } = require('../db/connection')

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null })

const syncQueue = new Queue('sync', { connection })

const worker = new Worker('sync', async (job) => {
  const { saleId } = job.data

  const pool   = await getPool()
  const result = await pool.request().input('id', sql.Int, saleId).query('SELECT * FROM sales WHERE id = @id')
  const sale   = result.recordset[0]

  await supabaseService.replicarVenta(saleId)
  await invoiceService.emitirDocumento(sale)

  await pool.request()
    .input('etype', sql.VarChar, 'sale')
    .input('eid',   sql.Int, saleId)
    .input('act',   sql.VarChar, 'sync')
    .input('stat',  sql.VarChar, 'success')
    .query('INSERT INTO sync_log (entity_type,entity_id,action,status) VALUES (@etype,@eid,@act,@stat)')
}, {
  connection,
  attempts: 3,
  backoff: { type: 'exponential', delay: 60000 },
})

worker.on('failed', async (job, err) => {
  console.error(`[SYNC QUEUE] Job ${job.id} falló:`, err.message)
  const { getPool, sql } = require('../db/connection')
  const pool = await getPool()
  await pool.request()
    .input('etype', sql.VarChar,  'sale')
    .input('eid',   sql.Int,      job.data.saleId)
    .input('act',   sql.VarChar,  'sync')
    .input('stat',  sql.VarChar,  'error')
    .input('emsg',  sql.NVarChar, err.message)
    .query('INSERT INTO sync_log (entity_type,entity_id,action,status,error_message) VALUES (@etype,@eid,@act,@stat,@emsg)')
})

module.exports = { syncQueue }
