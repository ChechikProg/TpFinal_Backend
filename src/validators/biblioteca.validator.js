import { HttpError } from '../utils/httpError.js'
import { validarIdExterno, validarEstado } from './comunes.validator.js'

const ORDENES = ['recientes', 'titulo', 'puntaje', 'horas']

export function validarAgregar(body = {}) {
  return {
    idExterno: validarIdExterno(body.idExterno),
    estado: validarEstado(body.estado) || 'quiero_jugar',
  }
}

export function validarActualizar(body = {}) {
  const estado = validarEstado(body.estado)
  let horasJugadas

  if (body.horasJugadas !== undefined) {
    horasJugadas = Number(body.horasJugadas)
    if (!Number.isFinite(horasJugadas) || horasJugadas < 0 || horasJugadas > 99999) {
      throw new HttpError(400, 'Las horas jugadas tienen que ser un número entre 0 y 99999')
    }
    horasJugadas = Math.round(horasJugadas * 10) / 10
  }

  if (estado === undefined && horasJugadas === undefined) {
    throw new HttpError(400, 'Mandá el estado o las horas jugadas para actualizar')
  }

  return { estado, horasJugadas }
}

export function validarFiltros(query = {}) {
  const estado = validarEstado(query.estado)
  const soloFavoritos = query.favoritos === 'true'
  const orden = query.orden || 'recientes'
  if (!ORDENES.includes(orden)) {
    throw new HttpError(400, `El orden tiene que ser uno de: ${ORDENES.join(', ')}`)
  }
  return { estado, soloFavoritos, orden }
}
