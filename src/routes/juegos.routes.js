import { Router } from 'express'
import * as juegosController from '../controllers/juegos.controller.js'

const router = Router()

router.get('/', juegosController.buscar)
router.get('/generos', juegosController.generos)
router.get('/:idExterno', juegosController.detalle)

export default router
