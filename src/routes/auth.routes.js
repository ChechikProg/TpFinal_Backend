import { Router } from 'express'
import * as authController from '../controllers/auth.controller.js'
import { requiereAuth } from '../middlewares/auth.middleware.js'

const router = Router()

router.post('/registro', authController.registrar)
router.post('/login', authController.iniciarSesion)
router.post('/logout', authController.cerrarSesion)
router.get('/yo', requiereAuth, authController.usuarioActual)

export default router
