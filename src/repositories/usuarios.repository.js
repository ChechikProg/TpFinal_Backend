import { query } from '../config/db.js'

// Convierte una fila de la base (snake_case) al formato que devuelve la API (camelCase).
// Nunca incluye la contraseña.
function aUsuarioPublico(fila) {
  if (!fila) return null
  return {
    id: fila.id,
    nombreUsuario: fila.nombre_usuario,
    email: fila.email,
    nombre: fila.nombre,
    avatarUrl: fila.avatar_url,
    bio: fila.bio,
    plataformaPreferida: fila.plataforma_preferida,
    creadoEn: fila.creado_en,
  }
}

export async function buscarPorId(id) {
  const { rows } = await query('SELECT * FROM usuarios WHERE id = $1', [id])
  return aUsuarioPublico(rows[0])
}

// Devuelve también el hash de la contraseña, solo para usarlo en el login.
export async function buscarPorEmailConContrasena(email) {
  const { rows } = await query('SELECT * FROM usuarios WHERE email = $1', [email])
  if (!rows[0]) return null
  return { ...aUsuarioPublico(rows[0]), contrasenaHash: rows[0].contrasena_hash }
}

export async function existeEmail(email) {
  const { rowCount } = await query('SELECT 1 FROM usuarios WHERE email = $1', [email])
  return rowCount > 0
}

export async function existeNombreUsuario(nombreUsuario) {
  const { rowCount } = await query(
    'SELECT 1 FROM usuarios WHERE LOWER(nombre_usuario) = LOWER($1)',
    [nombreUsuario]
  )
  return rowCount > 0
}

export async function crear({ nombreUsuario, email, contrasenaHash }) {
  const { rows } = await query(
    `INSERT INTO usuarios (nombre_usuario, email, contrasena_hash, nombre)
     VALUES ($1, $2, $3, $1)
     RETURNING *`,
    [nombreUsuario, email, contrasenaHash]
  )
  return aUsuarioPublico(rows[0])
}

export async function listarGenerosPreferidos(usuarioId) {
  const { rows } = await query('SELECT genero FROM usuario_generos WHERE usuario_id = $1 ORDER BY genero', [
    usuarioId,
  ])
  return rows.map((f) => f.genero)
}

// Actualiza solo los campos que llegan
export async function actualizarPerfil(usuarioId, datos, db = { query }) {
  const columnas = {
    nombre: 'nombre',
    bio: 'bio',
    avatarUrl: 'avatar_url',
    plataformaPreferida: 'plataforma_preferida',
  }
  const sets = []
  const params = [usuarioId]
  for (const [campo, columna] of Object.entries(columnas)) {
    if (datos[campo] !== undefined) {
      params.push(datos[campo])
      sets.push(`${columna} = $${params.length}`)
    }
  }
  if (sets.length > 0) {
    await db.query(`UPDATE usuarios SET ${sets.join(', ')}, actualizado_en = NOW() WHERE id = $1`, params)
  }
}

export async function reemplazarGenerosPreferidos(usuarioId, generos, db = { query }) {
  await db.query('DELETE FROM usuario_generos WHERE usuario_id = $1', [usuarioId])
  for (const genero of generos) {
    await db.query('INSERT INTO usuario_generos (usuario_id, genero) VALUES ($1, $2)', [usuarioId, genero])
  }
}
