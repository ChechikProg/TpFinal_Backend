import * as valoracionesService from '../services/valoraciones.service.js'
import { validarPuntaje, validarResena } from '../validators/valoraciones.validator.js'
import { validarIdExterno } from '../validators/comunes.validator.js'

export async function obtener(req, res, next) {
  try {
    res.json(await valoracionesService.obtenerDeJuego(req.usuarioId, validarIdExterno(req.params.idExterno)))
  } catch (error) {
    next(error)
  }
}

export async function puntuar(req, res, next) {
  try {
    const puntaje = validarPuntaje(req.body)
    await valoracionesService.puntuar(req.usuarioId, validarIdExterno(req.params.idExterno), puntaje)
    res.json({ puntaje })
  } catch (error) {
    next(error)
  }
}

export async function quitarPuntaje(req, res, next) {
  try {
    await valoracionesService.quitarPuntaje(req.usuarioId, validarIdExterno(req.params.idExterno))
    res.status(204).end()
  } catch (error) {
    next(error)
  }
}

export async function guardarResena(req, res, next) {
  try {
    const texto = validarResena(req.body)
    const esNueva = await valoracionesService.guardarResena(req.usuarioId, validarIdExterno(req.params.idExterno), texto)
    res.status(esNueva ? 201 : 200).json({ texto })
  } catch (error) {
    next(error)
  }
}

export async function borrarResena(req, res, next) {
  try {
    await valoracionesService.borrarResena(req.usuarioId, validarIdExterno(req.params.idExterno))
    res.status(204).end()
  } catch (error) {
    next(error)
  }
}
