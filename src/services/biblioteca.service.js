import { conTransaccion } from '../config/db.js'
import * as bibliotecaRepository from '../repositories/biblioteca.repository.js'
import * as juegosRepository from '../repositories/juegos.repository.js'
import * as actividadRepository from '../repositories/actividad.repository.js'
import { asegurarJuego } from './juegos.service.js'
import { HttpError } from '../utils/httpError.js'

export async function listar(usuarioId, filtros) {
  const [juegos, conteo] = await Promise.all([
    bibliotecaRepository.listar(usuarioId, filtros),
    bibliotecaRepository.contarPorEstado(usuarioId),
  ])
  return { juegos, conteo }
}

export async function obtener(usuarioId, idExterno) {
  const item = await bibliotecaRepository.buscar(usuarioId, idExterno)
  if (!item) throw new HttpError(404, 'Ese juego no está en tu biblioteca')
  return item
}

export async function agregar(usuarioId, { idExterno, estado }) {
  // Traemos el juego de RAWG antes de abrir la transacción (puede tardar)
  await asegurarJuego(idExterno)

  return conTransaccion(async (db) => {
    const juegoId = await juegosRepository.buscarIdPorIdExterno(idExterno, db)

    if (await bibliotecaRepository.buscarFila(usuarioId, juegoId, db)) {
      throw new HttpError(409, 'Ese juego ya está en tu biblioteca')
    }

    await bibliotecaRepository.agregar({ usuarioId, juegoId, estado }, db)
    await actividadRepository.registrar(
      { usuarioId, tipo: 'juego_agregado', juegoId, detalle: { estado } },
      db
    )
    return bibliotecaRepository.buscar(usuarioId, idExterno, db)
  })
}

export async function actualizar(usuarioId, idExterno, { estado, horasJugadas }) {
  return conTransaccion(async (db) => {
    const juegoId = await juegosRepository.buscarIdPorIdExterno(idExterno, db)
    const anterior = juegoId && (await bibliotecaRepository.buscarFila(usuarioId, juegoId, db))
    if (!anterior) throw new HttpError(404, 'Ese juego no está en tu biblioteca')

    await bibliotecaRepository.actualizar({ usuarioId, juegoId, estado, horasJugadas }, db)

    if (estado && estado !== anterior.estado) {
      await actividadRepository.registrar(
        {
          usuarioId,
          tipo: 'estado_cambiado',
          juegoId,
          detalle: { anterior: anterior.estado, nuevo: estado },
        },
        db
      )
    }
    return bibliotecaRepository.buscar(usuarioId, idExterno, db)
  })
}

export async function quitar(usuarioId, idExterno) {
  return conTransaccion(async (db) => {
    const juegoId = await juegosRepository.buscarIdPorIdExterno(idExterno, db)
    const quitado = juegoId && (await bibliotecaRepository.quitar(usuarioId, juegoId, db))
    if (!quitado) throw new HttpError(404, 'Ese juego no está en tu biblioteca')

    await actividadRepository.registrar({ usuarioId, tipo: 'juego_quitado', juegoId }, db)
  })
}
