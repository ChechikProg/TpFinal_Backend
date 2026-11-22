import { Router } from 'express'
import * as estadisticasController from '../controllers/estadisticas.controller.js'

const router = Router()

router.get('/', estadisticasController.obtener)

export default router
