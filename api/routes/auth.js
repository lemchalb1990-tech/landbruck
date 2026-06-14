const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const { getPool, sql } = require('../db/connection')

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' })
    const pool   = await getPool()
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM admin_users WHERE email = @email')
    const user = result.recordset[0]
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' })
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' })
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' })
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
