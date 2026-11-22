import { HttpError } from '../utils/httpError.js'

export function validarIdColeccion(valor) {
  const id = Number(valor)
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'El id de la colección no es válido')
  return id
}

// parcial = true en la edición (se puede mandar solo el nombre o solo la descripción)
export function validarColeccion(body = {}, { parcial = false } = {}) {
  const errores = {}
  const datos = {}

  if (body.nombre !== undefined || !parcial) {
    const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : ''
    if (!nombre) errores.nombre = 'El nombre es obligatorio'
    else if (nombre.length > 80) errores.nombre = 'Máximo 80 caracteres'
    else datos.nombre = nombre
  }

  if (body.descripcion !== undefined) {
    const descripcion = typeof body.descripcion === 'string' ? body.descripcion.trim() : ''
    if (descripcion.length > 300) errores.descripcion = 'Máximo 300 caracteres'
    else datos.descripcion = descripcion || null
  }

  if (Object.keys(errores).length > 0) throw new HttpError(400, 'Hay errores en el formulario', errores)
  if (parcial && Object.keys(datos).length === 0) {
    throw new HttpError(400, 'Mandá el nombre o la descripción para actualizar')
  }
  return datos
}
