import * as perfilService from '../services/perfil.service.js'
import { validarPerfil } from '../validators/perfil.validator.js'

export async function obtener(req, res, next) {
  try {
    res.json({ perfil: await perfilService.obtener(req.usuarioId) })
  } catch (error) {
    next(error)
  }
}

export async function actualizar(req, res, next) {
  try {
    res.json({ perfil: await perfilService.actualizar(req.usuarioId, validarPerfil(req.body)) })
  } catch (error) {
    next(error)
  }
}
