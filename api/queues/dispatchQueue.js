const { Queue, Worker } = require('bullmq')
const IORedis = require('ioredis')
const starkenService = require('../services/starkenService')

const connection  = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null })
const dispatchQueue = new Queue('dispatch', { connection })

const worker = new Worker('dispatch', async (job) => {
  const { saleId } = job.data
  const result = await starkenService.crearOrdenDespacho(saleId)
  console.log(`[DISPATCH] Orden Starken creada: ${result.tracking_number}`)
}, {
  connection,
  attempts: 3,
  backoff: { type: 'exponential', delay: 60000 },
})

worker.on('failed', (job, err) => {
  console.error(`[DISPATCH QUEUE] Job ${job.id} falló:`, err.message)
})

module.exports = { dispatchQueue }
