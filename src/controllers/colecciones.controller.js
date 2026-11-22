import * as coleccionesService from '../services/colecciones.service.js'
import { validarColeccion, validarIdColeccion } from '../validators/colecciones.validator.js'
import { validarIdExterno } from '../validators/comunes.validator.js'

export async function listar(req, res, next) {
  try {
    const idExterno = req.query.idExterno ? validarIdExterno(req.query.idExterno) : null
    res.json({ colecciones: await coleccionesService.listar(req.usuarioId, idExterno) })
  } catch (error) {
    next(error)
  }
}

export async function obtener(req, res, next) {
  try {
    res.json({ coleccion: await coleccionesService.obtener(req.usuarioId, validarIdColeccion(req.params.id)) })
  } catch (error) {
    next(error)
  }
}

export async function crear(req, res, next) {
  try {
    const coleccion = await coleccionesService.crear(req.usuarioId, validarColeccion(req.body))
    res.status(201).json({ coleccion })
  } catch (error) {
    next(error)
  }
}

export async function actualizar(req, res, next) {
  try {
    const coleccion = await coleccionesService.actualizar(
      req.usuarioId,
      validarIdColeccion(req.params.id),
      validarColeccion(req.body, { parcial: true })
    )
    res.json({ coleccion })
  } catch (error) {
    next(error)
  }
}

export async function borrar(req, res, next) {
  try {
    await coleccionesService.borrar(req.usuarioId, validarIdColeccion(req.params.id))
    res.status(204).end()
  } catch (error) {
    next(error)
  }
}

export async function agregarJuego(req, res, next) {
  try {
    await coleccionesService.agregarJuego(
      req.usuarioId,
      validarIdColeccion(req.params.id),
      validarIdExterno(req.body?.idExterno)
    )
    res.status(201).end()
  } catch (error) {
    next(error)
  }
}

export async function quitarJuego(req, res, next) {
  try {
    await coleccionesService.quitarJuego(
      req.usuarioId,
      validarIdColeccion(req.params.id),
      validarIdExterno(req.params.idExterno)
    )
    res.status(204).end()
  } catch (error) {
    next(error)
  }
}
