import { query } from '../config/db.js'

// ---------- Puntuaciones ----------
export async function obtenerPuntaje(usuarioId, juegoId) {
  const { rows } = await query(
    'SELECT puntaje FROM puntuaciones WHERE usuario_id = $1 AND juego_id = $2',
    [usuarioId, juegoId]
  )
  return rows[0]?.puntaje ?? null
}

export async function guardarPuntaje(usuarioId, juegoId, puntaje, db = { query }) {
  await db.query(
    `INSERT INTO puntuaciones (usuario_id, juego_id, puntaje) VALUES ($1, $2, $3)
     ON CONFLICT (usuario_id, juego_id) DO UPDATE SET puntaje = EXCLUDED.puntaje, actualizado_en = NOW()`,
    [usuarioId, juegoId, puntaje]
  )
}

export async function borrarPuntaje(usuarioId, juegoId) {
  const { rowCount } = await query('DELETE FROM puntuaciones WHERE usuario_id = $1 AND juego_id = $2', [
    usuarioId,
    juegoId,
  ])
  return rowCount > 0
}

// ---------- Reseñas ----------
// Reseñas de un juego (de todos los usuarios), con el puntaje que le dio cada autor.
export async function listarResenasDeJuego(juegoId) {
  const { rows } = await query(
    `SELECT r.id, r.texto, r.creado_en, r.actualizado_en,
            u.id AS usuario_id, u.nombre_usuario, u.nombre, u.avatar_url,
            p.puntaje
     FROM resenas r
     JOIN usuarios u ON u.id = r.usuario_id
     LEFT JOIN puntuaciones p ON p.usuario_id = r.usuario_id AND p.juego_id = r.juego_id
     WHERE r.juego_id = $1
     ORDER BY r.actualizado_en DESC`,
    [juegoId]
  )
  return rows.map((f) => ({
    id: f.id,
    texto: f.texto,
    creadoEn: f.creado_en,
    actualizadoEn: f.actualizado_en,
    puntaje: f.puntaje,
    autor: { id: f.usuario_id, nombreUsuario: f.nombre_usuario, nombre: f.nombre, avatarUrl: f.avatar_url },
  }))
}

export async function existeResena(usuarioId, juegoId, db = { query }) {
  const { rowCount } = await db.query('SELECT 1 FROM resenas WHERE usuario_id = $1 AND juego_id = $2', [
    usuarioId,
    juegoId,
  ])
  return rowCount > 0
}

export async function guardarResena(usuarioId, juegoId, texto, db = { query }) {
  await db.query(
    `INSERT INTO resenas (usuario_id, juego_id, texto) VALUES ($1, $2, $3)
     ON CONFLICT (usuario_id, juego_id) DO UPDATE SET texto = EXCLUDED.texto, actualizado_en = NOW()`,
    [usuarioId, juegoId, texto]
  )
}

export async function borrarResena(usuarioId, juegoId) {
  const { rowCount } = await query('DELETE FROM resenas WHERE usuario_id = $1 AND juego_id = $2', [
    usuarioId,
    juegoId,
  ])
  return rowCount > 0
}
