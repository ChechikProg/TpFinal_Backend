import { Router } from 'express'
import * as valoracionesController from '../controllers/valoraciones.controller.js'

const router = Router()

// Mi puntaje + todas las reseñas del juego
router.get('/:idExterno', valoracionesController.obtener)
router.put('/:idExterno/puntaje', valoracionesController.puntuar)
router.delete('/:idExterno/puntaje', valoracionesController.quitarPuntaje)
router.put('/:idExterno/resena', valoracionesController.guardarResena)
router.delete('/:idExterno/resena', valoracionesController.borrarResena)

export default router
