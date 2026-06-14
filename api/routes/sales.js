const router = require('express').Router()
const { getPool, sql }   = require('../db/connection')
const { authMiddleware } = require('../services/authService')

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, from, to, page = 1, limit = 20 } = req.query
    const pool   = await getPool()
    const offset = (page - 1) * limit
    let where = 'WHERE 1=1'
    if (status) where += ` AND s.status = '${status}'`
    if (from)   where += ` AND s.sale_date >= '${from}'`
    if (to)     where += ` AND s.sale_date <= '${to}'`
    const result = await pool.request().query(
      `SELECT s.*, p.name AS product_name, p.category FROM sales s
       LEFT JOIN products p ON s.product_id = p.id
       ${where} ORDER BY s.sale_date DESC
       OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`
    )
    res.json({ data: result.recordset, page: +page, limit: +limit })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const pool  = await getPool()
    const stats = await pool.request().query(`
      SELECT
        COUNT(*) AS total_sales,
        ISNULL(SUM(total_price), 0) AS total_revenue,
        SUM(CASE WHEN CAST(sale_date AS DATE) = CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END) AS sales_today,
        ISNULL(SUM(CASE WHEN sale_date >= DATEADD(day,-30,GETDATE()) THEN total_price ELSE 0 END), 0) AS revenue_30d
      FROM sales WHERE status != 'cancelled'
    `)
    res.json(stats.recordset[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
