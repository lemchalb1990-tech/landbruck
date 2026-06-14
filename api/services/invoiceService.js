// Stub — pendiente de integración con facturador electrónico (Bsale recomendado)
async function emitirDocumento(_sale) {
  console.log('[INVOICE] Módulo de facturación pendiente de integración')
  return { status: 'pending', message: 'Facturación no configurada aún' }
}

module.exports = { emitirDocumento }
