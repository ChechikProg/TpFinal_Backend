import { HttpError } from '../utils/httpError.js'

export function validarPuntaje(body = {}) {
  const puntaje = Number(body.puntaje)
  if (!Number.isInteger(puntaje) || puntaje < 1 || puntaje > 5) {
    throw new HttpError(400, 'La puntuación tiene que ser un número entero del 1 al 5')
  }
  return puntaje
}

export function validarResena(body = {}) {
  const texto = typeof body.texto === 'string' ? body.texto.trim() : ''
  if (!texto) throw new HttpError(400, 'La reseña no puede estar vacía', { texto: 'Escribí tu reseña' })
  if (texto.length > 500) {
    throw new HttpError(400, 'La reseña no puede tener más de 500 caracteres', {
      texto: 'Máximo 500 caracteres',
    })
  }
  return texto
}
