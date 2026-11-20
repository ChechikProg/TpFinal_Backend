import * as favoritosService from '../services/favoritos.service.js'
import { validarIdExterno } from '../validators/comunes.validator.js'

export async function listar(req, res, next) {
  try {
    res.json({ favoritos: await favoritosService.listar(req.usuarioId) })
  } catch (error) {
    next(error)
  }
}

export async function consultar(req, res, next) {
  try {
    const esFavorito = await favoritosService.esFavorito(
      req.usuarioId,
      validarIdExterno(req.params.idExterno)
    )
    res.json({ esFavorito })
  } catch (error) {
    next(error)
  }
}

export async function agregar(req, res, next) {
  try {
    const agregado = await favoritosService.agregar(req.usuarioId, validarIdExterno(req.params.idExterno))
    res.status(agregado ? 201 : 200).json({ esFavorito: true })
  } catch (error) {
    next(error)
  }
}

export async function quitar(req, res, next) {
  try {
    await favoritosService.quitar(req.usuarioId, validarIdExterno(req.params.idExterno))
    res.status(204).end()
  } catch (error) {
    next(error)
  }
}
