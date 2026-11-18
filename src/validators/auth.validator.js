import { HttpError } from '../utils/httpError.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USUARIO_REGEX = /^[a-zA-Z0-9_.]{3,30}$/

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : ''
}

// Valida el body del registro. Si hay errores, lanza un 400 con el error de cada campo.
// Si está todo bien, devuelve los datos limpios.
export function validarRegistro(body = {}) {
  const nombreUsuario = texto(body.nombreUsuario)
  const email = texto(body.email).toLowerCase()
  const contrasena = typeof body.contrasena === 'string' ? body.contrasena : ''
  const confirmacion = typeof body.confirmacion === 'string' ? body.confirmacion : ''

  const errores = {}

  if (!nombreUsuario) {
    errores.nombreUsuario = 'El nombre de usuario es obligatorio'
  } else if (!USUARIO_REGEX.test(nombreUsuario)) {
    errores.nombreUsuario =
      'Tiene que tener entre 3 y 30 caracteres: letras, números, punto o guion bajo'
  }

  if (!email) {
    errores.email = 'El correo es obligatorio'
  } else if (!EMAIL_REGEX.test(email) || email.length > 255) {
    errores.email = 'El correo no es válido'
  }

  if (!contrasena) {
    errores.contrasena = 'La contraseña es obligatoria'
  } else if (contrasena.length < 8) {
    errores.contrasena = 'La contraseña tiene que tener al menos 8 caracteres'
  } else if (contrasena.length > 72) {
    errores.contrasena = 'La contraseña no puede tener más de 72 caracteres'
  }

  if (!confirmacion) {
    errores.confirmacion = 'Confirmá la contraseña'
  } else if (confirmacion !== contrasena) {
    errores.confirmacion = 'Las contraseñas no coinciden'
  }

  if (Object.keys(errores).length > 0) {
    throw new HttpError(400, 'Hay errores en el formulario', errores)
  }

  return { nombreUsuario, email, contrasena }
}

export function validarLogin(body = {}) {
  const email = texto(body.email).toLowerCase()
  const contrasena = typeof body.contrasena === 'string' ? body.contrasena : ''

  const errores = {}
  if (!email) errores.email = 'El correo es obligatorio'
  if (!contrasena) errores.contrasena = 'La contraseña es obligatoria'

  if (Object.keys(errores).length > 0) {
    throw new HttpError(400, 'Hay errores en el formulario', errores)
  }

  return { email, contrasena }
}
