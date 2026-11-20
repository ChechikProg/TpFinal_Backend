import { Router } from 'express'
import * as juegosController from '../controllers/juegos.controller.js'

const router = Router()

router.get('/', juegosController.buscar)
router.get('/generos', juegosController.generos)
// Tiene que ir antes de '/:idExterno' para que "imagen" no se tome como un id
router.get('/imagen', juegosController.imagen)
router.get('/:idExterno', juegosController.detalle)

export default router
