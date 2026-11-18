import { verificarToken } from '../utils/jwt.js'
import { HttpError } from '../utils/httpError.js'

export const NOMBRE_COOKIE = 'token'

// Protege las rutas privadas: lee el JWT de la cookie, lo verifica
// y guarda el id del usuario en req.usuarioId para usarlo en los controllers.
export function requiereAuth(req, res, next) {
  const token = req.cookies?.[NOMBRE_COOKIE]

  if (!token) {
    return next(new HttpError(401, 'Tenés que iniciar sesión'))
  }

  try {
    const payload = verificarToken(token)
    req.usuarioId = Number(payload.sub)
    next()
  } catch (error) {
    const mensaje =
      error.name === 'TokenExpiredError'
        ? 'La sesión venció, volvé a iniciar sesión'
        : 'La sesión no es válida'
    next(new HttpError(401, mensaje))
  }
}
