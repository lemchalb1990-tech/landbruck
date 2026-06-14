const sql = require('mssql')

const config = {
  server:   process.env.DB_SERVER   || 'localhost',
  database: process.env.DB_NAME     || 'landbruk_db',
  user:     process.env.DB_USER     || 'sa',
  password: process.env.DB_PASSWORD || '',
  options:  { encrypt: false, trustServerCertificate: true, enableArithAbort: true },
  pool:     { max: 10, min: 0, idleTimeoutMillis: 30000 },
}

let pool = null

async function getPool() {
  if (!pool) {
    pool = await sql.connect(config)
    console.log('[DB] Conectado a SQL Server ->', process.env.DB_NAME)
  }
  return pool
}

module.exports = { getPool, sql }
