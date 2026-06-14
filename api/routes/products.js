const router  = require('express').Router()
const multer  = require('multer')
const { getPool, sql }      = require('../db/connection')
const { authMiddleware }    = require('../services/authService')
const cloudinaryService     = require('../services/cloudinaryService')
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, category, low_stock, page = 1, limit = 20 } = req.query
    const pool = await getPool()
    const offset = (page - 1) * limit
    let where = 'WHERE 1=1'
    if (status)    where += ` AND p.status = '${status}'`
    if (category)  where += ` AND p.category = '${category}'`
    if (low_stock) where += ` AND p.stock_quantity <= 5`
    const result = await pool.request().query(
      `SELECT p.*, (SELECT COUNT(*) FROM product_images WHERE product_id = p.id) AS image_count
       FROM products p ${where} ORDER BY p.created_at DESC
       OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`
    )
    const total = await pool.request().query(`SELECT COUNT(*) AS total FROM products p ${where}`)
    res.json({ data: result.recordset, total: total.recordset[0].total, page: +page, limit: +limit })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const pool    = await getPool()
    const product = await pool.request().input('id', sql.Int, req.params.id).query('SELECT * FROM products WHERE id = @id')
    if (!product.recordset.length) return res.status(404).json({ error: 'Producto no encontrado' })
    const images = await pool.request().input('pid', sql.Int, req.params.id)
      .query('SELECT * FROM product_images WHERE product_id = @pid ORDER BY position')
    res.json({ ...product.recordset[0], images: images.recordset })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { sku, name, scientific_name, description, price, stock_quantity,
            category, germination_days, sowing_season, sowing_depth_cm,
            plant_spacing_cm, is_organic, weight_grams } = req.body
    if (!sku || !name || !price) return res.status(400).json({ error: 'sku, name y price son obligatorios' })
    const pool = await getPool()
    const r = await pool.request()
      .input('sku',              sql.VarChar,  sku)
      .input('name',             sql.NVarChar, name)
      .input('scientific_name',  sql.NVarChar, scientific_name || null)
      .input('description',      sql.NVarChar, description || null)
      .input('price',            sql.Decimal,  price)
      .input('stock_quantity',   sql.Int,      stock_quantity || 0)
      .input('category',         sql.NVarChar, category || null)
      .input('germination_days', sql.Int,      germination_days || null)
      .input('sowing_season',    sql.NVarChar, sowing_season || null)
      .input('sowing_depth_cm',  sql.Decimal,  sowing_depth_cm || null)
      .input('plant_spacing_cm', sql.Int,      plant_spacing_cm || null)
      .input('is_organic',       sql.Bit,      is_organic ? 1 : 0)
      .input('weight_grams',     sql.Int,      weight_grams || 50)
      .query(`INSERT INTO products (sku,name,scientific_name,description,price,stock_quantity,
              category,germination_days,sowing_season,sowing_depth_cm,plant_spacing_cm,is_organic,weight_grams)
              OUTPUT INSERTED.id
              VALUES (@sku,@name,@scientific_name,@description,@price,@stock_quantity,
              @category,@germination_days,@sowing_season,@sowing_depth_cm,@plant_spacing_cm,@is_organic,@weight_grams)`)
    res.status(201).json({ id: r.recordset[0].id, message: 'Producto creado' })
  } catch (err) {
    if (err.number === 2627) return res.status(409).json({ error: 'El SKU ya existe' })
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const pool   = await getPool()
    const fields = ['name','scientific_name','description','price','stock_quantity','category',
                    'germination_days','sowing_season','sowing_depth_cm','plant_spacing_cm','is_organic','weight_grams','status']
    const sets   = fields.filter(f => req.body[f] !== undefined).map(f => `${f} = @${f}`).join(', ')
    if (!sets) return res.status(400).json({ error: 'Nada que actualizar' })
    const r = pool.request().input('id', sql.Int, req.params.id)
    fields.forEach(f => { if (req.body[f] !== undefined) r.input(f, req.body[f]) })
    await r.query(`UPDATE products SET ${sets}, updated_at = GETDATE() WHERE id = @id`)
    res.json({ message: 'Producto actualizado' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/:id/images', authMiddleware, upload.array('images', 10), async (req, res) => {
  try {
    const pool = await getPool()
    const results = []
    for (let i = 0; i < req.files.length; i++) {
      const file     = req.files[i]
      const uploaded = await cloudinaryService.uploadBuffer(file.buffer, file.mimetype, `landbruk/products/${req.params.id}`)
      await pool.request()
        .input('pid', sql.Int,      req.params.id)
        .input('url', sql.NVarChar, uploaded.secure_url)
        .input('cid', sql.NVarChar, uploaded.public_id)
        .input('pos', sql.Int,      i)
        .query('INSERT INTO product_images (product_id,cloudinary_url,cloudinary_id,position) VALUES (@pid,@url,@cid,@pos)')
      results.push({ url: uploaded.secure_url })
    }
    res.status(201).json({ images: results })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
