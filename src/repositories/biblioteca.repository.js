import { query } from '../config/db.js'

// Columnas que devolvemos de cada juego de la biblioteca, con su puntaje,
// si es favorito y si tiene reseña.
const SELECT_ITEM = `
  SELECT b.estado, b.horas_jugadas, b.agregado_en, b.actualizado_en, b.terminado_en,
         j.id_externo, j.titulo, j.portada_url, j.fecha_lanzamiento, j.generos, j.plataformas,
         p.puntaje,
         (f.juego_id IS NOT NULL) AS es_favorito,
         (r.id IS NOT NULL) AS tiene_resena
  FROM biblioteca b
  JOIN juegos j ON j.id = b.juego_id
  LEFT JOIN puntuaciones p ON p.usuario_id = b.usuario_id AND p.juego_id = b.juego_id
  LEFT JOIN favoritos f ON f.usuario_id = b.usuario_id AND f.juego_id = b.juego_id
  LEFT JOIN resenas r ON r.usuario_id = b.usuario_id AND r.juego_id = b.juego_id
`

const ORDEN_SQL = {
  recientes: 'b.agregado_en DESC',
  titulo: 'j.titulo ASC',
  puntaje: 'p.puntaje DESC NULLS LAST, j.titulo ASC',
  horas: 'b.horas_jugadas DESC, j.titulo ASC',
}

function aItem(fila) {
  return {
    idExterno: fila.id_externo,
    titulo: fila.titulo,
    portadaUrl: fila.portada_url,
    fechaLanzamiento: fila.fecha_lanzamiento
      ? fila.fecha_lanzamiento.toISOString().slice(0, 10)
      : null,
    generos: fila.generos,
    plataformas: fila.plataformas,
    estado: fila.estado,
    horasJugadas: Number(fila.horas_jugadas),
    puntaje: fila.puntaje,
    esFavorito: fila.es_favorito,
    tieneResena: fila.tiene_resena,
    agregadoEn: fila.agregado_en,
    actualizadoEn: fila.actualizado_en,
    terminadoEn: fila.terminado_en,
  }
}

export async function listar(usuarioId, { estado, soloFavoritos, orden }) {
  const condiciones = ['b.usuario_id = $1']
  const params = [usuarioId]

  if (estado) {
    params.push(estado)
    condiciones.push(`b.estado = $${params.length}`)
  }
  if (soloFavoritos) condiciones.push('f.juego_id IS NOT NULL')

  const { rows } = await query(
    `${SELECT_ITEM} WHERE ${condiciones.join(' AND ')} ORDER BY ${ORDEN_SQL[orden]}`,
    params
  )
  return rows.map(aItem)
}

export async function contarPorEstado(usuarioId) {
  const { rows } = await query(
    'SELECT estado, COUNT(*)::int AS cantidad FROM biblioteca WHERE usuario_id = $1 GROUP BY estado',
    [usuarioId]
  )
  const conteo = { quiero_jugar: 0, jugando: 0, terminado: 0, abandonado: 0 }
  for (const fila of rows) conteo[fila.estado] = fila.cantidad
  return conteo
}

export async function buscar(usuarioId, idExterno, db = { query }) {
  const { rows } = await db.query(`${SELECT_ITEM} WHERE b.usuario_id = $1 AND j.id_externo = $2`, [
    usuarioId,
    idExterno,
  ])
  return rows[0] ? aItem(rows[0]) : null
}

// Devuelve la fila sin armar (para saber el estado anterior antes de actualizar)
export async function buscarFila(usuarioId, juegoId, db = { query }) {
  const { rows } = await db.query(
    'SELECT * FROM biblioteca WHERE usuario_id = $1 AND juego_id = $2',
    [usuarioId, juegoId]
  )
  return rows[0] || null
}

export async function agregar({ usuarioId, juegoId, estado }, db = { query }) {
  await db.query(
    `INSERT INTO biblioteca (usuario_id, juego_id, estado, terminado_en)
     VALUES ($1, $2, $3::varchar, CASE WHEN $3::varchar = 'terminado' THEN NOW() END)`,
    [usuarioId, juegoId, estado]
  )
}

export async function actualizar({ usuarioId, juegoId, estado, horasJugadas }, db = { query }) {
  await db.query(
    `UPDATE biblioteca SET
       estado = COALESCE($3::varchar, estado),
       horas_jugadas = COALESCE($4::numeric, horas_jugadas),
       terminado_en = CASE
         WHEN $3::varchar = 'terminado' AND estado <> 'terminado' THEN NOW()
         WHEN $3::varchar IS NOT NULL AND $3::varchar <> 'terminado' THEN NULL
         ELSE terminado_en
       END,
       actualizado_en = NOW()
     WHERE usuario_id = $1 AND juego_id = $2`,
    [usuarioId, juegoId, estado ?? null, horasJugadas ?? null]
  )
}

export async function quitar(usuarioId, juegoId, db = { query }) {
  const { rowCount } = await db.query(
    'DELETE FROM biblioteca WHERE usuario_id = $1 AND juego_id = $2',
    [usuarioId, juegoId]
  )
  return rowCount > 0
}
