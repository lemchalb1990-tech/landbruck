const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  const header = req.headers['authorization']
  if (!header) return res.status(401).json({ error: 'Token requerido' })
  const token = header.replace('Bearer ', '')
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

module.exports = { authMiddleware }
