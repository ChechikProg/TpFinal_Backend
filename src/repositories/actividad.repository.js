import { query } from '../config/db.js'

export async function registrar({ usuarioId, tipo, juegoId = null, coleccionId = null, detalle = null }, db = { query }) {
  await db.query(
    `INSERT INTO actividad (usuario_id, tipo, juego_id, coleccion_id, detalle)
     VALUES ($1, $2, $3, $4, $5)`,
    [usuarioId, tipo, juegoId, coleccionId, detalle]
  )
}

export async function listar(usuarioId, limite) {
  const { rows } = await query(
    `SELECT a.id, a.tipo, a.detalle, a.creado_en,
            j.id_externo, j.titulo, j.portada_url,
            c.id AS coleccion_id, c.nombre AS coleccion_nombre
     FROM actividad a
     LEFT JOIN juegos j ON j.id = a.juego_id
     LEFT JOIN colecciones c ON c.id = a.coleccion_id
     WHERE a.usuario_id = $1
     ORDER BY a.creado_en DESC, a.id DESC
     LIMIT $2`,
    [usuarioId, limite]
  )

  return rows.map((fila) => ({
    id: fila.id,
    tipo: fila.tipo,
    detalle: fila.detalle,
    creadoEn: fila.creado_en,
    juego: fila.id_externo
      ? { idExterno: fila.id_externo, titulo: fila.titulo, portadaUrl: fila.portada_url }
      : null,
    coleccion: fila.coleccion_id ? { id: fila.coleccion_id, nombre: fila.coleccion_nombre } : null,
  }))
}
