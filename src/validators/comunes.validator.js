import { HttpError } from '../utils/httpError.js'

export const ESTADOS = ['quiero_jugar', 'jugando', 'terminado', 'abandonado']

// El id del juego en RAWG: un entero positivo.
export function validarIdExterno(valor) {
  const id = Number(valor)
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, 'El id del juego no es válido')
  }
  return id
}

export function validarEstado(valor, { obligatorio = false } = {}) {
  if (valor === undefined || valor === null || valor === '') {
    if (obligatorio) throw new HttpError(400, 'El estado es obligatorio')
    return undefined
  }
  if (!ESTADOS.includes(valor)) {
    throw new HttpError(400, `El estado tiene que ser uno de: ${ESTADOS.join(', ')}`)
  }
  return valor
}
