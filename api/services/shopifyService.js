const axios = require('axios')
const { getPool, sql } = require('../db/connection')

const shopify = axios.create({
  baseURL: `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${process.env.SHOPIFY_API_VERSION}`,
  headers: {
    'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_API_TOKEN,
    'Content-Type': 'application/json',
  },
})

async function publishProduct(product) {
  const body = {
    product: {
      title:        product.name,
      body_html:    buildDescription(product),
      vendor:       'Landbruck',
      product_type: product.category || 'Semillas',
      tags:         buildTags(product),
      variants: [{
        price:   String(product.price),
        sku:     product.sku,
        weight:  product.weight_grams,
        weight_unit: 'g',
        inventory_management: 'shopify',
        inventory_quantity:   product.stock_quantity,
      }],
      images: (product.images || []).map(img => ({ src: img.cloudinary_url, alt: img.alt_text || product.name })),
    },
  }

  if (product.shopify_product_id) {
    const res = await shopify.put(`/products/${product.shopify_product_id}.json`, body)
    return res.data.product.id
  } else {
    const res = await shopify.post('/products.json', body)
    return res.data.product.id
  }
}

async function syncAllStock() {
  const pool    = await getPool()
  const result  = await pool.request().query(
    "SELECT id, sku, stock_quantity, shopify_product_id FROM products WHERE status = 'published' AND shopify_product_id IS NOT NULL"
  )
  for (const p of result.recordset) {
    try {
      const varRes = await shopify.get(`/products/${p.shopify_product_id}/variants.json`)
      const variantId = varRes.data.variants[0]?.id
      if (!variantId) continue
      await shopify.post('/inventory_levels/set.json', {
        inventory_item_id: varRes.data.variants[0].inventory_item_id,
        available:         p.stock_quantity,
        location_id:       process.env.SHOPIFY_LOCATION_ID,
      })
    } catch (err) {
      console.error(`[SHOPIFY] Error sync stock SKU ${p.sku}:`, err.message)
    }
  }
}

function buildDescription(p) {
  return `
    <p>${p.description || ''}</p>
    <ul>
      ${p.scientific_name    ? `<li><strong>Nombre científico:</strong> ${p.scientific_name}</li>` : ''}
      ${p.germination_days   ? `<li><strong>Germinación:</strong> ${p.germination_days} días</li>` : ''}
      ${p.sowing_season      ? `<li><strong>Época de siembra:</strong> ${p.sowing_season}</li>` : ''}
      ${p.sowing_depth_cm    ? `<li><strong>Profundidad:</strong> ${p.sowing_depth_cm} cm</li>` : ''}
      ${p.plant_spacing_cm   ? `<li><strong>Espaciado:</strong> ${p.plant_spacing_cm} cm</li>` : ''}
    </ul>
  `
}

function buildTags(p) {
  const tags = ['semillas', p.category].filter(Boolean)
  if (p.is_organic) tags.push('orgánica')
  return tags.join(', ')
}

module.exports = { publishProduct, syncAllStock }
