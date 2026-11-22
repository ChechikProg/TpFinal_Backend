import { conTransaccion } from '../config/db.js'
import * as valoracionesRepository from '../repositories/valoraciones.repository.js'
import * as juegosRepository from '../repositories/juegos.repository.js'
import * as actividadRepository from '../repositories/actividad.repository.js'
import { asegurarJuego } from './juegos.service.js'
import { HttpError } from '../utils/httpError.js'

// Puntaje y reseña del usuario + reseñas de todos para un juego
export async function obtenerDeJuego(usuarioId, idExterno) {
  const juegoId = await juegosRepository.buscarIdPorIdExterno(idExterno)
  if (!juegoId) return { miPuntaje: null, resenas: [] }

  const [miPuntaje, resenas] = await Promise.all([
    valoracionesRepository.obtenerPuntaje(usuarioId, juegoId),
    valoracionesRepository.listarResenasDeJuego(juegoId),
  ])
  return {
    miPuntaje,
    resenas: resenas.map((r) => ({ ...r, esMia: r.autor.id === usuarioId })),
  }
}

export async function puntuar(usuarioId, idExterno, puntaje) {
  await asegurarJuego(idExterno)
  await conTransaccion(async (db) => {
    const juegoId = await juegosRepository.buscarIdPorIdExterno(idExterno, db)
    await valoracionesRepository.guardarPuntaje(usuarioId, juegoId, puntaje, db)
    await actividadRepository.registrar({ usuarioId, tipo: 'juego_puntuado', juegoId, detalle: { puntaje } }, db)
  })
}

export async function quitarPuntaje(usuarioId, idExterno) {
  const juegoId = await juegosRepository.buscarIdPorIdExterno(idExterno)
  const borrado = juegoId && (await valoracionesRepository.borrarPuntaje(usuarioId, juegoId))
  if (!borrado) throw new HttpError(404, 'No puntuaste ese juego')
}

export async function guardarResena(usuarioId, idExterno, texto) {
  await asegurarJuego(idExterno)
  return conTransaccion(async (db) => {
    const juegoId = await juegosRepository.buscarIdPorIdExterno(idExterno, db)
    const yaExistia = await valoracionesRepository.existeResena(usuarioId, juegoId, db)
    await valoracionesRepository.guardarResena(usuarioId, juegoId, texto, db)
    await actividadRepository.registrar(
      { usuarioId, tipo: yaExistia ? 'resena_editada' : 'resena_creada', juegoId },
      db
    )
    return !yaExistia // true si es nueva
  })
}

export async function borrarResena(usuarioId, idExterno) {
  const juegoId = await juegosRepository.buscarIdPorIdExterno(idExterno)
  const borrada = juegoId && (await valoracionesRepository.borrarResena(usuarioId, juegoId))
  if (!borrada) throw new HttpError(404, 'No escribiste una reseña de ese juego')
}
