import { HttpError } from '../utils/httpError.js'

const PLATAFORMAS = ['PC', 'PlayStation', 'Xbox', 'Nintendo', 'iOS', 'Android']

// Solo se valida lo que llega: se puede editar un dato por vez.
export function validarPerfil(body = {}) {
  const errores = {}
  const datos = {}

  if (body.nombre !== undefined) {
    const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : ''
    if (!nombre) errores.nombre = 'El nombre no puede quedar vacío'
    else if (nombre.length > 60) errores.nombre = 'Máximo 60 caracteres'
    else datos.nombre = nombre
  }

  if (body.bio !== undefined) {
    const bio = typeof body.bio === 'string' ? body.bio.trim() : ''
    if (bio.length > 300) errores.bio = 'Máximo 300 caracteres'
    else datos.bio = bio || null
  }

  if (body.avatarUrl !== undefined) {
    const avatarUrl = typeof body.avatarUrl === 'string' ? body.avatarUrl.trim() : ''
    if (!avatarUrl) {
      datos.avatarUrl = null
    } else {
      try {
        const url = new URL(avatarUrl)
        if (url.protocol !== 'https:') throw new Error()
        if (avatarUrl.length > 500) throw new Error()
        datos.avatarUrl = avatarUrl
      } catch {
        errores.avatarUrl = 'Tiene que ser un link de imagen que empiece con https://'
      }
    }
  }

  if (body.plataformaPreferida !== undefined) {
    const plataforma = body.plataformaPreferida || null
    if (plataforma && !PLATAFORMAS.includes(plataforma)) errores.plataformaPreferida = 'Plataforma no válida'
    else datos.plataformaPreferida = plataforma
  }

  if (body.generosPreferidos !== undefined) {
    const lista = Array.isArray(body.generosPreferidos) ? body.generosPreferidos : null
    if (!lista || lista.length > 10 || lista.some((g) => typeof g !== 'string' || !g.trim() || g.length > 60)) {
      errores.generosPreferidos = 'Elegí hasta 10 géneros'
    } else {
      datos.generosPreferidos = [...new Set(lista.map((g) => g.trim()))]
    }
  }

  if (Object.keys(errores).length > 0) throw new HttpError(400, 'Hay errores en el formulario', errores)
  if (Object.keys(datos).length === 0) throw new HttpError(400, 'No hay datos para actualizar')
  return datos
}
