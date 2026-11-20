import { Router } from 'express'
import * as bibliotecaController from '../controllers/biblioteca.controller.js'

const router = Router()

router.get('/', bibliotecaController.listar)
router.post('/', bibliotecaController.agregar)
router.get('/:idExterno', bibliotecaController.obtener)
router.patch('/:idExterno', bibliotecaController.actualizar)
router.delete('/:idExterno', bibliotecaController.quitar)

export default router
