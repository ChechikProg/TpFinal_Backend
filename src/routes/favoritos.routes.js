import { Router } from 'express'
import * as favoritosController from '../controllers/favoritos.controller.js'

const router = Router()

router.get('/', favoritosController.listar)
router.get('/:idExterno', favoritosController.consultar)
router.put('/:idExterno', favoritosController.agregar)
router.delete('/:idExterno', favoritosController.quitar)

export default router
