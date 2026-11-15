import { Router } from 'express'

const router = Router()

router.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Acá se van a montar las demás rutas:
// router.use('/auth', authRoutes)
// router.use('/library', libraryRoutes)

export default router
