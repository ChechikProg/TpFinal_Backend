import * as authService from '../services/auth.service.js'
import { validarRegistro, validarLogin } from '../validators/auth.validator.js'
import { NOMBRE_COOKIE } from '../middlewares/auth.middleware.js'
import { fechaDeVencimiento } from '../utils/jwt.js'
import { env } from '../config/env.js'

const esProduccion = env.nodeEnv === 'production'

// En producción el front y el back están en dominios distintos,
// por eso la cookie necesita sameSite 'none' y secure (solo HTTPS).
const opcionesCookie = {
  httpOnly: true,
  secure: esProduccion,
  sameSite: esProduccion ? 'none' : 'lax',
  path: '/',
}

function guardarCookie(res, token) {
  res.cookie(NOMBRE_COOKIE, token, { ...opcionesCookie, expires: fechaDeVencimiento(token) })
}

export async function registrar(req, res, next) {
  try {
    const datos = validarRegistro(req.body)
    const { usuario, token } = await authService.registrar(datos)
    guardarCookie(res, token)
    res.status(201).json({ usuario })
  } catch (error) {
    next(error)
  }
}

export async function iniciarSesion(req, res, next) {
  try {
    const datos = validarLogin(req.body)
    const { usuario, token } = await authService.iniciarSesion(datos)
    guardarCookie(res, token)
    res.json({ usuario })
  } catch (error) {
    next(error)
  }
}

export function cerrarSesion(req, res) {
  res.clearCookie(NOMBRE_COOKIE, opcionesCookie)
  res.status(204).end()
}

export async function usuarioActual(req, res, next) {
  try {
    const usuario = await authService.obtenerUsuarioActual(req.usuarioId)
    res.json({ usuario })
  } catch (error) {
    next(error)
  }
}
