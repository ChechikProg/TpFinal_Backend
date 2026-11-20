import { query } from '../config/db.js'
import { traducirGenero } from '../utils/generos.js'

export async function listar(usuarioId) {
  const { rows } = await query(
    `SELECT j.id_externo, j.titulo, j.portada_url, j.generos, j.plataformas, f.creado_en
     FROM favoritos f
     JOIN juegos j ON j.id = f.juego_id
     WHERE f.usuario_id = $1
     ORDER BY f.creado_en DESC`,
    [usuarioId]
  )
  return rows.map((fila) => ({
    idExterno: fila.id_externo,
    titulo: fila.titulo,
    portadaUrl: fila.portada_url,
    generos: fila.generos.map(traducirGenero),
    plataformas: fila.plataformas,
    agregadoEn: fila.creado_en,
  }))
}

export async function esFavorito(usuarioId, juegoId, db = { query }) {
  const { rowCount } = await db.query(
    'SELECT 1 FROM favoritos WHERE usuario_id = $1 AND juego_id = $2',
    [usuarioId, juegoId]
  )
  return rowCount > 0
}

// Devuelve true si se agregó y false si ya estaba
export async function agregar(usuarioId, juegoId, db = { query }) {
  const { rowCount } = await db.query(
    `INSERT INTO favoritos (usuario_id, juego_id) VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [usuarioId, juegoId]
  )
  return rowCount > 0
}

export async function quitar(usuarioId, juegoId, db = { query }) {
  const { rowCount } = await db.query(
    'DELETE FROM favoritos WHERE usuario_id = $1 AND juego_id = $2',
    [usuarioId, juegoId]
  )
  return rowCount > 0
}
