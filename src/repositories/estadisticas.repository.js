import { query } from '../config/db.js'

// Todas las consultas se calculan en el momento con los datos del usuario.
// No hay valores guardados: si el usuario cambia algo, cambian las estadísticas.

export async function resumen(usuarioId) {
  const { rows } = await query(
    `SELECT
       COUNT(*)::int                                            AS total,
       COUNT(*) FILTER (WHERE estado = 'quiero_jugar')::int      AS quiero_jugar,
       COUNT(*) FILTER (WHERE estado = 'jugando')::int           AS jugando,
       COUNT(*) FILTER (WHERE estado = 'terminado')::int         AS terminado,
       COUNT(*) FILTER (WHERE estado = 'abandonado')::int        AS abandonado,
       COALESCE(SUM(horas_jugadas), 0)::float                    AS horas_totales,
       (SELECT ROUND(AVG(puntaje)::numeric, 1)::float FROM puntuaciones WHERE usuario_id = $1) AS puntaje_promedio,
       (SELECT COUNT(*)::int FROM puntuaciones WHERE usuario_id = $1) AS puntuaciones,
       (SELECT COUNT(*)::int FROM resenas WHERE usuario_id = $1)      AS resenas,
       (SELECT COUNT(*)::int FROM favoritos WHERE usuario_id = $1)    AS favoritos,
       (SELECT COUNT(*)::int FROM colecciones WHERE usuario_id = $1)  AS colecciones
     FROM biblioteca
     WHERE usuario_id = $1`,
    [usuarioId]
  )
  return rows[0]
}

// Cuántos juegos de la biblioteca tiene cada género (un juego puede tener varios)
export async function generos(usuarioId, limite = 6) {
  const { rows } = await query(
    `SELECT genero, COUNT(*)::int AS cantidad, COALESCE(SUM(b.horas_jugadas), 0)::float AS horas
     FROM biblioteca b
     JOIN juegos j ON j.id = b.juego_id
     CROSS JOIN UNNEST(j.generos) AS genero
     WHERE b.usuario_id = $1
     GROUP BY genero
     ORDER BY cantidad DESC, horas DESC, genero
     LIMIT $2`,
    [usuarioId, limite]
  )
  return rows
}

export async function plataformas(usuarioId) {
  const { rows } = await query(
    `SELECT plataforma, COUNT(*)::int AS cantidad
     FROM biblioteca b
     JOIN juegos j ON j.id = b.juego_id
     CROSS JOIN UNNEST(j.plataformas) AS plataforma
     WHERE b.usuario_id = $1
     GROUP BY plataforma
     ORDER BY cantidad DESC, plataforma`,
    [usuarioId]
  )
  return rows
}

export async function distribucionPuntajes(usuarioId) {
  const { rows } = await query(
    `SELECT s.puntaje, COUNT(p.puntaje)::int AS cantidad
     FROM generate_series(1, 5) AS s(puntaje)
     LEFT JOIN puntuaciones p ON p.puntaje = s.puntaje AND p.usuario_id = $1
     GROUP BY s.puntaje
     ORDER BY s.puntaje`,
    [usuarioId]
  )
  return rows
}

// Juegos agregados y terminados en cada uno de los últimos 6 meses
export async function actividadMensual(usuarioId) {
  const { rows } = await query(
    `SELECT TO_CHAR(m.mes, 'YYYY-MM') AS mes,
            (SELECT COUNT(*)::int FROM biblioteca b
              WHERE b.usuario_id = $1 AND date_trunc('month', b.agregado_en) = m.mes) AS agregados,
            (SELECT COUNT(*)::int FROM biblioteca b
              WHERE b.usuario_id = $1 AND date_trunc('month', b.terminado_en) = m.mes) AS terminados
     FROM generate_series(
            date_trunc('month', NOW()) - INTERVAL '5 months',
            date_trunc('month', NOW()),
            INTERVAL '1 month'
          ) AS m(mes)
     ORDER BY m.mes`,
    [usuarioId]
  )
  return rows
}

export async function masJugados(usuarioId, limite = 5) {
  const { rows } = await query(
    `SELECT j.id_externo, j.titulo, j.portada_url, b.horas_jugadas::float AS horas, b.estado
     FROM biblioteca b
     JOIN juegos j ON j.id = b.juego_id
     WHERE b.usuario_id = $1 AND b.horas_jugadas > 0
     ORDER BY b.horas_jugadas DESC, j.titulo
     LIMIT $2`,
    [usuarioId, limite]
  )
  return rows.map((f) => ({
    idExterno: f.id_externo,
    titulo: f.titulo,
    portadaUrl: f.portada_url,
    horas: f.horas,
    estado: f.estado,
  }))
}

// Días distintos con alguna actividad en los últimos 30 días
export async function diasActivos(usuarioId) {
  const { rows } = await query(
    `SELECT COUNT(DISTINCT DATE(creado_en))::int AS dias
     FROM actividad
     WHERE usuario_id = $1 AND creado_en >= NOW() - INTERVAL '30 days'`,
    [usuarioId]
  )
  return rows[0].dias
}
