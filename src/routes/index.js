import { Router } from 'express'
import { query } from '../config/db.js'
import authRoutes from './auth.routes.js'

const router = Router()

// Chequea que el servidor ande y que llegue a la base de datos
router.get('/health', async (req, res, next) => {
  try {
    await query('SELECT 1')
    res.json({ status: 'ok', database: 'conectada' })
  } catch (error) {
    next(error)
  }
})

router.use('/auth', authRoutes)

export default router
