import { conTransaccion } from '../config/db.js'
import * as favoritosRepository from '../repositories/favoritos.repository.js'
import * as juegosRepository from '../repositories/juegos.repository.js'
import * as actividadRepository from '../repositories/actividad.repository.js'
import { asegurarJuego } from './juegos.service.js'
import { HttpError } from '../utils/httpError.js'

export function listar(usuarioId) {
  return favoritosRepository.listar(usuarioId)
}

export async function esFavorito(usuarioId, idExterno) {
  const juegoId = await juegosRepository.buscarIdPorIdExterno(idExterno)
  return Boolean(juegoId) && favoritosRepository.esFavorito(usuarioId, juegoId)
}

// Devuelve true si se agregó ahora y false si ya era favorito
export async function agregar(usuarioId, idExterno) {
  await asegurarJuego(idExterno)

  return conTransaccion(async (db) => {
    const juegoId = await juegosRepository.buscarIdPorIdExterno(idExterno, db)
    const agregado = await favoritosRepository.agregar(usuarioId, juegoId, db)
    if (agregado) {
      await actividadRepository.registrar({ usuarioId, tipo: 'favorito_agregado', juegoId }, db)
    }
    return agregado
  })
}

export async function quitar(usuarioId, idExterno) {
  return conTransaccion(async (db) => {
    const juegoId = await juegosRepository.buscarIdPorIdExterno(idExterno, db)
    const quitado = juegoId && (await favoritosRepository.quitar(usuarioId, juegoId, db))
    if (!quitado) throw new HttpError(404, 'Ese juego no está en tus favoritos')

    await actividadRepository.registrar({ usuarioId, tipo: 'favorito_quitado', juegoId }, db)
  })
}
