import { Router } from 'express'
import * as coleccionesController from '../controllers/colecciones.controller.js'

const router = Router()

router.get('/', coleccionesController.listar)
router.post('/', coleccionesController.crear)
router.get('/:id', coleccionesController.obtener)
router.patch('/:id', coleccionesController.actualizar)
router.delete('/:id', coleccionesController.borrar)
router.post('/:id/juegos', coleccionesController.agregarJuego)
router.delete('/:id/juegos/:idExterno', coleccionesController.quitarJuego)

export default router
