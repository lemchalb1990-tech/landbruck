const router  = require('express').Router()
const { authMiddleware } = require('../services/authService')
const shopifyService     = require('../services/shopifyService')
const { getPool, sql }   = require('../db/connection')

router.post('/publish/:id', authMiddleware, async (req, res) => {
  try {
    const pool   = await getPool()
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`SELECT p.*,
        (SELECT cloudinary_url, alt_text, position FROM product_images WHERE product_id = p.id ORDER BY position FOR JSON PATH) AS images_json
        FROM products p WHERE p.id = @id`)
    if (!result.recordset.length) return res.status(404).json({ error: 'Producto no encontrado' })
    const product = result.recordset[0]
    product.images = JSON.parse(product.images_json || '[]')
    if (product.status === 'draft') return res.status(400).json({ error: 'Primero marca el producto como "ready"' })
    const shopifyId = await shopifyService.publishProduct(product)
    await pool.request()
      .input('sid', sql.VarChar, String(shopifyId))
      .input('id',  sql.Int, product.id)
      .query("UPDATE products SET shopify_product_id = @sid, status = 'published', updated_at = GETDATE() WHERE id = @id")
    res.json({ message: 'Publicado en Shopify', shopify_product_id: shopifyId })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/stock', authMiddleware, async (req, res) => {
  try {
    await shopifyService.syncAllStock()
    res.json({ message: 'Stock sincronizado con Shopify' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
