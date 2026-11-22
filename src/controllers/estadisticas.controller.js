import * as estadisticasService from '../services/estadisticas.service.js'

export async function obtener(req, res, next) {
  try {
    res.json(await estadisticasService.calcular(req.usuarioId))
  } catch (error) {
    next(error)
  }
}
