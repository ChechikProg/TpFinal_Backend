import * as bibliotecaService from '../services/biblioteca.service.js'
import { validarAgregar, validarActualizar, validarFiltros } from '../validators/biblioteca.validator.js'
import { validarIdExterno } from '../validators/comunes.validator.js'

export async function listar(req, res, next) {
  try {
    res.json(await bibliotecaService.listar(req.usuarioId, validarFiltros(req.query)))
  } catch (error) {
    next(error)
  }
}

export async function obtener(req, res, next) {
  try {
    const item = await bibliotecaService.obtener(req.usuarioId, validarIdExterno(req.params.idExterno))
    res.json({ item })
  } catch (error) {
    next(error)
  }
}

export async function agregar(req, res, next) {
  try {
    const item = await bibliotecaService.agregar(req.usuarioId, validarAgregar(req.body))
    res.status(201).json({ item })
  } catch (error) {
    next(error)
  }
}

export async function actualizar(req, res, next) {
  try {
    const idExterno = validarIdExterno(req.params.idExterno)
    const item = await bibliotecaService.actualizar(req.usuarioId, idExterno, validarActualizar(req.body))
    res.json({ item })
  } catch (error) {
    next(error)
  }
}

export async function quitar(req, res, next) {
  try {
    await bibliotecaService.quitar(req.usuarioId, validarIdExterno(req.params.idExterno))
    res.status(204).end()
  } catch (error) {
    next(error)
  }
}
