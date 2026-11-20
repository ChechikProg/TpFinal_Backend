import * as actividadRepository from '../repositories/actividad.repository.js'
import { HttpError } from '../utils/httpError.js'

export async function listar(req, res, next) {
  try {
    const limite = req.query.limite === undefined ? 20 : Number(req.query.limite)
    if (!Number.isInteger(limite) || limite < 1 || limite > 100) {
      throw new HttpError(400, 'El límite tiene que ser un número entre 1 y 100')
    }
    res.json({ actividad: await actividadRepository.listar(req.usuarioId, limite) })
  } catch (error) {
    next(error)
  }
}
