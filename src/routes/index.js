import { Router } from 'express'
import { query } from '../config/db.js'
import { requiereAuth } from '../middlewares/auth.middleware.js'
import authRoutes from './auth.routes.js'
import juegosRoutes from './juegos.routes.js'
import bibliotecaRoutes from './biblioteca.routes.js'
import favoritosRoutes from './favoritos.routes.js'
import actividadRoutes from './actividad.routes.js'
import valoracionesRoutes from './valoraciones.routes.js'
import coleccionesRoutes from './colecciones.routes.js'
import perfilRoutes from './perfil.routes.js'
import estadisticasRoutes from './estadisticas.routes.js'

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

// Todas las rutas de abajo necesitan sesión iniciada
router.use('/juegos', requiereAuth, juegosRoutes)
router.use('/biblioteca', requiereAuth, bibliotecaRoutes)
router.use('/favoritos', requiereAuth, favoritosRoutes)
router.use('/actividad', requiereAuth, actividadRoutes)
router.use('/valoraciones', requiereAuth, valoracionesRoutes)
router.use('/colecciones', requiereAuth, coleccionesRoutes)
router.use('/perfil', requiereAuth, perfilRoutes)
router.use('/estadisticas', requiereAuth, estadisticasRoutes)

export default router
