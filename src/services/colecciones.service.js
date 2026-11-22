import { conTransaccion } from '../config/db.js'
import * as coleccionesRepository from '../repositories/colecciones.repository.js'
import * as juegosRepository from '../repositories/juegos.repository.js'
import * as actividadRepository from '../repositories/actividad.repository.js'
import { asegurarJuego } from './juegos.service.js'
import { HttpError } from '../utils/httpError.js'

async function obtenerPropia(usuarioId, coleccionId, db) {
  const coleccion = await coleccionesRepository.buscar(usuarioId, coleccionId, db)
  // Mismo error si no existe o si es de otro usuario: no revelamos colecciones ajenas
  if (!coleccion) throw new HttpError(404, 'No encontramos esa colección')
  return coleccion
}

async function nombreDisponible(usuarioId, nombre, excluirId) {
  if (await coleccionesRepository.existeNombre(usuarioId, nombre, excluirId)) {
    throw new HttpError(409, 'Ya tenés una colección con ese nombre', { nombre: 'Ya existe una colección con ese nombre' })
  }
}

// Si llega idExterno, cada colección indica si contiene ese juego (para el Detalle).
export async function listar(usuarioId, idExterno) {
  if (!idExterno) return coleccionesRepository.listar(usuarioId)
  // Si el juego todavía no está en nuestra base, ninguna colección lo tiene: usamos un id imposible
  const juegoId = (await juegosRepository.buscarIdPorIdExterno(idExterno)) || -1
  return coleccionesRepository.listar(usuarioId, juegoId)
}

export async function obtener(usuarioId, coleccionId) {
  const coleccion = await obtenerPropia(usuarioId, coleccionId)
  const juegos = await coleccionesRepository.listarJuegos(coleccionId)
  return { ...coleccion, cantidadJuegos: juegos.length, juegos }
}

export async function crear(usuarioId, datos) {
  await nombreDisponible(usuarioId, datos.nombre)
  return conTransaccion(async (db) => {
    const coleccion = await coleccionesRepository.crear(usuarioId, datos, db)
    await actividadRepository.registrar(
      { usuarioId, tipo: 'coleccion_creada', coleccionId: coleccion.id, detalle: { nombre: coleccion.nombre } },
      db
    )
    return coleccion
  })
}

export async function actualizar(usuarioId, coleccionId, datos) {
  await obtenerPropia(usuarioId, coleccionId)
  if (datos.nombre) await nombreDisponible(usuarioId, datos.nombre, coleccionId)
  return coleccionesRepository.actualizar(usuarioId, coleccionId, datos)
}

export async function borrar(usuarioId, coleccionId) {
  await conTransaccion(async (db) => {
    const coleccion = await obtenerPropia(usuarioId, coleccionId, db)
    // Guardamos el nombre en el detalle porque la colección deja de existir
    await actividadRepository.registrar(
      { usuarioId, tipo: 'coleccion_borrada', detalle: { nombre: coleccion.nombre } },
      db
    )
    await coleccionesRepository.borrar(usuarioId, coleccionId, db)
  })
}

export async function agregarJuego(usuarioId, coleccionId, idExterno) {
  const coleccion = await obtenerPropia(usuarioId, coleccionId)
  await asegurarJuego(idExterno)

  return conTransaccion(async (db) => {
    const juegoId = await juegosRepository.buscarIdPorIdExterno(idExterno, db)
    const agregado = await coleccionesRepository.agregarJuego(coleccionId, juegoId, db)
    if (!agregado) throw new HttpError(409, 'Ese juego ya está en la colección')
    await actividadRepository.registrar(
      {
        usuarioId,
        tipo: 'juego_agregado_a_coleccion',
        juegoId,
        coleccionId,
        detalle: { nombre: coleccion.nombre },
      },
      db
    )
  })
}

export async function quitarJuego(usuarioId, coleccionId, idExterno) {
  const coleccion = await obtenerPropia(usuarioId, coleccionId)
  await conTransaccion(async (db) => {
    const juegoId = await juegosRepository.buscarIdPorIdExterno(idExterno, db)
    const quitado = juegoId && (await coleccionesRepository.quitarJuego(coleccionId, juegoId, db))
    if (!quitado) throw new HttpError(404, 'Ese juego no está en la colección')
    await actividadRepository.registrar(
      {
        usuarioId,
        tipo: 'juego_quitado_de_coleccion',
        juegoId,
        coleccionId,
        detalle: { nombre: coleccion.nombre },
      },
      db
    )
  })
}
