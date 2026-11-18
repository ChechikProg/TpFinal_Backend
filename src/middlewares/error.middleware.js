import { env } from '../config/env.js'

export function notFoundHandler(req, res) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` })
}

// Express reconoce este middleware como manejador de errores por tener 4 parámetros.
export function errorHandler(err, req, res, next) {
  // JSON mal formado en el body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' })
  }

  const status = err.status || 500
  const message = status === 500 ? 'Error interno del servidor' : err.message

  if (status === 500 && env.nodeEnv !== 'production') {
    console.error(err)
  }

  const body = { error: message }
  if (err.details) body.detalles = err.details

  res.status(status).json(body)
}
