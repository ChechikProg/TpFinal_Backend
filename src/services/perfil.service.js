import { conTransaccion } from '../config/db.js'
import * as usuariosRepository from '../repositories/usuarios.repository.js'
import * as actividadRepository from '../repositories/actividad.repository.js'
import { HttpError } from '../utils/httpError.js'

export async function obtener(usuarioId) {
  const [usuario, generosPreferidos] = await Promise.all([
    usuariosRepository.buscarPorId(usuarioId),
    usuariosRepository.listarGenerosPreferidos(usuarioId),
  ])
  if (!usuario) throw new HttpError(404, 'Usuario no encontrado')
  return { ...usuario, generosPreferidos }
}

export async function actualizar(usuarioId, datos) {
  await conTransaccion(async (db) => {
    await usuariosRepository.actualizarPerfil(usuarioId, datos, db)
    if (datos.generosPreferidos) {
      await usuariosRepository.reemplazarGenerosPreferidos(usuarioId, datos.generosPreferidos, db)
    }
    await actividadRepository.registrar(
      { usuarioId, tipo: 'perfil_editado', detalle: { campos: Object.keys(datos) } },
      db
    )
  })
  return obtener(usuarioId)
}
