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
