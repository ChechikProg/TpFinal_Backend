import { Router } from 'express'
import * as perfilController from '../controllers/perfil.controller.js'

const router = Router()

router.get('/', perfilController.obtener)
router.patch('/', perfilController.actualizar)

export default router
