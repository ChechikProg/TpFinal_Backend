import bcrypt from 'bcryptjs'
import * as usuariosRepository from '../repositories/usuarios.repository.js'
import { generarToken } from '../utils/jwt.js'
import { HttpError } from '../utils/httpError.js'

const RONDAS_BCRYPT = 10

export async function registrar({ nombreUsuario, email, contrasena }) {
  const errores = {}
  if (await usuariosRepository.existeEmail(email)) {
    errores.email = 'Ya hay una cuenta con ese correo'
  }
  if (await usuariosRepository.existeNombreUsuario(nombreUsuario)) {
    errores.nombreUsuario = 'Ese nombre de usuario ya está en uso'
  }
  if (Object.keys(errores).length > 0) {
    throw new HttpError(409, 'No se pudo crear la cuenta', errores)
  }

  const contrasenaHash = await bcrypt.hash(contrasena, RONDAS_BCRYPT)

  try {
    const usuario = await usuariosRepository.crear({ nombreUsuario, email, contrasenaHash })
    return { usuario, token: generarToken(usuario.id) }
  } catch (error) {
    // 23505 = violación de UNIQUE (dos registros iguales al mismo tiempo)
    if (error.code === '23505') {
      throw new HttpError(409, 'Ese correo o nombre de usuario ya está en uso')
    }
    throw error
  }
}

export async function iniciarSesion({ email, contrasena }) {
  const usuario = await usuariosRepository.buscarPorEmailConContrasena(email)

  // Mismo mensaje si no existe el correo o si la contraseña está mal,
  // así no se puede averiguar qué correos están registrados.
  const contrasenaValida = usuario && (await bcrypt.compare(contrasena, usuario.contrasenaHash))
  if (!contrasenaValida) {
    throw new HttpError(401, 'Correo o contraseña incorrectos')
  }

  const { contrasenaHash, ...usuarioPublico } = usuario
  return { usuario: usuarioPublico, token: generarToken(usuario.id) }
}

export async function obtenerUsuarioActual(usuarioId) {
  const usuario = await usuariosRepository.buscarPorId(usuarioId)
  if (!usuario) {
    throw new HttpError(401, 'La sesión ya no es válida')
  }
  return usuario
}
