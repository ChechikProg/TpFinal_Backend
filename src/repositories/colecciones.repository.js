import { query } from '../config/db.js'
import { traducirGenero } from '../utils/generos.js'

function aColeccion(fila) {
  return {
    id: fila.id,
    nombre: fila.nombre,
    descripcion: fila.descripcion,
    creadoEn: fila.creado_en,
    actualizadoEn: fila.actualizado_en,
    cantidadJuegos: fila.cantidad_juegos ?? 0,
    portadas: fila.portadas || [],
    ...(fila.contiene_juego !== undefined && { contieneJuego: fila.contiene_juego }),
  }
}

// Lista las colecciones del usuario con la cantidad de juegos y hasta 4 portadas.
// Si se pasa juegoId, indica también si cada colección contiene ese juego.
export async function listar(usuarioId, juegoId = null) {
  const { rows } = await query(
    `SELECT c.*,
            (SELECT COUNT(*)::int FROM coleccion_juegos cj WHERE cj.coleccion_id = c.id) AS cantidad_juegos,
            ARRAY(
              SELECT j.portada_url FROM coleccion_juegos cj
              JOIN juegos j ON j.id = cj.juego_id
              WHERE cj.coleccion_id = c.id
              ORDER BY cj.agregado_en DESC LIMIT 4
            ) AS portadas
            ${juegoId ? ', EXISTS (SELECT 1 FROM coleccion_juegos cj WHERE cj.coleccion_id = c.id AND cj.juego_id = $2) AS contiene_juego' : ''}
     FROM colecciones c
     WHERE c.usuario_id = $1
     ORDER BY c.creado_en DESC, c.id DESC`,
    juegoId ? [usuarioId, juegoId] : [usuarioId]
  )
  return rows.map(aColeccion)
}

// Solo devuelve la colección si es del usuario
export async function buscar(usuarioId, coleccionId, db = { query }) {
  const { rows } = await db.query('SELECT * FROM colecciones WHERE id = $1 AND usuario_id = $2', [
    coleccionId,
    usuarioId,
  ])
  return rows[0] ? aColeccion(rows[0]) : null
}

export async function listarJuegos(coleccionId) {
  const { rows } = await query(
    `SELECT j.id_externo, j.titulo, j.portada_url, j.generos, j.plataformas, j.fecha_lanzamiento, cj.agregado_en
     FROM coleccion_juegos cj
     JOIN juegos j ON j.id = cj.juego_id
     WHERE cj.coleccion_id = $1
     ORDER BY cj.agregado_en DESC`,
    [coleccionId]
  )
  return rows.map((f) => ({
    idExterno: f.id_externo,
    titulo: f.titulo,
    portadaUrl: f.portada_url,
    generos: f.generos.map(traducirGenero),
    plataformas: f.plataformas,
    fechaLanzamiento: f.fecha_lanzamiento ? f.fecha_lanzamiento.toISOString().slice(0, 10) : null,
    agregadoEn: f.agregado_en,
  }))
}

export async function existeNombre(usuarioId, nombre, excluirId = null) {
  const { rowCount } = await query(
    'SELECT 1 FROM colecciones WHERE usuario_id = $1 AND LOWER(nombre) = LOWER($2) AND id <> COALESCE($3, 0)',
    [usuarioId, nombre, excluirId]
  )
  return rowCount > 0
}

export async function crear(usuarioId, { nombre, descripcion = null }, db = { query }) {
  const { rows } = await db.query(
    'INSERT INTO colecciones (usuario_id, nombre, descripcion) VALUES ($1, $2, $3) RETURNING *',
    [usuarioId, nombre, descripcion]
  )
  return aColeccion(rows[0])
}

export async function actualizar(usuarioId, coleccionId, { nombre, descripcion }) {
  const { rows } = await query(
    `UPDATE colecciones SET
       nombre = COALESCE($3, nombre),
       descripcion = CASE WHEN $4::boolean THEN $5 ELSE descripcion END,
       actualizado_en = NOW()
     WHERE id = $1 AND usuario_id = $2
     RETURNING *`,
    [coleccionId, usuarioId, nombre ?? null, descripcion !== undefined, descripcion ?? null]
  )
  return rows[0] ? aColeccion(rows[0]) : null
}

export async function borrar(usuarioId, coleccionId, db = { query }) {
  const { rowCount } = await db.query('DELETE FROM colecciones WHERE id = $1 AND usuario_id = $2', [
    coleccionId,
    usuarioId,
  ])
  return rowCount > 0
}

// true si se agregó, false si ya estaba
export async function agregarJuego(coleccionId, juegoId, db = { query }) {
  const { rowCount } = await db.query(
    'INSERT INTO coleccion_juegos (coleccion_id, juego_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [coleccionId, juegoId]
  )
  return rowCount > 0
}

export async function quitarJuego(coleccionId, juegoId, db = { query }) {
  const { rowCount } = await db.query(
    'DELETE FROM coleccion_juegos WHERE coleccion_id = $1 AND juego_id = $2',
    [coleccionId, juegoId]
  )
  return rowCount > 0
}
