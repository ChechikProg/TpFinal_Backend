import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

if (!env.jwtSecret) {
  throw new Error('Falta JWT_SECRET en el archivo .env')
}

// Crea un token con el id del usuario. Vence según JWT_EXPIRES_IN (por ejemplo "7d").
export function generarToken(usuarioId) {
  return jwt.sign({ sub: String(usuarioId) }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  })
}

// Devuelve el contenido del token o lanza un error si es inválido o está vencido.
export function verificarToken(token) {
  return jwt.verify(token, env.jwtSecret)
}

// Fecha en la que vence un token (se usa para que la cookie dure lo mismo).
export function fechaDeVencimiento(token) {
  const { exp } = jwt.decode(token)
  return new Date(exp * 1000)
}
