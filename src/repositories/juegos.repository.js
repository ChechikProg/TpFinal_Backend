import { query } from '../config/db.js'

// Guarda el juego (o actualiza sus datos si ya estaba) y devuelve su id interno.
// Recibe `db` para poder usarse dentro de una transacción.
export async function guardar(juego, db = { query }) {
  const { rows } = await db.query(
    `INSERT INTO juegos (id_externo, titulo, portada_url, fecha_lanzamiento, generos, plataformas)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (id_externo) DO UPDATE SET
       titulo = EXCLUDED.titulo,
       portada_url = EXCLUDED.portada_url,
       fecha_lanzamiento = EXCLUDED.fecha_lanzamiento,
       generos = EXCLUDED.generos,
       plataformas = EXCLUDED.plataformas
     RETURNING id`,
    [
      juego.idExterno,
      juego.titulo,
      juego.portadaUrl,
      juego.fechaLanzamiento,
      juego.generos,
      juego.plataformas,
    ]
  )
  return rows[0].id
}

export async function buscarIdPorIdExterno(idExterno, db = { query }) {
  const { rows } = await db.query('SELECT id FROM juegos WHERE id_externo = $1', [idExterno])
  return rows[0]?.id ?? null
}
