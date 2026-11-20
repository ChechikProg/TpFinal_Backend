import { Router } from 'express'
import * as actividadController from '../controllers/actividad.controller.js'

const router = Router()

router.get('/', actividadController.listar)

export default router
