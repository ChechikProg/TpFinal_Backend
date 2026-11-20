import pg from 'pg'
import { env } from './env.js'

const { Pool } = pg

if (!env.databaseUrl) {
  throw new Error('Falta DATABASE_URL en el archivo .env')
}

// Pool de conexiones: reutiliza conexiones abiertas en vez de abrir una por consulta.
export const pool = new Pool({
  connectionString: env.databaseUrl,
})

// Si una conexión se corta (por ejemplo, se reinicia PostgreSQL), lo registramos
// en vez de dejar que el servidor se caiga.
pool.on('error', (error) => {
  console.error('Error en la conexión con PostgreSQL:', error.message)
})

// Atajo para hacer consultas: query('SELECT * FROM usuarios WHERE id = $1', [id])
export function query(text, params) {
  return pool.query(text, params)
}

// Ejecuta varias consultas como una sola operación: si alguna falla, se deshacen todas.
// Ejemplo: agregar un juego a la biblioteca y registrar la actividad.
export async function conTransaccion(callback) {
  const cliente = await pool.connect()
  try {
    await cliente.query('BEGIN')
    const resultado = await callback(cliente)
    await cliente.query('COMMIT')
    return resultado
  } catch (error) {
    await cliente.query('ROLLBACK')
    throw error
  } finally {
    cliente.release()
  }
}
